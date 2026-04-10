import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { verifyIdTokenFromRequest } from "@/lib/server-auth";

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
  try {
    const user = await verifyIdTokenFromRequest(request);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Neautorizováno." }, { status: 401 });
    }
    const authHeader = request.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    if (!idToken) {
      return NextResponse.json({ ok: false, error: "Chybí token." }, { status: 401 });
    }
    const sessionCookie = await adminAuth().createSessionCookie(idToken, {
      expiresIn: MAX_AGE_MS,
    });
    const res = NextResponse.json({ ok: true });
    res.headers.append("Set-Cookie", sessionCookieHeader(sessionCookie, MAX_AGE_SEC));
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Chyba session";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", sessionCookieHeader("", 0));
  return res;
}
