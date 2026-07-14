import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesError } from '@/lib/revenuecat/webPurchases';
import RevenueCatUI, { type PresentPaywallIfNeededParams } from '@/lib/revenuecat/webUI';

// --- Configuration ---
// IMPORTANT: In a real app, use environment variables for keys.
const REVENUECAT_API_KEY_IOS = 'appl_public_ios_key'; // Replace with your actual key
const REVENUECAT_API_KEY_ANDROID = 'goog_public_android_key'; // Replace with your actual key
const ENTITLEMENT_ID = 'clarity circle Pro';

interface RevenueCatContextState {
  isPro: boolean;
  customerInfo: CustomerInfo | null;
  loading: boolean;
  error: PurchasesError | null;
  presentPaywallIfNeeded: () => Promise<boolean>;
  restorePurchases: () => Promise<void>;
  presentCustomerCenter: () => Promise<void>;
}

const RevenueCatContext = createContext<RevenueCatContextState | undefined>(undefined);

export const useRevenueCat = (): RevenueCatContextState => {
  const context = useContext(RevenueCatContext);
  if (context === undefined) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }
  return context;
};

interface RevenueCatProviderProps {
  children: ReactNode;
  appUserID?: string | null;
}

export const RevenueCatProvider = ({ children, appUserID }: RevenueCatProviderProps) => {
  const [isPro, setIsPro] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PurchasesError | null>(null);

  const updateCustomerInfo = (info: CustomerInfo) => {
    setCustomerInfo(info);
    const proEntitlement = info.entitlements.active[ENTITLEMENT_ID];
    setIsPro(typeof proEntitlement !== 'undefined');
  };

  useEffect(() => {
    // Handler must be in the outer scope so cleanup can reference it.
    const onCustomerInfoUpdated = (info: CustomerInfo) => {
      updateCustomerInfo(info);
    };

    const init = async () => {
      // Configure the SDK (no-op placeholder on web). For native apps, use the
      // React Native SDK via a platform-specific implementation.
      await Purchases.configure({ apiKey: undefined, appUserID: appUserID ?? undefined });

      // Set up a listener for customer info updates
      Purchases.addCustomerInfoUpdateListener(onCustomerInfoUpdated);

      // Fetch initial customer info
      const initialInfo = await Purchases.getCustomerInfo();
      updateCustomerInfo(initialInfo);
      setLoading(false);
    };

    init().catch((e) => {
      setError(e as PurchasesError);
      setLoading(false);
    });

    // Optional: Enable debug logs for development
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    // Clean up the listener on unmount
    return () => {
      Purchases.removeCustomerInfoUpdateListener(onCustomerInfoUpdated);
    };
  }, [appUserID]);

  const handlePresentPaywall = async (): Promise<boolean> => {
    try {
      const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: ENTITLEMENT_ID,
      });
      // RevenueCatUI.presentPaywallIfNeeded resolves to a PAYWALL_RESULT string constant.
      return paywallResult === RevenueCatUI.PAYWALL_RESULT.PURCHASED || paywallResult === RevenueCatUI.PAYWALL_RESULT.RESTORED;
    } catch (e) {
      console.error('Paywall presentation error:', e);
      return false;
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const info = await Purchases.restorePurchases();
      updateCustomerInfo(info);
      alert('Purchases restored successfully!');
    } catch (e) {
      alert('Failed to restore purchases.');
      console.error('Restore error:', e);
    }
  };

  const handlePresentCustomerCenter = async () => {
    console.warn('presentCustomerCenter is not available in this environment.');
  };

  const value = {
    isPro,
    customerInfo,
    loading,
    error,
    presentPaywallIfNeeded: handlePresentPaywall,
    restorePurchases: handleRestorePurchases,
    presentCustomerCenter: handlePresentCustomerCenter,
  };

  return (
    <RevenueCatContext.Provider value={value}>
      {children}
    </RevenueCatContext.Provider>
  );
};