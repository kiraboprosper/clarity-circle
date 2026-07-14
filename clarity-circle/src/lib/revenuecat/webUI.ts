// Web-safe shim for react-native-purchases-ui used in the app.

export type PresentPaywallIfNeededParams = {
  requiredEntitlementIdentifier?: string;
};

const PAYWALL_RESULT = {
  PURCHASED: 'PURCHASED',
  RESTORED: 'RESTORED',
  NOT_PRESENTED: 'NOT_PRESENTED',
} as const;

export type PaywallResult = (typeof PAYWALL_RESULT)[keyof typeof PAYWALL_RESULT];

const RevenueCatUI = {
  presentPaywallIfNeeded: async (opts?: PresentPaywallIfNeededParams): Promise<PaywallResult> => {
    void opts;
    // No-op on web placeholder; return NOT_PRESENTED
    return PAYWALL_RESULT.NOT_PRESENTED;
  },
  PAYWALL_RESULT,
};

export default RevenueCatUI;
