import { ea, emailShell, escapeHtml } from "@/lib/emails/email-shell";
import {
  ANNOUNCEMENT_CATEGORY_LABEL,
  toAnnouncementExcerpt,
  type AnnouncementCategory,
} from "@/lib/announcements";

export function announcementNotifyEmailHtml(input: {
  title: string;
  content: string;
  category: AnnouncementCategory;
  authorName: string;
  publicUrl: string;
}): string {
  const title = escapeHtml(input.title);
  const author = escapeHtml(input.authorName);
  const categoryLabel = escapeHtml(ANNOUNCEMENT_CATEGORY_LABEL[input.category]);
  const excerpt = escapeHtml(toAnnouncementExcerpt(input.content, 420));
  const url = escapeHtml(input.publicUrl);

  return emailShell(
    "Nové oznámení",
    `
<p class="ea-text" style="${ea.p}">Ahoj kapitáne,</p>
<p class="ea-text" style="${ea.p}">
  na webu ESPORTARENA TSV vyšlo nové oznámení
  (<strong style="${ea.strong}">${categoryLabel}</strong>).
</p>
<div class="ea-box" style="${ea.box}">
  <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#0f172a !important;">${title}</p>
  <p style="margin:0 0 8px;font-size:13px;color:#475569 !important;">Autor: ${author}</p>
  <p style="margin:0;white-space:pre-wrap;line-height:1.65;color:#1e293b !important;">${excerpt}</p>
</div>
<p style="margin:24px 0;text-align:center;">
  <a class="ea-btn" href="${url}" style="${ea.btn}">Otevřít oznámení</a>
</p>
<p class="ea-muted" style="${ea.muted}">
  Dostáváš tento e-mail, protože máš registrovaný tým v příslušné disciplíně
  (nebo jde o obecné oznámení pro všechny kapitány).
</p>
`,
    { headerSub: `Sezóna 4 · Oznámení · ${categoryLabel}` }
  );
}
