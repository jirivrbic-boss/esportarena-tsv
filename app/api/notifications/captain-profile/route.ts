import { NextResponse } from "next/server";
import { sendDiscordWebhook } from "@/lib/discord-webhook";
import { verifyFirebaseClientIdTokenFromRequest } from "@/lib/firebase/verify-client-id-token";

type Body = {
  captainEmail: string;
  phone?: string;
  discordUsername?: string;
  faceitNickname?: string;
  steamNickname?: string;
  isAdult?: boolean;
  profileComplete?: boolean;
  studentCertUrl?: string | null;
  parentConsentUrl?: string | null;
  /** true = v tomto uložení byl nahrán nový soubor */
  newStudentUpload?: boolean;
  newParentUpload?: boolean;
};

function normEmail(s: string | undefined): string {
  return (s ?? "").trim().toLowerCase();
}

export async function POST(request: Request) {
  const user = await verifyFirebaseClientIdTokenFromRequest(request);
  if (!user?.uid) {
    return NextResponse.json(
      { ok: false, error: "Chybí nebo neplatný Firebase ID token." },
      { status: 401 }
    );
  }
  if (!user.email) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Token neobsahuje e-mail. Zkus se odhlásit a znovu přihlásit (e-mail/heslo).",
      },
      { status: 401 }
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  if (normEmail(body.captainEmail) !== normEmail(user.email)) {
    return NextResponse.json(
      { ok: false, error: "E-mail musí odpovídat přihlášenému účtu." },
      { status: 403 }
    );
  }

  const lines: string[] = [
    `**Telefon:** ${(body.phone ?? "—").slice(0, 80)}`,
    `**Discord:** ${(body.discordUsername ?? "—").slice(0, 120)}`,
    `**Faceit:** ${(body.faceitNickname ?? "—").slice(0, 120)}`,
    `**Steam:** ${(body.steamNickname ?? "—").slice(0, 120)}`,
    `**18+:** ${body.isAdult ? "ano" : "ne"}`,
    `**Profil kompletní:** ${body.profileComplete ? "ano" : "ne"}`,
  ];

  const docBlock: string[] = [];
  if (body.studentCertUrl) {
    docBlock.push(
      `• Potvrzení studenta${body.newStudentUpload ? " _(nový upload)_" : ""}: ${body.studentCertUrl}`
    );
  }
  if (!body.isAdult && body.parentConsentUrl) {
    docBlock.push(
      `• Souhlas zákonného zástupce${body.newParentUpload ? " _(nový upload)_" : ""}: ${body.parentConsentUrl}`
    );
  }

  const description = (
    lines.join("\n") +
    (docBlock.length
      ? `\n\n**Dokumenty kapitána:**\n${docBlock.join("\n")}`
      : "")
  ).slice(0, 4000);

  const headline = body.profileComplete
    ? "**Profil kapitána** · uloženo (kompletní)"
    : "**Profil kapitána** · uloženo (rozpracované)";

  const sent = await sendDiscordWebhook({
    content: headline,
    embeds: [
      {
        title: (user.email ?? "Kapitán").slice(0, 256),
        description,
        fields: [
          {
            name: "UID",
            value: `\`${user.uid}\``,
            inline: true,
          },
        ],
      },
    ],
  });

  if (!sent.ok) {
    return NextResponse.json(
      { ok: false, error: sent.error },
      { status: sent.status }
    );
  }

  return NextResponse.json({ ok: true });
}
