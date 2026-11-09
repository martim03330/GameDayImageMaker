/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { frameOf } from "./natfree4";
import { Top } from "./natfree10";
import { Shade } from "./natfree16";
import { HALO } from "./natfree19";
import { caps, fit, fixtureOf, fullName, roundTitle, SHADOW, whenRows } from "./natfree9";
import { DISPLAY } from "./shared";
import { clubInk } from "./trend2";
import { CANVAS_W, type RenderData } from "./types";

const W = CANVAS_W - 120;

/** Title, fixture and date · kick-off · ground set flush left, for a row with an object beside it. */
export function SideText({ data, k, ts, w, title, tMax = 66 }: { data: RenderData; k: number; ts: number; w: number; title: string; tMax?: number }) {
  const fixture = fixtureOf(data);
  const tPx = Math.min(tMax * k * ts, w / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 27 * k * ts, w, 0.08);
  const rows = whenRows(data, 21 * k * ts, w, 0.12);
  const wPx = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, w, 0.12)));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{title}</div>
      {fixture && <div style={{ ...caps(fPx, 0.08), paddingLeft: 0, fontWeight: 800, marginTop: 18 * k, textShadow: HALO }}>{fixture}</div>}
      {rows.map((l, i) => (
        <div key={i} style={{ ...caps(wPx, 0.12), paddingLeft: 0, fontWeight: 600, marginTop: 10 * k, opacity: 0.94, textShadow: HALO }}>{l}</div>
      ))}
    </div>
  );
}

export function sideTextH(data: RenderData, k: number, ts: number, w: number, title: string, tMax = 66) {
  const fixture = fixtureOf(data);
  const tPx = Math.min(tMax * k * ts, w / Math.max(1, title.length * 0.5));
  const rows = whenRows(data, 21 * k * ts, w, 0.12);
  const wPx = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, w, 0.12)));
  return tPx + (fixture ? 18 * k + fit(fixture, 27 * k * ts, w, 0.08) : 0) + rows.length * (wPx + 10 * k);
}

/** GOAL in Anton, his name and exact club, flush left beside an object. */
export function GoalText({ data, k, ts, w }: { data: RenderData; k: number; ts: number; w: number }) {
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = fullName(data);
  const club = ourClub(data).toUpperCase();
  const gPx = Math.min(120 * k * ts, w / Math.max(1, word.length * 0.5));
  const nPx = fit(name, 30 * k * ts, w, 0.08);
  const cPx = fit(club, 22 * k * ts, w, 0.18);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <div style={{ fontFamily: DISPLAY, fontSize: gPx, lineHeight: 1, whiteSpace: "nowrap", textShadow: SHADOW }}>{word}</div>
      <div style={{ ...caps(nPx, 0.08), paddingLeft: 0, fontWeight: 800, marginTop: 18 * k, textShadow: HALO }}>{name}</div>
      {club && <div style={{ ...caps(cPx, 0.18), paddingLeft: 0, fontWeight: 700, marginTop: 10 * k, opacity: 0.96, textShadow: HALO }}>{club}</div>}
    </div>
  );
}

/**
 * A corner flag: white pole with a ball on top and a waving flag in his club's colour, edged in white so a club
 * colour close to the sky still reads.
 */
