const brand = {
  bg: "#050505",
  green: "#39FF14",
  muted: "#94a3b8",
  white: "#ffffff",
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell(title: string, inner: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;background:${brand.bg};font-family:Inter,system-ui,sans-serif;color:${brand.white};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${brand.bg};padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;border:1px solid #1f2937;border-radius:12px;overflow:hidden;">
<tr><td style="padding:24px 28px;background:linear-gradient(135deg,#0a0a0a,#111);">
<h1 style="margin:0;font-size:22px;letter-spacing:0.06em;color:${brand.green};text-transform:uppercase;">ESPORTARENA TSV</h1>
<p style="margin:8px 0 0;font-size:13px;color:${brand.muted};">Sezóna 4</p>
</td></tr>
<tr><td style="padding:28px;">
<h2 style="margin:0 0 16px;font-size:18px;color:${brand.white};">${title}</h2>
${inner}
</td></tr>
<tr><td style="padding:16px 28px;border-top:1px solid #1f2937;font-size:12px;color:${brand.muted};">
EsportArena Plzeň · studentský turnaj CS2
</td></tr>
</table>
</td></tr></table></body></html>`;
}

export function teamApprovedEmailHtml(teamName: string, hubUrl: string) {
  const safeName = escapeHtml(teamName);
  const safeHub = escapeHtml(hubUrl);
  return shell(
    "GG! Tvůj tým byl schválen",
    `<p style="line-height:1.6;color:#e5e7eb;">Tým <strong style="color:${brand.white};">${safeName}</strong> byl schválen administrací.</p>
<p style="line-height:1.6;color:#e5e7eb;">Odkaz na Faceit hub (kvalifikace):</p>
<p style="margin:16px 0;"><a href="${safeHub}" style="display:inline-block;padding:12px 20px;background:${brand.green};color:#050505;font-weight:700;text-decoration:none;border-radius:8px;">Otevřít Faceit hub</a></p>
<p style="line-height:1.6;font-size:13px;color:${brand.muted};">Pokud tlačítko nefunguje, zkopíruj odkaz: ${safeHub}</p>
<p style="line-height:1.6;font-size:13px;color:${brand.muted};margin-top:20px;">Oficiální komunikace probíhá na Discordu.</p>`
  );
}

export function teamRejectedEmailHtml(teamName: string, reason: string) {
  const safeName = escapeHtml(teamName);
  const r = escapeHtml(reason.trim() || "Důvod nebyl uveden.");
  return shell(
    "Registrace týmu nebyla schválena",
    `<p style="line-height:1.6;color:#e5e7eb;">Tým <strong style="color:${brand.white};">${safeName}</strong> bohužel nebyl schválen.</p>
<p style="line-height:1.6;color:#fca5a5;"><strong>Důvod:</strong> ${r}</p>
<p style="line-height:1.6;font-size:13px;color:${brand.muted};margin-top:20px;">V případě dotazů použij oficiální Discord turnaje.</p>`
  );
}
