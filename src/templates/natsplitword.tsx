import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, OFF_WHITE, capsEm, natFixture, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * The shared frame of the "split word" natural looks: his real photo full-bleed and the word cut in two
 * halves set either side of him at chest height — "MATCH" to his left, "DAY" to his right — in big bold
 * caps, in front of the photo, so he stands between them. One small line at the foot; the NEYOD logo at the top.
 */
function NatSplitwordFrame({ data, a, b, line }: { data: RenderData; a: string; b: string; line: string }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const place = natPlace(data, CANVAS_W, H, { fx: 540, fy: story ? 700 : 500, fs: story ? 240 : 150 });
  const M = 48;
  const body = place.fs * 1.5; // half his shoulder width, roughly
  const roomL = place.fx - body - M;
  const roomR = CANVAS_W - place.fx - body - M;
  // Room on both sides: one half each side of him. Not enough on one side (he stands off-centre): both
  // halves stacked on the wider side, so neither lands on his shirt nor runs off the canvas.
  const split = Math.min(roomL, roomR) >= 230 * k;
  const wide = roomL >= roomR ? "left" : "right";
  const fitSize = (room: number, t: string) => room / Math.max(1, t.length * 0.62);
  const size = split
    ? Math.min(150 * k * ts, fitSize(roomL, a), fitSize(roomR, b))
    : Math.min(150 * k * ts, fitSize(Math.max(roomL, roomR), a.length > b.length ? a : b));
  const y = place.fy + place.fs * 1.4;
  const aRight = CANVAS_W - (place.fx - body * 0.6);
  const bLeft = place.fx + body * 0.6;
  const bottom = (story ? STORY_BOTTOM : H - 60) - (params.textY ?? 0);
  const lPx = Math.min(16 * k * ts, (CANVAS_W - 140) / Math.max(1, capsEm(line, 0.22)));
  const logoTop = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const half = { position: "absolute", top: y, fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: "-0.03em", lineHeight: 1, whiteSpace: "nowrap", textShadow: "0 4px 24px rgba(0,0,0,.35)" } as const;
  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      {/* In front of him: behind, a raised arm hid half the word ("GO" vanished behind his fist). */}
      {split ? (
        <>
          <div style={{ ...half, right: aRight }}>{a}</div>
          <div style={{ ...half, left: bLeft }}>{b}</div>
        </>
      ) : (
        <div style={{ ...half, [wide]: M, textAlign: wide, top: y - size * 0.5 }}>
          <div>{a}</div>
          <div>{b}</div>
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: logoTop + (story ? 230 : 160), background: "linear-gradient(to bottom, rgba(0,0,0,.3), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: H - bottom + lPx + 180 * k, background: "linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, width: CANVAS_W, top: bottom - lPx, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: lPx, letterSpacing: "0.22em", paddingLeft: "0.22em", lineHeight: 1, whiteSpace: "nowrap" }}>{line}</div>
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}

/** Splits a word for the two sides: MATCHDAY → MATCH | DAY, else in the middle. */
function halves(word: string): [string, string] {
  const w = word.toUpperCase();
  if (w === "MATCHDAY") return ["MATCH", "DAY"];
  const i = w.indexOf(" ");
  if (i > 0) return [w.slice(0, i), w.slice(i + 1)];
  const m = Math.ceil(w.length / 2);
  return [w.slice(0, m), w.slice(m)];
}

/** Natural · palavra partida (matchday): MATCH | DAY either side of him; HOME v AWAY · date · time at the foot. */
export function Natsplitword({ data }: { data: RenderData }) {
  const fx = natFixture(data);
  const [a, b] = halves(data.content.kicker || "MATCHDAY");
  return <NatSplitwordFrame data={data} a={a} b={b} line={[`${fx.homeName} v ${fx.awayName}`, fx.date, fx.kickoff].filter(Boolean).join("  ·  ").toUpperCase()} />;
}

/** Natural goal · palavra partida: GO | AL either side of his celebration; his name · his club's exact name. No score. */
export function Goalnatsplitword({ data }: { data: RenderData }) {
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ");
  const [a, b] = halves(data.content.kicker || "GOAL");
  return <NatSplitwordFrame data={data} a={a} b={b} line={[name, ourClub(data)].filter(Boolean).join("  ·  ").toUpperCase()} />;
}
