import { NextRequest, NextResponse } from "next/server";

/**
 * Dočasný vstup do /admin bez Firebase role.
 *
 * Nastavení (Netlify → Environment):
 * - ADMIN_DOCASNY_JEN_CESTA=1 → stačí otevřít tuto URL bez parametrů (na produkci rizikové — po odladění vypni).
 * - nebo ADMIN_DOCASNY_TOKEN=tajné_slovo → pak URL musí být /admin-docasny-pristup?t=tajné_slovo
 *
 * Pokud je nastavený TOKEN, parametr ?t= je vždy povinný (bezpečnější než jen cesta).
 */
export async function GET(request: NextRequest) {
  const jenCesta = process.env.ADMIN_DOCASNY_JEN_CESTA === "1";
  const token = process.env.ADMIN_DOCASNY_TOKEN?.trim() ?? "";

  if (!jenCesta && !token) {
    return new NextResponse(
      "Dočasný admin přístup není zapnutý. V Netlify přidej ADMIN_DOCASNY_JEN_CESTA=1 nebo ADMIN_DOCASNY_TOKEN + navštiv /admin-docasny-pristup?t=TOKEN.",
      {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }
    );
  }

  const tParam = request.nextUrl.searchParams.get("t")?.trim() ?? "";

  let allowed = false;
  if (token) {
    allowed = tParam === token;
  } else if (jenCesta) {
    allowed = true;
  }

  if (!allowed) {
    return new NextResponse(
      token
        ? "Chybí nebo neplatný parametr ?t= (musí odpovídat ADMIN_DOCASNY_TOKEN v prostředí serveru)."
        : "Přístup zamítnut.",
      { status: 403, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  const res = NextResponse.redirect(new URL("/admin", request.url));
  res.cookies.set("admin_temp", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
