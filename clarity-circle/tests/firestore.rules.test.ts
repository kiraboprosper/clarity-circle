﻿﻿﻿import { readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it, beforeEach } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  const rulesPath = path.resolve(process.cwd(), "../firestore.rules");
  testEnv = await initializeTestEnvironment({
    projectId: "clarity-circle-rules-test",
    firestore: {
      rules: readFileSync(rulesPath, "utf8"),
    },
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

async function seedUser(uid: string, role: "user" | "moderator" | "admin" = "user") {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "users", uid), {
      uid,
      email: `${uid}@example.com`,
      displayName: uid,
      username: uid,
      role,
      points: 100,
      subscriptionTier: "free",
      notificationSettings: {
        likes: true,
        comments: true,
        follows: true,
        challenges: true,
        directMessages: true,
        communityUpdates: true,
      },
    });
  });
}

async function seedPost(postId: string, authorId: string) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "posts", postId), {
      author: {
        uid: authorId,
        displayName: authorId,
        username: authorId,
        isVerified: false,
      },
      content: "A seed post.",
      createdAt: new Date(),
      likesCount: 0,
      likedBy: [],
      commentsCount: 0,
    });
  });
}

describe("Firestore security rules", () => {
  it("allows profile preference updates but blocks self-promoting sensitive fields", async () => {
    await seedUser("alice");
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertSucceeds(updateDoc(doc(db, "users", "alice"), { bio: "Focused", isPrivate: true }));
    await assertFails(updateDoc(doc(db, "users", "alice"), { role: "admin" }));
    await assertFails(updateDoc(doc(db, "users", "alice"), { points: 999999 }));
    await assertFails(updateDoc(doc(db, "users", "alice"), { subscriptionTier: "business" }));
  });

  it("blocks client-created point transactions and reward redemptions", async () => {
    await seedUser("alice");
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(db, "points", "fake"), { userId: "alice", amount: 5000, type: "daily_login" }));
    await assertFails(setDoc(doc(db, "rewardRedemptions", "fake"), { userId: "alice", rewardId: "reward_1" }));
  });

  it("blocks direct subscription writes from the client", async () => {
    await seedUser("alice");
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(db, "subscriptions", "alice"), { userId: "alice", tier: "business" }));
  });

  it("allows authenticated users to manage their own profile and login dates", async () => {
    await seedUser("alice");
    const db = testEnv.authenticatedContext("alice").firestore();

    await assertSucceeds(setDoc(doc(db, "users", "alice"), {
      uid: "alice",
      email: "alice@example.com",
      displayName: "Alice",
      username: "alice",
      role: "user",
      points: 0,
      subscriptionTier: "free",
      notificationSettings: {
        likes: true,
        comments: true,
        follows: true,
        challenges: true,
        directMessages: true,
        communityUpdates: true,
      },
    }));
    await assertSucceeds(getDoc(doc(db, "users", "alice")));
    await assertSucceeds(setDoc(doc(db, "users", "alice", "loginDates", "2025-01-01"), {
      date: "2025-01-01",
      recordedAt: new Date(),
    }));
    await assertSucceeds(getDoc(doc(db, "users", "alice", "loginDates", "2025-01-01")));
  });

  it("allows admins to manage rewards and normal users only to read them", async () => {
    await seedUser("admin", "admin");
    await seedUser("alice");
    const adminDb = testEnv.authenticatedContext("admin").firestore();
    const userDb = testEnv.authenticatedContext("alice").firestore();
    await assertSucceeds(setDoc(doc(adminDb, "rewards", "badge"), { name: "Badge", pointsCost: 10 }));
    await assertSucceeds(getDoc(doc(userDb, "rewards", "badge")));
    await assertFails(setDoc(doc(userDb, "rewards", "fake"), { name: "Fake", pointsCost: 0 }));
  });

  it("allows moderators to hide reported posts but blocks ordinary users", async () => {
    await seedUser("mod", "moderator");
    await seedUser("alice");
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "posts", "p1"), { authorId: "alice", isHidden: false, likesCount: 0, commentsCount: 0 });
    });
    const modDb = testEnv.authenticatedContext("mod").firestore();
    const userDb = testEnv.authenticatedContext("alice").firestore();
    await assertFails(updateDoc(doc(userDb, "posts", "p1"), { isHidden: true }));
    await assertSucceeds(updateDoc(doc(modDb, "posts", "p1"), { isHidden: true, isReported: true }));
  });

  it("persists user-owned saved items, circle memberships, and event RSVPs", async () => {
    await seedUser("alice");
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertSucceeds(setDoc(doc(db, "savedItems", "alice_post_p1"), { userId: "alice", id: "p1", type: "post" }));
    await assertSucceeds(setDoc(doc(db, "circleMemberships", "alice_c1"), { userId: "alice", circleId: "c1" }));
    await assertSucceeds(setDoc(doc(db, "eventRsvps", "alice_e1"), { userId: "alice", eventId: "e1" }));
    await assertSucceeds(deleteDoc(doc(db, "savedItems", "alice_post_p1")));
  });
});

