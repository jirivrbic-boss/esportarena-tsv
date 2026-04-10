import { NextResponse } from "next/server";
import { Resend } from "resend";
import { adminNewUserEmailHtml } from "@/lib/emails/captain-templates";
import { notifyDiscordCaptainRegistered } from "@/lib/discord-webhook";
import { verifyIdTokenFromRequest } from "@/lib/server-auth";

export async function POST(request: Request) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  const to = process.env.ADMIN_ALERT_EMAIL ?? "jiri@esportarena.cz";

  const user = await verifyIdTokenFromRequest(request);
  if (!user?.email) {
    return NextResponse.json({ ok: false, error: "Neautorizováno." }, { status: 401 });
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const email = body.email ?? user.email;

  await notifyDiscordCaptainRegistered({
    email,
    uid: user.uid,
  });

  if (!key || !from) {
    return NextResponse.json(
      { ok: false, error: "Resend není nakonfigurováno." },
      { status: 503 }
    );
  }

  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from,
    to,
    subject: `[ESPORTARENA TSV] Nový kapitán: ${email}`,
    html: adminNewUserEmailHtml(email, user.uid),
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
