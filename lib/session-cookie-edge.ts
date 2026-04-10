import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

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
      email: typeof payload.email === "string" ? payload.email : undefined,
      sub: typeof payload.sub === "string" ? payload.sub : undefined,
    };
  } catch {
    return null;
  }
}