describe("Comments subcollection rules", () => {
  beforeEach(async () => {
    // Seed users and a post for the tests
    await seedUser("alice");
    await seedUser("bob");
    await seedPost("p1", "alice");
  });

  it("should allow authenticated users to create valid comments", async () => {
    const aliceDb = testEnv.authenticatedContext("alice").firestore();
    const commentRef = doc(aliceDb, "posts/p1/comments/c1");
    const validComment = {
      uid: "alice",
      author: { displayName: "Alice", photoURL: "https://example.com/photo.jpg" },
      content: "This is a great post!",
      createdAt: new Date(),
    };
    await assertSucceeds(setDoc(commentRef, validComment));
  });

  it("should block creating comments when unauthenticated", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const commentRef = doc(unauthedDb, "posts/p1/comments/c1");
    await assertFails(setDoc(commentRef, { content: "spam" }));
  });

  it("should block creating a comment with invalid data", async () => {
    const aliceDb = testEnv.authenticatedContext("alice").firestore();
    const commentRef = doc(aliceDb, "posts/p1/comments/c1");
    const invalidComment = {
      uid: "alice",
      author: { displayName: "Alice" },
      content: "a".repeat(501), // content is too long
      createdAt: new Date(),
    };
    await assertFails(setDoc(commentRef, invalidComment));
  });

  it("should allow a comment author to update their own comment", async () => {
    const aliceDb = testEnv.authenticatedContext("alice").firestore();
    const commentRef = doc(aliceDb, "posts/p1/comments/c1");
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "posts/p1/comments/c1"), { uid: "alice", content: "Initial comment", author: {}, createdAt: new Date() });
    });
    await assertSucceeds(updateDoc(commentRef, { content: "Updated comment" }));
  });

  it("should block users from updating other users' comments", async () => {
    const bobDb = testEnv.authenticatedContext("bob").firestore();
    const commentRef = doc(bobDb, "posts/p1/comments/c1");
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "posts/p1/comments/c1"), { uid: "alice", content: "Initial comment" });
    });
    await assertFails(updateDoc(commentRef, { content: "Bob's malicious update" }));
  });

  it("should allow a comment author to delete their own comment", async () => {
    const aliceDb = testEnv.authenticatedContext("alice").firestore();
    const commentRef = doc(aliceDb, "posts/p1/comments/c1");
    await assertSucceeds(deleteDoc(commentRef));
  });
});

describe("Connections collection rules", () => {
  beforeEach(async () => {
    await seedUser("alice");
    await seedUser("bob");
  });

  it("should allow a user to create and read their own connection notes", async () => {
    const aliceDb = testEnv.authenticatedContext("alice").firestore();
    const aliceNotesRef = doc(aliceDb, "connections/alice/contacts/bob");

    await assertSucceeds(setDoc(aliceNotesRef, { notes: "Met at the conference." }));
    await assertSucceeds(getDoc(aliceNotesRef));
  });

  it("should block a user from reading another user's connection notes", async () => {
    const bobDb = testEnv.authenticatedContext("bob").firestore();
    // Alice creates a note about Charlie, which Bob should not be able to read.
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "connections/alice/contacts/charlie"), { notes: "Secret note" });
    });

    const aliceNotesForCharlieRef = doc(bobDb, "connections/alice/contacts/charlie");
    await assertFails(getDoc(aliceNotesForCharlieRef));
  });

  it("should block a user from writing to another user's connection notes", async () => {
    const bobDb = testEnv.authenticatedContext("bob").firestore();
    const aliceNotesRef = doc(bobDb, "connections/alice/contacts/charlie");
    await assertFails(setDoc(aliceNotesRef, { notes: "Bob's malicious note" }));
  });

  it("should block unauthenticated users from accessing any connection notes", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const aliceNotesRef = doc(unauthedDb, "connections/alice/contacts/bob");
    await assertFails(getDoc(aliceNotesRef));
    await assertFails(setDoc(aliceNotesRef, { notes: "Anonymous note" }));
  });
});

