import { adminAuth, isAdminEmailFromEnv } from "@/lib/firebase/admin";
import { verifyFirebaseClientIdTokenFromRequest } from "@/lib/firebase/verify-client-id-token";
import { isSuperAdminEmail } from "@/lib/super-admin";

export { isSuperAdminEmail, SUPER_ADMIN_EMAIL } from "@/lib/super-admin";

/** Schválení týmů: Super Admin nebo e-maily z ADMIN_EMAILS. */
export function isAdminEmail(email: string | undefined): boolean {
  return isSuperAdminEmail(email) || isAdminEmailFromEnv(email);
}

export async function verifyIdTokenFromRequest(
  request: Request
): Promise<{ uid: string; email: string | undefined } | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const app = adminAuth();
    const decoded = await app.verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
}

export async function requireAdmin(request: Request) {
  const user = await verifyIdTokenFromRequest(request);
  if (!user?.email || !isAdminEmail(user.email)) {
    return null;
  }
  return user;
}

export async function requireSuperAdmin(request: Request) {
  const user = await verifyIdTokenFromRequest(request);
  if (!user?.email || !isSuperAdminEmail(user.email)) {
    return null;
  }
  return user;
}

/** Jakýkoli přihlášený uživatel (platný Firebase ID token). */
export async function requireAuth(request: Request) {
  return verifyIdTokenFromRequest(request);
}

/**
 * Admin API: ověření Bearer ID tokenu bez Admin SDK + kontrola ADMIN_EMAILS / super admin.
 */
export async function verifyAdminBearer(request: Request): Promise<
  | { ok: true; user: { uid: string; email: string } }
  | { ok: false; status: 401 | 403; error: string }
> {
  const user = await verifyFirebaseClientIdTokenFromRequest(request);
  if (!user?.uid) {
    return {
      ok: false,
      status: 401,
      error: "Chybí nebo neplatný Firebase token.",
    };
  }
  if (!user.email || !isAdminEmail(user.email)) {
    return {
      ok: false,
      status: 403,
      error: "Účet nemá oprávnění administrátora.",
    };
  }
  return { ok: true, user: { uid: user.uid, email: user.email } };
}
