/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { shade } from "@/lib/color";
import { DMSERIF } from "./fx";
import { NatFigure, NatGround, natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { roundTitle } from "./natfree9";
import { DISPLAY } from "./shared";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { TypeLayer, notHead, safeRow, standAt, wordW } from "./usgame6";
import { CREST_HALO, FlagClock, Front, M, Page, Portrait, caps, dateVenue, fixtureLines, frontFeet, nameLines, portraitOf, vsLines } from "./prokit";

/* Round 33 · new pro families (liked/ refs + Pinterest "football matchday poster design", "matchday graphic serie a"). */

const W = CANVAS_W;

/* ================= 1 · Portrait in strips (matchday) — Pinterest "Newcastle v Aston Villa" strips, liked08 ================= */

/**
 * Retrato em tiras (matchday): a light ground; a huge black-and-white portrait of him cut into four tall strips that
 * slide up and down against each other, MATCHDAY across them in the club colour; the same player full-body in colour
 * in front; crests, HOME X AWAY, date · ground and the flags clock at the foot.
 */
export function Prostrips({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fx = natFixture(d);
  const n = 4;
  const gap = 14 * k;
  const sw = (W - 2 * M - (n - 1) * gap) / n;
  const sTop = top + 40 * k;
  const sBot = lt - 330 * k;
  const shift = [0, 50, -30, 70].map((v) => v * k);
  const word = "MATCHDAY";
  const wPx = Math.min(230 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const p0 = frontFeet(d, 560, lt + 40 * k, 1000 * k / 1.3);
  // MATCHDAY interlocked with him: behind his body, his head in front; moved off his head when it would hide it.
  const row = safeRow(p0, word, sTop + (sBot - sTop) * 0.52, wPx, M, W - M, "middle", 0.04, lt - 300 * k);
  const vs = vsLines(d, 24 * k * ts, W - 2 * M, 16 * k);
  const dv = dateVenue(d);
  const p = p0;
  return (
    <Page d={d} bg="#efefed" light>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #fafaf9, #e4e4e1)" }} />
      {s &&
        Array.from({ length: n }, (_, i) => {
          const x = M + i * (sw + gap);
          return (
            <div key={i} style={{ position: "absolute", left: x, top: sTop + shift[i], width: sw, height: sBot - sTop, overflow: "hidden", background: "#cfcfcd" }}>
              <div style={{ position: "absolute", left: -x, top: -(sTop + shift[i]), width: W, height: H }}>
                <Portrait s={s} cx={W * 0.5} cy={sTop + 300 * k} fh={300 * k} mode="bw" />
              </div>
            </div>
          );
        })}
      <TypeLayer id="strips-b" H={H} rows={[row]} paint={() => ({ fill: t.ink })} />
      <Front d={d} p={p} light />
      <TypeLayer id="strips-f" H={H} rows={[row]} clipD={notHead(p, H)} paint={() => ({ fill: t.ink })} />
      <div style={{ position: "absolute", left: M - 14 * k, right: M - 14 * k, top: lt - 270 * k, height: 230 * k, borderRadius: 20 * k, background: "rgba(255,255,255,.93)", boxShadow: "0 12px 34px rgba(0,0,0,.16)" }} />
      <div style={{ position: "absolute", left: M, right: M, top: lt - 250 * k, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * k }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 * k }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 60 * k, width: 60 * k, objectFit: "contain", filter: CREST_HALO }} />}
          <FlagClock d={d} px={26 * k * ts} color="#16181c" gap={20 * k} />
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 60 * k, width: 60 * k, objectFit: "contain", filter: CREST_HALO }} />}
        </div>
        {vs.lines.map((l, i) => (
          <div key={i} style={caps(vs.px, 0.04, 900, "#16181c")}>{l}</div>
        ))}
        {dv && <div style={caps(16 * k * ts, 0.2, 700, t.ink)}>{dv}</div>}
      </div>
    </Page>
  );
}

/* ================= 2 · Arch frame (matchday) — Pinterest "Nanaimo" disc, liked10 Monaco ================= */

/**
 * Retrato em arco (matchday): a deep club-colour ground; a tall arch (rounded top) in a lighter tone holding a big
 * black-and-white portrait of him; the same player full-body and in colour stepping out of the arch's foot; MATCHDAY
 * tracked over the arch, crests and HOME V AWAY under it; date · ground and the flags clock at the foot.
 */
