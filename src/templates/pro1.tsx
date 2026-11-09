/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { roundTitle } from "./natfree9";
import { DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { headBox, wordW } from "./usgame6";
import { CREST_HALO, FlagClock, Front, M, frontFeet, Page, Portrait, caps, dateVenue, fitCaps, fixtureLines, nameLines, portraitOf, vsLines, whenRows } from "./prokit";

const W = CANVAS_W;

/** The club's light tint for type on a light ground. */
const tint = (ink: string) => shade(ink, 0.55);

/** A surname in stacked chunks of two letters ("KOVACIC" → KO / VA / CIC), the last chunk never one letter alone. */
function chunks(word: string): string[] {
  const s = word.replace(/\s+/g, "");
  if (s.length <= 3) return [s];
  const out: string[] = [];
  for (let i = 0; i < s.length; i += 2) out.push(s.slice(i, i + 2));
  if (out.length > 1 && out[out.length - 1].length === 1) out[out.length - 2] += out.pop();
  return out;
}

/* ================= 1 · Stacked surname (matchday) — liked01 Kovačić ================= */

/**
 * Apelido empilhado (matchday): a light ground; his surname stacked huge in two-letter rows in a light tint of the
 * club colour behind him (KO / VA / CIC); him full-body in front; the competition tracked top-left, HOME / x AWAY in
 * condensed italic caps top-right (exact names, wrapped); crests, date and the flags clock at the foot.
 */
export function Prosurname({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const sur = (d.content.lastName || d.content.firstName || "").toUpperCase();
  const rows = chunks(sur);
  const y0 = top + 120 * k;
  const y1 = lt - 230 * k;
  const maxEm = Math.max(...rows.map((r) => wordW(r, 1)));
  const px = Math.min((y1 - y0) / (rows.length * 0.84), (W - 2 * M) * 0.74 / Math.max(0.1, maxEm));
  const p = frontFeet(d, d.params.side === "left" ? 420 : 640, lt + 80 * k, 1500 * k / 1.3);
  const fl = fixtureLines(d, 430 * k, 44 * k * ts, 26 * k);
  // The fixture sits top-right unless his head is there: then it goes on the free side (left of his head), or — when
  // that is narrow — to the foot, centred, above the crests.
  const hb = headBox(p);
  const flH = (fl.home.length + fl.away.length) * fl.px * 0.92 + fl.px * 0.6 + 8 * k;
  const flTop = top + 40 * k;
  const hitsHead = hb.x1 > W - M - 430 * k && hb.y0 < flTop + flH;
  const freeL = hb.x0 - M - 20 * k;
  const flMode: "right" | "left" | "foot" = !hitsHead ? "right" : freeL >= 360 * k ? "left" : "foot";
  const fl2 = flMode === "foot" ? fixtureLines(d, W - 2 * M, 34 * k * ts, 20 * k) : flMode === "left" ? fixtureLines(d, freeL, 44 * k * ts, 22 * k) : fl;
  const comp = (matchFacts(d).comp || roundTitle(d)).toUpperCase();
  const fx = natFixture(d);
  const dv = dateVenue(d);
  const dvPx = fitCaps(dv, 20 * k * ts, W - 2 * M, 0.3);
  const ink = t.ink;
  const italic: CSSProperties = { fontFamily: DISPLAY, lineHeight: 0.92, color: ink, whiteSpace: "nowrap", transform: "skewX(-8deg)", textAlign: "right" };
  return (
    <Page d={d} bg="#eef1f4" light>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #f8f9fb, #e6eaef)" }} />
      {rows.map((r, i) => (
        <div key={i} style={{ position: "absolute", left: M - px * 0.03, top: y0 + i * px * 0.84, fontFamily: DISPLAY, fontSize: px, lineHeight: 0.84, color: tint(ink), opacity: 0.9, whiteSpace: "nowrap" }}>{r}</div>
      ))}
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: M, top, ...caps(18 * k, 0.32, 800, ink) }}>{comp}</div>
      {flMode !== "foot" && (
        <div style={{ position: "absolute", ...(flMode === "right" ? { right: M } : { left: M, background: "rgba(255,255,255,.82)", padding: `${10 * k}px ${14 * k}px`, borderRadius: 12 * k }), top: flTop, display: "flex", flexDirection: "column", alignItems: flMode === "right" ? "flex-end" : "flex-start" }}>
          {fl2.home.map((l, i) => (
            <div key={"h" + i} style={{ ...italic, fontSize: fl2.px, textAlign: flMode === "right" ? "right" : "left" }}>{l}</div>
          ))}
          <div style={{ ...italic, fontSize: fl2.px * 0.6, color: shade(ink, 0.2), margin: `${4 * k}px 0` }}>X</div>
          {fl2.away.map((l, i) => (
            <div key={"a" + i} style={{ ...italic, fontSize: fl2.px, textAlign: flMode === "right" ? "right" : "left" }}>{l}</div>
          ))}
        </div>
      )}
      {flMode === "foot" && (
        <div style={{ position: "absolute", left: M, right: M, top: lt - 190 * k - (fl2.home.length + fl2.away.length) * fl2.px * 0.95 - 30 * k, display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,.82)", borderRadius: 14 * k, padding: `${10 * k}px 0` }}>
          {[...fl2.home, "X", ...fl2.away].map((l, i) => (
            <div key={i} style={{ fontFamily: DISPLAY, lineHeight: 0.95, color: ink, whiteSpace: "nowrap", fontSize: l === "X" ? fl2.px * 0.6 : fl2.px, transform: "skewX(-8deg)" }}>{l}</div>
          ))}
        </div>
      )}
      <div style={{ position: "absolute", left: M, right: M, top: lt - 160 * k, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 * k }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 * k }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 58 * k, width: 58 * k, objectFit: "contain", filter: CREST_HALO }} />}
          <FlagClock d={d} px={26 * k * ts} color="#15171b" gap={22 * k} />
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 58 * k, width: 58 * k, objectFit: "contain", filter: CREST_HALO }} />}
        </div>
        {dv && <div style={caps(dvPx, 0.3, 700, ink)}>{dv}</div>}
      </div>
    </Page>
  );
}

