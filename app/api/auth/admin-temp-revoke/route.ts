import { NextResponse } from "next/server";

/** Odstraní cookie dočasného admin náhledu (např. odkaz v patičce). */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_temp", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
