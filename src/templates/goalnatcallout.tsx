/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NAT_SHADOW } from "./natbug";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/** Rough width of mixed-case Inter semibold at 1px (for fitting the name). */
function textEm(s: string, tracking: number): number {
  let em = 0;
  for (const ch of s.normalize("NFD").replace(/\p{M}/gu, "")) em += ch === " " ? 0.27 : /[MW]/.test(ch) ? 0.86 : /[A-Z]/.test(ch) ? 0.68 : /[iljtf]/.test(ch) ? 0.3 : /[mw]/.test(ch) ? 0.86 : 0.57;
  return em + [...s].length * tracking;
}

/**
 * Natural goal · callout: his real celebration photo full-bleed and almost untouched, annotated like a
 * magazine photo — a small dot beside his head, a thin white leader line rising out to the clear side, and at
 * its end a small label: "GOAL", his name, his club's exact name. No score. The NEYOD logo alone at the foot.
 */
export function Goalnatcallout({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const M = story ? 64 : 56;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 420 : params.side === "right" ? 660 : 620,
    fy: story ? 680 : 560,
    fs: story ? 240 : 168,
  });

  /* ---- the label ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const first = (content.firstName ?? "").trim();
  const last = (content.lastName ?? "").trim();
  const name = [first, last].filter(Boolean).join(" ");
  const club = ourClub(data).toUpperCase();
  const kSize = 22 * k * ts;
  const cSize = 18 * k * ts;

  /* ---- the leader: dot just above his hair → up and out → a short level run → the label, which sits
     above his head's level (clear of raised arms, as far as a photo allows) ---- */
  const dir = place.fx > CANVAS_W / 2 ? -1 : 1;
  const topMin = story ? STORY_TOP : 60;
  const p0 = { x: place.fx + dir * place.faceW * 0.5, y: place.fy - place.fs * 0.95 };
  const rise = Math.max(0, Math.min(place.fs * 0.8, p0.y - topMin - kSize * 0.5));
  const p1 = { x: p0.x + dir * rise * 0.85, y: p0.y - rise };
  const run = Math.round(64 * k);
  const p2 = { x: p1.x + dir * run, y: p1.y };
  const gap = Math.round(18 * k);
  const avail = dir < 0 ? p2.x - gap - M : CANVAS_W - M - (p2.x + gap);
  // The name on one line if it fits at a readable size, else first / last on two lines.
  const one = Math.min(42 * k * ts, avail / Math.max(1, textEm(name, 0)));
  const twoLines = one < 34 * k * ts && !!first && !!last;
  const nSize = twoLines ? Math.min(42 * k * ts, avail / Math.max(1, textEm(first, 0), textEm(last, 0))) : one;
  const cFit = Math.min(cSize, avail / Math.max(1, capsEm(club, 0.22)));
  const labelTop = p2.y - kSize / 2 + (params.textY ?? 0);
  const ldy = params.textY ?? 0;

  const sw = story ? 3.4 : 2.6;
  const dot = Math.round(6 * k);

  /* ---- the logo: bottom centre ---- */
  const lh = story ? 88 : 52;
  const logoTop = (story ? STORY_BOTTOM - lh : CANVAS_H - 50 - lh) - (params.logoY ?? 0);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      {/* Edgeless breaths of shade: behind the label (its side of the top) and under the logo. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse ${story ? 700 : 560}px ${story ? 520 : 400}px at ${dir < 0 ? "0%" : "100%"} ${labelTop + 40}px, rgba(0,0,0,.26), rgba(0,0,0,.1) 50%, rgba(0,0,0,0) 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 520 : 300, background: "linear-gradient(to top, rgba(0,0,0,.34), rgba(0,0,0,0))" }} />

      {/* The leader line. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: ldy }} aria-hidden>
        <defs>
          <filter id="gnc-sh" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.38" />
            <feDropShadow dx="0" dy="8" stdDeviation="22" floodColor="#000" floodOpacity="0.42" />
          </filter>
        </defs>
        <g filter="url(#gnc-sh)">
          <path d={`M ${p0.x} ${p0.y} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`} fill="none" stroke="#fff" strokeWidth={sw} strokeLinejoin="miter" />
          <circle cx={p0.x} cy={p0.y} r={dot} fill="#fff" />
        </g>
      </svg>

      {/* The label. */}
      <div
        style={{
          position: "absolute",
          top: labelTop,
          ...(dir < 0 ? { right: CANVAS_W - (p2.x - gap), alignItems: "flex-end", textAlign: "right" } : { left: p2.x + gap, alignItems: "flex-start", textAlign: "left" }),
          display: "flex",
          flexDirection: "column",
          fontFamily: SANS,
          color: "#fff",
          textShadow: NAT_SHADOW,
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: kSize, lineHeight: 1, letterSpacing: "0.34em", marginRight: dir < 0 ? "-0.34em" : 0 }}>{kicker}</div>
        {name && (
          <div style={{ marginTop: Math.round(16 * k), fontWeight: 700, fontSize: nSize, lineHeight: 1.04, letterSpacing: "-0.005em" }}>
            {twoLines ? (
              <>
                {first}
                <br />
                {last}
              </>
            ) : (
              name
            )}
          </div>
        )}
        {club && <div style={{ marginTop: Math.round(14 * k), fontWeight: 700, fontSize: cFit, lineHeight: 1, letterSpacing: "0.22em", marginRight: dir < 0 ? "-0.22em" : 0, opacity: 0.92 }}>{club}</div>}
      </div>

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center bottom" }}
      />
    </div>
  );
}
