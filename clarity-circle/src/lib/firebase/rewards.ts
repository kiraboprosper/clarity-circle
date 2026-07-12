import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./collections";
import { redeemRewardSecure } from "./functions";
import type { Reward } from "../types";

export async function getRewards(): Promise<Reward[]> {
  const q = query(collection(db, COLLECTIONS.REWARDS), orderBy("pointsCost", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reward));
}

export async function redeemReward(_userId: string, reward: Reward): Promise<void> {
  await redeemRewardSecure(reward);
}
