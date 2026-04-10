import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyFirebaseSessionCookie } from "@/lib/session-cookie-edge";
import { isSuperAdminEmail } from "@/lib/super-admin";

const SESSION_COOKIE = "firebase_session";

export async function middleware(request: NextRequest) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!projectId) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token
    ? await verifyFirebaseSessionCookie(token, projectId)
    : null;
  const isSuper = Boolean(session?.email && isSuperAdminEmail(session.email));

  if (!isSuper) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/pravidla/edit", "/oznameni/edit", "/edit"],
};
