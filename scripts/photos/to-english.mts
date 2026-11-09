// One-off: rewrites the Portuguese wording saved inside existing edits (titles, stat labels, captions).
// New edits are already English (src/lib/types.ts POST_TYPES and src/lib/render-data.ts).
import { db } from "../../src/lib/db";

const KICKERS: Record<string, string> = {
  "DIA DE JOGO": "MATCHDAY", "HOJE HÁ JOGO": "IT'S MATCHDAY", "É HOJE": "GAME DAY",
  GOLO: "GOAL", BIS: "BRACE", "MELHOR EM CAMPO": "MAN OF THE MATCH", "HOMEM DO JOGO": "PLAYER OF THE MATCH",
  "EM GRANDE FORMA": "IN FORM", "EM ALTA": "ON FIRE", IMPARÁVEL: "UNSTOPPABLE",
  "JOGADOR DO MÊS": "PLAYER OF THE MONTH", "NOVO REFORÇO": "NEW SIGNING", "É OFICIAL": "IT'S OFFICIAL",
  "BEM-VINDO": "WELCOME", RENOVAÇÃO: "NEW DEAL", RENOVOU: "SIGNED", "É PARA CONTINUAR": "HERE TO STAY",
  "EQUIPA DA SEMANA": "TEAM OF THE WEEK", "ONZE DA JORNADA": "XI OF THE WEEK",
};
const LABELS: Record<string, string> = { Jogos: "Games", Golos: "Goals", Golo: "Goal", "Assist.": "Assists", "Assists.": "Assists", Assistências: "Assists", Minutos: "Minutes", Nota: "Rating", Vitórias: "Wins" };
const MONTHS: Record<string, string> = { JANEIRO: "JANUARY", FEVEREIRO: "FEBRUARY", MARÇO: "MARCH", ABRIL: "APRIL", MAIO: "MAY", JUNHO: "JUNE", JULHO: "JULY", AGOSTO: "AUGUST", SETEMBRO: "SEPTEMBER", OUTUBRO: "OCTOBER", NOVEMBRO: "NOVEMBER", DEZEMBRO: "DECEMBER" };

const ordinal = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? "TH" : ["TH", "ST", "ND", "RD"][n % 10] ?? "TH"}`;

function caption(s: string): string {
  let out = s
    .replace(/JORNADA\s*(\d+)/gi, (_, n) => `MATCHDAY ${n}`)
    .replace(/(\d+)\s*\.?[ªº]?\s*PRÉ-?ELIMINATÓRIA/gi, (_, n) => `${ordinal(Number(n))} PRELIMINARY ROUND`)
    .replace(/(\d+)\s*\.?[ªº]?\s*ELIMINATÓRIA/gi, (_, n) => `${ordinal(Number(n))} QUALIFYING ROUND`)
    .replace(/MEIAS-FINAIS/gi, "SEMI-FINALS")
    .replace(/QUARTOS DE FINAL/gi, "QUARTER-FINALS")
    .replace(/OITAVOS DE FINAL/gi, "ROUND OF 16")
    .replace(/ÚLTIMOS (\d+) JOGOS/gi, (_, n) => `LAST ${n} GAMES`);
  for (const [pt, en] of Object.entries(MONTHS)) out = out.replace(new RegExp(pt, "gi"), en);
  return out;
}

let n = 0;
for (const e of db().prepare("SELECT id, content FROM edits").all() as { id: string; content: string }[]) {
  const c = JSON.parse(e.content);
  const before = JSON.stringify(c);
  c.kicker = KICKERS[(c.kicker ?? "").toUpperCase()] ?? caption(c.kicker ?? "");
  c.subline = caption(c.subline ?? "");
  c.stats = (c.stats ?? []).map((s: { label: string; value: string }) => ({ ...s, label: LABELS[s.label] ?? s.label }));
  if (JSON.stringify(c) !== before) {
    db().prepare("UPDATE edits SET content = ? WHERE id = ?").run(JSON.stringify(c), e.id);
    n++;
  }
}
console.log(`${n} edits atualizadas`);
process.exit(0);
