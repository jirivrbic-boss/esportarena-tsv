import { adminAuth, isAdminEmailFromEnv } from "@/lib/firebase/admin";
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
