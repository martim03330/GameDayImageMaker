/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from "react";
import { ourClub } from "./goalnatcaption";
import { shade } from "@/lib/color";
import { DMSERIF } from "./fx";
import { natFixture } from "./natkit";
import { frameOf } from "./natfree4";
import { dropped } from "./natfree26";
import { lines3 } from "./natfree23";
import { roundTitle } from "./natfree9";
import { DISPLAY, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { logoTopOf } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";
import { tones } from "./usgame4";
import { wordW } from "./usgame6";
import { FlagClock, Front, M, Page, caps, dateVenue, frontFeet, vsLines } from "./prokit";

/* Round 35 · new pro families (Pinterest "soccer player poster minimal", "matchday graphic champions league"). */

const W = CANVAS_W;

/* ================= 1 · Minimal poster (matchday) — Pinterest Mbappé / Suárez minimal posters ================= */

/**
 * Cartaz minimalista (matchday): an off-white paper ground; his surname huge at the top in tight black caps; a tall
 * club-colour block behind his body that he breaks out of; a fixture row of four hairline-ruled columns at the foot
 * (date, kick-off with flags, VS crests, ground) and HOME X AWAY above it.
 */
export function Prominimal({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const sur = (d.content.lastName || d.content.firstName || "").toUpperCase();
  const sPx = Math.min(230 * k, (W - 2 * M) / Math.max(0.1, wordW(sur, 1)));
  const rowH = 120 * k;
  const rowTop = lt - 40 * k - rowH;
  const vs = vsLines(d, 24 * k * ts, W - 2 * M, 15 * k);
  const vsTop = rowTop - 20 * k - vs.lines.length * (vs.px + 6 * k);
  const bTop = top + sPx * 0.82 + 40 * k;
  const bBot = vsTop - 30 * k;
  const p = frontFeet(d, 540, bBot + 10 * k, (bBot - bTop) * 1.08);
  const col = (label: string, body: ReactNode, i: number) => (
    <div key={label} style={{ flex: 1, borderLeft: i ? "1px solid rgba(0,0,0,.25)" : "none", padding: `0 ${12 * k}px`, display: "flex", flexDirection: "column", gap: 8 * k }}>
      <div style={caps(12 * k, 0.24, 700, t.ink)}>{label}</div>
      {body}
    </div>
  );
  const dv = lines3(fx.venue.toUpperCase(), 16 * k * ts, (W - 2 * M) / 4 - 24 * k, 0.02, 10 * k);
  return (
    <Page d={d} bg="#f4f2ec" light>
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: SANS, fontWeight: 900, fontSize: sPx * 0.9, letterSpacing: "-0.03em", lineHeight: 0.9, color: "#111", whiteSpace: "nowrap" }}>{sur}</div>
      <div style={{ position: "absolute", left: M + 60 * k, right: M + 60 * k, top: bTop, height: bBot - bTop, background: t.ink }} />
      <div style={{ position: "absolute", left: M + 60 * k, top: bTop + 16 * k, ...caps(16 * k, 0.3, 800, "#fff"), padding: `0 ${18 * k}px` }}>{roundTitle(d)}</div>
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: M, right: M, top: vsTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#111"), marginBottom: 6 * k }}>{l}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: M, right: M, top: rowTop, height: rowH, borderTop: "2px solid #111", paddingTop: 14 * k, display: "flex", boxSizing: "border-box" }}>
        {col("DATE", <div style={caps(22 * k * ts, 0.04, 900, "#111")}>{fx.date}</div>, 0)}
        {col("KICK-OFF", <FlagClock d={d} px={18 * k * ts} color="#111" gap={4 * k} dir="column" />, 1)}
        {col(
          "MATCH",
          <div style={{ display: "flex", gap: 8 * k }}>
            {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((u, i) => (
              <img key={i} src={u!} alt="" style={{ height: 44 * k, width: 44 * k, objectFit: "contain" }} />
            ))}
          </div>,
          2,
        )}
        {col("GROUND", <>{dv.lines.map((l, i) => <div key={i} style={caps(dv.px, 0.02, 800, "#111")}>{l}</div>)}</>, 3)}
      </div>
    </Page>
  );
}

/* ================= 2 · Crests face-off (matchday) — Pinterest UCL "PSG vs Arsenal" face-off ================= */

/**
 * Emblemas frente a frente (matchday): a dark ground split down the middle — the home crest huge and ghosted on the
 * left half, the away crest on the right — a thin white seam with VS; him full-body and sharp in front between them;
 * MATCHDAY across the top, HOME X AWAY, date · ground and the flags clock at the foot.
 */
