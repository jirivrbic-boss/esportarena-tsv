import type { User } from "firebase/auth";
import { isClientAdminEmail } from "@/lib/admin-client";

/** Nastaví HttpOnly session cookie pro Edge middleware (/admin, /edit). */
export async function syncFirebaseSessionCookie(user: User): Promise<void> {
  const token = await user.getIdToken(true);
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

type AppRouter = { replace: (href: string) => void };

/**
 * Po přihlášení: session cookie, pak přesměrování.
 * Admin → /admin přes celou stránku (cookie se spolehlivě pošle do middleware).
 */
export async function completeAuthLanding(
  user: User,
  router: AppRouter
): Promise<void> {
  try {
    await syncFirebaseSessionCookie(user);
  } catch {
    /* i bez cookie zkusíme admin URL — může selhat v middleware */
  }
  if (isClientAdminEmail(user.email)) {
    if (typeof window !== "undefined") {
      window.location.assign("/admin");
    }
    return;
  }
  router.replace("/dashboard");
}
