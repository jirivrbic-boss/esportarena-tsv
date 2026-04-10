import { adminAuth, isAdminEmail } from "@/lib/firebase/admin";

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
