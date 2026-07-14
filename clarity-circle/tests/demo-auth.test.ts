import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getDemoAuthState } from "../src/lib/context/demoAuth";

describe("getDemoAuthState", () => {
  const originalLocation = globalThis.location;

  beforeEach(() => {
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: { search: "" },
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("enables a local demo user when the query flag is present", () => {
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: { search: "?demoAuth=1" },
    });

    const state = getDemoAuthState();

    expect(state.enabled).toBe(true);
    expect(state.user?.uid).toBe("demo-user");
    expect(state.profile?.displayName).toBe("Demo User");
    expect(state.profile?.username).toBe("demo");
  });

  it("stays disabled without the demo flag", () => {
    const state = getDemoAuthState();

    expect(state.enabled).toBe(false);
    expect(state.user).toBeNull();
    expect(state.profile).toBeNull();
  });
});
