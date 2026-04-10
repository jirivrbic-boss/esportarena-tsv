"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type { CaptainProfile } from "@/lib/types";

type AuthState = {
  user: User | null;
  profile: CaptainProfile | null;
  loading: boolean;
  firebaseReady: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CaptainProfile | null>(null);
  const firebaseReady = isFirebaseConfigured();
  const [loading, setLoading] = useState(() => firebaseReady);

  const loadProfile = useCallback(async (u: User) => {
    if (!firebaseReady) return;
    const db = getFirebaseDb();
    const snap = await getDoc(doc(db, "users", u.uid));
    if (snap.exists()) {
      setProfile(snap.data() as CaptainProfile);
    } else {
      setProfile(null);
    }
  }, [firebaseReady]);

  useEffect(() => {
    if (!firebaseReady) return;
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await loadProfile(u);
      else setProfile(null);
      setLoading(false);
    });
    return () => unsub();
  }, [firebaseReady, loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user && firebaseReady) await loadProfile(user);
  }, [user, firebaseReady, loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!firebaseReady) throw new Error("Firebase není nakonfigurováno.");
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    },
    [firebaseReady]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (!firebaseReady) throw new Error("Firebase není nakonfigurováno.");
      const cred = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password
      );
      const db = getFirebaseDb();
      await setDoc(doc(db, "users", cred.user.uid), {
        email: cred.user.email,
        phone: "",
        discordUsername: "",
        faceitNickname: "",
        steamNickname: "",
        isAdult: false,
        profileComplete: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const token = await cred.user.getIdToken();
      await fetch("/api/notifications/admin-new-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: cred.user.email }),
      }).catch(() => {});
      await fetch("/api/notifications/captain-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kind: "welcome",
          displayName: (cred.user.email ?? "kapitán").split("@")[0],
        }),
      }).catch(() => {});
    },
    [firebaseReady]
  );

  const signOut = useCallback(async () => {
    if (!firebaseReady) return;
    await firebaseSignOut(getFirebaseAuth());
  }, [firebaseReady]);

  const sendPasswordReset = useCallback(
    async (email: string) => {
      if (!firebaseReady) throw new Error("Firebase není nakonfigurováno.");
      const auth = getFirebaseAuth();
      const origin = window.location.origin;
      await sendPasswordResetEmail(auth, email.trim(), {
        url: `${origin}/prihlaseni`,
        handleCodeInApp: false,
      });
    },
    [firebaseReady]
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      firebaseReady,
      refreshProfile,
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
    }),
    [
      user,
      profile,
      loading,
      firebaseReady,
      refreshProfile,
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth mimo AuthProvider");
  return ctx;
}
