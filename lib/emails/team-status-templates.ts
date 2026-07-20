import { ea, emailShell, escapeHtml } from "@/lib/emails/email-shell";
import { SITE_COPY } from "@/lib/site-copy";

const emailSub = SITE_COPY.emailHeaderSub;

export function teamApprovedEmailHtml(
  teamName: string,
  hubUrl?: string,
  gameLabel?: string
) {
  const safeName = escapeHtml(teamName);
  const safeGame = gameLabel ? escapeHtml(gameLabel) : "";
  const gameLine = gameLabel
    ? `<p style="${ea.p}"><strong style="${ea.strong}">Hra:</strong> ${safeGame}</p>`
    : "";
  const hubBlock =
    hubUrl && hubUrl.length > 0
      ? (() => {
          const safeHub = escapeHtml(hubUrl);
          return `<p style="${ea.p}">Odkaz na Faceit hub (kvalifikace CS2):</p>
<p style="margin:16px 0;"><a href="${safeHub}" class="ea-btn" style="${ea.btn}">Otevřít Faceit hub</a></p>
<p style="${ea.muted}">Pokud tlačítko nefunguje, zkopíruj odkaz: <a href="${safeHub}" class="ea-link" style="${ea.link}">${safeHub}</a></p>`;
        })()
      : `<p style="${ea.p}">Další kroky k této hře najdeš v Oznámeních na webu.</p>`;
  return emailShell(
    "GG! Tvůj tým byl schválen",
    `${gameLine}<p style="${ea.p}">Tým <strong style="${ea.strong}">${safeName}</strong> byl schválen administrací.</p>
${hubBlock}
<p style="${ea.muted}">${SITE_COPY.announcementsPrimary}</p>`,
    { headerSub: emailSub }
  );
}

export function teamRejectedEmailHtml(teamName: string, reason: string) {
  const safeName = escapeHtml(teamName);
  const r = escapeHtml(reason.trim() || "Důvod nebyl uveden.");
  return emailShell(
    "Registrace týmu nebyla schválena",
    `<p style="${ea.p}">Tým <strong style="${ea.strong}">${safeName}</strong> bohužel nebyl schválen.</p>
<p style="${ea.danger}"><strong style="${ea.strong}">Důvod:</strong> ${r}</p>
<p style="${ea.muted}">V případě dotazů použij Centrum podpory na webu nebo sekci Oznámení.</p>`,
    { headerSub: emailSub }
  );
}
