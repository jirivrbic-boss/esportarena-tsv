import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

/** E-mail z Firebase JWT (horní claim nebo identities u session cookie). */
function emailFromFirebasePayload(payload: JWTPayload): string | undefined {
  if (typeof payload.email === "string" && payload.email.trim()) {
    return payload.email.trim();
  }
  const fb = payload.firebase as
    | { identities?: { email?: string[] } }
    | undefined;
  const fromId = fb?.identities?.email?.[0];
  if (typeof fromId === "string" && fromId.trim()) return fromId.trim();
  return undefined;
}

/**
 * Ověření Firebase session cookie JWT na Edge (middleware).
 * @see https://firebase.google.com/docs/auth/admin/manage-cookies
 */
export async function verifyFirebaseSessionCookie(
  token: string,
  projectId: string
): Promise<{ email?: string; sub?: string } | null> {
  if (!token || !projectId) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://session.firebase.google.com/${projectId}`,
      audience: projectId,
    });
    return {
      email: emailFromFirebasePayload(payload),
      sub: typeof payload.sub === "string" ? payload.sub : undefined,
    };
  } catch {
    return null;
  }
}
