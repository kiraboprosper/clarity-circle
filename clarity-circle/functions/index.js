const {setGlobalOptions} = require("firebase-functions");
const {onCall, HttpsError, onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
setGlobalOptions({maxInstances: 10});

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

const POINT_EVENTS = {
  account_created: 50,
  onboarding_completed: 100,
  daily_login: 5,
  habit_completed: 10,
  helpful_comment: 5,
  post_created: 10,
  challenge_completed: null,
};

function requireAuth(request) {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required.");
  return request.auth.uid;
}

async function requireModerator(uid) {
  const snap = await db.collection("users").doc(uid).get();
  const role = snap.data()?.role;
  if (role !== "admin" && role !== "moderator") {
    throw new HttpsError("permission-denied", "Moderator access required.");
  }
}

function assertAllowedPoint(type, amount) {
  if (!Object.prototype.hasOwnProperty.call(POINT_EVENTS, type)) {
    throw new HttpsError("invalid-argument", "Unsupported point event.");
  }
  const expected = POINT_EVENTS[type];
  if (expected !== null && expected !== amount) {
    throw new HttpsError("invalid-argument", "Point amount does not match event.");
  }
  if (expected === null && (amount < 1 || amount > 1000)) {
    throw new HttpsError("invalid-argument", "Challenge completion points are out of range.");
  }
}

exports.awardPoints = onCall(async (request) => {
  const uid = requireAuth(request);
  const {amount, type, description, referenceId = null} = request.data || {};
  if (!Number.isInteger(amount) || typeof type !== "string" || typeof description !== "string") {
    throw new HttpsError("invalid-argument", "amount, type, and description are required.");
  }
  assertAllowedPoint(type, amount);
  const id = `${uid}_${type}_${referenceId || new Date().toISOString().slice(0, 10)}`;
  const txRef = db.collection("points").doc(id);
  await db.runTransaction(async (tx) => {
    const existing = await tx.get(txRef);
    if (existing.exists) return;
    tx.set(txRef, {userId: uid, amount, type, description, referenceId, createdAt: FieldValue.serverTimestamp()});
    tx.update(db.collection("users").doc(uid), {points: FieldValue.increment(amount), xp: FieldValue.increment(Math.max(0, amount))});
  });
  return {ok: true};
});

exports.redeemReward = onCall(async (request) => {
  const uid = requireAuth(request);
  const {rewardId} = request.data || {};
  if (typeof rewardId !== "string") throw new HttpsError("invalid-argument", "rewardId is required.");
  const rewardRef = db.collection("rewards").doc(rewardId);
  const userRef = db.collection("users").doc(uid);
  const redemptionRef = db.collection("rewardRedemptions").doc(`${uid}_${rewardId}_${Date.now()}`);
  await db.runTransaction(async (tx) => {
    const [rewardSnap, userSnap] = await Promise.all([tx.get(rewardRef), tx.get(userRef)]);
    if (!rewardSnap.exists) throw new HttpsError("not-found", "Reward not found.");
    if (!userSnap.exists) throw new HttpsError("not-found", "User not found.");
    const reward = rewardSnap.data();
    const user = userSnap.data();
    if (reward.isPremiumOnly && user.subscriptionTier === "free") throw new HttpsError("permission-denied", "Premium plan required.");
    if ((user.points || 0) < reward.pointsCost) throw new HttpsError("failed-precondition", "Not enough points.");
    tx.update(userRef, {points: FieldValue.increment(-reward.pointsCost)});
    tx.set(redemptionRef, {userId: uid, rewardId, rewardName: reward.name, pointsCost: reward.pointsCost, createdAt: FieldValue.serverTimestamp()});
    tx.set(db.collection("points").doc(redemptionRef.id), {userId: uid, amount: -reward.pointsCost, type: "reward_redeemed", description: `Redeemed: ${reward.name}`, referenceId: rewardId, createdAt: FieldValue.serverTimestamp()});
  });
  return {ok: true};
});

exports.moderateReport = onCall(async (request) => {
  const uid = requireAuth(request);
  await requireModerator(uid);
  const {reportId, action} = request.data || {};
  if (typeof reportId !== "string" || !["actioned", "dismissed"].includes(action)) {
    throw new HttpsError("invalid-argument", "Invalid moderation request.");
  }
  const reportRef = db.collection("reports").doc(reportId);
  await db.runTransaction(async (tx) => {
    const reportSnap = await tx.get(reportRef);
    if (!reportSnap.exists) throw new HttpsError("not-found", "Report not found.");
    const report = reportSnap.data();
    tx.update(reportRef, {status: action, reviewedBy: uid, reviewedAt: FieldValue.serverTimestamp(), actionTaken: action === "actioned" ? "Content hidden" : "No action required"});
    if (action === "actioned") {
      if (report.targetType === "post") tx.update(db.collection("posts").doc(report.targetId), {isHidden: true, isReported: true});
      if (report.targetType === "comment") tx.update(db.collection("comments").doc(report.targetId), {isHidden: true, isReported: true});
      if (report.targetType === "message") {
        const messageRef = db.collectionGroup("messages").where(admin.firestore.FieldPath.documentId(), "==", report.targetId).limit(1);
        tx.update((await tx.get(messageRef)).docs[0].ref, {isDeleted: true, isReported: true});
      }
    }
  });
  return {ok: true};
});

function tierFromEntitlements(entitlements = {}) {
  const active = Object.values(entitlements).filter((item) => item && item.expires_date !== null);
  const ids = active.map((item) => item.product_identifier || item.id || item.entitlement_id);
  if (ids.includes("business") || entitlements.business) return "business";
  if (ids.includes("pro") || entitlements.pro) return "pro";
  return "free";
}

exports.revenueCatWebhook = onRequest(async (req, res) => {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (secret && req.get("authorization") !== `Bearer ${secret}`) {
    res.status(401).send("Unauthorized");
    return;
  }
  const event = req.body?.event || req.body;
  const uid = event?.app_user_id || event?.appUserId;
  if (!uid) {
    res.status(400).send("Missing app user id");
    return;
  }
  const tier = tierFromEntitlements(event?.entitlement_ids ? Object.fromEntries(event.entitlement_ids.map((id) => [id, {id}])) : event?.subscriber_attributes?.entitlements || event?.entitlements || {});
  await db.collection("users").doc(uid).set({subscriptionTier: tier, subscriptionExpiry: event?.expiration_at_ms ? new Date(event.expiration_at_ms) : null, lastActiveAt: FieldValue.serverTimestamp()}, {merge: true});
  await db.collection("subscriptions").doc(uid).set({userId: uid, tier, provider: "revenuecat", updatedAt: FieldValue.serverTimestamp(), rawEventType: event?.type || null}, {merge: true});
  res.json({ok: true});
});
