/* eslint-disable @next/next/no-img-element */
import { shade } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { DMSERIF } from "./fx";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { scoreOf } from "./outline";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { wordW } from "./usgame6";
import { CREST_HALO, FlagClock, Front, M, Page, caps, dateVenue, frontFeet, nameLines, vsLines } from "./prokit";

/* Round 35 · new pro families, part 2. */

const W = CANVAS_W;

/* ================= 5 · Monogram (matchday) — Pinterest "Cole Jermaine Palmer" letter poster ================= */

/**
 * Monograma (matchday): a light ground; his initials giant and overlapping behind him — the first in the club colour,
 * the second as a thick outline; him full-body in front; his full name small in serif under the letters; HOME X AWAY,
 * date · ground and the flags clock at the foot.
 */
export function Promonogram({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const a = (d.content.firstName || "").trim().charAt(0).toUpperCase();
  const b = (d.content.lastName || "").trim().charAt(0).toUpperCase();
  const px = 900 * k;
  const vs = vsLines(d, 24 * k * ts, W - 2 * M, 15 * k);
  const footH = vs.lines.length * (vs.px + 6 * k) + 12 * k + 18 * k * ts + 14 * k + 26 * k * ts;
  const footTop = lt - 40 * k - footH;
  const p = frontFeet(d, 560, footTop + 10 * k, 1150 * k / 1.3);
  const fx = natFixture(d);
  const name = [d.content.firstName, d.content.lastName].filter(Boolean).join(" ");
  return (
    <Page d={d} bg="#f3f2ee" light>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, #ffffff, #e6e5e0 75%)" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {a && (
          <text x={W * 0.36} y={top + px * 0.78} textAnchor="middle" style={{ fontFamily: DMSERIF, fontSize: px }} fill={t.ink}>
            {a}
          </text>
        )}
        {b && (
          <text x={W * 0.66} y={top + px * 0.98} textAnchor="middle" style={{ fontFamily: DMSERIF, fontSize: px }} fill="none" stroke={t.ink} strokeWidth={10 * k}>
            {b}
          </text>
        )}
      </svg>
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: M, top, display: "flex", alignItems: "center", gap: 14 * k }}>
        {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((u, i) => (
          <img key={i} src={u!} alt="" style={{ height: 56 * k, width: 56 * k, objectFit: "contain" }} />
        ))}
      </div>
      <div style={{ position: "absolute", right: M, top: top + 10 * k, fontFamily: DMSERIF, fontStyle: "italic", fontSize: 40 * k, color: "#111", whiteSpace: "nowrap" }}>{name}</div>
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: footTop - 16 * k, height: footH + 26 * k, borderRadius: 18 * k, background: "rgba(255,255,255,.9)", boxShadow: "0 12px 34px rgba(0,0,0,.12)" }} />
      <div style={{ position: "absolute", left: M, right: M, top: footTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#111"), marginBottom: 6 * k }}>{l}</div>
        ))}
        <div style={{ height: 6 * k }} />
        <div style={caps(18 * k * ts, 0.14, 700, t.ink)}>{dateVenue(d)}</div>
        <div style={{ height: 14 * k }} />
        <FlagClock d={d} px={26 * k * ts} color="#111" gap={22 * k} />
      </div>
    </Page>
  );
}

/* ================= 6 · Spotlight with type columns (matchday) — Pinterest UCL silhouette "Matchday" ================= */

/**
 * Holofote (matchday): a dark ground with a soft cone of light from the top onto him in the club colour; him
 * full-body and sharp in the light; MATCHDAY in serif at the top; the home team in a column on the left (crest, exact
 * name), the away team on the right; date · ground and the flags clock at the foot.
 */
