import { ea, emailShell, escapeHtml } from "@/lib/emails/email-shell";

export function playoffInvitationEmailHtml(params: {
  teamName: string;
  tournamentName: string;
  gameLabel: string;
  tournamentUrl: string;
}) {
  const team = escapeHtml(params.teamName);
  const tournament = escapeHtml(params.tournamentName);
  const game = escapeHtml(params.gameLabel);
  const url = escapeHtml(params.tournamentUrl);

  const inner = `
    <p style="${ea.p}">
      Tvůj tým <strong style="${ea.strong}">${team}</strong> byl vybrán pro turnaj
      <strong style="${ea.strong}">${tournament}</strong> (${game}) — fáze <strong style="${ea.strong}">play-off / LAN</strong>.
    </p>
    <p style="${ea.p}">
      Potvrď prosím účast v kapitánském portálu. Bez přijetí pozvánky se tým do turnaje nezapíše.
    </p>
    <p style="margin:24px 0;">
      <a href="${url}" class="ea-btn" style="${ea.btn}">Otevřít turnaj a přijmout pozvánku</a>
    </p>
    <p style="${ea.muted}">
      Odkaz: <a href="${url}" class="ea-link" style="${ea.link}">${url}</a>
    </p>
  `;

  return emailShell(`Pozvánka do turnaje — ${params.tournamentName}`, inner, {
    headerSub: "Sezóna 4 · Play-off / LAN",
  });
}
