import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./collections";
import type { Reward } from "../types";

export async function getRewards(): Promise<Reward[]> {
  const q = query(collection(db, COLLECTIONS.REWARDS), orderBy("pointsCost", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reward));
}

export async function redeemReward(userId: string, reward: Reward): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.POINTS), {
    userId,
    amount: -reward.pointsCost,
    type: "reward_redeemed",
    description: `Redeemed: ${reward.name}`,
    referenceId: reward.id,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    points: increment(-reward.pointsCost),
  });
}
