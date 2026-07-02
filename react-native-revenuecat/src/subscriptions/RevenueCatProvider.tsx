import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CustomerInfo, PurchasesPackage } from "@revenuecat/purchases-typescript-internal";
import {
  addCustomerInfoListener,
  configureRevenueCat,
  getConfiguredPackages,
  getCustomerInfo,
  isClarityPro,
  presentCustomerCenter,
  presentPaywall,
  presentPaywallIfNeeded,
  purchasePackage,
  restorePurchases,
} from "./revenueCat";

type RevenueCatContextValue = {
  customerInfo: CustomerInfo | null;
  packages: PurchasesPackage[];
  isPro: boolean;
  loading: boolean;
  error: Error | null;
  refreshCustomerInfo: () => Promise<CustomerInfo | null>;
  purchase: (rcPackage: PurchasesPackage) => Promise<CustomerInfo | null>;
  restorePurchases: () => Promise<CustomerInfo | null>;
  presentPaywall: () => Promise<boolean>;
  presentPaywallIfNeeded: () => Promise<boolean>;
  presentCustomerCenter: () => Promise<void>;
};

const RevenueCatContext = createContext<RevenueCatContextValue | null>(null);

type RevenueCatProviderProps = PropsWithChildren<{
  appUserID?: string | null;
}>;

export function RevenueCatProvider({ appUserID, children }: RevenueCatProviderProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshCustomerInfo = useCallback(async () => {
    try {
      setError(null);
      const info = await getCustomerInfo();
      setCustomerInfo(info);
      return info;
    } catch (caught) {
      const nextError = caught instanceof Error ? caught : new Error("Unable to refresh subscription status.");
      setError(nextError);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let removeListener: (() => void) | undefined;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        await configureRevenueCat(appUserID);
        removeListener = addCustomerInfoListener((info) => {
          if (mounted) setCustomerInfo(info);
        });
        const [info, availablePackages] = await Promise.all([
          getCustomerInfo(),
          getConfiguredPackages(),
        ]);
        if (!mounted) return;
        setCustomerInfo(info);
        setPackages(availablePackages);
      } catch (caught) {
        if (!mounted) return;
        setError(caught instanceof Error ? caught : new Error("Unable to initialize subscriptions."));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
      removeListener?.();
    };
  }, [appUserID]);

  const purchase = useCallback(async (rcPackage: PurchasesPackage) => {
    try {
      setError(null);
      const info = await purchasePackage(rcPackage);
      setCustomerInfo(info);
      return info;
    } catch (caught) {
      const nextError = caught instanceof Error ? caught : new Error("Purchase failed.");
      setError(nextError);
      return null;
    }
  }, []);

  const restore = useCallback(async () => {
    try {
      setError(null);
      const info = await restorePurchases();
      setCustomerInfo(info);
      return info;
    } catch (caught) {
      const nextError = caught instanceof Error ? caught : new Error("Restore failed.");
      setError(nextError);
      return null;
    }
  }, []);

  const value = useMemo<RevenueCatContextValue>(
    () => ({
      customerInfo,
      packages,
      isPro: isClarityPro(customerInfo),
      loading,
      error,
      refreshCustomerInfo,
      purchase,
      restorePurchases: restore,
      presentPaywall,
      presentPaywallIfNeeded,
      presentCustomerCenter,
    }),
    [customerInfo, error, loading, packages, purchase, refreshCustomerInfo, restore],
  );

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
}

export function useRevenueCat() {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error("useRevenueCat must be used inside RevenueCatProvider.");
  }
  return context;
}
