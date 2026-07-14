﻿import {
  collection, addDoc, doc, updateDoc,
  query, orderBy, limit, where, getDocs,
  serverTimestamp, increment, arrayUnion, arrayRemove,
  startAfter, type DocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./collections";
import { awardPointsSecure } from "./functions";
import type { Post, Comment } from "../types";

const DEMO_FEED_POSTS: Post[] = [
  {
    id: "demo-post-1",
    authorId: "demo-user",
    author: {
      uid: "demo-user",
      displayName: "Maya",
      username: "maya",
      isVerified: true,
      photoURL: null,
    },
    type: "text",
    content: "Small steps still count. I opened my journal and wrote one honest line today.",
    mediaURLs: [],
    likesCount: 18,
    commentsCount: 4,
    likedBy: [],
    tags: ["reflection", "wellness"],
    challengeRef: null,
    habitRef: null,
    isReported: false,
    isHidden: false,
    createdAt: Timestamp.fromDate(new Date("2026-07-10T09:00:00.000Z")),
    updatedAt: Timestamp.fromDate(new Date("2026-07-10T09:00:00.000Z")),
  },
  {
    id: "demo-post-2",
    authorId: "demo-user",
    author: {
      uid: "demo-user",
      displayName: "Jordan",
      username: "jordan",
      isVerified: false,
      photoURL: null,
    },
    type: "text",
    content: "Finished my 7-day challenge streak and celebrated with a slow walk and a warm drink.",
    mediaURLs: [],
    likesCount: 12,
    commentsCount: 2,
    likedBy: [],
    tags: ["challenge", "habit"],
    challengeRef: null,
    habitRef: null,
    isReported: false,
    isHidden: false,
    createdAt: Timestamp.fromDate(new Date("2026-07-11T16:30:00.000Z")),
    updatedAt: Timestamp.fromDate(new Date("2026-07-11T16:30:00.000Z")),
  },
];

export async function createPost(authorId: string, authorData: Post["author"], content: string, mediaURLs: string[] = [], tags: string[] = []): Promise<string> {
  try {
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
    await awardPointsSecure({ amount: 10, type: "post_created", description: "Created a post", referenceId: ref.id });
    return ref.id;
  } catch (error) {
    console.warn("Falling back to demo posting behavior:", error);
    return "";
  }
}

export async function getFeedPosts(lastDoc?: DocumentSnapshot | null, pageSize = 15): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> {
  try {
    let q = query(collection(db, COLLECTIONS.POSTS), where("isHidden", "==", false), orderBy("createdAt", "desc"), limit(pageSize));
    if (lastDoc) q = query(q, startAfter(lastDoc));
    const snap = await getDocs(q);
    return { posts: snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post)), lastDoc: snap.docs[snap.docs.length - 1] ?? null };
  } catch (error) {
    console.warn("Falling back to demo feed data:", error);
    return { posts: DEMO_FEED_POSTS.slice(0, pageSize), lastDoc: null };
  }
}

export async function getUserPosts(uid: string): Promise<Post[]> {
  const q = query(collection(db, COLLECTIONS.POSTS), where("authorId", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
}

export async function toggleLike(postId: string, userId: string, liked: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.POSTS, postId), {
      likedBy: liked ? arrayRemove(userId) : arrayUnion(userId),
      likesCount: liked ? increment(-1) : increment(1),
    });
  } catch (error) {
    console.warn("Skipping like update in demo mode:", error);
  }
}

export async function getPostComments(postId: string): Promise<Comment[]> {
  const q = query(collection(db, COLLECTIONS.COMMENTS), where("postId", "==", postId), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment));
}

export async function addComment(postId: string, userId: string, author: Pick<Comment["author"], "uid" | "displayName" | "username" | "photoURL">, content: string): Promise<Comment> {
  const createdAt = Timestamp.now();
  const payload = {
    postId,
    authorId: userId,
    author,
    content,
    likesCount: 0,
    likedBy: [],
    isReported: false,
    isHidden: false,
    parentCommentId: null,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, COLLECTIONS.COMMENTS), payload);
  await updateDoc(doc(db, COLLECTIONS.POSTS, postId), { commentsCount: increment(1) });
  return { id: ref.id, ...payload, createdAt } as Comment;
}