export function Proarch({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fx = natFixture(d);
  const aw = W - 2 * M - 120 * k;
  const ax = (W - aw) / 2;
  const aTop = top + 120 * k;
  const aBot = lt - 330 * k;
  const fl = fixtureLines(d, W - 2 * M, 30 * k * ts, 18 * k);
  const dv = dateVenue(d);
  const p = frontFeet(d, 560, aBot + 150 * k, 900 * k / 1.3);
  const wPx = Math.min(120 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCHDAY", 1) * 1.25));
  return (
    <Page d={d} bg={shade(t.ink, -0.55)}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 35%, ${shade(t.ink, -0.1)}, ${shade(t.ink, -0.6)} 80%)` }} />
      <div style={{ position: "absolute", left: ax, top: aTop, width: aw, height: aBot - aTop, borderRadius: `${aw / 2}px ${aw / 2}px 0 0`, overflow: "hidden", background: `linear-gradient(180deg, ${shade(t.ink, 0.2)}, ${shade(t.ink, -0.2)})`, boxShadow: "0 0 0 6px rgba(255,255,255,.9), 0 30px 60px rgba(0,0,0,.45)" }}>
        {s && (
          <div style={{ position: "absolute", left: -ax, top: -aTop, width: W, height: H }}>
            <Portrait s={s} cx={W / 2} cy={aTop + 330 * k} fh={300 * k} mode="bw" opacity={0.9} />
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 55%, ${shade(t.ink, -0.4)}cc)` }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 10 * k, textAlign: "center", fontFamily: DISPLAY, fontSize: wPx, letterSpacing: "0.08em", lineHeight: 1, color: "#fff" }}>MATCHDAY</div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, right: M, top: aBot + 40 * k, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 * k }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 * k, marginBottom: 6 * k }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 66 * k, width: 66 * k, objectFit: "contain", filter: CREST_HALO }} />}
          <div style={caps(18 * k, 0.24, 800, "#fff")}>{roundTitle(d)}</div>
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 66 * k, width: 66 * k, objectFit: "contain", filter: CREST_HALO }} />}
        </div>
        {[...fl.home, "V", ...fl.away].map((l, i) => (
          <div key={i} style={{ ...caps(l === "V" ? 16 * k : fl.px, 0.04, 900, "#fff"), textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>{l}</div>
        ))}
        {dv && <div style={{ ...caps(16 * k * ts, 0.16, 600, "rgba(255,255,255,.85)"), marginTop: 6 * k }}>{dv}</div>}
        <div style={{ height: 6 * k }} />
        <FlagClock d={d} px={28 * k * ts} color="#fff" gap={22 * k} />
      </div>
    </Page>
  );
}

/* ================= 3 · Circle portrait (goal) — Pinterest "Nanaimo United" red disc ================= */

/**
 * Golo · retrato no círculo (goal): a dark ground; a big disc in the club colour behind a large black-and-white portrait
 * of him; GOAL huge across the top; the same player full-body and in colour in front of the disc's foot; his full name
 * and exact club at the foot with his crest.
 */
export function Goalprocircle({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(300 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const R = 380 * k;
  const cy = top + gPx * 0.8 + R * 0.9;
  const nl = nameLines(d, W - 2 * M - 120 * k, 40 * k, 24 * k);
  const crest = d.club?.crestUrl;
  const nh = nl.name.lines.length * (nl.name.px + 8 * k) + nl.club.lines.length * (nl.club.px + 6 * k);
  const p = frontFeet(d, 600, lt - nh - 20 * k, 950 * k / 1.3);
  return (
    <Page d={d} bg="#121418">
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, #23262d, #0d0f12 75%)" }} />
      <div style={{ position: "absolute", left: W / 2 - R, top: cy - R, width: 2 * R, height: 2 * R, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, ${shade(t.ink, 0.15)}, ${shade(t.ink, -0.25)})` }} />
      {s && (
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 ${H - cy - R}px 0)` }}>
          <Portrait s={s} cx={W / 2} cy={cy - R * 0.15} fh={300 * k} mode="bw" />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.82, color: "#fff", whiteSpace: "nowrap" }}>{word}</div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, right: M, top: lt - 20 * k - nh, display: "flex", alignItems: "center", gap: 22 * k }}>
        {crest && <img src={crest} alt="" style={{ height: 90 * k, width: 90 * k, objectFit: "contain", filter: CREST_HALO }} />}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {nl.name.lines.map((l, i) => (
            <div key={i} style={{ ...caps(nl.name.px, 0.02, 900, "#fff"), marginBottom: 8 * k }}>{l}</div>
          ))}
          {nl.club.lines.map((l, i) => (
            <div key={"c" + i} style={{ ...caps(nl.club.px, 0.16, 700, t.glow), marginBottom: 6 * k }}>{l}</div>
          ))}
        </div>
      </div>
    </Page>
  );
}

/* ================= 4 · Editorial serif over the real photo (matchday) — Pinterest "AS Roma versus FC Porto" ================= */

/**
 * Editorial serifado (matchday): his real photo full-bleed with a warm gradient in the club colour from one side; a
 * serif column on that side — HOME / versus / AWAY in DM Serif (exact names, wrapped), the round tracked above, date ·
 * ground and the flags clock under; him sharp.
 */