function CornerFlag({ data, w, h, k }: { data: RenderData; w: number; h: number; k: number }) {
  const ink = clubInk(data);
  const px = 14 * k;
  const x0 = px + 5 * k;
  const y0 = 22 * k;
  const fw = w - x0 - 6 * k;
  const fh = h * 0.5;
  const x1 = x0 + fw;
  const flag = `M ${x0} ${y0} C ${x0 + fw * 0.35} ${y0 - 18 * k}, ${x0 + fw * 0.65} ${y0 + 18 * k}, ${x1} ${y0 + 6 * k} L ${x1} ${y0 + fh + 6 * k} C ${x0 + fw * 0.65} ${y0 + fh + 18 * k}, ${x0 + fw * 0.35} ${y0 + fh - 18 * k}, ${x0} ${y0 + fh} Z`;
  return (
    <svg width={w} height={h} style={{ display: "block", flexShrink: 0, overflow: "visible", filter: "drop-shadow(0 6px 16px rgba(0,0,0,.4))" }}>
      <rect x={px - 5 * k} y={10 * k} width={10 * k} height={h - 10 * k} rx={5 * k} fill="#fff" />
      <circle cx={px} cy={10 * k} r={9 * k} fill="#fff" />
      <path d={flag} fill={ink} stroke="#fff" strokeWidth={5 * k} strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Natural · bandeirola de canto (matchday): a corner flag in his club's colour beside MATCHDAY 14, the fixture and
 * date · kick-off · ground — one row above his head.
 */
export function Natcornerflag({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const fw = 180 * k;
  const fh = 230 * k;
  const gap = 34 * k;
  const tw = W - fw - gap;
  const blockH = Math.max(fh, sideTextH(data, k, ts, tw, title));
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <CornerFlag data={data} w={fw} h={fh} k={k} />
          <SideText data={data} k={k} ts={ts} w={tw} title={title} />
        </div>
      </Shade>
    </Top>
  );
}

/** Golo natural · bandeirola de canto (goal): the corner flag, where goals are celebrated, beside GOAL, his name and club. */
export function Goalnatcornerflag({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const fw = 160 * k;
  const fh = 250 * k;
  const gap = 40 * k;
  return (
    <Top data={data} blockH={fh} drop={310}>
      <Shade k={k} h={fh}>
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <CornerFlag data={data} w={fw} h={fh} k={k} />
          <GoalText data={data} k={k} ts={ts} w={W - fw - gap} />
        </div>
      </Shade>
    </Top>
  );
}

/**
 * Natural · credencial (matchday): a matchday pass on a lanyard in his club's colour — the strap fades up into the
 * sky, the white card carries his club's crest, MATCHDAY 14 and the fixture in dark ink, the date · kick-off ·
 * ground under the card.
 */
export function Natpass({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const ink = clubInk(data);
  const crest = data.club?.crestUrl;
  const title = roundTitle(data);
  const fixture = fixtureOf(data);
  const cw = Math.min(W, 640 * k);
  const pad = 20 * k;
  const crestD = 80 * k;
  const iw = cw - 2 * pad - (crest ? crestD + 24 * k : 0);
  const tPx = Math.min(54 * k * ts, iw / Math.max(1, title.length * 0.5));
  const fPx = fit(fixture, 22 * k * ts, iw, 0.06);
  const cardH = 14 * k + pad + Math.max(crest ? crestD : 0, tPx + (fixture ? 12 * k + fPx : 0)) + pad;
  const strapH = 44 * k;
  const rows = whenRows(data, 21 * k * ts, W * 0.9, 0.16);
  const wPx = Math.min(21 * k * ts, ...rows.map((l) => fit(l, 21 * k * ts, W * 0.9, 0.16)));
  const blockH = strapH + cardH + (rows.length ? 18 * k + rows.length * wPx + (rows.length - 1) * 8 * k + 16 * k : 0);
  const strap = { position: "absolute" as const, top: 0, width: 26 * k, height: strapH + 8 * k, background: ink, border: `${3 * k}px solid #fff`, borderTop: "none", boxSizing: "border-box" as const };
  const fade = "linear-gradient(to bottom, transparent, #000 60%)";
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ position: "relative", width: cw, height: strapH, WebkitMaskImage: fade, maskImage: fade }}>
          <div style={{ ...strap, left: cw / 2 - 70 * k, transform: "skewX(-24deg)", transformOrigin: "bottom" }} />
          <div style={{ ...strap, left: cw / 2 + 44 * k, transform: "skewX(24deg)", transformOrigin: "bottom" }} />
        </div>
        <div style={{ position: "relative", width: cw, height: cardH, background: "#fff", borderRadius: 18 * k, boxShadow: "0 10px 30px rgba(0,0,0,.4)", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 14 * k, background: ink }} />
          <div style={{ position: "absolute", left: cw / 2 - 34 * k, top: 20 * k, width: 68 * k, height: 8 * k, borderRadius: 6 * k, background: "#e4e6ea" }} />
          <div style={{ position: "absolute", left: pad, right: pad, top: 14 * k + pad, display: "flex", alignItems: "center", gap: 24 * k }}>
            {crest && <img src={crest} alt="" style={{ width: crestD, height: crestD, objectFit: "contain", flexShrink: 0 }} />}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ fontFamily: DISPLAY, fontSize: tPx, lineHeight: 1, whiteSpace: "nowrap", color: ink }}>{title}</div>
              {fixture && <div style={{ ...caps(fPx, 0.06), paddingLeft: 0, fontWeight: 800, marginTop: 12 * k, color: "#16181d", textShadow: "none" }}>{fixture}</div>}
            </div>
          </div>
        </div>
        {rows.length > 0 && (
          <div style={{ marginTop: 18 * k, padding: `${8 * k}px ${20 * k}px`, borderRadius: 999, background: "rgba(10,12,16,.55)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 * k }}>
            {rows.map((l, i) => (
              <div key={i} style={{ ...caps(wPx, 0.16), fontWeight: 600, textShadow: "none" }}>{l}</div>
            ))}
          </div>
        )}
      </Shade>
    </Top>
  );
}

/**
 * His shirt on a dressing-room hanger, seen from the back: the body in his club's colour edged in white, his
 * surname and shirt number in white Anton (number from his profile; without one, the name alone).
 */
function KitHanger({ data, w, k }: { data: RenderData; w: number; k: number }) {
  const ink = clubInk(data);
  const surname = (data.content.lastName || "").toUpperCase();
  const num = (data.player.number || "").replace(/\D/g, "");
  const h = w * 1.02;
  const hook = 46 * k;
  const s = w / 100;
  // A short-sleeved shirt in a 100×92 box under the hook.
  const shirt = `M 34 8 L 22 12 L 2 30 L 14 44 L 22 38 L 22 92 L 78 92 L 78 38 L 86 44 L 98 30 L 78 12 L 66 8 C 62 14, 38 14, 34 8 Z`;
  const nPx = Math.min(15 * s, (46 * s) / Math.max(1, surname.length * 0.5));
  return (
    <div style={{ position: "relative", width: w, height: h + hook, flexShrink: 0, filter: "drop-shadow(0 8px 18px rgba(0,0,0,.45))" }}>
      <svg width={w} height={hook + 14 * s} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <path d={`M ${w / 2} ${hook + 8 * s} L ${w / 2} ${hook * 0.55} C ${w / 2} ${hook * 0.1}, ${w / 2 + 22 * k} ${hook * 0.05}, ${w / 2 + 22 * k} ${hook * 0.35}`} fill="none" stroke="#fff" strokeWidth={6 * k} strokeLinecap="round" />
        <path d={`M ${12 * s} ${hook + 16 * s} L ${w / 2} ${hook + 6 * s} L ${88 * s} ${hook + 16 * s}`} fill="none" stroke="#fff" strokeWidth={6 * k} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <svg width={w} height={h} viewBox="0 0 100 92" style={{ position: "absolute", left: 0, top: hook + 6 * s, overflow: "visible" }}>
        <path d={shirt} fill={ink} stroke="#fff" strokeWidth={2.2} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: hook + 6 * s + 24 * s, display: "flex", flexDirection: "column", alignItems: "center", color: "#fff" }}>
        {surname && <div style={{ fontFamily: DISPLAY, fontSize: nPx, lineHeight: 1, whiteSpace: "nowrap", letterSpacing: "0.04em" }}>{surname}</div>}
        {num && <div style={{ fontFamily: DISPLAY, fontSize: 40 * s, lineHeight: 1, marginTop: 4 * s }}>{num}</div>}
      </div>
    </div>
  );
}

