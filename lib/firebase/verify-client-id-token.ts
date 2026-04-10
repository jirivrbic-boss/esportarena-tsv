import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { resolveFirebaseProjectIdForServer } from "@/lib/firebase/resolve-firebase-project-id";

const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

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
 * Ověření Firebase **ID tokenu** z klienta (getIdToken) bez Admin SDK.
 * Stejné klíče jako u Admin verifyIdToken — webhooky fungují i bez FIREBASE_SERVICE_ACCOUNT_JSON.
 */
export async function verifyFirebaseClientIdTokenFromRequest(
  request: Request
): Promise<{ uid: string; email: string | undefined } | null> {
  const projectId = resolveFirebaseProjectIdForServer();
  if (!projectId) return null;
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    const uid = typeof payload.sub === "string" ? payload.sub : "";
    if (!uid) return null;
    return { uid, email: emailFromFirebasePayload(payload) };
  } catch {
    return null;
  }
}
