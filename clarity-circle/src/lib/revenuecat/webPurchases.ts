// Web-safe shim for RevenueCat Purchases APIs used by the web app.
// This avoids importing react-native-specific SDKs during Next.js builds.

export type CustomerInfo = {
  entitlements: { active: Record<string, any> };
};

export enum LOG_LEVEL {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export type PurchasesError = Error;

type Listener = (info: CustomerInfo) => void;

const listeners = new Set<Listener>();

const Purchases = {
  configure: async (_opts: { apiKey?: string; appUserID?: string }) => {
    // No-op for web; if you want web subscriptions, integrate RevenueCat JS SDK here.
    return;
  },
  addCustomerInfoUpdateListener: (cb: Listener) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  removeCustomerInfoUpdateListener: (cb: Listener) => {
    listeners.delete(cb);
  },
  getCustomerInfo: async (): Promise<CustomerInfo> => {
    return { entitlements: { active: {} } };
  },
  restorePurchases: async (): Promise<CustomerInfo> => {
    return { entitlements: { active: {} } };
  },
  setLogLevel: (_level: LOG_LEVEL) => {
    // noop
  },
};

export default Purchases;
