import type { Auth, User } from "firebase/auth";
import type { Unsubscribe } from "firebase/auth";

export function waitForAuthState(
  authInstance: Auth,
  subscribe: typeof import("firebase/auth").onAuthStateChanged,
  timeoutMs = 4000
): Promise<User | null> {
  return new Promise((resolve) => {
    let settled = false;
    let unsubscribe: Unsubscribe | null = null;

    const finish = (value: User | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      unsubscribe?.();
      resolve(value);
    };

    const timer = setTimeout(() => finish(null), timeoutMs);

    unsubscribe = subscribe(
      authInstance,
      (user) => finish(user),
      () => finish(null)
    );
  });
}
