import { expect, test } from "vitest";
import { createHash } from "node:crypto";
import { DEFAULTS, defaultsFor, fillTemplate, LANGS, pickVariations } from "@/lib/prospect-lang";
import { AGENCY_DEFAULTS, fillAgency } from "./messages";

test("fillAgency fills the agency and picks a stable variation", () => {
  const a = fillAgency("Olá {agencia}, {jogadores} jogadores {{a|b}}", { agencia: "FMA Sports", jogadores: 24 }, "id1");
  expect(a.startsWith("Olá FMA Sports, 24 jogadores ")).toBe(true);
  expect(["a", "b"]).toContain(a.slice(-1));
  expect(a).toBe(fillAgency("Olá {agencia}, {jogadores} jogadores {{a|b}}", { agencia: "FMA Sports", jogadores: 24 }, "id1"));
});

test("default messages never mention NEYOD and carry the price", () => {
  for (const t of [AGENCY_DEFAULTS.pt, AGENCY_DEFAULTS.en]) {
    expect(/neyod/i.test(t.message + t.followup + t.plans)).toBe(false);
    expect(t.message).toContain("15");
    // The plans message lists every pack with its price.
    for (const price of ["15", "12", "20", "28"]) expect(t.plans).toContain(price);
  }
});

test("player message opens personally, offers a free edit and points to the MATCHDAY highlight", () => {
  const m = fillTemplate(DEFAULTS.pt.message, { nome: "Diego", clube: "Leça FC", adversario: "Fafe" }, "seed-1");
  expect(m).toMatch(/^(Olá|Boas|Viva) Diego!/);
  expect(m).toContain("Leça FC");
  expect(m).toContain("contra o Fafe");
  expect(m).toContain("destaque MATCHDAY");
  expect(m).toContain("15€/mês");
  expect(m).not.toMatch(/NEYOD/i);
  for (const lang of Object.keys(DEFAULTS) as (keyof typeof DEFAULTS)[]) {
    expect(DEFAULTS[lang].message).toContain("MATCHDAY");
    expect(DEFAULTS[lang].followup).toContain("MATCHDAY");
    expect(DEFAULTS[lang].message + DEFAULTS[lang].followup + DEFAULTS[lang].plans).not.toMatch(/NEYOD/i);
  }
});

/** Every text a template can produce: each {{a|b|c}} expanded into all its options. */
function allVariants(t: string): string[] {
  const m = /\{\{([^{}]*\|[^{}]*)\}\}/.exec(t);
  if (!m) return [t];
  return m[1].split("|").flatMap((o) => allVariants(t.slice(0, m.index) + o + t.slice(m.index + m[0].length)));
}

// Football / soccer words, in the four languages the basketball messages exist in (MATCHDAY, the highlight's name, is fine).
// Short words are matched as whole words (Unicode letters: "début" is not "but").
const FOOTBALL_WORDS = /soccer|football|futebol|f[uú]tbol|goal|pitch|relvado|kick.?off|apito|whistle|crest|⚽|this weekend|fim de semana|fin de semana|week-end|(?<!\p{L})(?:foot|golo?s?|goles|but|match)(?!\p{L})/iu;

test("basketball messages: no football words, 'your next game', and the same offer", () => {
  for (const lang of LANGS) {
    const t = defaultsFor("basketball", lang);
    for (const kind of ["message", "followup", "plans"] as const) {
      for (const v of allVariants(t[kind])) {
        // "match" is the right word for a basketball game in French: only English is held to "game".
        const text = lang === "fr" ? v.replace(/(?<!\p{L})matchs?(?!\p{L})/gu, "") : v;
        expect(text, `${lang} ${kind}`).not.toMatch(FOOTBALL_WORDS);
        expect(v).not.toMatch(/NEYOD/i);
      }
    }
    expect(t.message).toContain("MATCHDAY");
    expect(t.followup).toContain("MATCHDAY");
    expect(t.message).toContain("15");
  }
  const m = fillTemplate(defaultsFor("basketball", "en").message, { nome: "Victor", clube: "Abilene Christian", adversario: "Lamar" }, "seed-1");
  expect(m).toMatch(/^(Hi|Hey|Hello) Victor!/);
  expect(m).toContain("a free edit for your next game against Lamar");
  expect(m).toContain("(in-game or full body)");
  expect(m).toContain("MATCHDAY highlight");
  expect(m).toContain("€15/month");
  expect(fillTemplate(defaultsFor("basketball", "en").message, { nome: "Victor", clube: "ACU", adversario: "" }, "s")).toContain("a free edit for your next game.");
  expect(fillTemplate(defaultsFor("basketball", "en").followup, { nome: "Victor", clube: "ACU", adversario: "" }, "s")).toContain("a free edit for your next game");
  // Arabic falls back to the English basketball messages.
  expect(defaultsFor("basketball", "ar")).toBe(defaultsFor("basketball", "en"));
  // Still varied: different players get different texts.
  const seen = new Set(["a", "b", "c", "d", "e", "f"].map((s) => pickVariations(defaultsFor("basketball", "en").message, s)));
  expect(seen.size).toBeGreaterThan(1);
});

test("soccer messages are unchanged", () => {
  for (const lang of LANGS) expect(defaultsFor("soccer", lang)).toBe(DEFAULTS[lang]);
  // Fingerprint of every built-in football message (update only on purpose).
  const digest = createHash("sha256").update(JSON.stringify(DEFAULTS)).digest("hex").slice(0, 16);
  expect(digest).toBe("e3b1ba4a4ab83861");
  expect(fillTemplate(DEFAULTS.en.message, { nome: "Diego", clube: "Leça FC", adversario: "Fafe" }, "seed-1")).toContain("this weekend's game against Fafe");
});

import { EMAIL_DEFAULTS, mailtoUrl } from "./messages";

test("management emails: never NEYOD, all prices, subject personalised", () => {
  for (const t of [EMAIL_DEFAULTS.pt, EMAIL_DEFAULTS.en]) {
    expect(/neyod/i.test(t.subject + t.body + t.followupSubject + t.followup)).toBe(false);
    for (const price of ["250", "450", "750", "990"]) expect(t.body).toContain(price);
    expect(t.subject).toContain("{agencia}");
  }
});

test("mailto link carries recipient, subject and body", () => {
  const u = mailtoUrl("geral@agencia.pt", "Olá & bem-vindos", "Linha 1\nLinha 2");
  expect(u.startsWith("mailto:geral@agencia.pt?subject=")).toBe(true);
  expect(decodeURIComponent(u.split("subject=")[1].split("&body=")[0])).toBe("Olá & bem-vindos");
  expect(decodeURIComponent(u.split("&body=")[1])).toBe("Linha 1\nLinha 2");
});
