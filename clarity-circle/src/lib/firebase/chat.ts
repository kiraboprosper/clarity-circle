import {
  collection, addDoc, doc, updateDoc, getDocs, onSnapshot,
  query, where, orderBy, serverTimestamp, increment,
  limit, type Unsubscribe,
} from "firebase/firestore";
import { db } from "./config";
import type { Conversation, Message, UserProfile } from "../types";

export async function getOrCreateDirectConversation(
  user1Id: string,
  user1Profile: Pick<UserProfile, "uid" | "displayName" | "photoURL">,
  user2Id: string,
  user2Profile: Pick<UserProfile, "uid" | "displayName" | "photoURL">
): Promise<string> {
  const participants = [user1Id, user2Id].sort();
  const q = query(
    collection(db, "conversations"),
    where("type", "==", "direct"),
    where("participants", "array-contains", user1Id)
  );
  const snap = await getDocs(q);
  const existing = snap.docs.find((d) => {
    const p = d.data().participants as string[];
    return p.includes(user2Id);
  });
  if (existing) return existing.id;

  const ref = await addDoc(collection(db, "conversations"), {
    type: "direct",
    participants,
    participantProfiles: [user1Profile, user2Profile],
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    lastMessageBy: "",
    unreadCounts: { [user1Id]: 0, [user2Id]: 0 },
    name: null,
    avatarURL: null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Conversation));
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderProfile: Message["senderProfile"],
  content: string,
  participants: string[]
): Promise<void> {
  await addDoc(collection(db, `conversations/${conversationId}/messages`), {
    conversationId,
    senderId,
    senderProfile,
    content,
    mediaURLs: [],
    isRead: false,
    readBy: [senderId],
    isDeleted: false,
    isReported: false,
    createdAt: serverTimestamp(),
  });

  const unreadUpdate: Record<string, unknown> = {};
  participants
    .filter((p) => p !== senderId)
    .forEach((p) => { unreadUpdate[`unreadCounts.${p}`] = increment(1); });

  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: content,
    lastMessageAt: serverTimestamp(),
    lastMessageBy: senderId,
    ...unreadUpdate,
  });
}

export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  const q = query(
    collection(db, `conversations/${conversationId}/messages`),
    orderBy("createdAt", "asc"),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)));
  });
}

export async function markConversationRead(conversationId: string, userId: string): Promise<void> {
  await updateDoc(doc(db, "conversations", conversationId), {
    [`unreadCounts.${userId}`]: 0,
  });
}