/**
 * Natural · camisola no cabide (matchday): his shirt hanging ready in the dressing room — surname and number on the
 * back in his club's colour — beside MATCHDAY 14, the fixture and date · kick-off · ground.
 */
export function Natkithanger({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const title = roundTitle(data);
  const sw = 190 * k;
  const gap = 36 * k;
  const tw = W - sw - gap;
  const blockH = Math.max(sw * 1.02 + 46 * k, sideTextH(data, k, ts, tw, title));
  return (
    <Top data={data} blockH={blockH} drop={290}>
      <Shade k={k} h={blockH}>
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <KitHanger data={data} w={sw} k={k} />
          <SideText data={data} k={k} ts={ts} w={tw} title={title} />
        </div>
      </Shade>
    </Top>
  );
}

/** Golo natural · camisola no cabide (goal): his shirt on the hanger beside GOAL, his name and exact club. */
export function Goalnatkithanger({ data }: { data: RenderData }) {
  const { k, ts } = frameOf(data);
  const sw = 200 * k;
  const gap = 40 * k;
  const blockH = sw * 1.02 + 46 * k;
  return (
    <Top data={data} blockH={blockH} drop={310}>
      <Shade k={k} h={blockH}>
        <div style={{ display: "flex", alignItems: "center", gap }}>
          <KitHanger data={data} w={sw} k={k} />
          <GoalText data={data} k={k} ts={ts} w={W - sw - gap} />
        </div>
      </Shade>
    </Top>
  );
}
