import { NextResponse } from "next/server";
import { adminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { bannedEmailDocPath } from "@/lib/captain-ban";
import { getDocRest } from "@/lib/firebase/firestore-rest-admin";
import { sendPasswordResetLinkEmail } from "@/lib/emails/password-reset";
import { SITE_CANONICAL_ORIGIN } from "@/lib/site-seo";
import { reportSiteAction } from "@/lib/discord-webhook";

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Continue URL pro Firebase — vždy oficiální apex (ne www / vercel.app). */
function passwordResetContinueBase(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "").replace("://www.", "://");
  }
  return SITE_CANONICAL_ORIGIN;
}

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? "");
  if (!email) {
    return NextResponse.json({ ok: false, error: "Zadej e-mail." }, { status: 400 });
  }

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Obnova hesla teď není dostupná (chybí konfigurace serveru).",
        clientFallback: true,
      },
      { status: 503 }
    );
  }

  try {
    const ban = await getDocRest(bannedEmailDocPath(email));
    if (ban) {
      // Stejná odpověď jako u neexistujícího — neprozrazujeme detaily
      return NextResponse.json({ ok: true });
    }

    const user = await adminAuth().getUserByEmail(email);
    if (user.disabled) {
      return NextResponse.json({ ok: true });
    }
    let displayName = "";
    try {
      const profile = await getDocRest(`users/${user.uid}`);
      if (profile) {
        displayName = `${String(profile.firstName ?? "")} ${String(profile.lastName ?? "")}`.trim();
      }
    } catch {
      /* */
    }

    const site = passwordResetContinueBase();
    const firebaseLink = await adminAuth().generatePasswordResetLink(email, {
      url: `${site}/prihlaseni`,
      handleCodeInApp: false,
    });

    const parsed = new URL(firebaseLink);
    const oobCode = parsed.searchParams.get("oobCode");
    if (!oobCode) {
      return NextResponse.json(
        {
          ok: false,
          error: "Nepodařilo se připravit odkaz pro obnovu hesla.",
          clientFallback: true,
        },
        { status: 500 }
      );
    }

    const resetUrl = `${site}/heslo/akce?mode=resetPassword&oobCode=${encodeURIComponent(oobCode)}`;
    const sent = await sendPasswordResetLinkEmail({
      to: user.email ?? email,
      displayName: displayName || undefined,
      resetUrl,
    });

    if (!sent.ok) {
      // Resend není nastavený / selhal — NEspalovat Firebase klientskou kvótou
      return NextResponse.json(
        {
          ok: false,
          error: sent.error,
          clientFallback: false,
          resendFailed: true,
        },
        { status: 503 }
      );
    }

    void reportSiteAction({
      content: "**Obnova hesla** · odkaz odeslán e-mailem",
      title: "Password reset",
      fields: [
        { name: "E-mail", value: email, inline: true },
        { name: "UID", value: `\`${user.uid}\``, inline: true },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const code =
      e && typeof e === "object" && "code" in e
        ? String((e as { code?: string }).code)
        : "";
    if (code === "auth/user-not-found") {
      // Stejná odpověď jako při úspěchu — neprozrazujeme existenci účtu
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Odeslání selhalo.",
        clientFallback: true,
      },
      { status: 500 }
    );
  }
}
