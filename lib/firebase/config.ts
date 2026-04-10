import type { FirebaseOptions } from "firebase/app";

function env(name: string): string | undefined {
  const v = process.env[name];
  if (v == null) return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}

/** Hodnoty z buildu (NEXT_PUBLIC_* v bundlu). */
export const firebaseConfig = {
  apiKey: env("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: env("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: env("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: env("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: env("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: env("NEXT_PUBLIC_FIREBASE_APP_ID"),
} as const;

type ConfigKey = keyof typeof firebaseConfig;

/** Doplnění z root layoutu (server má na Netlify env vždy při requestu). */
let injectedFromServer: Partial<Record<ConfigKey, string>> | null = null;

/**
 * Volá se synchronně při renderu (FirebaseRuntimeInit) — přepíše / doplní build-time prázdné hodnoty.
 */
export function installFirebaseConfigFromServer(
  patch: Partial<Record<ConfigKey, string | undefined>>
) {
  const next: Partial<Record<ConfigKey, string>> = {
    ...(injectedFromServer ?? {}),
  };
  for (const key of Object.keys(patch) as ConfigKey[]) {
    const v = patch[key];
    if (typeof v === "string" && v.trim()) {
      next[key] = v.trim();
    }
  }
  injectedFromServer = Object.keys(next).length ? next : injectedFromServer;
}

export function getFirebaseConfig(): FirebaseOptions {
  const b = firebaseConfig;
  const i = injectedFromServer;
  return {
    apiKey: i?.apiKey ?? b.apiKey ?? "",
    authDomain: i?.authDomain ?? b.authDomain ?? "",
    projectId: i?.projectId ?? b.projectId ?? "",
    storageBucket: i?.storageBucket ?? b.storageBucket ?? "",
    messagingSenderId: i?.messagingSenderId ?? b.messagingSenderId ?? "",
    appId: i?.appId ?? b.appId ?? "",
  };
}

export function isFirebaseConfigured(): boolean {
  const c = getFirebaseConfig();
  return Boolean(
    c.apiKey?.trim() && c.projectId?.trim() && c.storageBucket?.trim()
  );
}

/** Pro root layout (server) — čte aktuální env. */
export function readFirebasePublicEnvFromProcess(): Record<ConfigKey, string | undefined> {
  return {
    apiKey: env("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: env("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: env("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: env("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: env("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: env("NEXT_PUBLIC_FIREBASE_APP_ID"),
  };
}
