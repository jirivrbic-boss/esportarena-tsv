import { NextResponse } from "next/server";
import { verifyFirebaseClientIdTokenFromRequest } from "@/lib/firebase/verify-client-id-token";
import {
  firebaseAdminUnavailableMessage,
  isFirebaseAdminRuntimeError,
} from "@/lib/firebase/runtime-errors";

const COOKIE_NAME = "firebase_session";
/** 5 dní (Firebase session cookie max ~2 týdny). */
const MAX_AGE_SEC = 60 * 60 * 24 * 5;
const MAX_AGE_MS = MAX_AGE_SEC * 1000;

function sessionCookieHeader(value: string, maxAge: number): string {
  const isProd = process.env.NODE_ENV === "production";
  const parts = [
    `${COOKIE_NAME}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (isProd) parts.push("Secure");
  return parts.join("; ");
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const idToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  if (!idToken) {
    return NextResponse.json(
      {
        ok: false,
        error: "Chybí hlavička Authorization: Bearer (Firebase ID token).",
        code: "no_token",
      },
      { status: 401 }
    );
  }

  try {
    const user = await verifyFirebaseClientIdTokenFromRequest(request);
    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "ID token se nepodařilo ověřit. Ověř, že FIREBASE_SERVICE_ACCOUNT_JSON je ze stejného Firebase projektu jako NEXT_PUBLIC_* proměnné. V konzoli Firebase přidej doménu hostingu mezi Authentication → Settings → Authorized domains.",
          code: "invalid_id_token",
        },
        { status: 401 }
      );
    }

    const { adminAuth, isFirebaseAdminConfigured } = await import("@/lib/firebase/admin");
    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json({
        ok: true,
        code: "session_cookie_unavailable",
        warning: "FIREBASE_SERVICE_ACCOUNT_JSON není nastavený; session cookie se nevytvoří.",
      });
    }

    const sessionCookie = await adminAuth().createSessionCookie(idToken, {
      expiresIn: MAX_AGE_MS,
    });
    const res = NextResponse.json({ ok: true });
    res.headers.append("Set-Cookie", sessionCookieHeader(sessionCookie, MAX_AGE_SEC));
    return res;
  } catch (e) {
    if (isFirebaseAdminRuntimeError(e)) {
      // Na Cloudflare je session cookie best-effort; klientské přihlášení běží dál.
      return NextResponse.json({
        ok: true,
        code: "session_cookie_unavailable",
        warning: firebaseAdminUnavailableMessage(),
      });
    }
    const msg = e instanceof Error ? e.message : "Chyba session";
    return NextResponse.json({ ok: false, error: msg, code: "session_cookie_error" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", sessionCookieHeader("", 0));
  return res;
}