export function Profaceoff({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const cs = 640 * k;
  const cy = H * 0.42;
  const wPx = Math.min(170 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCHDAY", 1)));
  const vs = vsLines(d, 26 * k * ts, W - 2 * M, 15 * k);
  const footH = vs.lines.length * (vs.px + 6 * k) + 12 * k + 18 * k * ts + 14 * k + 26 * k * ts;
  const footTop = lt - 40 * k - footH;
  const p = frontFeet(d, 540, footTop + 30 * k, 1080 * k / 1.3);
  const ghost = (u: string | null, left: boolean) =>
    u ? <img src={u} alt="" style={{ position: "absolute", left: left ? W / 4 - cs / 2 - 60 * k : (3 * W) / 4 - cs / 2 + 60 * k, top: cy - cs / 2, width: cs, height: cs, objectFit: "contain", opacity: 0.32, filter: "saturate(.6)" }} /> : null;
  return (
    <Page d={d} bg="#0d0f13">
      <div style={{ position: "absolute", left: 0, top: 0, width: W / 2, height: H, background: `linear-gradient(180deg, ${shade(t.ink, -0.35)}, #0b0c10)` }} />
      <div style={{ position: "absolute", left: W / 2, top: 0, width: W / 2, height: H, background: "linear-gradient(180deg, #23262c, #0b0c10)" }} />
      {ghost(fx.homeCrest, true)}
      {ghost(fx.awayCrest, false)}
      <div style={{ position: "absolute", left: W / 2 - 2 * k, top: 0, width: 4 * k, height: H, background: "#fff", opacity: 0.6 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: DISPLAY, fontSize: wPx, lineHeight: 0.82, color: "#fff", whiteSpace: "nowrap" }}>MATCHDAY</div>
      <div style={{ position: "absolute", left: W / 2 - 44 * k, top: top + wPx * 0.82 + 30 * k, width: 88 * k, height: 88 * k, borderRadius: "50%", background: "#fff", color: "#111", fontFamily: DISPLAY, fontSize: 40 * k, display: "flex", alignItems: "center", justifyContent: "center" }}>VS</div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: 0, right: 0, top: footTop - 60 * k, bottom: 0, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.7) 35%)" }} />
      <div style={{ position: "absolute", left: M, right: M, top: footTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {vs.lines.map((l, i) => (
          <div key={i} style={{ ...caps(vs.px, 0.04, 900, "#fff"), marginBottom: 6 * k }}>{l}</div>
        ))}
        <div style={{ height: 6 * k }} />
        <div style={caps(18 * k * ts, 0.14, 600, "rgba(255,255,255,.85)")}>{dateVenue(d)}</div>
        <div style={{ height: 14 * k }} />
        <FlagClock d={d} px={26 * k * ts} color="#fff" gap={22 * k} />
      </div>
    </Page>
  );
}

/* ================= 3 · Photo inside the letters (matchday) — Pinterest "MATCH day" letter-clipped photos ================= */

/**
 * Foto nas letras (matchday): a light ground; MATCH / DAY huge in two rows with a real photo (the stadium on record,
 * else his own photo's ground) showing through the letters; him full-body and sharp in front; crests, HOME X AWAY, date ·
 * ground and the flags clock at the foot.
 */
export function Proletterphoto({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const fx = natFixture(d);
  const cut = d.cutouts.find((c) => c.url === d.photoUrl);
  const photo = d.club?.stadiumImages?.[0] ?? d.bgPhotoUrl ?? cut?.original ?? null;
  const px = Math.min(420 * k, (W - 2 * M) / Math.max(0.1, wordW("MATCH", 1)));
  const y1 = top + 20 * k + px * 0.8;
  const y2 = y1 + px * 0.86;
  const vs = vsLines(d, 24 * k * ts, W - 2 * M, 15 * k);
  const footH = 60 * k + 12 * k + vs.lines.length * (vs.px + 6 * k) + 12 * k + 18 * k * ts + 14 * k + 26 * k * ts;
  const footTop = lt - 40 * k - footH;
  // Both words must read: he stands below DAY (shrinks to the room under it, never under 700px tall).
  const feetY = footTop + 20 * k;
  const p = frontFeet(d, 840, feetY, Math.max(700 * k / 1.3, Math.min(1150 * k / 1.3, feetY - (y2 - px * 0.25))));
  const words = (
    <>
      <text x={W / 2} y={y1} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: px }}>
        MATCH
      </text>
      <text x={W / 2} y={y2} textAnchor="middle" style={{ fontFamily: DISPLAY, fontSize: px }}>
        DAY
      </text>
    </>
  );
  return (
    <Page d={d} bg="#efeeea" light>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 35%, #ffffff, #e5e4df 75%)" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="letterphoto">{words}</clipPath>
        </defs>
        <g fill={t.ink}>{words}</g>
        {photo && <image href={photo} x={0} y={top} width={W} height={y2 - top + 40 * k} preserveAspectRatio="xMidYMid slice" clipPath="url(#letterphoto)" style={{ filter: "contrast(1.1) saturate(1.05)" }} />}
        <g fill="none" stroke={t.ink} strokeWidth={4 * k}>
          {words}
        </g>
      </svg>
      <Front d={d} p={p} light />
      <div style={{ position: "absolute", left: M - 10 * k, right: M - 10 * k, top: footTop - 16 * k, height: footH + 26 * k, borderRadius: 18 * k, background: "rgba(255,255,255,.92)", boxShadow: "0 12px 34px rgba(0,0,0,.14)" }} />
      <div style={{ position: "absolute", left: M, right: M, top: footTop, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 20 * k, height: 60 * k }}>
          {[fx.homeCrest, fx.awayCrest].filter(Boolean).map((u, i) => (
            <img key={i} src={u!} alt="" style={{ height: 60 * k, width: 60 * k, objectFit: "contain" }} />
          ))}
        </div>
        <div style={{ height: 12 * k }} />
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

/* ================= 4 · Magazine cover (matchday + goal) — Pinterest editorial covers, liked01 ================= */

function Cover({ d, mast, lines, issue }: { d: RenderData; mast: string; lines: { big: string; small?: string }[]; issue: string }) {
  const { H, k, top, ts } = frameOf(d);
  const t = tones(d);
  const lt = logoTopOf(d, H);
  const mPx = Math.min(230 * k, (W - 2 * M) / Math.max(0.1, mast.length * 0.55));
  const p = frontFeet(d, 660, lt + 80 * k, 1280 * k / 1.3);
  // The cover lines keep to the left of his body (the cut-out's box, trimmed of its empty sides).
  const bodyLeft = p.img ? p.img.left + p.img.width * 0.12 : W * 0.5;
  const cw = Math.max(260 * k, Math.min(W * 0.42, bodyLeft - M - 20 * k));
  const serif: CSSProperties = { fontFamily: DMSERIF, color: "#fff", lineHeight: 1.02, textShadow: "0 3px 16px rgba(0,0,0,.45)" };
  return (
    <Page d={d} bg={shade(t.ink, -0.5)}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${shade(t.ink, 0.05)}, ${shade(t.ink, -0.6)})` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: top - 10 * k, textAlign: "center", fontFamily: DMSERIF, fontSize: mPx, lineHeight: 0.9, color: "#fff", letterSpacing: "-0.01em" }}>{mast}</div>
      <div style={{ position: "absolute", left: M, right: M, top: top - 10 * k + mPx * 0.95, display: "flex", justifyContent: "space-between", borderTop: "2px solid rgba(255,255,255,.8)", paddingTop: 10 * k }}>
        <div style={caps(15 * k, 0.24, 700, "#fff")}>{issue}</div>
        <div style={caps(15 * k, 0.24, 700, "#fff")}>{(matchFacts(d).comp || "").toUpperCase()}</div>
      </div>
      <Front d={d} p={p} />
      <div style={{ position: "absolute", left: M, top: top + mPx + 90 * k, width: cw, display: "flex", flexDirection: "column", gap: 26 * k }}>
        {lines.map((l, i) => {
          const b = lines3(l.big, 52 * k * ts, cw, 0, 26 * k);
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 * k }}>
              {l.small && <div style={{ ...caps(14 * k, 0.24, 800, t.glow === "#ffffff" ? "#fff" : shade(t.glow, 0.3)), textShadow: "0 2px 8px rgba(0,0,0,.5)" }}>{l.small}</div>}
              {b.lines.map((x, j) => (
                <div key={j} style={{ ...serif, fontSize: b.px }}>{x}</div>
              ))}
            </div>
          );
        })}
      </div>
    </Page>
  );
}

/** Capa editorial (matchday): a magazine cover — MATCHDAY masthead in serif, issue (the round) and competition under a rule; him big in front, the cover lines down the left: HOME v AWAY, kick-off, the ground. */
export function Procover({ data }: { data: RenderData }) {
  const d = dropped(data);
  const fx = natFixture(d);
  const clocks = [fx.time, fx.ptTime].filter(Boolean).join(" · ");
  const lines = [
    { small: "THE FIXTURE", big: fx.homeName && fx.awayName ? `${fx.homeName} v ${fx.awayName}` : roundTitle(d) },
    ...(clocks ? [{ small: "KICK-OFF", big: clocks }] : []),
    ...(fx.venue || fx.date ? [{ small: fx.date ? fx.date.toUpperCase() : "WHERE", big: fx.venue || fx.date }] : []),
  ];
  const no = matchFacts(d).roundNo;
  return <Cover d={d} mast="Matchday" lines={lines} issue={no ? `ISSUE NO. ${no}` : roundTitle(d)} />;
}

/** Golo · capa editorial (goal): the magazine cover with GOAL as the masthead and his name and club as the cover lines. */
export function Goalprocover({ data }: { data: RenderData }) {
  const d = dropped(data);
  const name = [d.content.firstName, d.content.lastName].filter(Boolean).join(" ");
  const club = ourClub(d);
  const no = (d.player.number || "").replace(/\D/g, "").slice(0, 2);
  const word = (d.content.kicker || "Goal").toLowerCase();
  const lines = [{ small: "THE SCORER", big: name }, ...(club ? [{ small: "FOR", big: club }] : [])];
  return <Cover d={d} mast={word.charAt(0).toUpperCase() + word.slice(1) + "!"} lines={lines} issue={no ? `NO. ${no}` : "GOAL"} />;
}
