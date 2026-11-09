/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { shade } from "@/lib/color";
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { scoreOf } from "./outline";
import { DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { standAt, wordW } from "./usgame6";
import { CREST_HALO, FlagClock, Front, M, Page, Portrait, caps, frontFeet, nameLines, portraitOf, secondShot } from "./prokit";

/* Round 36 · new pro families, part 2 (Pinterest "goal announcement graphic", "college soccer media day graphic"). */

const W = CANVAS_W;

/* ================= 6 · Outlined number + caption grid (matchday) — Pinterest "16" outline, media-day numbers ================= */

/**
 * Número em contorno (matchday): his real photo full-bleed, graded a little dark; his shirt number giant and outlined in
 * white on the free side, behind him; a tiny caption grid in the corner below it — four labelled cells (VS, DATE, KICK-OFF,
 * GROUND) with hairlines, both crests on top.
 */
export function Prooutlinenum({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const left = d.params.side !== "left";
  const p = standAt(d, left ? 700 : 380, 760, 185);
  const num = (d.player.number || "").replace(/\D/g, "").slice(0, 2) || matchFacts(d).roundNo || "";
  const fx = natFixture(d);
  const colW = W * 0.46;
  const px = Math.min(720 * k, colW / Math.max(0.1, wordW(num || "0", 1)));
  const x0 = left ? M : W - M - colW;
  const opp = d.content.home === false ? fx.homeName : fx.awayName;
  const cell = (label: string, body: ReactNode) => (
    <div style={{ borderTop: "1px solid rgba(255,255,255,.45)", padding: `${10 * k}px 0` }}>
      <div style={caps(11 * k, 0.26, 700, "rgba(255,255,255,.7)")}>{label}</div>
      <div style={{ marginTop: 6 * k }}>{body}</div>
    </div>
  );
  const val = (s0: string) => lines3(s0.toUpperCase(), 22 * k * ts, colW, 0.04, 13 * k).lines.map((l, i) => <div key={i} style={caps(22 * k * ts, 0.04, 900, "#fff")}>{l}</div>);
  return (
    <Page d={d} bg="#0e1014">
      <NatGround place={p} W={W} H={H} style={{ filter: "contrast(1.08) brightness(.75)" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${left ? 90 : 270}deg, ${shade(t.ink, -0.6)}dd, ${shade(t.ink, -0.6)}00 60%)` }} />
      {num && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <text x={x0 + colW / 2} y={top + 40 * k + px * 0.8} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: px }} fill="none" stroke="#fff" strokeWidth={6 * k}>
            {num}
          </text>
        </svg>
      )}
      <NatFigure data={d} place={p} W={W} H={H} clean />
      <div style={{ position: "absolute", left: x0, width: colW, top: lt - 600 * k, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 14 * k, marginBottom: 14 * k }}>
          {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((u, i) => (
            <img key={i} src={u!} alt="" style={{ height: 60 * k, width: 60 * k, objectFit: "contain", filter: CREST_HALO }} />
          ))}
        </div>
        {cell("VS", val(opp))}
        {cell("DATE", val(fx.date))}
        {cell("KICK-OFF", <FlagClock d={d} px={22 * k * ts} color="#fff" gap={6 * k} dir="column" />)}
        {fx.venue && cell("GROUND", val(fx.venue))}
      </div>
    </Page>
  );
}

/* ================= 7 · Portrait + vertical GOAL (goal) — Pinterest "MATCHDAG" vertical word with portrait ================= */

/**
 * Golo · retrato e palavra vertical (goal): a dark ground; GOAL huge and vertical up the left edge in white; his big
 * colour portrait filling the right two-thirds, fading at the foot; his crest, full name and exact club bottom-right.
 */
export function Goalprovertical({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const len = lt - 40 * k - top;
  const px = Math.min(300 * k, len / Math.max(0.1, wordW(word, 1)));
  const cx = M + px * 0.4;
  const cy = top + len / 2;
  const crest = d.club?.crestUrl;
  const nl = nameLines(d, W * 0.55, 36 * k, 18 * k);
  return (
    <Page d={d} bg="#121418">
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, -0.45)}, #0d0e11)` }} />
      {s && <Portrait s={s} cx={W * 0.62} cy={top + 520 * k} fh={420 * k} mode="color" fade={30} />}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" transform={`rotate(-90 ${cx} ${cy})`} style={{ fontFamily: DISPLAY, fontSize: px }} fill="#fff">
          {word}
        </text>
      </svg>
      <div style={{ position: "absolute", right: M, top: lt - 200 * k, width: W * 0.55, display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right" }}>
        {crest && <img src={crest} alt="" style={{ height: 70 * k, width: 70 * k, objectFit: "contain", filter: CREST_HALO, marginBottom: 12 * k }} />}
        {nl.name.lines.map((l, i) => (
          <div key={i} style={{ ...caps(nl.name.px, 0.02, 900, "#fff"), marginBottom: 6 * k, textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>{l}</div>
        ))}
        {nl.club.lines.map((l, i) => (
          <div key={"c" + i} style={{ ...caps(nl.club.px, 0.16, 700, t.glow), marginBottom: 4 * k }}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 8 · Two-portrait mosaic (goal) — Pinterest media-day colour blocks ================= */

/**
 * Golo · mosaico (goal): a light ground with two clean colour blocks — top-right in the club colour holding a big colour
 * portrait of him, bottom-left in near-black holding a black-and-white portrait from his second photo (else the same one);
 * GOAL huge across the gap between them; his full name and exact club on a white row.
 */
export function Goalpromosaic({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const s = portraitOf(d);
  const two = secondShot(d);
  const word = (d.content.kicker || "Goal").toUpperCase();
  const gPx = Math.min(240 * k, (W - 2 * M) / Math.max(0.1, wordW(word, 1)));
  const midY = top + 600 * k;
  const a = { x: W * 0.36, y: top, w: W - M - W * 0.36, h: midY - top - 20 * k };
  const b = { x: M, y: midY + gPx * 0.6, w: W * 0.6 - M, h: lt - 140 * k - (midY + gPx * 0.6) };
  const nl = nameLines(d, W - 2 * M - 60 * k, 34 * k, 18 * k);
  const block = (r: typeof a, bg: string, content: ReactNode) => (
    <div style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, background: bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -r.x, top: -r.y, width: W, height: H }}>{content}</div>
    </div>
  );
  return (
    <Page d={d} bg="#f1f0ec" light>
      {block(a, t.ink, s && <Portrait s={s} cx={a.x + a.w / 2} cy={a.y + a.h * 0.45} fh={a.h * 0.32} mode="color" />)}
      {block(
        b,
        "#1b1d22",
        <Portrait s={two ?? s!} cx={b.x + b.w / 2} cy={b.y + b.h * 0.42} fh={b.h * 0.34} mode="bw" />,
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: midY - gPx * 0.3, textAlign: "center", fontFamily: DISPLAY, fontSize: gPx, lineHeight: 0.82, color: "#111", whiteSpace: "nowrap" }}>{word}</div>
      <div style={{ position: "absolute", left: M, right: M, top: lt - 120 * k, display: "flex", flexDirection: "column", alignItems: "center", background: "#fff", borderRadius: 14 * k, padding: `${10 * k}px 0` }}>
        {nl.name.lines.map((l, i) => (
          <div key={i} style={{ ...caps(nl.name.px, 0.02, 900, "#111"), marginBottom: 4 * k }}>{l}</div>
        ))}
        {nl.club.lines.map((l, i) => (
          <div key={"c" + i} style={{ ...caps(nl.club.px * 0.85, 0.16, 700, t.ink), marginBottom: 2 * k }}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 9 · Corner brackets (goal) — Pinterest "ABBIE McMANUS 5" ================= */

/**
 * Golo · cantos (goal): a pale ground; his full figure framed by four thick corner brackets in the club colour; his
 * surname vertical up the left edge with his first name small beside it; his shirt number in a club-colour box on the
 * right; GOAL and his crest at the top, his exact club at the foot.
 */
export function Goalprobrackets({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const sur = (d.content.lastName || d.content.firstName || "").toUpperCase();
  const first = d.content.lastName ? (d.content.firstName || "").toUpperCase() : "";
  const no = (d.player.number || "").replace(/\D/g, "").slice(0, 2);
  const crest = d.club?.crestUrl;
  const fx0 = M + 170 * k;
  const fTop = top + 150 * k;
  const fBot = lt - 110 * k;
  const len = fBot - fTop;
  const sPx = Math.min(150 * k, len / Math.max(0.1, wordW(sur, 1)));
  const p = frontFeet(d, (fx0 + W - M) / 2, fBot - 20 * k, len * 0.95);
  const club = lines3(ourClub(d).toUpperCase(), 20 * k * ts, W - 2 * M, 0.18, 13 * k);
  const br = 70 * k;
  const bw = 12 * k;
  const corner = (x: number, y: number, sx: number, sy: number, key: string) => <path key={key} d={`M ${x} ${y + sy * br} L ${x} ${y} L ${x + sx * br} ${y}`} fill="none" stroke={t.ink} strokeWidth={bw} strokeLinecap="square" />;
  const cx = M + sPx * 0.42;
  const cy = fTop + len / 2;
  return (
    <Page d={d} bg="#f2f1ed" light>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {corner(fx0, fTop, 1, 1, "a")}
        {corner(W - M, fTop, -1, 1, "b")}
        {corner(fx0, fBot, 1, -1, "c")}
        {corner(W - M, fBot, -1, -1, "d")}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" transform={`rotate(-90 ${cx} ${cy})`} style={{ fontFamily: DISPLAY, fontSize: sPx }} fill="#111">
          {sur}
        </text>
        {first && (
          <text x={cx + sPx * 0.62} y={fBot} textAnchor="start" transform={`rotate(-90 ${cx + sPx * 0.62} ${fBot})`} style={{ fontFamily: DISPLAY, fontSize: 34 * k, letterSpacing: "0.2em" }} fill={t.ink}>
            {first}
          </text>
        )}
      </svg>
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: M, right: M, top, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 96 * k, lineHeight: 0.82, color: "#111" }}>{(d.content.kicker || "Goal").toUpperCase()}</div>
        {crest && <img src={crest} alt="" style={{ height: 90 * k, width: 90 * k, objectFit: "contain" }} />}
      </div>
      {no && <div style={{ position: "absolute", right: M - 10 * k, top: fTop + len * 0.62, background: t.ink, color: "#fff", fontFamily: DISPLAY, fontSize: 110 * k, lineHeight: 1, padding: `${6 * k}px ${16 * k}px` }}>{no}</div>}
      <div style={{ position: "absolute", left: 0, right: 0, top: fBot + 26 * k, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {club.lines.map((l, i) => (
          <div key={i} style={{ ...caps(club.px, 0.18, 800, t.ink), marginBottom: 4 * k }}>{l}</div>
        ))}
      </div>
    </Page>
  );
}

/* ================= 10 · Broadcast lower-third (result) — Pinterest TV result bars ================= */

/**
 * Resultado · rodapé de TV (result): his real photo full-bleed and sharp; a broadcast lower-third across the foot — a
 * FULL TIME tag in the club colour, home crest and exact name, the score in a white box, away name and crest — with the
 * competition on a thin strip under it.
 */
export function Resultprolower({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const p = standAt(d, 540, 700, 190);
  const score = scoreOf(d, " – ") || "FT";
  const barH = 120 * k;
  const barTop = lt - 90 * k - barH;
  const sideW = (W - 2 * M - 220 * k) / 2;
  const hn = lines3(fx.homeName.toUpperCase(), 22 * k * ts, sideW - 80 * k, 0.04, 13 * k);
  const an = lines3(fx.awayName.toUpperCase(), 22 * k * ts, sideW - 80 * k, 0.04, 13 * k);
  const nPx = Math.min(hn.px, an.px);
  const comp = (matchFacts(d).comp || "").toUpperCase();
  const name = (n: { lines: string[] }, right: boolean) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: right ? "flex-end" : "flex-start" }}>
      {n.lines.map((l, i) => (
        <div key={i} style={{ ...caps(nPx, 0.04, 900, "#fff"), marginTop: i ? 4 * k : 0 }}>{l}</div>
      ))}
    </div>
  );
  return (
    <Page d={d} bg="#0e1014">
      <NatGround place={p} W={W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: barTop - 160 * k, bottom: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.6) 45%)" }} />
      <NatFigure data={d} place={p} W={W} H={H} clean />
      <div style={{ position: "absolute", left: M, top: barTop - 48 * k, background: t.ink, ...caps(22 * k, 0.24, 800, "#fff"), padding: `${10 * k}px ${16 * k}px` }}>FULL TIME</div>
      <div style={{ position: "absolute", left: M, right: M, top: barTop, height: barH, display: "flex", alignItems: "stretch", boxShadow: "0 14px 40px rgba(0,0,0,.5)" }}>
        <div style={{ width: sideW, background: "rgba(14,16,20,.92)", display: "flex", alignItems: "center", gap: 14 * k, padding: `0 ${16 * k}px` }}>
          {fx.homeCrest && <img src={fx.homeCrest} alt="" style={{ height: 60 * k, width: 60 * k, objectFit: "contain", filter: CREST_HALO }} />}
          {name(hn, false)}
        </div>
        <div style={{ flex: 1, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontSize: 80 * k * ts, color: "#111", whiteSpace: "nowrap" }}>{score}</div>
        <div style={{ width: sideW, background: "rgba(14,16,20,.92)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14 * k, padding: `0 ${16 * k}px` }}>
          {name(an, true)}
          {fx.awayCrest && <img src={fx.awayCrest} alt="" style={{ height: 60 * k, width: 60 * k, objectFit: "contain", filter: CREST_HALO }} />}
        </div>
      </div>
      {comp && <div style={{ position: "absolute", left: M, right: M, top: barTop + barH, height: 40 * k, background: shade(t.ink, -0.3), display: "flex", alignItems: "center", justifyContent: "center", ...caps(16 * k * ts, 0.24, 700, "#fff") }}>{comp}</div>}
    </Page>
  );
}

