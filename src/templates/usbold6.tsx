/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade } from "@/lib/color";
import { ANTON, em } from "./mist";
import { Filled } from "./natref4";
import { NatFigure, natPlace } from "./natkit";
import { CONDENSED, DISPLAY } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { Logo, capsStyle, facts, frame, groundOf, wrapCaps } from "./usbold1";
import { CREST_HALO } from "./usgame1";

/*
 * Round 81 · two bold looks, each after ONE real reference captured this round (Pinterest):
 *
 *   ushosting       bold US MATCHDAY after Iowa women's soccer "HOSTING" (No. 5 Iowa vs South Dakota State;
 *                   "soccer gameday graphic design university", row 4 col 2): his own night/dusk photo in natural
 *                   colour, the sky and stands pulled down into a deep slate-navy dusk (darkest at the top), the
 *                   grass left green; a centred block over him: the crest small in a white disc, "HOME VS AWAY"
 *                   bold white condensed caps (exact names, wrapped, never cut), a hairline, "venue | date | time"
 *                   small and tracked, then the kicker gigantic in the reference's gold condensed caps, its foot
 *                   just over his hair (the reference's heads touch the word; here it stops above them).
 *   agencygoalgrid  agency GOAL after Man City "GOAL" (Rayan Cherki; "goal graphic design soccer player", row 2
 *                   col 3): his photo with him filled out, bleached into a pale high-key grey with a faint
 *                   blueprint grid in the club colour; a deep navy-to-club-colour band across the lower part,
 *                   behind his chest; "GOAL" giant in the club colour above his hair; his shirt number big in the
 *                   club colour and his name in white on the band at the left, his club crest at the right. No
 *                   score, no signature.
 *
 * Both: the ground is the photo with him filled out (Filled), so he is never doubled; he goes on top sharp and in
 * colour (NatFigure clean). When his head is high (face centre above ~40% of the frame) or the room over his hair
 * is too small, the word drops under his chin, in front of him, on a soft backing (as usbold3 / usbold4).
 */

const W = CANVAS_W;
const GOLD = "#ffcd00";
/** Anton: the caps' top / foot inside a line box of lineHeight 1 (fractions of the size). */
const CAP_TOP = 0.13;
const CAP_FOOT = 0.87;

/* ===== ushosting — "HOSTING" gold over his hair, matchup on top, dusk grade ===== */

