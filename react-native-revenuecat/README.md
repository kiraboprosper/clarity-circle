# Clarity Circle RevenueCat React Native Setup

This folder contains a drop-in RevenueCat subscription integration for a React Native app.
It is intentionally separate from the existing Next.js web app in `clarity-circle/`.

## 1. Install the SDK

Run this from your React Native app root:

```sh
npm install --save react-native-purchases react-native-purchases-ui
```

For iOS, install pods after npm finishes:

```sh
cd ios
pod install
cd ..
```

Android must include billing permission in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="com.android.vending.BILLING" />
```

RevenueCat Paywalls require `react-native-purchases-ui` and currently need iOS 15+ and Android API 24+ for the paywall UI. The core Purchases SDK supports lower minimums, but use the Paywall requirements if you present RevenueCat-hosted paywalls.

## 2. RevenueCat dashboard configuration

Create or confirm these items in RevenueCat before testing:

- Entitlement identifier: `clarity circle Pro`
- Products:
  - `clarity_family_monthly` named `clarity family`
  - `monthly` named `Monthly`
- Offering: create an offering such as `default` and mark it current.
- Packages: add both products to the offering, usually as monthly packages.
- Paywall: attach a RevenueCat Paywall to the offering.

Best practice: gate features by entitlement, not product ID. Both products should unlock `clarity circle Pro` unless the family plan should unlock a different entitlement.

## 3. Add the provider

Wrap your app once, near the root:

```tsx
import React from "react";
import { RevenueCatProvider } from "./src/subscriptions/RevenueCatProvider";
import { AppNavigator } from "./src/AppNavigator";

export default function App() {
  return (
    <RevenueCatProvider appUserID={undefined}>
      <AppNavigator />
    </RevenueCatProvider>
  );
}
```

If your app has authenticated users, pass a stable ID:

```tsx
<RevenueCatProvider appUserID={user.uid}>
  <AppNavigator />
</RevenueCatProvider>
```

## 4. Check entitlement and present paywall

```tsx
import React from "react";
import { Alert, Button, Text, View } from "react-native";
import { useRevenueCat } from "./src/subscriptions/RevenueCatProvider";

export function ProGate() {
  const { isPro, loading, error, presentPaywallIfNeeded, restorePurchases } = useRevenueCat();

  const openPro = async () => {
    const unlocked = await presentPaywallIfNeeded();
    if (!unlocked) Alert.alert("Subscription needed", "Clarity Circle Pro is required.");
  };

  if (loading) return <Text>Checking subscription...</Text>;

  return (
    <View>
      <Text>{isPro ? "Pro active" : "Free plan"}</Text>
      {error ? <Text>{error.message}</Text> : null}
      <Button title="Open Pro" onPress={openPro} />
      <Button title="Restore purchases" onPress={restorePurchases} />
    </View>
  );
}
```

## 5. Customer Center

Add Customer Center when you have the RevenueCat plan and dashboard configuration for it, and when users need self-service subscription support such as cancellation help, refunds on iOS, restoring purchases, or plan changes. Keep a regular restore button too.

```tsx
import { Button } from "react-native";
import { useRevenueCat } from "./src/subscriptions/RevenueCatProvider";

export function BillingHelpButton() {
  const { presentCustomerCenter } = useRevenueCat();
  return <Button title="Manage subscription" onPress={presentCustomerCenter} />;
}
```

## 6. Operational best practices

- Configure Purchases once on app launch.
- Use a stable `appUserID` after login; anonymous IDs are fine before login.
- Do not store a RevenueCat secret key in the mobile app. The public SDK key is expected in-app.
- Call `getCustomerInfo()` when opening premium areas; the SDK caches it and refreshes as needed.
- Listen for customer info updates and update local UI immediately.
- Always provide restore purchases.
- Treat cancellations and billing issues through `CustomerInfo`; entitlement active status remains the source of truth.
- Test using RevenueCat Test Store first, then Apple/Google sandbox testers.
