import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let adminApp: App | undefined;

function getServiceAccount(): Record<string, unknown> | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw?.trim()) return null;
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getAdminApp(): App {
  if (adminApp) return adminApp;
  const sa = getServiceAccount();
  if (!sa) {
    throw new Error("Chybí FIREBASE_SERVICE_ACCOUNT_JSON pro serverové operace.");
  }
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  adminApp =
    getApps().length > 0
      ? getApps()[0]!
      : initializeApp({
          credential: cert(sa as Parameters<typeof cert>[0]),
          ...(bucket ? { storageBucket: bucket } : {}),
        });
  return adminApp;
}

export function adminDb() {
  return getFirestore(getAdminApp());
}

export function adminAuth() {
  return getAuth(getAdminApp());
}

export function adminStorage() {
  return getStorage(getAdminApp());
}

export function parseAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  return parseAdminEmails().includes(email.toLowerCase());
}