export function Proeditorial({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const left = d.params.side !== "left";
  const p = standAt(d, left ? 700 : 380, 720, 200);
  const cw = W * 0.5;
  const fx = natFixture(d);
  const h = lines3(fx.homeName, 64 * k * ts, cw, 0, 36 * k);
  const a = lines3(fx.awayName, 64 * k * ts, cw, 0, 36 * k);
  const px = Math.min(h.px, a.px, 64 * k * ts);
  const dv = lines3(dateVenue(d), 18 * k * ts, cw, 0.1, 13 * k);
  const serif: CSSProperties = { fontFamily: DMSERIF, fontSize: px, lineHeight: 1.04, color: "#fff", whiteSpace: "nowrap", textShadow: "0 4px 20px rgba(0,0,0,.35)" };
  const side = left ? "left" : "right";
  return (
    <Page d={d} bg="#111">
      <NatGround place={p} W={W} H={H} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${left ? 90 : 270}deg, ${shade(t.ink, -0.3)}f2 0%, ${t.ink}aa 38%, ${t.ink}00 70%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.35), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,.5))" }} />
      <NatFigure data={d} place={p} W={W} H={H} clean />
      <div style={{ position: "absolute", [side]: M, top: top + 60 * k, width: cw, display: "flex", flexDirection: "column", alignItems: left ? "flex-start" : "flex-end", textAlign: side }}>
        <div style={caps(18 * k, 0.3, 800, "rgba(255,255,255,.85)")}>{roundTitle(d)}</div>
        <div style={{ height: 22 * k }} />
        <div style={{ display: "flex", gap: 14 * k, marginBottom: 18 * k }}>
          {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((u, i) => (
            <img key={i} src={u!} alt="" style={{ height: 64 * k, width: 64 * k, objectFit: "contain", filter: CREST_HALO }} />
          ))}
        </div>
        {h.lines.map((l, i) => (
          <div key={"h" + i} style={serif}>{l}</div>
        ))}
        <div style={{ ...serif, fontStyle: "italic", fontSize: px * 0.6, opacity: 0.9, margin: `${6 * k}px 0` }}>versus</div>
        {a.lines.map((l, i) => (
          <div key={"a" + i} style={serif}>{l}</div>
        ))}
        <div style={{ height: 26 * k }} />
        {dv.lines.map((l, i) => (
          <div key={"d" + i} style={{ ...caps(dv.px, 0.1, 600, "rgba(255,255,255,.9)"), marginBottom: 6 * k }}>{l}</div>
        ))}
        <div style={{ height: 14 * k }} />
        <FlagClock d={d} px={28 * k * ts} color="#fff" gap={10 * k} dir="column" />
      </div>
    </Page>
  );
}

/* ================= 5 · Colour / B&W split (matchday) — Pinterest "Napoli v Milan" split, liked04 ================= */

/**
 * Cor e preto e branco (matchday): a vertical split — the left half his big portrait in black and white on a dark
 * ground, the right half the same portrait in full colour on the club colour, a white seam; him full-body and sharp in
 * front across the seam; crests at the two top corners, MATCHDAY and the fixture across the foot with the flags clock.
 */
export function Prosplit({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const fx = natFixture(d);
  const vs = vsLines(d, 26 * k * ts, W - 2 * M, 16 * k);
  const wPx = Math.min(170 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCHDAY", 1)));
  const footH = wPx * 0.82 + 14 * k + vs.lines.length * (vs.px + 6 * k) + 14 * k + 28 * k * ts;
  const footTop = lt - 40 * k - footH;
  const p = frontFeet(d, 540, footTop + 40 * k, 980 * k / 1.3);
  const half = (right: boolean) => (
    <div style={{ position: "absolute", left: right ? W / 2 : 0, top: 0, width: W / 2, height: H, overflow: "hidden", background: right ? `linear-gradient(180deg, ${shade(t.ink, 0.05)}, ${shade(t.ink, -0.4)})` : "linear-gradient(180deg, #2b2d31, #0f1012)" }}>
      {s && (
        <div style={{ position: "absolute", left: right ? -W / 2 : 0, top: 0, width: W, height: H }}>
          <Portrait s={s} cx={W / 2} cy={top + 330 * k} fh={330 * k} mode={right ? "color" : "bw"} fade={30} />
        </div>
      )}
    </div>
  );
  return (
    <Page d={d} bg="#111">
      {half(false)}
      {half(true)}
      <div style={{ position: "absolute", left: W / 2 - 3 * k, top: 0, width: 6 * k, height: H, background: "#fff", opacity: 0.85 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.5, bottom: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.65) 60%)" }} />
      {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ position: "absolute", left: M, top, height: 90 * k, width: 90 * k, objectFit: "contain", filter: CREST_HALO }} />}
      {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ position: "absolute", right: M, top, height: 90 * k, width: 90 * k, objectFit: "contain", filter: CREST_HALO }} />}
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, right: M, top: footTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: wPx, lineHeight: 0.82, color: "#fff", whiteSpace: "nowrap", textShadow: "0 8px 26px rgba(0,0,0,.5)" }}>MATCHDAY</div>
        <div style={{ height: 14 * k }} />
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#fff"), marginBottom: 6 * k }}>{l}</div>
        ))}
        <div style={{ height: 8 * k }} />
        <FlagClock d={d} px={28 * k * ts} color="#fff" gap={22 * k} />
      </div>
    </Page>
  );
}

