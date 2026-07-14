import { describe, expect, it } from "vitest";
import { buildFallbackProfile } from "../src/lib/firebase/fallbacks";

describe("buildFallbackProfile", () => {
  it("creates a usable profile from an authenticated user", () => {
    const profile = buildFallbackProfile({
      uid: "abc123",
      email: "demo@example.com",
      displayName: "Demo User",
      photoURL: "https://example.com/avatar.png",
    } as any);

    expect(profile.uid).toBe("abc123");
    expect(profile.displayName).toBe("Demo User");
    expect(profile.username).toBe("demo");
    expect(profile.role).toBe("user");
    expect(profile.subscriptionTier).toBe("free");
    expect(profile.points).toBe(0);
  });
});