export function Ushosting({ data }: { data: RenderData }) {
  const { H, ts, logoTop } = frame(data);
  const story = H > CANVAS_H;
  const k = story ? 1.3 : 1;
  const f = facts(data);
  const navy = "#0d1424";

  const place = natPlace(data, W, H, { fx: W / 2, fy: story ? 1060 : 720, fs: story ? 165 : 130 });
  const faceCy = place.fy + (place.nudge?.y ?? 0);
  const hair = faceCy - place.fs * 1.05;
  const chin = faceCy + place.fs * 0.62;

  const word = (data.content.kicker || "HOSTING").toUpperCase().replace(/\s+/g, "");
  const fitPx = Math.min(300 * k * ts, (W - 110) / Math.max(1, em(word, ANTON, 40)));

  // ---- the head of the block: the matchup and the info line ----
  const home = f.fx.homeName.toUpperCase() || f.ours;
  const away = f.fx.awayName.toUpperCase() || f.opp;
  const vs = away ? `${home} VS ${away}` : home;
  const vsW = wrapCaps(vs, W - 150, 46 * ts * k * 0.85, 22, 0.02, 3, 0.5);
  const info = [f.venue, f.date, f.time].filter(Boolean).join("  |  ");
  const infoW = wrapCaps(info, W - 200, 19 * ts * k * 0.85, 12, 0.14, 2, 0.5);
  const crestD = story ? 92 : 72;
  const crest = f.ourCrest;
  const headH = (crest ? crestD + 22 : 0) + vsW.lines.length * vsW.px * 1.08 + 18 + 2 + 16 + infoW.lines.length * infoW.px * 1.4 + 18;

  // ---- above his hair, or (high head / no room) under his chin ----
  const minTop = story ? 230 : 70;
  const highHead = faceCy < H * 0.4;
  let wordPx = fitPx;
  // the word's caps end 24px over his hair; the head of the block sits on top of it
  let wordFoot = hair - 24;
  const room = wordFoot - minTop - headH;
  const above = !highHead && room >= fitPx * (CAP_FOOT - CAP_TOP) * 0.6;
  if (above) wordPx = Math.min(fitPx, room / (CAP_FOOT - CAP_TOP));
  else wordPx = Math.min(fitPx, 230 * k * ts);
  let blockTop: number;
  if (above) blockTop = wordFoot - wordPx * (CAP_FOOT - CAP_TOP) - headH;
  else {
    blockTop = chin + 40;
    wordFoot = blockTop + headH + wordPx * (CAP_FOOT - CAP_TOP);
  }
  const wordTop = wordFoot - wordPx * CAP_FOOT;
  const shadow = "0 2px 18px rgba(0,0,0,.45)";

  let y = blockTop;
  const crestTop = y;
  if (crest) y += crestD + 22;
  const vsTop = y;
  y += vsW.lines.length * vsW.px * 1.08 + 18;
  const ruleTop = y;
  y += 2 + 16;
  const infoTop = y;

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: navy, color: "#fff" }}>
      {/* the ground: his photo without him, natural colour, a touch deeper */}
      <div style={{ position: "absolute", inset: 0, filter: "saturate(.92) brightness(.9) contrast(1.06)" }}>
        <Filled place={place} H={H} />
      </div>
      {/* the reference's dusk: the sky and stands cooled and pulled into slate navy, darkest at the top; the grass kept */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: Math.max(H * 0.62, hair + 120), background: `linear-gradient(to bottom, ${navy}f2 0%, ${navy}c8 40%, ${navy}55 78%, ${navy}00 100%)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: H * 0.55, background: "#1d2a4a", mixBlendMode: "color", opacity: 0.55 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: logoTop - 320, bottom: 0, background: `linear-gradient(to bottom, rgba(0,0,0,0), ${navy}d0)` }} />

      {above && (
        <div style={{ position: "absolute", left: 0, right: 0, top: wordTop, textAlign: "center", fontFamily: DISPLAY, fontSize: wordPx, lineHeight: 1, whiteSpace: "nowrap", color: GOLD, textShadow: "0 4px 30px rgba(0,0,0,.35)" }}>
          {word}
        </div>
      )}

      <NatFigure data={data} place={place} W={W} H={H} clean />

      {!above && <div style={{ position: "absolute", left: -90, right: -90, top: blockTop - 60, height: wordFoot - blockTop + 130, background: `radial-gradient(closest-side, ${navy}e0, ${navy}90 60%, rgba(0,0,0,0))` }} />}
      {!above && (
        <div style={{ position: "absolute", left: 0, right: 0, top: wordTop, textAlign: "center", fontFamily: DISPLAY, fontSize: wordPx, lineHeight: 1, whiteSpace: "nowrap", color: GOLD, textShadow: "0 4px 30px rgba(0,0,0,.35)" }}>
          {word}
        </div>
      )}

      {crest && (
        <div style={{ position: "absolute", left: W / 2 - crestD / 2, top: crestTop, width: crestD, height: crestD, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 18px rgba(0,0,0,.35)" }}>
          <img src={crest} alt="" style={{ width: crestD * 0.66, height: crestD * 0.66, objectFit: "contain", filter: CREST_HALO }} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: vsTop, textAlign: "center", textShadow: shadow }}>
        {vsW.lines.map((l, i) => (
          <div key={i} style={capsStyle(vsW.px, 800, 0.02, "#fff", { lineHeight: 1.08 })}>
            {l}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: W / 2 - 300, width: 600, top: ruleTop, height: 2, background: "rgba(255,255,255,.75)" }} />
      {info && (
        <div style={{ position: "absolute", left: 0, right: 0, top: infoTop, textAlign: "center", textShadow: shadow }}>
          {infoW.lines.map((l, i) => (
            <div key={i} style={capsStyle(infoW.px, 600, 0.14, "#fff", { lineHeight: 1.4, paddingLeft: "0.14em" })}>
              {l}
            </div>
          ))}
        </div>
      )}

      <Logo data={data} top={logoTop} onLight={false} />
    </div>
  );
}

/* ===== agencygoalgrid — "GOAL" in the club colour over a pale grid, a deep band behind his chest ===== */

export function Agencygoalgrid({ data }: { data: RenderData }) {
  const { H, ts, logoTop } = frame(data);
  const story = H > CANVAS_H;
  const k = story ? 1.3 : 1;
  const { club } = groundOf(data);
  // The word's colour must read on the pale ground: very light colours are deepened, near-black ones lifted.
  const lc = luminance(club);
  const ink = lc > 0.55 ? shade(club, -0.4) : lc < 0.04 ? shade(club, 0.3) : club;
  // The band: deep navy into the club colour (dark enough for white type).
  const bandLo = lc > 0.3 ? shade(club, -0.35) : club;
  const navy = "#0a1630";
  // On the dark band the number needs a bright club colour.
  const numInk = luminance(ink) < 0.12 ? shade(ink, 0.5) : ink;
  // The number sits low on the band, where it turns into the club colour: white when the two would merge.
  const numOnBand = Math.abs(luminance(numInk) - luminance(bandLo)) < 0.18 ? "#fff" : numInk;

  const place = natPlace(data, W, H, { fx: W / 2, fy: story ? 900 : 600, fs: story ? 220 : 170 });
  const faceCy = place.fy + (place.nudge?.y ?? 0);
  const hair = faceCy - place.fs * 1.05;
  const chin = faceCy + place.fs * 0.62;

  const word = (data.content.kicker || "GOAL").trim().toUpperCase();
  // The reference's tall narrow caps: Anton stretched up a little.
  const stretch = 1.12;
  const fitPx = Math.min(420 * k * ts, (W - 110) / Math.max(1, em(word, ANTON, 40)));
  const capH = (CAP_FOOT - CAP_TOP) * stretch;
  const minTop = story ? 230 : 70;
  const highHead = faceCy < H * 0.4;
  const room = hair - 26 - minTop;
  const above = !highHead && room >= fitPx * capH * 0.55;
  const wordPx = above ? Math.min(fitPx, room / capH) : Math.min(fitPx, 260 * k * ts);

  // ---- the band: from his chest down ----
  const bandTop = Math.round(Math.min(H * 0.74, Math.max(H * 0.56, chin + place.fs * 0.55)));
  let wordCapTop: number;
  if (above) wordCapTop = hair - 26 - wordPx * capH;
  else wordCapTop = Math.max(bandTop + 30, chin + 40);
  const wordTop = wordCapTop - wordPx * CAP_TOP * stretch;

  // ---- number + name on the band, left; his club crest right ----
  const num = (data.player?.number || "").trim();
  const first = (data.content.firstName || "").trim();
  const last = (data.content.lastName || "").trim();
  const name = [first, last].filter(Boolean).join(" ");
  const nameW = wrapCaps(name, W * 0.5, 44 * ts * k * 0.85, 20, 0, 2, 0.48);
  const numPx = 96 * ts * k * 0.85;
  const textTop = above ? bandTop + 60 : wordCapTop + wordPx * capH + 40;
  const crest = data.club?.crestUrl ?? null;
  const crestD = story ? 110 : 86;
  const shadow = "0 2px 16px rgba(0,0,0,.5)";

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#eef0f3", color: "#fff" }}>
      {/* the ground: his photo without him, bleached into a pale high-key grey (its texture just showing) */}
      <div style={{ position: "absolute", inset: 0, filter: "grayscale(1) contrast(.6) brightness(1.55)" }}>
        <Filled place={place} H={H} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "#f1f3f6", opacity: 0.62 }} />
      {/* the reference's blueprint grid, faint, in the club colour */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.16, backgroundImage: `linear-gradient(${ink} 1.5px, transparent 1.5px), linear-gradient(90deg, ${ink} 1.5px, transparent 1.5px)`, backgroundSize: "120px 120px", backgroundPosition: "-6px -6px" }} />
      {/* the deep band behind his chest */}
      <div style={{ position: "absolute", left: 0, right: 0, top: bandTop, bottom: 0, background: `linear-gradient(to bottom, ${navy} 0%, ${shade(bandLo, -0.25)} 55%, ${bandLo} 100%)` }} />

      {above && (
        <div style={{ position: "absolute", left: 0, right: 0, top: wordTop, textAlign: "center", fontFamily: DISPLAY, fontSize: wordPx, lineHeight: 1, whiteSpace: "nowrap", color: ink, transform: `scaleY(${stretch})`, transformOrigin: "center top" }}>
          {word}
        </div>
      )}

      <NatFigure data={data} place={place} W={W} H={H} clean />

      {!above && <div style={{ position: "absolute", left: 0, right: 0, top: wordCapTop - 90, height: wordPx * capH + 180, background: `linear-gradient(to bottom, ${navy}00 0%, ${navy}d8 24%, ${navy}e0 76%, ${navy}00 100%)` }} />}
      {!above && (
        <div style={{ position: "absolute", left: 0, right: 0, top: wordTop, textAlign: "center", fontFamily: DISPLAY, fontSize: wordPx, lineHeight: 1, whiteSpace: "nowrap", color: "#fff", textShadow: "0 3px 24px rgba(0,0,0,.4)", transform: `scaleY(${stretch})`, transformOrigin: "center top" }}>
          {word}
        </div>
      )}

      <div style={{ position: "absolute", left: 64, top: textTop, textShadow: shadow }}>
        {num && <div style={{ fontFamily: DISPLAY, fontSize: numPx, lineHeight: 1, color: numOnBand }}>{num}</div>}
        {nameW.lines.map((l, i) => (
          <div key={i} style={{ fontFamily: CONDENSED, fontWeight: 700, fontSize: nameW.px, lineHeight: 1.1, whiteSpace: "nowrap", color: "#fff" }}>
            {l}
          </div>
        ))}
      </div>
      {crest && <img src={crest} alt="" style={{ position: "absolute", right: 64, top: textTop + 6, width: crestD, height: crestD, objectFit: "contain", filter: CREST_HALO }} />}

      <Logo data={data} top={logoTop} onLight={false} />
    </div>
  );
}