describe("Caregiver Daily Report rules", () => {
  beforeEach(async () => {
    // Seed users with roles
    await seedUser("parent1");
    await seedUser("child1");
    await seedUser("caregiver1");
    await seedUser("unassignedCaregiver");

    // Seed a family document connecting the users
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      // Link users to the family
      await updateDoc(doc(db, "users", "parent1"), { familyId: "family1", familyRole: "parent" });
      await updateDoc(doc(db, "users", "child1"), { familyId: "family1", familyRole: "child" });

      // Create the family with the assigned caregiver
      await setDoc(doc(db, "families", "family1"), {
        parentId: "parent1",
        childIds: ["child1"],
        caregivers: {
          caregiver1: { assignedChildIds: ["child1"] },
        },
      });
    });
  });

  const validReportData = {
    familyId: "family1",
    childId: "child1",
    caregiverId: "caregiver1",
    reportDate: new Date(),
    status: "in_progress",
  };

  it("should allow an assigned caregiver to create a valid report", async () => {
    const caregiverDb = testEnv.authenticatedContext("caregiver1").firestore();
    const reportRef = doc(caregiverDb, "dailyReports", "report1");
    await assertSucceeds(setDoc(reportRef, validReportData));
  });

  it("should block an unassigned caregiver from creating a report", async () => {
    const unassignedDb = testEnv.authenticatedContext("unassignedCaregiver").firestore();
    const reportRef = doc(unassignedDb, "dailyReports", "report1");
    // This caregiver is not in the family's caregiver map
    await assertFails(setDoc(reportRef, { ...validReportData, caregiverId: "unassignedCaregiver" }));
  });

  it("should allow the parent and creating caregiver to read a report", async () => {
    const parentDb = testEnv.authenticatedContext("parent1").firestore();
    const caregiverDb = testEnv.authenticatedContext("caregiver1").firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "dailyReports", "report1"), validReportData);
    });

    const reportRef = doc(parentDb, "dailyReports", "report1");
    await assertSucceeds(getDoc(reportRef)); // Parent can read
    await assertSucceeds(getDoc(doc(caregiverDb, "dailyReports", "report1"))); // Caregiver can read
  });

  it("should allow a caregiver to update their own 'in_progress' report", async () => {
    const caregiverDb = testEnv.authenticatedContext("caregiver1").firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "dailyReports", "report1"), validReportData);
    });
    const reportRef = doc(caregiverDb, "dailyReports", "report1");
    await assertSucceeds(updateDoc(reportRef, { waterIntake: "average" }));
  });

  it("should block a caregiver from updating a 'submitted' report", async () => {
    const caregiverDb = testEnv.authenticatedContext("caregiver1").firestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "dailyReports", "report1"), { ...validReportData, status: "submitted" });
    });
    const reportRef = doc(caregiverDb, "dailyReports", "report1");
    // Fails because status is not 'in_progress'
    await assertFails(updateDoc(reportRef, { waterIntake: "excellent" }));
  });
});

describe("Community creation rules", () => {
  beforeEach(async () => {
    await seedUser("alice");
    await seedUser("bob");
  });

  const validCommunityData = {
    name: "Test Community",
    description: "A community for testing.",
    category: "Testing",
    privacy: "public",
    rules: "Be nice.",
    tags: ["test"],
  };

  it("should allow a signed-in user to create a community", async () => {
    const aliceDb = testEnv.authenticatedContext("alice").firestore();
    // This simulates the batch write from the `createCommunity` function
    const batch = aliceDb.batch();
    const communityRef = doc(aliceDb, "communities", "comm1");
    const memberRef = doc(aliceDb, "community_members", "alice_comm1");

    batch.set(communityRef, { ...validCommunityData, creatorId: "alice", memberCount: 1 });
    batch.set(memberRef, { userId: "alice", communityId: "comm1", role: "owner" });

    await assertSucceeds(batch.commit());
  });

  it("should block creating a community when unauthenticated", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const batch = unauthedDb.batch();
    const communityRef = doc(unauthedDb, "communities", "comm1");
    const memberRef = doc(unauthedDb, "community_members", "guest_comm1");

    batch.set(communityRef, { ...validCommunityData, creatorId: "guest", memberCount: 1 });
    batch.set(memberRef, { userId: "guest", communityId: "comm1", role: "owner" });

    await assertFails(batch.commit());
  });

  it("should block creating a community where the creatorId is not the authenticated user", async () => {
    const aliceDb = testEnv.authenticatedContext("alice").firestore();
    const communityRef = doc(aliceDb, "communities", "comm1");
    // Alice is trying to create a community and assign Bob as the creator
    await assertFails(setDoc(communityRef, { ...validCommunityData, creatorId: "bob", memberCount: 1 }));
  });
});