export function Prospotlight({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const p = frontFeet(d, 540, lt + 40 * k, 1150 * k / 1.3);
  const colW = 260 * k;
  const hn = lines3(fx.homeName.toUpperCase(), 24 * k * ts, colW, 0.04, 14 * k);
  const an = lines3(fx.awayName.toUpperCase(), 24 * k * ts, colW, 0.04, 14 * k);
  const nPx = Math.min(hn.px, an.px);
  const midY = H * 0.5;
  const col = (c: string | null, n: { lines: string[] }, right: boolean) => (
    <div style={{ position: "absolute", [right ? "right" : "left"]: M, top: midY - 120 * k, width: colW, display: "flex", flexDirection: "column", alignItems: right ? "flex-end" : "flex-start", textAlign: right ? "right" : "left" }}>
      {c && <img src={c} alt="" style={{ height: 110 * k, width: 110 * k, objectFit: "contain", filter: CREST_HALO }} />}
      <div style={{ height: 14 * k }} />
      {n.lines.map((l, i) => (
        <div key={i} style={{ ...caps(nPx, 0.04, 900, "#fff"), marginBottom: 6 * k, textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>{l}</div>
      ))}
    </div>
  );
  return (
    <Page d={d} bg="#08090c">
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 100%, ${shade(t.ink, -0.4)}, #07080b 70%)` }} />
      <div style={{ position: "absolute", left: W / 2 - 520 * k, top: 0, width: 1040 * k, height: H, background: `radial-gradient(ellipse 50% 70% at 50% 0%, rgba(255,255,255,.28), ${t.glow}33 45%, rgba(0,0,0,0) 75%)`, clipPath: `polygon(40% 0, 60% 0, 100% 100%, 0 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DMSERIF, fontSize: 130 * k, lineHeight: 1, color: "#fff" }}>Matchday</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 150 * k, textAlign: "center", ...caps(16 * k, 0.4, 700, "rgba(255,255,255,.8)") }}>{(matchFacts(d).comp || "").toUpperCase()}</div>
      <Front d={d} p={p} glow={t.glow} />
      {col(fx.homeCrest, hn, false)}
      {col(fx.awayCrest, an, true)}
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: lt - 160 * k, height: 120 * k, borderRadius: 18 * k, background: "rgba(8,9,12,.86)", border: `1px solid ${t.glow}55` }} />
      <div style={{ position: "absolute", left: M, right: M, top: lt - 140 * k, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 * k }}>
        <div style={caps(18 * k * ts, 0.14, 600, "rgba(255,255,255,.88)")}>{dateVenue(d)}</div>
        <FlagClock d={d} px={26 * k * ts} color="#fff" gap={22 * k} />
      </div>
    </Page>
  );
}

/* ================= 7 · Name + block (goal) — Pinterest "ARDA Güler" minimal poster ================= */

/**
 * Golo · nome e bloco (goal): an off-white paper ground; his surname stacked big at the top-left in black with his
 * first name light above it; a club-colour block behind his body with his shirt number in its corner; him in front;
 * GOAL tracked on the block; his crest and exact club at the foot.
 */
export function Goalproblock({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const crest = d.club?.crestUrl;
  const first = d.content.lastName ? d.content.firstName || "" : "";
  const sur = (d.content.lastName || d.content.firstName || "").toUpperCase();
  const sPx = Math.min(210 * k, (W - 2 * M) / Math.max(0.1, wordW(sur, 1)));
  const no = (d.player.number || "").replace(/\D/g, "").slice(0, 2);
  const club = lines3(ourClub(d).toUpperCase(), 20 * k * ts, W - 2 * M - 100 * k, 0.16, 13 * k);
  const bTop = top + 70 * k + sPx * 0.82 + 30 * k;
  const bBot = lt - 120 * k;
  const p = frontFeet(d, 560, bBot + 40 * k, (bBot - bTop) * 1.15);
  return (
    <Page d={d} bg="#f4f1ea" light>
      {first && <div style={{ position: "absolute", left: M, top, fontFamily: SANS, fontWeight: 300, fontSize: 64 * k, lineHeight: 1, color: "#111", whiteSpace: "nowrap" }}>{first}</div>}
      <div style={{ position: "absolute", left: M, top: top + 70 * k, fontFamily: DISPLAY, fontSize: sPx, lineHeight: 0.82, color: "#111", whiteSpace: "nowrap" }}>{sur}</div>
      <div style={{ position: "absolute", left: M + 80 * k, right: M, top: bTop, height: bBot - bTop, background: t.ink }} />
      {no && <div style={{ position: "absolute", right: M + 24 * k, top: bTop + 14 * k, fontFamily: DISPLAY, fontSize: 120 * k, lineHeight: 1, color: "#fff" }}>{no}</div>}
      <div style={{ position: "absolute", left: M + 104 * k, top: bTop + 24 * k, ...caps(28 * k, 0.4, 800, "#fff") }}>{(d.content.kicker || "Goal").toUpperCase()}</div>
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: M, right: M, top: lt - 100 * k, display: "flex", alignItems: "center", gap: 16 * k, background: "rgba(255,255,255,.9)", borderRadius: 14 * k, padding: `${10 * k}px ${16 * k}px` }}>
        {crest && <img src={crest} alt="" style={{ height: 52 * k, width: 52 * k, objectFit: "contain" }} />}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {club.lines.map((l, i) => (
            <div key={i} style={{ ...caps(club.px, 0.16, 800, t.ink), marginBottom: 4 * k }}>{l}</div>
          ))}
        </div>
      </div>
    </Page>
  );
}

/* ================= 8 · Serif over the figure (goal) — Pinterest UCL white-silhouette "Matchday" ================= */

/**
 * Golo · serifa sobre ele (goal): a white studio ground; him full-body in colour; "Goal" huge in black serif italic
 * across his lower body, drawn in front only below his waist (his face and chest stay clear); his crest, full name and
 * exact club small at the foot.
 */
export function Goalproserif({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const crest = d.club?.crestUrl;
  const word = (d.content.kicker || "Goal").toLowerCase();
  const w2 = word.charAt(0).toUpperCase() + word.slice(1);
  const nl = nameLines(d, W - 2 * M - 100 * k, 30 * k, 18 * k);
  const nh = nl.name.lines.length * (nl.name.px + 8 * k) + nl.club.lines.length * (nl.club.px + 6 * k);
  const p = frontFeet(d, 540, lt - nh - 30 * k, 1300 * k / 1.3);
  const f = d.face ?? [0.38, 0.08, 0.24, 0.12];
  const waist = p.img ? p.img.top + p.img.height * Math.min(0.62, f[1] + f[3] * 4.2) : H * 0.55;
  const px = Math.min(320 * k, (W - 2 * M) / Math.max(0.1, w2.length * 0.48));
  const y = Math.max(waist + px * 0.55, top + px);
  return (
    <Page d={d} bg="#fbfbfa" light>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, #ffffff, #ecebe8 80%)" }} />
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: 0, right: 0, top: y - px * 0.85, textAlign: "center", fontFamily: DMSERIF, fontStyle: "italic", fontSize: px, lineHeight: 1, color: "#111", whiteSpace: "nowrap" }}>{w2}</div>
      <div style={{ position: "absolute", left: M, right: M, top: lt - nh - 20 * k, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 * k }}>
        {crest && <img src={crest} alt="" style={{ height: 60 * k, width: 60 * k, objectFit: "contain" }} />}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {nl.name.lines.map((l, i) => (
            <div key={i} style={{ ...caps(nl.name.px, 0.02, 900, "#111"), marginBottom: 6 * k }}>{l}</div>
          ))}
          {nl.club.lines.map((l, i) => (
            <div key={"c" + i} style={{ ...caps(nl.club.px, 0.16, 700, t.ink), marginBottom: 4 * k }}>{l}</div>
          ))}
        </div>
      </div>
    </Page>
  );
}

/* ================= 9 · "Final Score." (result) — Pinterest "Final Score. 0 – 17" ================= */

/**
 * Resultado · Final Score (result): a club-colour ground; "Final Score." in heavy sans at the top-left; the score huge
 * under it with each club's exact name small over its digits; him full-body on the right, sharp; the competition and
 * the crests at the foot.
 */
export function Resultprofinal({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const score = scoreOf(d, "–");
  const [hg, ag] = score ? score.split("–") : ["–", "–"];
  const dPx = 260 * k;
  const cw = W * 0.4;
  const hn = lines3(fx.homeName.toUpperCase(), 18 * k * ts, cw, 0.04, 12 * k);
  const an = lines3(fx.awayName.toUpperCase(), 18 * k * ts, cw, 0.04, 12 * k);
  const p = frontFeet(d, 760, lt + 60 * k, 1350 * k / 1.3);
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const digit = (n: string, names: { lines: string[]; px: number }, c: string | null, y: number) => (
    <div style={{ position: "absolute", left: M, top: y, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 * k }}>
        {c && <img src={c} alt="" style={{ height: 46 * k, width: 46 * k, objectFit: "contain", filter: CREST_HALO }} />}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {names.lines.map((l, i) => (
            <div key={i} style={{ ...caps(names.px, 0.04, 800, "rgba(255,255,255,.92)"), marginBottom: 3 * k }}>{l}</div>
          ))}
        </div>
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: dPx, lineHeight: 0.9, color: "#fff", letterSpacing: "-0.04em" }}>{n}</div>
    </div>
  );
  return (
    <Page d={d} bg={t.ink}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, 0.1)}, ${shade(t.ink, -0.45)})` }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, top, fontFamily: SANS, fontWeight: 900, fontSize: 110 * k, lineHeight: 0.92, color: "#fff", letterSpacing: "-0.03em" }}>
        Final
        <br />
        Score.
      </div>
      {digit(hg, hn, fx.homeCrest, top + 260 * k)}
      {digit(ag, an, fx.awayCrest, top + 260 * k + dPx + 80 * k)}
      {comp && <div style={{ position: "absolute", left: M, top: lt - 50 * k, ...caps(18 * k * ts, 0.2, 700, "rgba(255,255,255,.85)") }}>{comp}</div>}
    </Page>
  );
}

