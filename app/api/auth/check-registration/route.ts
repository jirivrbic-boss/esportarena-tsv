import { NextResponse } from "next/server";
import {
  bannedEmailDocPath,
  normalizeBanEmail,
} from "@/lib/captain-ban";
import { getDocRest } from "@/lib/firebase/firestore-rest-admin";

/** Veřejná kontrola před registrací kapitána — zabanovaný e-mail se nesmí znovu registrovat. */
export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const email = normalizeBanEmail(body.email ?? "");
  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { ok: false, error: "Zadej platný e-mail." },
      { status: 400 }
    );
  }

  try {
    const ban = await getDocRest(bannedEmailDocPath(email));
    if (ban) {
      return NextResponse.json({
        ok: true,
        allowed: false,
        reason: String(ban.reason ?? "Účet s tímto e-mailem je zabanovaný."),
      });
    }
    return NextResponse.json({ ok: true, allowed: true });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Kontrola selhala.",
      },
      { status: 500 }
    );
  }
}
