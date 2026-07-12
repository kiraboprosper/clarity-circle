"use client";
import { Purchases, type CustomerInfo, type Offering, type Package } from "@revenuecat/purchases-js";
import type { SubscriptionTier } from "@/lib/types";

const API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY;
const PRO_ENTITLEMENT = process.env.NEXT_PUBLIC_REVENUECAT_PRO_ENTITLEMENT || "pro";
const BUSINESS_ENTITLEMENT = process.env.NEXT_PUBLIC_REVENUECAT_BUSINESS_ENTITLEMENT || "business";

let configuredUserId: string | null = null;

export function isRevenueCatConfigured() {
  return Boolean(API_KEY && API_KEY !== "your_revenuecat_api_key");
}

export function getPurchases(userId: string) {
  if (!isRevenueCatConfigured()) throw new Error("RevenueCat API key is not configured.");
  if (!Purchases.isConfigured()) {
    configuredUserId = userId;
    return Purchases.configure({ apiKey: API_KEY!, appUserId: userId });
  }
  const purchases = Purchases.getSharedInstance();
  if (configuredUserId !== userId && purchases.getAppUserId() !== userId) {
    configuredUserId = userId;
    purchases.changeUser(userId);
  }
  return purchases;
}

export async function getCurrentOffering(userId: string): Promise<Offering | null> {
  const offerings = await getPurchases(userId).getOfferings();
  return offerings.current;
}

export function tierFromCustomerInfo(customerInfo: CustomerInfo): { tier: SubscriptionTier; expiresAt: Date | null } {
  const active = customerInfo.entitlements.active;
  if (active[BUSINESS_ENTITLEMENT]?.isActive) return { tier: "business", expiresAt: active[BUSINESS_ENTITLEMENT].expirationDate };
  if (active[PRO_ENTITLEMENT]?.isActive) return { tier: "pro", expiresAt: active[PRO_ENTITLEMENT].expirationDate };
  return { tier: "free", expiresAt: null };
}

export function packagePrice(rcPackage: Package) {
  return rcPackage.webBillingProduct.price.formattedPrice;
}

export function packageTitle(rcPackage: Package) {
  return rcPackage.webBillingProduct.title || rcPackage.identifier;
}
