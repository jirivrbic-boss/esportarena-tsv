import { ea, emailShell, escapeHtml } from "@/lib/emails/email-shell";

export function supportTicketAdminEmailHtml(input: {
  ticketId: string;
  visitorEmail: string;
  visitorName?: string;
  categoryLabel?: string;
  subject: string;
  message: string;
  adminUrl: string;
}): string {
  const safeMsg = escapeHtml(input.message).replace(/\n/g, "<br/>");
  return emailShell(
    "Nový dotaz z centra podpory",
    `<p style="${ea.p}"><strong style="${ea.strong}">Od:</strong> ${escapeHtml(input.visitorEmail)}</p>
${input.visitorName ? `<p style="${ea.p}"><strong style="${ea.strong}">Jméno:</strong> ${escapeHtml(input.visitorName)}</p>` : ""}
${input.categoryLabel ? `<p style="${ea.p}"><strong style="${ea.strong}">Kategorie:</strong> ${escapeHtml(input.categoryLabel)}</p>` : ""}
<p style="${ea.p}"><strong style="${ea.strong}">Předmět:</strong> ${escapeHtml(input.subject)}</p>
<div class="ea-box" style="${ea.box}">${safeMsg}</div>
<p style="margin:24px 0 0;font-size:14px;"><a href="${escapeHtml(input.adminUrl)}" class="ea-link" style="${ea.link}">Otevřít v administraci →</a></p>
<p style="${ea.muted}">Ticket ID: ${escapeHtml(input.ticketId)}</p>`,
    { headerSub: "Administrace · Centrum podpory" }
  );
}

export function supportTicketReplyUserEmailHtml(input: {
  adminReply: string;
}): string {
  const safe = escapeHtml(input.adminReply).replace(/\n/g, "<br/>");
  return emailShell(
    "Odpověď na tvůj dotaz",
    `<p style="${ea.p}">Odpověď organizátorů na tvůj dotaz z centra podpory:</p>
<div class="ea-box" style="${ea.box}">${safe}</div>
<p style="${ea.muted}">Další dotazy můžeš znovu poslat z webu v sekci Centrum podpory.</p>`,
    { headerSub: "Centrum podpory · ESPORTARENA TSV" }
  );
}
