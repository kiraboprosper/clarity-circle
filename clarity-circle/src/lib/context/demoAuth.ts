import type { User } from "firebase/auth";
import type { UserProfile } from "../types";
import { buildFallbackProfile } from "../firebase/fallbacks";

interface DemoAuthState {
  enabled: boolean;
  user: User | null;
  profile: UserProfile | null;
}

function createDemoUser(): User {
  return {
    uid: "demo-user",
    email: "demo@example.com",
    displayName: "Demo User",
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {} as User["metadata"],
    providerData: [],
    refreshToken: "demo-refresh-token",
    tenantId: null,
    phoneNumber: null,
    providerId: "demo",
    delete: async () => undefined,
    getIdToken: async () => "demo-token",
    getIdTokenResult: async () => ({ token: "demo-token", expirationTime: "", issuedAtTime: "", signInProvider: "demo", claims: {}, authTime: "" }) as any,
    reload: async () => undefined,
    toJSON: () => ({}),
  } as User;
}

function getLocationSearch(): string {
  if (typeof window !== "undefined" && window.location) {
    return window.location.search || "";
  }

  if (typeof globalThis !== "undefined" && "location" in globalThis && globalThis.location) {
    return globalThis.location.search || "";
  }

  return "";
}

export function getDemoAuthState(): DemoAuthState {
  const search = getLocationSearch();
  const params = new URLSearchParams(search);
  const enabled = params.get("demoAuth") === "1";

  if (!enabled) return { enabled: false, user: null, profile: null };

  const demoUser = createDemoUser();
  return {
    enabled: true,
    user: demoUser,
    profile: buildFallbackProfile(demoUser),
  };
}
