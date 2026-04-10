import type { User } from "firebase/auth";

/** Nastaví HttpOnly session cookie pro Edge middleware (/admin, /edit). */
export async function syncFirebaseSessionCookie(user: User): Promise<void> {
  const token = await user.getIdToken();
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? "Nepodařilo se nastavit přihlašovací session.");
  }
}
