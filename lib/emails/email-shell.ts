/** Sdílená e-mailová šablona — světlé pozadí kvůli čitelnosti v auto dark/light režimu mobilních klientů. */

export const emailBrand = {
  green: "#39FF14",
  greenDark: "#166534",
  btnText: "#050505",
  headerBg: "#0a0a0a",
  headerSub: "#cbd5e1",
  outerBg: "#eef2f6",
  cardBg: "#ffffff",
  bodyText: "#1e293b",
  heading: "#0f172a",
  muted: "#475569",
  border: "#e2e8f0",
  boxBg: "#f8fafc",
  danger: "#b91c1c",
};

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Inline styly pro obsah — vždy s !important kvůli Gmail / Apple Mail dark mode. */
export const ea = {
  p: `margin:0 0 16px;line-height:1.65;color:${emailBrand.bodyText} !important;`,
  muted: `margin:0 0 16px;line-height:1.65;color:${emailBrand.muted} !important;font-size:13px;`,
  strong: `color:${emailBrand.heading} !important;font-weight:700;`,
  strongGreen: `color:${emailBrand.greenDark} !important;font-weight:700;`,
  link: `color:${emailBrand.greenDark} !important;text-decoration:underline;`,
  btn: `display:inline-block;padding:12px 22px;background-color:${emailBrand.green} !important;color:${emailBrand.btnText} !important;text-decoration:none !important;font-weight:700;border-radius:8px;text-transform:uppercase;font-size:13px;letter-spacing:0.06em;`,
  box: `padding:16px;border-radius:8px;background-color:${emailBrand.boxBg} !important;border:1px solid ${emailBrand.border} !important;color:${emailBrand.bodyText} !important;font-size:14px;line-height:1.65;`,
  danger: `line-height:1.65;color:${emailBrand.danger} !important;`,
  list: `margin:0 0 16px;padding-left:20px;color:${emailBrand.bodyText} !important;line-height:1.8;`,
};

const emailHeadStyles = `
:root { color-scheme: light only; supported-color-schemes: light; }
body, .ea-body { background-color: ${emailBrand.outerBg} !important; color: ${emailBrand.bodyText} !important; }
.ea-card, .ea-content { background-color: ${emailBrand.cardBg} !important; }
.ea-title { color: ${emailBrand.heading} !important; }
.ea-text, .ea-text p, .ea-text li, .ea-text td, .ea-text div { color: ${emailBrand.bodyText} !important; }
.ea-muted { color: ${emailBrand.muted} !important; }
.ea-link { color: ${emailBrand.greenDark} !important; }
.ea-box { background-color: ${emailBrand.boxBg} !important; color: ${emailBrand.bodyText} !important; border-color: ${emailBrand.border} !important; }
.ea-btn { background-color: ${emailBrand.green} !important; color: ${emailBrand.btnText} !important; }
.ea-danger { color: ${emailBrand.danger} !important; }
@media (prefers-color-scheme: dark) {
  body, .ea-body { background-color: ${emailBrand.outerBg} !important; color: ${emailBrand.bodyText} !important; }
  .ea-card, .ea-content { background-color: ${emailBrand.cardBg} !important; }
  .ea-text, .ea-text p, .ea-text li, .ea-text td, .ea-text div { color: ${emailBrand.bodyText} !important; }
  .ea-title { color: ${emailBrand.heading} !important; }
  .ea-muted { color: ${emailBrand.muted} !important; }
  .ea-link { color: ${emailBrand.greenDark} !important; }
  .ea-box { background-color: ${emailBrand.boxBg} !important; color: ${emailBrand.bodyText} !important; }
  .ea-btn { background-color: ${emailBrand.green} !important; color: ${emailBrand.btnText} !important; }
  .ea-danger { color: ${emailBrand.danger} !important; }
}
`;

type ShellOptions = {
  headerSub?: string;
  footer?: string;
};

export function emailShell(title: string, inner: string, options?: ShellOptions) {
  const headerSub =
    options?.headerSub ?? "Sezóna 4 · EsportArena Plzeň — studentský turnaj";
  const footer =
    options?.footer ??
    "EsportArena Plzeň · studentský turnaj pro české a slovenské školy (CS2, LoL, Brawl Stars, FC 26)";

  return `<!DOCTYPE html>
<html lang="cs" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<style type="text/css">${emailHeadStyles}</style>
</head>
<body class="ea-body" style="margin:0;padding:0;background-color:${emailBrand.outerBg};color:${emailBrand.bodyText};font-family:Inter,system-ui,-apple-system,sans-serif;">
<table class="ea-body" width="100%" cellpadding="0" cellspacing="0" role="presentation" bgcolor="${emailBrand.outerBg}" style="background-color:${emailBrand.outerBg};padding:32px 16px;">
<tr><td align="center">
<table class="ea-card" width="600" cellpadding="0" cellspacing="0" role="presentation" bgcolor="${emailBrand.cardBg}" style="max-width:600px;background-color:${emailBrand.cardBg};border:1px solid ${emailBrand.border};border-radius:12px;overflow:hidden;">
<tr><td bgcolor="${emailBrand.headerBg}" style="padding:24px 28px;background-color:${emailBrand.headerBg};">
<h1 style="margin:0;font-size:22px;letter-spacing:0.06em;color:${emailBrand.green} !important;text-transform:uppercase;">ESPORTARENA TSV</h1>
<p class="ea-muted" style="margin:8px 0 0;font-size:13px;color:${emailBrand.headerSub} !important;">${headerSub}</p>
</td></tr>
<tr><td class="ea-content ea-text" bgcolor="${emailBrand.cardBg}" style="padding:28px;background-color:${emailBrand.cardBg};color:${emailBrand.bodyText};">
<h2 class="ea-title" style="margin:0 0 16px;font-size:18px;color:${emailBrand.heading} !important;">${title}</h2>
${inner}
</td></tr>
<tr><td class="ea-content" bgcolor="${emailBrand.cardBg}" style="padding:16px 28px;border-top:1px solid ${emailBrand.border};background-color:${emailBrand.cardBg};font-size:12px;color:${emailBrand.muted} !important;">
${footer}
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

/** @deprecated Použij {@link emailShell} */
export function tournamentEmailShell(title: string, inner: string) {
  return emailShell(title, inner, { headerSub: "Sezóna 4" });
}
