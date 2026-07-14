"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase/config";
import { getUserProfile } from "../firebase/users";
import { recordDailyLogin } from "../firebase/users";
import type { UserProfile } from "../types";
import { waitForAuthState } from "./authBootstrap";
import { buildFallbackProfile } from "../firebase/fallbacks";
import { getDemoAuthState } from "./demoAuth";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (u: User) => {
    try {
      const p = await getUserProfile(u.uid);
      if (p) {
        setProfile(p);
        await recordDailyLogin(u.uid);
        return;
      }

      const fallbackProfile = buildFallbackProfile(u);
      setProfile(fallbackProfile);
      await recordDailyLogin(u.uid).catch(() => undefined);
    } catch (error) {
      console.warn("Falling back to local profile state:", error);
      setProfile(buildFallbackProfile(u));
    }
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user);
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const demoState = getDemoAuthState();
      if (demoState.enabled) {
        if (isMounted) {
          setUser(demoState.user);
          setProfile(demoState.profile);
          setLoading(false);
        }
        return;
      }

      try {
        const initialUser = await waitForAuthState(auth, onAuthStateChanged, 4000);
        if (!isMounted) return;

        setUser(initialUser);
        if (initialUser) {
          try {
            await loadProfile(initialUser);
          } catch (error) {
            console.warn("Unable to load profile during auth bootstrap:", error);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.warn("Auth bootstrap failed:", error);
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
