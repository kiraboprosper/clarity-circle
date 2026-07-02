import {
  collection, addDoc, doc, updateDoc, deleteDoc,
  query, orderBy, limit, where, getDocs,
  serverTimestamp, increment, arrayUnion, arrayRemove,
  startAfter, type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./collections";
import type { Post, Comment } from "../types";

export async function createPost(
  authorId: string,
  authorData: Post["author"],
  content: string,
  mediaURLs: string[] = [],
  tags: string[] = []
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.POSTS), {
    authorId,
    author: authorData,
    content,
    mediaURLs,
    tags,
    type: mediaURLs.length ? "image" : "text",
    likesCount: 0,
    commentsCount: 0,
    likedBy: [],
    challengeRef: null,
    habitRef: null,
    isReported: false,
    isHidden: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, COLLECTIONS.USERS, authorId), { postsCount: increment(1) });

  const { awardPoints } = await import("./auth");
  await awardPoints(authorId, 10, "post_created", "Created a post");

  return ref.id;
}

export async function getFeedPosts(
  lastDoc?: DocumentSnapshot,
  pageSize = 15
): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, COLLECTIONS.POSTS),
    where("isHidden", "==", false),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );
  if (lastDoc) q = query(q, startAfter(lastDoc));

  const snap = await getDocs(q);
  const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
  return { posts, lastDoc: snap.docs[snap.docs.length - 1] ?? null };
}

export async function getUserPosts(uid: string): Promise<Post[]> {
  const q = query(
    collection(db, COLLECTIONS.POSTS),
    where("authorId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
}

export async function toggleLike(postId: string, userId: string, liked: boolean): Promise<void> {
  const ref = doc(db, COLLECTIONS.POSTS, postId);
  await updateDoc(ref, {
    likedBy:    liked ? arrayRemove(userId) : arrayUnion(userId),
    likesCount: liked ? increment(-1) : increment(1),
  });
}

export async function addComment(
  postId: string,
  authorId: string,
  authorData: Comment["author"],
  content: string
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.COMMENTS), {
    postId,
    authorId,
    author: authorData,
    content,
    likesCount: 0,
    likedBy: [],
    isReported: false,
    parentCommentId: null,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, COLLECTIONS.POSTS, postId), { commentsCount: increment(1) });
  const { awardPoints } = await import("./auth");
  await awardPoints(authorId, 5, "helpful_comment", "Left a comment");
  return ref.id;
}

export async function getPostComments(postId: string): Promise<Comment[]> {
  const q = query(
    collection(db, COLLECTIONS.COMMENTS),
    where("postId", "==", postId),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment));
}

export async function reportContent(
  reporterId: string,
  targetType: string,
  targetId: string,
  targetUserId: string,
  reason: string,
  description = ""
): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.REPORTS), {
    reporterId,
    targetType,
    targetId,
    targetUserId,
    reason,
    description,
    status: "pending",
    reviewedBy: null,
    reviewedAt: null,
    actionTaken: null,
    createdAt: serverTimestamp(),
  });
}