/* ================= 2 · Two scales on a gradient (matchday + goal) — liked03 Benfica ================= */

function TwoScaleBase({ d, right }: { d: RenderData; right: (col: { x: number; w: number; bottom: number }) => React.ReactNode }) {
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const crest = d.club?.crestUrl;
  const p = frontFeet(d, 400, lt + 40 * k, 1080 * k / 1.3);
  return (
    <Page d={d} bg={shade(t.ink, -0.6)}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 22%, ${shade(t.ink, 0.08)} 0%, ${shade(t.ink, -0.35)} 55%, ${shade(t.ink, -0.7)} 100%)` }} />
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: -120 * k, top: top + 60 * k, width: 620 * k, height: 620 * k, objectFit: "contain", opacity: 0.1, filter: "grayscale(1) brightness(3)" }} />}
      {s && <Portrait s={s} cx={W * 0.55} cy={top + 300 * k} fh={300 * k} mode="color" opacity={0.95} fade={38} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: top + 520 * k, height: 600 * k, background: `linear-gradient(to bottom, transparent, ${shade(t.ink, -0.45)}cc 60%, transparent)` }} />
      <Front d={d} p={p} />
      {right({ x: W * 0.58, w: W * 0.42 - M, bottom: lt - 50 * k })}
    </Page>
  );
}

/**
 * Duas escalas (matchday): a deep club-colour gradient with the crest faint behind; a huge colour close-up of him at
 * the top fading into the ground; the same player full-body and smaller in front; both crests stacked top-right; the
 * fixture (exact names), date · ground and the kick-off as two clocks with round flags bottom-right.
 */
export function Protwoscale({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, top, ts } = frameOf(d);
  const fx = natFixture(d);
  return (
    <TwoScaleBase
      d={d}
      right={(c) => {
        const fl = fixtureLines(d, c.w, 30 * k * ts, 18 * k);
        const rd = roundTitle(d);
        const dv = dateVenue(d);
        const dvl = lines3(dv, 16 * k * ts, c.w, 0.1, 12 * k);
        const h = 22 * k + fl.home.length * (fl.px + 6 * k) + 30 * k + fl.away.length * (fl.px + 6 * k) + 20 * k + dvl.lines.length * (dvl.px + 6 * k) + 24 * k + 40 * k * ts;
        return (
          <>
            <div style={{ position: "absolute", right: M, top: top + 10 * k, display: "flex", flexDirection: "column", gap: 18 * k }}>
              {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((u, i) => (
                <img key={i} src={u!} alt="" style={{ height: 88 * k, width: 88 * k, objectFit: "contain", filter: CREST_HALO }} />
              ))}
            </div>
            <div style={{ position: "absolute", left: c.x, width: c.w, top: c.bottom - h, display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right" }}>
              <div style={caps(18 * k * ts, 0.24, 700, "rgba(255,255,255,.75)")}>{rd}</div>
              <div style={{ height: 14 * k }} />
              {fl.home.map((l, i) => (
                <div key={"h" + i} style={{ ...caps(fl.px, 0.02, 900, "#fff"), marginTop: 6 * k }}>{l}</div>
              ))}
              <div style={{ ...caps(18 * k, 0.2, 700, "rgba(255,255,255,.7)"), margin: `${8 * k}px 0` }}>VS</div>
              {fl.away.map((l, i) => (
                <div key={"a" + i} style={{ ...caps(fl.px, 0.02, 900, "#fff"), marginTop: 6 * k }}>{l}</div>
              ))}
              <div style={{ height: 20 * k }} />
              {dvl.lines.map((l, i) => (
                <div key={"d" + i} style={{ ...caps(dvl.px, 0.1, 600, "rgba(255,255,255,.85)"), marginTop: 6 * k }}>{l}</div>
              ))}
              <div style={{ height: 24 * k }} />
              <FlagClock d={d} px={34 * k * ts} color="#fff" gap={24 * k} />
            </div>
          </>
        );
      }}
    />
  );
}

/** Golo · duas escalas (goal): the same two-scale composition with GOAL, his full name and exact club bottom-right. */
export function Goalprotwoscale({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { k, top, ts } = frameOf(d);
  const crest = d.club?.crestUrl;
  return (
    <TwoScaleBase
      d={d}
      right={(c) => {
        const word = (d.content.kicker || "Goal").toUpperCase();
        const gPx = Math.min(170 * k * ts, c.w / Math.max(0.1, wordW(word, 1)));
        const nl = nameLines(d, c.w, 38 * k, 24 * k);
        const h = gPx * 0.82 + 22 * k + nl.name.lines.length * (nl.name.px + 8 * k) + 8 * k + nl.club.lines.length * (nl.club.px + 6 * k);
        return (
          <>
            {crest && <img src={crest} alt="" style={{ position: "absolute", right: M, top: top + 10 * k, height: 96 * k, width: 96 * k, objectFit: "contain", filter: CREST_HALO }} />}
            <div style={{ position: "absolute", left: c.x, width: c.w, top: c.bottom - h, display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right" }}>
              <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.82, color: "#fff", textShadow: "0 8px 24px rgba(0,0,0,.35)" }}>{word}</div>
              <div style={{ height: 22 * k }} />
              {nl.name.lines.map((l, i) => (
                <div key={i} style={{ ...caps(nl.name.px, 0.02, 900, "#fff"), marginBottom: 8 * k }}>{l}</div>
              ))}
              {nl.club.lines.map((l, i) => (
                <div key={"c" + i} style={{ ...caps(nl.club.px, 0.16, 700, "rgba(255,255,255,.8)"), marginBottom: 6 * k }}>{l}</div>
              ))}
            </div>
          </>
        );
      }}
    />
  );
}

/* ================= 3 · Number frame (matchday) — liked05 Temple ================= */

/**
 * Número moldura (matchday): a light grey ground; his shirt number giant as an outlined frame (white rim, club-colour
 * line) with a big black-and-white close-up of him inside the digits; the same player smaller, full-body and in colour
 * in front; the competition tracked at the top; crests, HOME X AWAY and date · kick-off · ground at the foot.
 */
export function Proframenum({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const num = (d.player.number || "").replace(/\D/g, "").slice(0, 2) || matchFacts(d).roundNo || "1";
  const fx = natFixture(d);
  const vs = vsLines(d, 24 * k * ts, W - 2 * M, 17 * k);
  const rows = whenRows(d, 18 * k * ts, W - 2 * M, 0.1);
  const wPx = Math.min(18 * k * ts, ...rows.map((l) => fitCaps(l, 18 * k * ts, W - 2 * M, 0.1)));
  const infoH = 56 * k + 12 * k + vs.lines.length * (vs.px + 6 * k) + rows.length * (wPx + 6 * k);
  const infoTop = lt - 40 * k - infoH;
  const y0 = top + 60 * k;
  const px = Math.min((infoTop - 30 * k - y0) / 0.8, (W - 2 * M) / Math.max(0.1, wordW(num, 1) * 1.04));
  const nw = wordW(num, px);
  const base = y0 + px * 0.8;
  const s = portraitOf(d);
  const pcx = W / 2;
  const pcy = y0 + px * 0.32;
  const pb = s ? (() => {
    const h = (px * 0.34) / s.face[3];
    const w = h * s.aspect;
    return { x: pcx - (s.face[0] + s.face[2] / 2) * w, y: pcy - (s.face[1] + s.face[3] / 2) * h, w, h };
  })() : null;
  const p = frontFeet(d, 560, infoTop - 10 * k, px * 1.55);
  const text = (props: React.SVGProps<SVGTextElement>) => (
    <text x={W / 2} y={base} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: px }} {...props}>
      {num}
    </text>
  );
  return (
    <Page d={d} bg="#e9e9e7" light>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, #fbfbfa, #e6e6e3 60%, #d4d4d0)" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="frnum-clip">{text({})}</clipPath>
        </defs>
        {text({ fill: "#202226" })}
        {pb && s && <image href={s.url} x={pb.x} y={pb.y} width={pb.w} height={pb.h} clipPath="url(#frnum-clip)" preserveAspectRatio="none" style={{ filter: "grayscale(1) contrast(1.15)" }} />}
        {text({ fill: "none", stroke: "#fff", strokeWidth: px * 0.05, strokeLinejoin: "round" })}
        {text({ fill: "none", stroke: t.ink, strokeWidth: px * 0.022, strokeLinejoin: "round" })}
      </svg>
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...caps(18 * k, 0.4, 800, "#202226") }}>{(matchFacts(d).comp || roundTitle(d)).toUpperCase()}</div>
      <div style={{ position: "absolute", left: W / 2 - nw / 2, top: base + 10 * k, width: nw, height: 6 * k, background: t.ink, opacity: 0 }} />
      <div style={{ position: "absolute", left: M, right: M, top: infoTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 * k, height: 56 * k }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 56 * k, width: 56 * k, objectFit: "contain", filter: CREST_HALO }} />}
          <div style={{ fontFamily: DISPLAY, fontSize: 24 * k, color: t.ink }}>VS</div>
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 56 * k, width: 56 * k, objectFit: "contain", filter: CREST_HALO }} />}
        </div>
        <div style={{ height: 12 * k }} />
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#16181c"), marginBottom: 6 * k }}>{l}</div>
        ))}
        {rows.map((l, i) => (
          <div key={"w" + i} style={{ ...caps(wPx, 0.1, 600, "#33363c"), marginBottom: 6 * k }}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 4 · Three panels (goal) — liked08 Zanetti ================= */

/**
 * Golo · três painéis (goal): a light ground; three tall panels in the club colour holding one big duotone portrait of
 * him, sliced by the gaps; the same player full-body in colour in front; NO. 7 tagged top-right, his crest top-centre;
 * GOAL big in white over the panels' foot, his first name plain and surname in a highlight box, his exact club.
 */
export function Goalpropanels({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const pTop = top + 110 * k;
  const pBot = lt - 110 * k;
  const gap = 16 * k;
  const pw = (W - 2 * M - 2 * gap) / 3;
  const rects = [0, 1, 2].map((i) => ({ x: M + i * (pw + gap), y: pTop + (i === 1 ? -36 * k : 0), w: pw, h: pBot - pTop + (i === 1 ? 36 * k : 0) }));
  const no = (d.player.number || "").replace(/\D/g, "").slice(0, 2);
  const crest = d.club?.crestUrl;
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(150 * k * ts, (W - 2 * M) * 0.7 / Math.max(0.1, wordW(word, 1)));
  const first = (d.content.firstName || "").toUpperCase();
  const last = (d.content.lastName || "").toUpperCase();
  const nPx = Math.min(40 * k * ts, fitCaps(`${first} ${last}`, 40 * k * ts, W - 2 * M - 60 * k, 0.12));
  const club = lines3(ourClub(d).toUpperCase(), 20 * k * ts, W - 2 * M, 0.18, 14 * k);
  const blockH = gPx * 0.82 + 18 * k + nPx + 24 * k + 14 * k + club.lines.length * (club.px + 6 * k);
  const bTop = pBot - blockH + 20 * k;
  const p = frontFeet(d, 600, pBot + 40 * k, 1000 * k / 1.3);
  return (
    <Page d={d} bg="#f2f2f0" light>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #fbfbfa, #ecebe8)" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="panels3">
            {rects.map((r, i) => (
              <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} />
            ))}
          </clipPath>
        </defs>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={M / 2} cy={pTop + i * 30 * k} r={3 * k} fill={t.ink} opacity={0.5} />
        ))}
      </svg>
      <div style={{ position: "absolute", inset: 0, clipPath: "url(#panels3)" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${shade(t.ink, -0.1)}, ${shade(t.ink, -0.55)})` }} />
        {s && <Portrait s={s} cx={W / 2} cy={pTop + 250 * k} fh={260 * k} mode="duo" tint={t.ink} opacity={0.95} />}
      </div>
      <Front d={d} p={p} />
      {crest && <img src={crest} alt="" style={{ position: "absolute", left: W / 2 - 36 * k, top: top - 10 * k, height: 72 * k, width: 72 * k, objectFit: "contain", filter: CREST_HALO }} />}
      {no && (
        <div style={{ position: "absolute", right: M, top: top + 6 * k, display: "flex", alignItems: "center", gap: 10 * k }}>
          <div style={caps(26 * k, 0.12, 800, "#16181c")}>NO.</div>
          <div style={{ background: t.ink, color: "#fff", fontFamily: DISPLAY, fontSize: 40 * k, lineHeight: 1, padding: `${4 * k}px ${12 * k}px` }}>{no}</div>
        </div>
      )}
      <div style={{ position: "absolute", left: M + 18 * k, top: bTop, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.82, color: "#fff", textShadow: "0 8px 24px rgba(0,0,0,.4)" }}>{word}</div>
        <div style={{ height: 18 * k }} />
        <div style={{ display: "flex", alignItems: "stretch" }}>
          {first && <div style={{ ...caps(nPx, 0.12, 800, "#16181c"), background: "#fff", padding: `${12 * k}px ${14 * k}px` }}>{first}</div>}
          {last && <div style={{ ...caps(nPx, 0.12, 800, "#fff"), background: shade(t.ink, -0.3), padding: `${12 * k}px ${14 * k}px` }}>{last}</div>}
        </div>
        <div style={{ height: 14 * k }} />
        {club.lines.map((l, i) => (
          <div key={i} style={{ ...caps(club.px, 0.18, 700, "#fff"), textShadow: "0 2px 8px rgba(0,0,0,.5)", marginBottom: 6 * k }}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 5 · Angled panels (matchday) — liked09 Pulisic ================= */

/**
 * Painéis em ângulo (matchday): a light grey ground; MATCHDAY huge in the club colour across the top, slanted; a big
 * angled panel with his photo in black and white and a big B&W portrait of him rising out of it over the word; a
 * second angled panel in the club colour below; the same player smaller, full-body and in colour in front; a slim
 * versus card with both crests on the right; HOME X AWAY, date · ground and the flags clock at the foot.
 */
export function Proangled({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const s = portraitOf(d);
  const word = "MATCHDAY";
  const px = Math.min(230 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const wy = top + 30 * k;
  const aTop = wy + px * 0.55;
  const aBot = top + 1000 * k / 1.3;
  const slant = 70 * k;
  const aPoly = `polygon(${M}px ${aTop + slant}px, ${W * 0.8}px ${aTop}px, ${W * 0.8}px ${aBot - slant}px, ${M}px ${aBot}px)`;
  const portraitClip = `polygon(${M}px 0px, ${W * 0.8}px 0px, ${W * 0.8}px ${aBot - slant}px, ${M}px ${aBot}px)`;
  const bTop = aBot - 20 * k;
  const bBot = lt - 30 * k;
  const bPoly = `polygon(${M * 3}px ${bTop + slant}px, ${W - M}px ${bTop}px, ${W - M}px ${bBot}px, ${M * 3}px ${bBot}px)`;
  const cut = d.cutouts.find((c) => c.url === d.photoUrl);
  const orig = cut?.original;
  const vs = vsLines(d, 24 * k * ts, W * 0.5, 16 * k);
  const dv = dateVenue(d);
  const dvl = lines3(dv, 16 * k * ts, W * 0.5, 0.1, 12 * k);
  const infoH = vs.lines.length * (vs.px + 6 * k) + 10 * k + dvl.lines.length * (dvl.px + 6 * k) + 18 * k + 32 * k * ts;
  const p = frontFeet(d, 700, lt + 30 * k, 1000 * k / 1.3);
  return (
    <Page d={d} bg="#ebebea" light>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #f6f6f5, #e3e3e1)" }} />
      <div style={{ position: "absolute", left: M, top: wy, fontFamily: DISPLAY, fontSize: px, lineHeight: 0.82, color: t.ink, whiteSpace: "nowrap", transform: "rotate(-4deg) skewX(-6deg)", transformOrigin: "left top" }}>{word}</div>
      <div style={{ position: "absolute", inset: 0, clipPath: aPoly, background: "linear-gradient(160deg, #cfcfcf, #8b8b8b)" }}>
        {orig && <img src={orig} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.05) brightness(1.05)", opacity: 0.45 }} />}
      </div>
      {s && (
        <div style={{ position: "absolute", inset: 0, clipPath: portraitClip }}>
          <Portrait s={s} cx={W * 0.4} cy={aTop + 230 * k} fh={250 * k} mode="bw" />
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, clipPath: bPoly, background: `linear-gradient(160deg, ${t.ink}, ${shade(t.ink, -0.5)})` }} />
      <div style={{ position: "absolute", left: M * 3, right: M, top: bTop + slant + 18 * k, height: 4 * k, background: "#fff", opacity: 0.5, transform: "rotate(-3.6deg)", transformOrigin: "left center" }} />
      <Front d={d} p={p} />
      <div style={{ position: "absolute", right: M, top: aTop + 60 * k, width: 130 * k, padding: `${18 * k}px 0`, background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,.18)", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 * k }}>
        {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 80 * k, width: 80 * k, objectFit: "contain" }} />}
        <div style={caps(14 * k, 0.2, 800, t.ink)}>VERSUS</div>
        {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 80 * k, width: 80 * k, objectFit: "contain" }} />}
      </div>
      <div style={{ position: "absolute", left: M * 3 + 24 * k, top: bBot - 30 * k - infoH, display: "flex", flexDirection: "column" }}>
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#fff"), marginBottom: 6 * k }}>{l}</div>
        ))}
        <div style={{ height: 10 * k }} />
        {dvl.lines.map((l, i) => (
          <div key={"d" + i} style={{ ...caps(dvl.px, 0.1, 600, "rgba(255,255,255,.85)"), marginBottom: 6 * k }}>{l}</div>
        ))}
        <div style={{ height: 18 * k }} />
        <FlagClock d={d} px={32 * k * ts} color="#fff" gap={22 * k} />
      </div>
    </Page>
  );
}
