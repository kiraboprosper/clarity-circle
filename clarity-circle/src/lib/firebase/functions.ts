"use client";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getFirebaseApp } from "./config";
import type { Reward } from "../types";

function getFirebaseFunctions() {
  return getFunctions(getFirebaseApp());
}

type PointEvent =
  | "account_created"
  | "onboarding_completed"
  | "daily_login"
  | "habit_completed"
  | "helpful_comment"
  | "post_created"
  | "challenge_completed";

export async function awardPointsSecure(input: {
  amount: number;
  type: PointEvent;
  description: string;
  referenceId?: string | null;
}) {
  const functions = getFirebaseFunctions();
  const callable = httpsCallable(functions, "awardPoints");
  await callable(input);
}

export async function redeemRewardSecure(reward: Reward) {
  const functions = getFirebaseFunctions();
  const callable = httpsCallable(functions, "redeemReward");
  await callable({ rewardId: reward.id });
}

export async function syncSubscriptionSecure(customerInfo?: unknown) {
  const functions = getFirebaseFunctions();
  const callable = httpsCallable(functions, "syncSubscription");
  await callable({ customerInfo: customerInfo ?? null });
}

export async function moderateReportSecure(input: {
  reportId: string;
  action: "actioned" | "dismissed";
}) {
  const functions = getFirebaseFunctions();
  const callable = httpsCallable(functions, "moderateReport");
  await callable(input);
}
