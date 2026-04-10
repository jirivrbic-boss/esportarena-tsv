import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  profileUpdateEmailHtml,
  teamSubmittedEmailHtml,
  welcomeEmailHtml,
} from "@/lib/emails/captain-templates";
import { verifyIdTokenFromRequest } from "@/lib/server-auth";

type Kind = "welcome" | "profile_update" | "team_submitted";

export async function POST(request: Request) {
  const user = await verifyIdTokenFromRequest(request);
  if (!user?.email) {
    return NextResponse.json({ ok: false, error: "Neautorizováno." }, { status: 401 });
  }

  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) {
    return NextResponse.json(
      { ok: false, error: "Resend není nakonfigurováno." },
      { status: 503 }
    );
  }

  let payload: {
    kind: Kind;
    teamName?: string;
    schoolName?: string;
    displayName?: string;
  };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Neplatné JSON." }, { status: 400 });
  }

  const to = user.email;
  let subject: string;
  let html: string;

  switch (payload.kind) {
    case "welcome":
      subject = "Vítej v ESPORTARENA TSV (Sezóna 4)";
      html = welcomeEmailHtml(payload.displayName ?? "kapitáne");
      break;
    case "profile_update":
      subject = "Profil kapitána byl aktualizován";
      html = profileUpdateEmailHtml();
      break;
    case "team_submitted":
      subject = "Tým odeslán ke schválení · ESPORTARENA TSV";
      html = teamSubmittedEmailHtml(
        payload.teamName ?? "Tým",
        payload.schoolName ?? ""
      );
      break;
    default:
      return NextResponse.json({ ok: false, error: "Neznámý typ." }, { status: 400 });
  }

  const resend = new Resend(key);
  const { error } = await resend.emails.send({ from, to, subject, html });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
