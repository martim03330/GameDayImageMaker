/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { DMSERIF } from "./fx";
import { NatGround, natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { scoreOf } from "./outline";
import { VIBES } from "./panelscript";
import { DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { headBox, standAt, wordW } from "./usgame6";
import { CREST_HALO, Front, M, Page, caps, frontAt, frontFeet, nameLines } from "./prokit";

/* Round 34 · new pro families, part 2: goal and result (Pinterest "soccer goal celebration poster design"). */

const W = CANVAS_W;

/* ================= 7 · Club band with surname (goal) — Pinterest Sané ================= */

/**
 * Golo · faixa com apelido (goal): a deep ground; a tall vertical band in his club's colour down the middle with his
 * crest at its head; him full-body in front of the band; GOAL tracked small over his head; his surname huge at the
 * foot in the club's accent, his first name rotated beside it, his exact club under it.
 */
export function Goalproband({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const crest = d.club?.crestUrl;
  const sur = (d.content.lastName || d.content.firstName || "").toUpperCase();
  const first = d.content.lastName ? (d.content.firstName || "").toUpperCase() : "";
  const sPx = Math.min(200 * k * ts, (W - 2 * M - (first ? 70 * k : 0)) / Math.max(0.1, wordW(sur, 1)));
  const club = lines3(nameLines(d, W - 2 * M, 30 * k, 20 * k).club.lines.join(" "), 22 * k * ts, W - 2 * M, 0.18, 14 * k);
  const footH = sPx * 0.82 + 18 * k + club.lines.length * (club.px + 6 * k);
  const footTop = lt - 30 * k - footH;
  const bw = 460 * k;
  const p = frontFeet(d, 540, footTop + 40 * k, 1150 * k / 1.3);
  const accent = t.acc === "#ffffff" ? shade(t.glow, 0.3) : t.acc;
  return (
    <Page d={d} bg="#14161b">
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.6)}, #0e1014)` }} />
      <div style={{ position: "absolute", left: (W - bw) / 2, top: 0, width: bw, height: footTop + 30 * k, background: `linear-gradient(180deg, ${shade(t.ink, 0.1)}, ${shade(t.ink, -0.25)})` }} />
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: W / 2 - 60 * k, top: top - 20 * k, height: 120 * k, width: 120 * k, objectFit: "contain", filter: CREST_HALO }} />}
      <div style={{ position: "absolute", left: M, top, fontFamily: DISPLAY, fontSize: 84 * k, lineHeight: 0.82, color: "#fff" }}>{(d.content.kicker || "Goal").toUpperCase()}</div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, right: M, top: footTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12 * k }}>
          {first && <div style={{ ...caps(22 * k, 0.2, 800, "#fff"), writingMode: "vertical-rl", transform: "rotate(180deg)", marginBottom: 6 * k }}>{first}</div>}
          <div style={{ fontFamily: DISPLAY, fontSize: sPx, lineHeight: 0.82, color: accent, whiteSpace: "nowrap", textShadow: "0 8px 26px rgba(0,0,0,.5)" }}>{sur}</div>
        </div>
        <div style={{ height: 18 * k }} />
        {club.lines.map((l, i) => (
          <div key={i} style={{ ...caps(club.px, 0.18, 700, "rgba(255,255,255,.85)"), marginBottom: 6 * k }}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 8 · Mixed-face GOAL! (goal) — Pinterest Rafael Leão "GOAL!" ================= */

/**
 * Golo · letras mistas (goal): a light studio ground; GOAL! huge across the top with each letter in a different face
 * (condensed, serif italic, script) in near-black and the club colour; him full-body in colour in front of it; his
 * full name and exact club in a small row at the foot with his crest.
 */
export function Goalpromixed({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const crest = d.club?.crestUrl;
  const word = ((d.content.kicker || "Goal").toUpperCase() + "!").split("");
  const faces = [
    { f: DISPLAY, s: 1, c: "#16181c", st: "normal" },
    { f: DMSERIF, s: 0.92, c: t.ink, st: "italic" },
    { f: DISPLAY, s: 1, c: "#16181c", st: "normal" },
    { f: VIBES, s: 1.1, c: t.ink, st: "normal" },
    { f: DISPLAY, s: 1, c: "#16181c", st: "normal" },
  ];
  const px = Math.min(330 * k, (W - 2 * M) / Math.max(0.1, word.length * 0.55));
  const nl = nameLines(d, W - 2 * M - 120 * k, 34 * k, 20 * k);
  const nh = nl.name.lines.length * (nl.name.px + 8 * k) + nl.club.lines.length * (nl.club.px + 6 * k);
  const feet = lt - nh - 20 * k;
  const wordBottom = top + 40 * k + px * 1.12;
  // A wide pose (running, a kick) comes out small at full length: it is cropped waist-up instead, big, its cut hidden
  // behind the name row and the canvas foot.
  const wide = (d.photoAspect ?? 0.45) > 0.6;
  const p = wide ? frontAt(d, 560, wordBottom + 260 * k, 175 * k) : frontFeet(d, 560, feet, Math.max(1080 * k / 1.3, Math.min(1150 * k / 1.3, feet - wordBottom + 40 * k)));
  return (
    <Page d={d} bg="#f2f1ee" light>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, #ffffff, #e8e7e3 70%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 40 * k, display: "flex", justifyContent: "center", alignItems: "baseline" }}>
        {word.map((ch, i) => {
          const f = faces[i % faces.length];
          const st: CSSProperties = { fontFamily: f.f, fontStyle: f.st as CSSProperties["fontStyle"], fontSize: px * f.s, lineHeight: 1, color: f.c, whiteSpace: "nowrap" };
          return (
            <span key={i} style={st}>
              {ch}
            </span>
          );
        })}
      </div>
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: M, right: M, top: lt - nh - 20 * k, display: "flex", alignItems: "center", justifyContent: "center", gap: 20 * k, background: "rgba(255,255,255,.9)", borderRadius: 16 * k, padding: `${10 * k}px 0` }}>
        {crest && <img src={crest} alt="" style={{ height: 70 * k, width: 70 * k, objectFit: "contain" }} />}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {nl.name.lines.map((l, i) => (
            <div key={i} style={{ ...caps(nl.name.px, 0.02, 900, "#16181c"), marginBottom: 6 * k }}>{l}</div>
          ))}
          {nl.club.lines.map((l, i) => (
            <div key={"c" + i} style={{ ...caps(nl.club.px, 0.16, 700, t.ink), marginBottom: 4 * k }}>{l}</div>
          ))}
        </div>
      </div>
    </Page>
  );
}

/* ================= 9 · Giant shirt number (goal) — Pinterest Amy Turner "4", Mongiovi "10" ================= */

/**
 * Golo · número da camisola (goal): a dark ground; his shirt number giant in the club colour filling the canvas, him
 * full-body in front of it, sharp, in colour; his surname tracked up the number's side; GOAL and his crest at the top,
 * his full name and exact club at the foot.
 */
export function Goalpronumber({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const crest = d.club?.crestUrl;
  const num = (d.player.number || "").replace(/\D/g, "").slice(0, 2) || "1";
  const nl = nameLines(d, W - 2 * M, 34 * k, 20 * k);
  const nh = nl.name.lines.length * (nl.name.px + 8 * k) + nl.club.lines.length * (nl.club.px + 6 * k);
  const nTop = top + 120 * k;
  const nBot = lt - nh - 60 * k;
  const px = Math.min((nBot - nTop) / 0.8, (W - 2 * M) / Math.max(0.1, wordW(num, 1)));
  const sur = (d.content.lastName || d.content.firstName || "").toUpperCase();
  const p = frontFeet(d, 560, nBot + 30 * k, (nBot - nTop) * 1.05);
  const nx = W / 2;
  return (
    <Page d={d} bg="#121418">
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 45%, ${shade(t.ink, -0.45)}, #0c0e11 75%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: nTop, textAlign: "center", fontFamily: DISPLAY, fontSize: px, lineHeight: 0.8, color: t.ink, whiteSpace: "nowrap" }}>{num}</div>
      <div style={{ position: "absolute", left: nx + wordW(num, px) / 2 + 6 * k, top: nTop + 10 * k, ...caps(26 * k, 0.5, 800, "rgba(255,255,255,.75)"), writingMode: "vertical-rl" }}>{sur}</div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, right: M, top, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 90 * k * ts, lineHeight: 0.82, color: "#fff" }}>{(d.content.kicker || "Goal").toUpperCase()}</div>
        {crest && <img src={crest} alt="" style={{ height: 96 * k, width: 96 * k, objectFit: "contain", filter: CREST_HALO }} />}
      </div>
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: lt - nh - 36 * k, height: nh + 26 * k, borderRadius: 16 * k, background: "rgba(8,10,14,.82)" }} />
      <div style={{ position: "absolute", left: M, right: M, top: lt - nh - 20 * k, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {nl.name.lines.map((l, i) => (
          <div key={i} style={{ ...caps(nl.name.px, 0.02, 900, "#fff"), marginBottom: 8 * k }}>{l}</div>
        ))}
        {nl.club.lines.map((l, i) => (
          <div key={"c" + i} style={{ ...caps(nl.club.px, 0.16, 700, t.glow), marginBottom: 6 * k }}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 10 · Digits flanking "Full Time" (result) — Pinterest "3 Full TIME 1" ================= */

/**
 * Resultado · dígitos e script (result): his real photo graded dark; the home goals huge in serif italic on the left,
 * the away goals on the right, "Full Time" in script between them across the top; crests and exact names under each
 * digit; him sharp; the competition at the foot.
 */
export function Resultprodigits({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const score = scoreOf(d, "–");
  const [hg, ag] = score ? score.split("–") : ["–", "–"];
  const p = standAt(d, 540, 1300, 165);
  const dPx = 300 * k;
  const colW = W * 0.36;
  const hn = lines3(fx.homeName.toUpperCase(), 20 * k * ts, colW, 0.04, 13 * k);
  const an = lines3(fx.awayName.toUpperCase(), 20 * k * ts, colW, 0.04, 13 * k);
  const nPx = Math.min(hn.px, an.px);
  const comp = (matchFacts(d).comp || "").toUpperCase();
  // "Full Time" over the digits, unless his head is there: then low, above the competition, clear of his face.
  const hb = headBox(p);
  const scriptY = hb.y0 > top + 150 * k ? top - 20 * k : lt - 200 * k;
  const side = (n: string, c: string | null, nm: { lines: string[] }, right: boolean) => (
    <div style={{ position: "absolute", [right ? "right" : "left"]: M, top: top + 150 * k, width: colW, display: "flex", flexDirection: "column", alignItems: right ? "flex-end" : "flex-start" }}>
      <div style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: dPx, lineHeight: 0.9, color: "#fff", textShadow: "0 10px 30px rgba(0,0,0,.4)" }}>{n}</div>
      {c && <img src={c} alt="" style={{ height: 70 * k, width: 70 * k, objectFit: "contain", filter: CREST_HALO, marginTop: 6 * k }} />}
      {nm.lines.map((l, i) => (
        <div key={i} style={{ ...caps(nPx, 0.04, 800, "#fff"), marginTop: i ? 4 * k : 10 * k, textAlign: right ? "right" : "left" }}>{l}</div>
      ))}
    </div>
  );
  return (
    <Page d={d} bg="#0c0e12">
      <NatGround place={p} W={W} H={H} style={{ filter: "contrast(1.08) brightness(.8)" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${shade(t.ink, -0.7)}f0 0%, ${shade(t.ink, -0.6)}c0 30%, rgba(0,0,0,0) 50%, rgba(0,0,0,0) 80%, rgba(0,0,0,.6))` }} />
      <Front d={d} p={p} />
      {side(hg, fx.homeCrest, hn, false)}
      {side(ag, fx.awayCrest, an, true)}
      <div style={{ position: "absolute", left: 0, right: 0, top: scriptY, textAlign: "center", fontFamily: VIBES, fontSize: 120 * k, lineHeight: 1, color: "#fff", textShadow: "0 6px 20px rgba(0,0,0,.5)" }}>Full Time</div>
      {comp && <div style={{ position: "absolute", left: 0, right: 0, top: lt - 50 * k, textAlign: "center", ...caps(18 * k * ts, 0.24, 700, "rgba(255,255,255,.85)") }}>{comp}</div>}
    </Page>
  );
}
