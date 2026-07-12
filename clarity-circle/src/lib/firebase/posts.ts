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

export async function createPost(authorId: string, authorData: Post["author"], content: string, mediaURLs: string[] = [], tags: string[] = []): Promise<string> {
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
}

export async function getFeedPosts(lastDoc?: DocumentSnapshot | null, pageSize = 15): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(collection(db, COLLECTIONS.POSTS), where("isHidden", "==", false), orderBy("createdAt", "desc"), limit(pageSize));
  if (lastDoc) q = query(q, startAfter(lastDoc));
  const snap = await getDocs(q);
  return { posts: snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post)), lastDoc: snap.docs[snap.docs.length - 1] ?? null };
}

export async function getUserPosts(uid: string): Promise<Post[]> {
  const q = query(collection(db, COLLECTIONS.POSTS), where("authorId", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
}

export async function toggleLike(postId: string, userId: string, liked: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.POSTS, postId), {
    likedBy: liked ? arrayRemove(userId) : arrayUnion(userId),
    likesCount: liked ? increment(-1) : increment(1),
  });
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
