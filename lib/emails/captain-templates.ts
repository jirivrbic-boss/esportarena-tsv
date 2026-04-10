const brand = {
  bg: "#050505",
  green: "#39FF14",
  muted: "#94a3b8",
  white: "#ffffff",
};

function shell(title: string, inner: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;background:${brand.bg};font-family:Inter,system-ui,sans-serif;color:${brand.white};">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${brand.bg};padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;border:1px solid #1f2937;border-radius:12px;overflow:hidden;">
<tr><td style="padding:24px 28px;background:linear-gradient(135deg,#0a0a0a,#111);">
<h1 style="margin:0;font-size:22px;letter-spacing:0.06em;color:${brand.green};text-transform:uppercase;">ESPORTARENA TSV</h1>
<p style="margin:8px 0 0;font-size:13px;color:${brand.muted};">Sezóna 4 · Oficiální komunikace pouze přes Discord</p>
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

export function welcomeEmailHtml(captainName: string) {
  return shell(
    "Vítej, kapitáne",
    `<p style="line-height:1.6;color:#e5e7eb;">Ahoj ${captainName},</p>
<p style="line-height:1.6;color:#e5e7eb;">tvůj účet kapitána byl vytvořen. Dokonči prosím profil a registraci týmu v portálu.</p>
<p style="line-height:1.6;color:${brand.muted};font-size:13px;">Veškerá oficiální komunikace probíhá výhradně na Discordu — žádný WhatsApp.</p>`
  );
}

export function profileUpdateEmailHtml() {
  return shell(
    "Profil byl aktualizován",
    `<p style="line-height:1.6;color:#e5e7eb;">Tvé údaje kapitána byly uloženy.</p>
<p style="line-height:1.6;color:${brand.muted};font-size:13px;">Změny můžeš kdykoli upravit po přihlášení.</p>`
  );
}

export function teamSubmittedEmailHtml(teamName: string, schoolName: string) {
  return shell(
    "Tým odeslán ke schválení",
    `<p style="line-height:1.6;color:#e5e7eb;">Registrace týmu <strong style="color:${brand.green};">${teamName}</strong> (${schoolName}) byla přijata.</p>
<p style="line-height:1.6;color:#e5e7eb;">Status: <strong>Čeká na schválení</strong>. Po schválení administrátorem získáš přístup k odkazu na Faceit kvalifikaci.</p>
<p style="line-height:1.6;color:${brand.muted};font-size:13px;">Dotazy řešíme na Discordu.</p>`
  );
}

export function adminNewUserEmailHtml(email: string, uid: string) {
  return shell(
    "Nový kapitánský účet",
    `<p style="line-height:1.6;color:#e5e7eb;">Byl zaregistrován nový účet kapitána.</p>
<ul style="color:#e5e7eb;line-height:1.8;"><li>E-mail: ${email}</li><li>UID: ${uid}</li></ul>`
  );
}
