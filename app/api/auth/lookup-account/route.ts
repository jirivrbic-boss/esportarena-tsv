import { NextResponse } from "next/server";
import { adminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { getDocRest } from "@/lib/firebase/firestore-rest-admin";

export type AccountLookupItem = {
  uid: string;
  email: string;
  displayName: string;
  hasProfile: boolean;
};

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? "");
  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Zadej platný e-mail." },
      { status: 400 }
    );
  }

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Vyhledání účtu teď není dostupné (chybí konfigurace serveru).",
      },
      { status: 503 }
    );
  }

  try {
    const user = await adminAuth().getUserByEmail(email);
    let displayName = "Účet kapitána";
    let hasProfile = false;

    try {
      const profile = await getDocRest(`users/${user.uid}`);
      if (profile) {
        hasProfile = true;
        const first = String(profile.firstName ?? "").trim();
        const last = String(profile.lastName ?? "").trim();
        const name = `${first} ${last}`.trim();
        if (name) displayName = name;
      }
    } catch {
      /* profil je volitelný */
    }

    const account: AccountLookupItem = {
      uid: user.uid,
      email: user.email ?? email,
      displayName,
      hasProfile,
    };

    return NextResponse.json({ ok: true, accounts: [account] });
  } catch (e) {
    const code =
      e && typeof e === "object" && "code" in e
        ? String((e as { code?: string }).code)
        : "";
    if (code === "auth/user-not-found") {
      return NextResponse.json({ ok: true, accounts: [] });
    }
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Vyhledání selhalo.",
      },
      { status: 500 }
    );
  }
}
