import { describe, expect, it } from "vitest";
import {
  createSeedCommunities,
  getCommunityById,
  getCommunityStats,
} from "../src/lib/utils/communityData";
import {
  createSeedContacts,
  createSeedGoals,
  createSeedReminders,
  getPriorityContacts,
} from "../src/lib/utils/connectionData";

describe("community helpers", () => {
  it("returns seeded communities and stats", () => {
    const communities = createSeedCommunities();
    const community = getCommunityById(communities[0].id, communities);
    const stats = getCommunityStats(communities);

    expect(communities.length).toBeGreaterThan(0);
    expect(community?.name).toBeTruthy();
    expect(stats.totalMembers).toBeGreaterThan(0);
    expect(stats.activeChallenges).toBeGreaterThan(0);
  });
});

describe("connection helpers", () => {
  it("builds priority contacts and seeded reminders/goals", () => {
    const contacts = createSeedContacts();
    const reminders = createSeedReminders();
    const goals = createSeedGoals();
    const priority = getPriorityContacts(contacts, reminders, goals);

    expect(contacts.length).toBeGreaterThan(0);
    expect(reminders.length).toBeGreaterThan(0);
    expect(goals.length).toBeGreaterThan(0);
    expect(priority.length).toBeGreaterThan(0);
  });
});
