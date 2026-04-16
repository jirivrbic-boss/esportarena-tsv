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

export async function sendTeamCustomEmail(
  to: string,
  subject: string,
  message: string,
  teamName?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) {
    return { ok: false, error: "Resend není nakonfigurováno." };
  }
  const resend = new Resend(key);
  const safeTeamName = teamName?.trim() || "Tým";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <p>Ahoj,</p>
      <p>administrátor ti poslal zprávu k týmu <strong>${safeTeamName}</strong>.</p>
      <div style="margin:16px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;white-space:pre-wrap">${message}</div>
      <p>ESPORTARENA TSV</p>
    </div>
  `;
  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
