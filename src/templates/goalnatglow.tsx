/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, NatLight, NatSpot, OFF_WHITE, capsEm, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, type RenderData } from "./types";

const SERIF = "var(--font-fraunces), Georgia, serif";
const SHADOW = "0 1px 3px rgba(0,0,0,.45), 0 2px 16px rgba(0,0,0,.4)";

/**
 * Natural goal · holofote: his real celebration photo with the ground around him dimmed and a little light
 * on him (same pixels, no cutout edge), as if a floodlight picked him out. At the foot "Goal" in an italic
 * serif, his full name and his club's exact name; the NEYOD logo centred under them.
 */
export function Goalnatglow({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = 70;
  const place = natPlace(data, CANVAS_W, H, { fx: params.side === "left" ? 460 : 620, fy: story ? 640 : 440, fs: story ? 230 : 160 });
  const word = data.content.kicker ? data.content.kicker.charAt(0).toUpperCase() + data.content.kicker.slice(1).toLowerCase() : "Goal";
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const wPx = Math.min(92 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, word.length * 0.48));
  const nPx = Math.min(22 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(name, 0.16)));
  const cPx = Math.min(14 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(club, 0.22)));

  const bottom = (story ? STORY_BOTTOM : H - 48) - (params.textY ?? 0);
  const logoTop = bottom - (story ? 88 : 52) - (params.logoY ?? 0);
  const clubTop = logoTop - 40 * k - cPx;
  const nameTop = clubTop - 14 * k - nPx;
  const wordTop = nameTop - 18 * k - wPx;
  const line = { position: "absolute" as const, left: 0, right: 0, textAlign: "center" as const, whiteSpace: "nowrap" as const, lineHeight: 1, textShadow: SHADOW };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#1b2117", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatSpot place={place} W={CANVAS_W} H={H} amount={0.5} />
      <NatLight place={place} W={CANVAS_W} H={H} amount={0.12} />
      {/* No framed photo (no original): the plain cutout over the blurred ground instead. */}
      {!place.frame.fig && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: wordTop - 120, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.4))" }} />

      <div style={{ ...line, top: wordTop, fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: wPx }}>{word}</div>
      {name && <div style={{ ...line, top: nameTop, paddingLeft: "0.16em", fontFamily: SANS, fontWeight: 800, fontSize: nPx, letterSpacing: "0.16em" }}>{name}</div>}
      {club && <div style={{ ...line, top: clubTop, paddingLeft: "0.22em", fontFamily: SANS, fontWeight: 600, fontSize: cPx, letterSpacing: "0.22em", opacity: 0.85 }}>{club}</div>}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}
