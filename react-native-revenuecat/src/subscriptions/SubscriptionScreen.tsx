import React from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { PurchasesPackage } from "@revenuecat/purchases-typescript-internal";
import { CLARITY_PRO_ENTITLEMENT_ID, REVENUECAT_PRODUCTS } from "./revenueCatConfig";
import { useRevenueCat } from "./RevenueCatProvider";

const configuredProductIds = [
  REVENUECAT_PRODUCTS.clarityFamilyMonthly,
  REVENUECAT_PRODUCTS.monthly,
];

export function SubscriptionScreen() {
  const {
    packages,
    isPro,
    loading,
    error,
    purchase,
    restorePurchases,
    presentPaywallIfNeeded,
    presentCustomerCenter,
  } = useRevenueCat();

  const buy = async (rcPackage: PurchasesPackage) => {
    const info = await purchase(rcPackage);
    if (info?.entitlements.active[CLARITY_PRO_ENTITLEMENT_ID]) {
      Alert.alert("You're Pro", "Clarity Circle Pro is now active.");
    }
  };

  const openPaywall = async () => {
    const unlocked = await presentPaywallIfNeeded();
    if (!unlocked) {
      Alert.alert("No changes", "The paywall was closed without unlocking Pro.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.muted}>Checking subscription status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Clarity Circle Pro</Text>
      <Text style={styles.status}>{isPro ? "Active" : "Free plan"}</Text>
      {error ? <Text style={styles.error}>{error.message}</Text> : null}

      <TouchableOpacity style={styles.primaryButton} onPress={openPaywall}>
        <Text style={styles.primaryButtonText}>View RevenueCat Paywall</Text>
      </TouchableOpacity>

      <FlatList
        data={packages.filter((item) => configuredProductIds.includes(item.product.identifier))}
        keyExtractor={(item) => item.identifier}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.packageCard} onPress={() => buy(item)}>
            <View style={styles.packageCopy}>
              <Text style={styles.packageTitle}>{item.product.title}</Text>
              <Text style={styles.packageDescription}>{item.product.description}</Text>
            </View>
            <Text style={styles.price}>{item.product.priceString}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.muted}>
            No matching packages found. Confirm the current offering includes `monthly` and
            `clarity_family_monthly`.
          </Text>
        }
      />

      <TouchableOpacity style={styles.secondaryButton} onPress={restorePurchases}>
        <Text style={styles.secondaryButtonText}>Restore purchases</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => {
          presentCustomerCenter().catch((caught) => {
            const message = caught instanceof Error ? caught.message : "Customer Center is unavailable.";
            Alert.alert("Manage subscription", message);
          });
        }}
      >
        <Text style={styles.secondaryButtonText}>Manage subscription</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 16,
    padding: 20,
    backgroundColor: "#fffaf7",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#312a25",
  },
  status: {
    fontSize: 16,
    color: "#6f5f55",
  },
  muted: {
    color: "#7b6f68",
    fontSize: 14,
  },
  error: {
    color: "#b42318",
    fontSize: 14,
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#7c5cff",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#d8ccc4",
    backgroundColor: "white",
  },
  secondaryButtonText: {
    color: "#312a25",
    fontWeight: "700",
  },
  packageCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eadfd7",
    backgroundColor: "white",
  },
  packageCopy: {
    flex: 1,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#312a25",
  },
  packageDescription: {
    marginTop: 4,
    fontSize: 13,
    color: "#7b6f68",
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#7c5cff",
  },
});
