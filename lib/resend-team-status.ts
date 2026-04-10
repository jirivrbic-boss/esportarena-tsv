import { Resend } from "resend";
import {
  teamApprovedEmailHtml,
  teamRejectedEmailHtml,
} from "@/lib/emails/team-status-templates";

export async function sendTeamApprovedEmail(
  to: string,
  teamName: string,
  hubUrl?: string,
  gameLabel?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) {
    return { ok: false, error: "Resend není nakonfigurováno." };
  }
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from,
    to,
    subject: `GG! Tým „${teamName}“ byl schválen · ESPORTARENA TSV`,
    html: teamApprovedEmailHtml(teamName, hubUrl, gameLabel),
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function sendTeamRejectedEmail(
  to: string,
  teamName: string,
  reason: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) {
    return { ok: false, error: "Resend není nakonfigurováno." };
  }
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Tým „${teamName}“ nebyl schválen · ESPORTARENA TSV`,
    html: teamRejectedEmailHtml(teamName, reason),
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
