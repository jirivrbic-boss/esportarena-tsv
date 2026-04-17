import { NextResponse } from "next/server";
import { verifyFirebaseClientIdTokenFromRequest } from "@/lib/firebase/verify-client-id-token";

const COOKIE_NAME = "firebase_session";
/** 5 dní (Firebase session cookie max ~2 týdny). */
const MAX_AGE_SEC = 60 * 60 * 24 * 5;

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

  const user = await verifyFirebaseClientIdTokenFromRequest(request);
  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ID token se nepodařilo ověřit. Ověř, že doména hostingu je v Firebase Auth Authorized domains.",
        code: "invalid_id_token",
      },
      { status: 401 }
    );
  }

  // Na Cloudflare Workers nevyžadujeme session cookie; auth v admin API běží přes Bearer token.
  return NextResponse.json({
    ok: true,
    code: "session_cookie_skipped",
  });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", sessionCookieHeader("", 0));
  return res;
}
