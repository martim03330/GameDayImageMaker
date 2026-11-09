import { NatGround, natFixture, natPlace } from "./natkit";
import { dropped } from "./natfree26";
import { Shell, caps, fit, frameOf, small } from "./natref1";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Round 61 · a natural look after ONE reference (photo treatment first). Photos only through NatGround /
 * NatFigure, so the "Brilho suave" finish keeps working; he and his face stay sharp and in colour.
 *
 *   natrefgametime   "Game / Time" (Navbaxor v AGMK; Pinterest "matchday poster cinematic")
 *     treatment: a cool blue night grade — the ground a deep navy, the stadium lights blooming white-blue to his
 *                right and low behind him, the top falling to near black
 *     type:      a big wide rounded "Game" in silvery white high, a blue script "Time" crossing under it; "Home (VS)
 *                Away" small under them, the ground tinier under that
 */

const W = CANVAS_W;
const WIDE = "var(--font-unbounded), sans-serif";
const SCRIPT = "var(--font-vibes), cursive";

/** "LIGA PORTUGAL 2" → "Liga Portugal 2" (the reference's title case). */
const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase());

/* ===== natrefgametime ===== */

export function Natrefgametime({ data }: { data: RenderData }) {
  const d = dropped(data);
  const { H, k, ts, story, logoTop, bottom } = frameOf(d);
  const fx = natFixture(d);
  // He stands low, the type sits in the dark sky above his head (as in the reference).
  const place = natPlace(d, W, H, { fx: 520, fy: story ? 1080 : 760, fs: story ? 150 : 105 });
  const k0 = (d.content.kicker || "").trim();
  const custom = k0 && !/^(match|game)\s*day$/i.test(k0);
  const [big, it] = custom ? [k0.charAt(0).toUpperCase() + k0.slice(1).toLowerCase(), ""] : ["Game", "Time"];
  const g0 = fit(190 * k * ts, W - 160, big.length, 0.86);
  const n0 = Math.min(...[fx.homeName, fx.awayName].map((n) => fit(24 * k * ts, W * 0.36, n.length, 0.6)));
  const venue = fx.venue ? titleCase(fx.venue) : "";
  const vLine = [fx.date, fx.kickoff, venue].filter(Boolean).join("  ·  ");
  const v0 = fit(18 * k * ts, W - 200, vLine.length, 0.55);
  const h0 = g0 * 0.95 + (it ? g0 * 0.78 * 0.5 : 0) + n0 * 1.9 + 18 * k + v0 * 1.35 + 10 * k;
  // The reference's place: the dark sky above his head, under the logo band. The block shrinks to fit between the
  // two (his face never under a letter); with too little sky left it goes to the foot instead.
  const sky0 = logoTop + (story ? 190 : 130);
  const faceTop = place.fy - place.fs * 0.75;
  const room = faceTop - 30 * k - sky0;
  const high = room >= h0 * 0.5;
  const sc = high ? Math.min(1, room / h0) : 1;
  const [gPx, nPx, vPx] = [g0 * sc, n0 * Math.max(0.8, sc), v0 * Math.max(0.8, sc)];
  const iPx = gPx * 0.78;
  const blockH = gPx * 0.95 + (it ? iPx * 0.5 : 0) + nPx * 1.9 + 18 * k + vPx * 1.35 + 10 * k;
  const top = high ? sky0 : bottom - blockH;
  const cx = (place.fx / W) * 100;
  const cy = ((place.fy + place.fs * 1.4) / H) * 100;
  return (
    <Shell
      data={d}
      place={place}
      bg="#04081c"
      // The reference's treatment: a cool blue night. The ground black-and-white, multiplied by navy (bright royal
      // blue around him, near black at the top), then the floodlights screened in as white-blue blooms to his right
      // and low behind him.
      ground={
        <>
          <NatGround place={place} W={W} H={H} style={{ filter: "grayscale(1) contrast(1.1) brightness(1.05)" }} />
          <div style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", background: `radial-gradient(ellipse 80% 55% at ${cx}% ${cy + 8}%, #4f7dff 0%, #2443c9 40%, #0f1d6b 75%, #060b2c 100%)` }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(3,6,22,.8) 0%, rgba(3,6,22,.35) 32%, rgba(3,6,22,0) 50%)" }} />
          {/* The floodlight bank behind him: a wide soft glare band, two hot lamps in it (soft, no hard rings). */}
          <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", background: `radial-gradient(ellipse 70% 9% at 70% ${cy - 2}%, rgba(200,225,255,.55) 0%, rgba(90,140,255,.22) 50%, rgba(0,0,0,0) 100%), radial-gradient(ellipse 50% 7% at 30% ${cy + 12}%, rgba(170,200,255,.35) 0%, rgba(80,130,255,.14) 55%, rgba(0,0,0,0) 100%)` }} />
          <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", filter: "blur(18px)", background: `radial-gradient(ellipse 13% 7% at 84% ${cy - 3}%, rgba(255,255,255,.95) 0%, rgba(190,215,255,.5) 40%, rgba(0,0,0,0) 100%), radial-gradient(ellipse 10% 5.5% at 62% ${cy + 13}%, rgba(255,255,255,.8) 0%, rgba(170,200,255,.4) 45%, rgba(0,0,0,0) 100%)` }} />
        </>
      }
      front={
        <>
        {!high && <div style={{ position: "absolute", left: 0, right: 0, top: top - 260 * k, bottom: 0, background: "linear-gradient(to bottom, rgba(4,8,28,0), rgba(4,8,28,.82) 40%)" }} />}
        <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ position: "relative", height: gPx * 0.95 + iPx * 0.5 }}>
            <div style={{ fontFamily: WIDE, fontWeight: 600, fontSize: gPx, lineHeight: 0.95, letterSpacing: "-0.02em", whiteSpace: "nowrap", backgroundImage: "linear-gradient(to bottom, #ffffff 0%, #e8ecf5 45%, #9aa3b8 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 4px 18px rgba(0,0,0,.45))" }}>{big}</div>
            {it && <div style={{ position: "absolute", left: "50%", top: gPx * 0.5, transform: "translateX(-38%)", fontFamily: SCRIPT, fontSize: iPx, lineHeight: 1, color: "#3a52ff", whiteSpace: "nowrap", textShadow: "0 2px 14px rgba(0,0,30,.5)" }}>{it}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 * k, marginTop: 18 * k }}>
            <div style={{ width: W * 0.36, textAlign: "right", ...small(nPx, { fontWeight: 600 }) }}>{fx.homeName}</div>
            <div style={{ width: nPx * 1.9, height: nPx * 1.9, borderRadius: "50%", border: `${Math.max(1.5, k * 1.5)}px solid rgba(255,255,255,.55)`, display: "flex", alignItems: "center", justifyContent: "center", ...caps(nPx * 0.62, { letterSpacing: "0.04em", opacity: 0.8 }) }}>VS</div>
            <div style={{ width: W * 0.36, textAlign: "left", ...small(nPx, { fontWeight: 600 }) }}>{fx.awayName}</div>
          </div>
          <div style={small(vPx, { opacity: 0.7, marginTop: 10 * k })}>{vLine}</div>
        </div>
        </>
      }
    />
  );
}
