import { Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
} from "react-native-purchases";
import type {
  CustomerInfo,
  PurchasesError,
  PurchasesOffering,
  PurchasesPackage,
} from "@revenuecat/purchases-typescript-internal";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import {
  CLARITY_PRO_ENTITLEMENT_ID,
  REVENUECAT_API_KEY,
  REVENUECAT_OFFERING_ID,
} from "./revenueCatConfig";

let configured = false;
let configuredAppUserID: string | null | undefined;

export function isClarityPro(customerInfo: CustomerInfo | null | undefined): boolean {
  return Boolean(customerInfo?.entitlements.active[CLARITY_PRO_ENTITLEMENT_ID]);
}

export async function configureRevenueCat(appUserID?: string | null) {
  if (configured) {
    if (appUserID && appUserID !== configuredAppUserID) {
      await Purchases.logIn(appUserID);
      configuredAppUserID = appUserID;
    }
    return;
  }

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    throw new Error("RevenueCat Purchases is only configured for iOS and Android.");
  }

  Purchases.configure({
    apiKey: REVENUECAT_API_KEY,
    appUserID: appUserID || undefined,
  });

  configured = true;
  configuredAppUserID = appUserID;
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  ensureConfigured();
  return Purchases.getCustomerInfo();
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  ensureConfigured();
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? offerings.all[REVENUECAT_OFFERING_ID] ?? null;
}

export async function getConfiguredPackages(): Promise<PurchasesPackage[]> {
  const offering = await getCurrentOffering();
  return offering?.availablePackages ?? [];
}

export async function purchasePackage(rcPackage: PurchasesPackage): Promise<CustomerInfo> {
  ensureConfigured();
  try {
    const result = await Purchases.purchasePackage(rcPackage);
    return result.customerInfo;
  } catch (error) {
    if (isPurchaseCancelled(error)) {
      throw new Error("Purchase cancelled.");
    }
    throw normalizeRevenueCatError(error, "Purchase could not be completed.");
  }
}

export async function restorePurchases(): Promise<CustomerInfo> {
  ensureConfigured();
  try {
    return await Purchases.restorePurchases();
  } catch (error) {
    throw normalizeRevenueCatError(error, "Purchases could not be restored.");
  }
}

export async function presentPaywall(): Promise<boolean> {
  ensureConfigured();
  const offering = await getCurrentOffering();
  const result = await RevenueCatUI.presentPaywall(
    offering ? { offering } : undefined,
  );
  return isSuccessfulPaywallResult(result);
}

export async function presentPaywallIfNeeded(): Promise<boolean> {
  ensureConfigured();
  const offering = await getCurrentOffering();
  const result = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: CLARITY_PRO_ENTITLEMENT_ID,
    ...(offering ? { offering } : {}),
  });
  return isSuccessfulPaywallResult(result);
}

export async function presentCustomerCenter(): Promise<void> {
  ensureConfigured();
  await RevenueCatUI.presentCustomerCenter();
}

export function addCustomerInfoListener(
  listener: (customerInfo: CustomerInfo) => void,
): () => void {
  ensureConfigured();
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => Purchases.removeCustomerInfoUpdateListener(listener);
}

function ensureConfigured() {
  if (!configured) {
    throw new Error("RevenueCat has not been configured yet.");
  }
}

function isSuccessfulPaywallResult(result: PAYWALL_RESULT): boolean {
  return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
}

function isPurchaseCancelled(error: unknown): boolean {
  return Boolean((error as PurchasesError | undefined)?.userCancelled);
}

function normalizeRevenueCatError(error: unknown, fallback: string): Error {
  if (error instanceof Error) return error;
  const rcError = error as PurchasesError | undefined;
  return new Error(rcError?.message || fallback);
}
