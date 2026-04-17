import { NextResponse } from "next/server";
import {
  adminAuth,
  isFirebaseAdminConfigured,
} from "@/lib/firebase/admin";
import { verifyIdTokenFromRequest } from "@/lib/server-auth";
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
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Na hostingu chybí nebo je neplatný FIREBASE_SERVICE_ACCOUNT_JSON. Bez něj server neověří přihlášení a nelze nastavit cookie pro /admin. V Netlify: Site settings → Environment variables → vlož celý JSON klíče služby (Project settings → Service accounts) na jeden řádek.",
        code: "admin_not_configured",
      },
      { status: 503 }
    );
  }

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
    const user = await verifyIdTokenFromRequest(request);
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
