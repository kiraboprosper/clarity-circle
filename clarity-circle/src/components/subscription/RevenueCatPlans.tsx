"use client";
import { useEffect, useState } from "react";
import { CreditCard, ExternalLink, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/context/AuthContext";
import { updateUserProfile } from "@/lib/firebase/users";
import { getCurrentOffering, getPurchases, isRevenueCatConfigured, packagePrice, packageTitle, tierFromCustomerInfo } from "@/lib/revenuecat/client";
import type { Offering, Package } from "@revenuecat/purchases-js";

function planName(tier: string | undefined) {
  if (tier === "clarity_plus") return "Clarity Circle+";
  if (tier === "family") return "Family";
  if (tier === "business") return "Business";
  return "Free";
}

export function RevenueCatPlans() {
  const { user, profile, refreshProfile } = useAuth();
  const [offering, setOffering] = useState<Offering | null>(null);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncCustomerInfo = async () => {
    if (!user) return;
    const customerInfo = await getPurchases(user.uid).getCustomerInfo();
    const { tier, expiresAt } = tierFromCustomerInfo(customerInfo);
    await updateUserProfile(user.uid, { subscriptionTier: tier, subscriptionExpiry: expiresAt as never });
    await refreshProfile();
  };

  useEffect(() => {
    const load = async () => {
      if (!user || !isRevenueCatConfigured()) return;
      setLoading(true);
      setError(null);
      try {
        const rcOffering = await getCurrentOffering(user.uid);
        setOffering(rcOffering);
        await syncCustomerInfo();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load RevenueCat offerings.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const purchase = async (rcPackage: Package) => {
    if (!user) return;
    setBuying(rcPackage.identifier);
    setError(null);
    try {
      const result = await getPurchases(user.uid).purchase({ rcPackage, customerEmail: user.email || undefined });
      const { tier, expiresAt } = tierFromCustomerInfo(result.customerInfo);
      await updateUserProfile(user.uid, { subscriptionTier: tier, subscriptionExpiry: expiresAt as never });
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase was not completed.");
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Current Plan</h2>
          <Badge variant={profile?.subscriptionTier === "free" ? "gray" : "lavender"}>{planName(profile?.subscriptionTier)}</Badge>
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Subscriptions unlock unlimited habits, advanced analytics, garden customization, premium badges, exclusive circles, and store discounts.</p>
        {isRevenueCatConfigured() && <Button variant="secondary" size="sm" className="mt-4" onClick={syncCustomerInfo} loading={loading} leftIcon={<RefreshCw className="w-4 h-4" />}>Refresh access</Button>}
      </Card>

      {!isRevenueCatConfigured() && (
        <Card className="border-2 border-amber-200 bg-amber-50/60">
          <h3 className="font-bold text-amber-900">RevenueCat needs your API key</h3>
          <p className="text-sm mt-2 text-amber-800">Set NEXT_PUBLIC_REVENUECAT_API_KEY in .env.local, then configure current offerings and entitlements named clarity_plus, family, and business.</p>
        </Card>
      )}

      {error && <Card className="border-red-200 bg-red-50 text-sm text-red-700">{error}</Card>}

      {offering?.availablePackages?.length ? offering.availablePackages.map((rcPackage) => (
        <Card key={rcPackage.identifier} className="space-y-4">
          <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold" style={{ color: "var(--text-primary)" }}>{packageTitle(rcPackage)}</h3><p className="text-sm" style={{ color: "var(--text-muted)" }}>{rcPackage.webBillingProduct.description || "Premium Clarity Circle plan"}</p></div><span className="font-bold text-lavender-600">{packagePrice(rcPackage)}</span></div>
          <Button className="w-full" onClick={() => purchase(rcPackage)} loading={buying === rcPackage.identifier} leftIcon={<CreditCard className="w-4 h-4" />}>Subscribe</Button>
        </Card>
      )) : isRevenueCatConfigured() && !loading ? (
        <Card className="text-center space-y-3"><Sparkles className="w-8 h-8 mx-auto text-lavender-500" /><p className="font-semibold">No current RevenueCat offering found.</p><p className="text-sm" style={{ color: "var(--text-muted)" }}>Create an offering in RevenueCat and mark it current for this Web Billing app.</p></Card>
      ) : null}

      {profile?.subscriptionTier !== "free" && <Button variant="secondary" className="w-full" rightIcon={<ExternalLink className="w-4 h-4" />}>Manage billing in RevenueCat</Button>}
    </div>
  );
}
