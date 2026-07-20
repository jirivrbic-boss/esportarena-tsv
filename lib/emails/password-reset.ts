import { Resend } from "resend";
import { ea, emailShell, escapeHtml } from "@/lib/emails/email-shell";

export async function sendPasswordResetLinkEmail(input: {
  to: string;
  displayName?: string;
  resetUrl: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  if (!key || !from) {
    return {
      ok: false,
      error: "Chybí RESEND_API_KEY nebo RESEND_FROM — e-mail nelze odeslat.",
    };
  }

  const name = escapeHtml((input.displayName ?? "kapitáne").trim() || "kapitáne");
  const url = escapeHtml(input.resetUrl);

  const html = emailShell(
    "Obnova hesla",
    `
<p class="ea-text" style="${ea.p}">Ahoj <strong style="${ea.strong}">${name}</strong>,</p>
<p class="ea-text" style="${ea.p}">
  Požádali jste o obnovu hesla k účtu kapitána na ESPORTARENA TSV.
  Klikněte na tlačítko níže a nastavte nové heslo (zadejte ho dvakrát).
</p>
<p style="margin:24px 0;text-align:center;">
  <a class="ea-btn" href="${url}" style="${ea.btn}">Nastavit nové heslo</a>
</p>
<p class="ea-muted" style="${ea.muted}">
  Odkaz platí omezenou dobu. Pokud jste o obnovu nežádali, e-mail ignorujte.
</p>
<p class="ea-muted" style="${ea.muted}">
  Nejde kliknout? Zkopírujte odkaz:<br>
  <a class="ea-link" href="${url}" style="${ea.link}">${url}</a>
</p>
`
  );

  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from,
    to: input.to,
    subject: "ESPORTARENA TSV · Obnova hesla",
    html,
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
