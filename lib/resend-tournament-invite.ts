import { Resend } from "resend";
import { playoffInvitationEmailHtml } from "@/lib/emails/tournament-invite-templates";

export async function sendPlayoffInvitationEmail(params: {
  to: string;
  teamName: string;
  tournamentName: string;
  gameLabel: string;
  tournamentUrl: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) {
    return { ok: false, error: "Resend není nakonfigurováno." };
  }

  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: `Pozvánka do turnaje „${params.tournamentName}“ · ESPORTARENA TSV`,
    html: playoffInvitationEmailHtml(params),
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
