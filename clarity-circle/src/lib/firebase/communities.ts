import {
  collection,
  writeBatch,
  doc,
  serverTimestamp,
  getDoc,
  addDoc,
  query,
  where,
  orderBy,
  Query,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "./config";

export interface CommunityCreationData {
  name: string;
  description: string;
  coverImage: string;
  category: string;
  privacy: 'public' | 'private' | 'invite-only';
  rules: string;
  tags: string[];
}

export interface Community {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  category: string;
  privacy: 'public' | 'private' | 'invite-only';
  rules: string;
  tags: string[];
  creatorId: string;
  memberCount: number;
  createdAt: any; // Firestore Timestamp
}

export interface CommunityMember {
  userId: string;
  communityId: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joinedAt: any; // Firestore Timestamp
}

/**
 * Creates a new community and sets the creator as the owner.
 * @param creatorId The UID of the user creating the community.
 * @param communityData The data for the new community.
 * @returns The ID of the newly created community.
 */
export async function createCommunity(creatorId: string, communityData: CommunityCreationData): Promise<string> {
  const batch = writeBatch(db);

  // 1. Create the main community document
  const communityRef = doc(collection(db, "communities"));
  batch.set(communityRef, {
    ...communityData,
    creatorId: creatorId,
    memberCount: 1,
    createdAt: serverTimestamp(),
  });

  // 2. Create the owner's membership document
  const membershipRef = doc(db, "community_members", `${creatorId}_${communityRef.id}`);
  batch.set(membershipRef, { userId: creatorId, communityId: communityRef.id, role: 'owner', joinedAt: serverTimestamp() });

  await batch.commit();
  return communityRef.id;
}

/**
 * Fetches a single community document by its ID.
 * @param communityId The ID of the community to fetch.
 * @returns The community data or null if not found.
 */
export async function getCommunityById(communityId: string): Promise<Community | null> {
  const communityRef = doc(db, "communities", communityId);
  const communitySnap = await getDoc(communityRef);

  if (!communitySnap.exists()) {
    return null;
  }

  return { id: communitySnap.id, ...communitySnap.data() } as Community;
}

/**
 * Gets a user's membership document for a specific community.
 * @param communityId The ID of the community.
 * @param userId The UID of the user.
 * @returns The membership data or null if not a member.
 */
export async function getCommunityMembership(communityId: string, userId: string): Promise<CommunityMember | null> {
  if (!userId) return null;
  const membershipRef = doc(db, "community_members", `${userId}_${communityId}`);
  const membershipSnap = await getDoc(membershipRef);

  if (!membershipSnap.exists()) {
    return null;
  }

  return membershipSnap.data() as CommunityMember;
}

/**
 * Allows a user to join a public community.
 * @param communityId The ID of the community to join.
 * @param userId The UID of the user joining.
 */
export async function joinCommunity(communityId: string, userId: string): Promise<void> {
  const membershipRef = doc(db, "community_members", `${userId}_${communityId}`);
  const communityRef = doc(db, "communities", communityId);

  const batch = writeBatch(db);
  batch.set(membershipRef, { userId, communityId, role: 'member', joinedAt: serverTimestamp() });
  batch.update(communityRef, { memberCount: increment(1) });
  await batch.commit();
}

/**
 * Allows a user to leave a community.
 * @param communityId The ID of the community to leave.
 * @param userId The UID of the user leaving.
 */
export async function leaveCommunity(communityId: string, userId: string): Promise<void> {
  const membershipRef = doc(db, "community_members", `${userId}_${communityId}`);
  const communityRef = doc(db, "communities", communityId);

  const batch = writeBatch(db);
  batch.delete(membershipRef);
  batch.update(communityRef, { memberCount: increment(-1) });
  await batch.commit();
}

/**
 * Fetches all members of a specific community.
 * @param communityId The ID of the community.
 * @returns A promise that resolves to an array of community members with their user profiles.
 */
export async function getCommunityMembers(communityId: string): Promise<(CommunityMember & { user: any })[]> {
  const membersQuery = query(collection(db, "community_members"), where("communityId", "==", communityId));
  const membersSnap = await getDocs(membersQuery);

  const memberPromises = membersSnap.docs.map(async (memberDoc) => {
    const memberData = memberDoc.data() as CommunityMember;
    const userSnap = await getDoc(doc(db, "users", memberData.userId));
    return { ...memberData, user: userSnap.data() };
  });

  return Promise.all(memberPromises);
}

/**
 * Updates the role of a member within a community.
 * @param communityId The ID of the community.
 * @param memberId The UID of the member to update.
 * @param newRole The new role to assign.
 */
export async function updateCommunityMemberRole(communityId: string, memberId: string, newRole: 'owner' | 'admin' | 'moderator' | 'member'): Promise<void> {
  if (newRole === 'owner') {
    throw new Error("Ownership can only be transferred, not assigned.");
  }
  const membershipRef = doc(db, "community_members", `${memberId}_${communityId}`);
  await updateDoc(membershipRef, { role: newRole });
}

/**
 * Creates a new post in a community's feed.
 * @param communityId The ID of the community.
 * @param authorId The UID of the post author.
 * @param authorProfile Public profile data for the author.
 * @param content The text content of the post.
 */
export async function createCommunityPost(
  communityId: string,
  authorId: string,
  authorProfile: { displayName: string; photoURL: string; },
  content: string
): Promise<void> {
  const postsCollectionRef = collection(db, "community_posts");
  await addDoc(postsCollectionRef, {
    communityId,
    authorId,
    author: authorProfile,
    content,
    createdAt: serverTimestamp(),
    likesCount: 0,
    commentsCount: 0,
    likedBy: [],
  });
}

/**
 * Updates the content of a community post.
 * @param postId The ID of the post to update.
 * @param newContent The new text content for the post.
 */
export async function updateCommunityPost(postId: string, newContent: string): Promise<void> {
  const postRef = doc(db, "community_posts", postId);
  await updateDoc(postRef, {
    content: newContent,
    updatedAt: serverTimestamp(), // Track that the post was edited
  });
}

/**
 * Deletes a community post.
 * @param postId The ID of the post to delete.
 */
export async function deleteCommunityPost(postId: string): Promise<void> {
  const postRef = doc(db, "community_posts", postId);
  await deleteDoc(postRef);
}

/**
 * Returns a query for fetching posts for a specific community feed.
 * @param communityId The ID of the community.
 */
export function getCommunityPostsQuery(communityId: string): Query {
  return query(
    collection(db, "community_posts"),
    where("communityId", "==", communityId),
    orderBy("createdAt", "desc")
  );
}

/**
 * Toggles a like on a community post.
 * @param postId The ID of the post.
 * @param userId The UID of the user liking the post.
 * @param liked The current like status.
 */
export async function toggleCommunityPostLike(postId: string, userId: string, liked: boolean): Promise<void> {
  const postRef = doc(db, "community_posts", postId);
  await updateDoc(postRef, {
    likedBy: liked ? arrayRemove(userId) : arrayUnion(userId),
    likesCount: liked ? increment(-1) : increment(1),
  });
}

/**
 * Adds a comment to a community post.
 * @param postId The ID of the post to comment on.
 * @param authorId The UID of the comment author.
 * @param authorProfile Public profile data for the author.
 * @param content The text content of the comment.
 * @param parentCommentId The ID of the parent comment, if it's a reply.
 */
export async function addCommunityComment(
  postId: string,
  authorId: string,
  authorProfile: { displayName: string; photoURL: string; },
  content: string,
  parentCommentId: string | null = null,
): Promise<void> {
  const commentsCollectionRef = collection(db, `community_posts/${postId}/comments`);
  const postRef = doc(db, "community_posts", postId);
  const batch = writeBatch(db);

  const newCommentRef = doc(commentsCollectionRef);
  batch.set(newCommentRef, {
    postId,
    authorId,
    author: authorProfile,
    content,
    parentCommentId,
    replyCount: 0,
    createdAt: serverTimestamp(),
  });

  if (parentCommentId) {
    const parentCommentRef = doc(db, `community_posts/${postId}/comments`, parentCommentId);
    batch.update(parentCommentRef, { replyCount: increment(1) });
  }

  batch.update(postRef, { commentsCount: increment(1) });
  await batch.commit();
}

/**
 * Returns a query for fetching comments for a specific community post.
 * @param postId The ID of the post.
 */
export function getCommunityCommentsQuery(postId: string): Query {
  return query(
    collection(db, `community_posts/${postId}/comments`),
    orderBy("createdAt", "asc")
  );
}