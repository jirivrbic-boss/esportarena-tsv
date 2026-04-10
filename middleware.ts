import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSiteAdminEmail } from "@/lib/admin-access";
import { verifyFirebaseSessionCookie } from "@/lib/session-cookie-edge";

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
  const allowed = Boolean(session?.email && isSiteAdminEmail(session.email));

  if (!allowed) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/pravidla/edit", "/oznameni/edit", "/edit"],
};
