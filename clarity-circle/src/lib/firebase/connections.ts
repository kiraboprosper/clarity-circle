import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "./config";
import type { SuggestedContact, Conversation, ContactData } from "../types";

/**
 * Fetches a list of suggested contacts for a user to reach out to.
 * This initial version suggests contacts from conversations with the oldest interactions.
 * @param userId The UID of the current user.
 * @param count The number of suggestions to return.
 * @returns A promise that resolves to an array of suggested contacts.
 */
export async function getSuggestedContacts(userId: string, count: number = 3): Promise<SuggestedContact[]> {
  // 1. Query the user's oldest conversations
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participantIds", "array-contains", userId),
    orderBy("lastMessageAt", "asc"),
    limit(count)
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return [];
  }

  // 2. For each conversation, get the other participant's profile
  const suggestionsPromises = querySnapshot.docs.map(async (chatDoc) => {
    const chatData = chatDoc.data();
    const otherParticipantId = chatData.participantIds.find((id: string) => id !== userId);

    if (!otherParticipantId) return null;

    const userDocRef = doc(db, "users", otherParticipantId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) return null;

    const userData = userDoc.data();
    const lastInteraction = chatData.lastMessageAt ? new Date(chatData.lastMessageAt.seconds * 1000) : new Date();

    return { id: userDoc.id, name: userData.displayName, photoURL: userData.photoURL, reason: `Last talked ${lastInteraction.toLocaleDateString()}` } as SuggestedContact;
  });

  const suggestions = (await Promise.all(suggestionsPromises)).filter(Boolean) as SuggestedContact[];
  return suggestions;
}

/**
 * Fetches private data (notes, goals) for a specific contact.
 * @param userId The UID of the current user.
 * @param contactId The UID of the contact.
 * @returns A promise that resolves to the contact data.
 */
export async function getContactData(userId: string, contactId: string): Promise<ContactData> {
  const noteDocRef = doc(db, `connections/${userId}/contacts/${contactId}`);
  const docSnap = await getDoc(noteDocRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      notes: data.notes || "",
      communicationGoal: data.communicationGoal || null,
    };
  }
  return { notes: "", communicationGoal: null };
}

/**
 * Saves or updates private data for a specific contact.
 * @param userId The UID of the current user.
 * @param contactId The UID of the contact.
 * @param data The data to save (notes and/or communicationGoal).
 */
export async function saveContactData(userId: string, contactId: string, data: Partial<ContactData>): Promise<void> {
  const noteDocRef = doc(db, `connections/${userId}/contacts/${contactId}`);
  await setDoc(noteDocRef, data, { merge: true });
}

/**
 * Fetches a list of conversations for a user.
 * @param userId The UID of the current user.
 * @returns A promise that resolves to an array of conversations.
 */
export async function getConversations(userId: string): Promise<Conversation[]> {
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participantIds", "array-contains", userId),
    orderBy("lastMessageAt", "desc")
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return [];
  }

  const conversationsPromises = querySnapshot.docs.map(async (chatDoc) => {
    const chatData = chatDoc.data();
    const otherParticipantId = chatData.participantIds.find((id: string) => id !== userId);

    if (!otherParticipantId) return null;

    const userDocRef = doc(db, "users", otherParticipantId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) return null;

    const userData = userDoc.data();
    const lastMessageAt = chatData.lastMessageAt instanceof Timestamp ? chatData.lastMessageAt : Timestamp.fromDate(new Date(chatData.lastMessageAt?.seconds ? chatData.lastMessageAt.seconds * 1000 : Date.now()));

    return {
      id: chatDoc.id,
      type: "direct",
      participants: chatData.participantIds,
      participantProfiles: [
        {
          uid: userData.uid || otherParticipantId,
          displayName: userData.displayName || "Unknown",
          photoURL: userData.photoURL || "",
        },
      ],
      lastMessage: chatData.lastMessageText || "",
      lastMessageAt,
      lastMessageBy: chatData.lastMessageBy || otherParticipantId,
      unreadCounts: chatData.unreadCount || {},
      name: userData.displayName || null,
      avatarURL: userData.photoURL || null,
      createdAt: chatData.createdAt instanceof Timestamp ? chatData.createdAt : Timestamp.fromDate(new Date(chatData.createdAt?.seconds ? chatData.createdAt.seconds * 1000 : Date.now())),
    } as Conversation;
  });

  const conversations = (await Promise.all(conversationsPromises)).filter(Boolean) as Conversation[];
  return conversations;
}
