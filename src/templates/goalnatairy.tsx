/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NatFigure, NatGround, NatSpot, OFF_WHITE, capsEm, natPlace } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const SERIF = "var(--font-fraunces), Georgia, serif";
const SHADOW = "0 1px 3px rgba(0,0,0,.45), 0 2px 16px rgba(0,0,0,.4)";

/**
 * Natural goal · espaçado: his real celebration photo; across the top "G O A L" in a light, very widely
 * tracked sans that spans the width, his full name small under it and his club's exact name tinier still.
 * Nothing on him. The NEYOD logo centred at the foot.
 */
export function Goalnatairy({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = 70;
  const word = (data.content.kicker || "Goal").toUpperCase();
  const name = [data.content.firstName, data.content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const track = 0.62;
  // The tracking also trails the last letter: the word is centred on its letters only.
  const wPx = Math.min(130 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(word, track) * 1.05));
  const nPx = Math.min(24 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(name, 0.2)));
  const cPx = Math.min(14 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(club, 0.24)));

  const top = (story ? STORY_TOP + 10 : 56) - (params.textY ?? 0);
  const nameTop = top + wPx * 0.9 + 30 * k;
  const clubTop = nameTop + nPx + 16 * k;
  // His face below the type block.
  const place = natPlace(data, CANVAS_W, H, { fx: params.side === "left" ? 470 : 610, fy: Math.max(story ? 760 : 540, clubTop + cPx + (story ? 260 : 190)), fs: story ? 220 : 150 });
  const bottom = (story ? STORY_BOTTOM : H - 48) - (params.textY ?? 0);
  const logoTop = bottom - (story ? 88 : 52) - (params.logoY ?? 0);
  const line = { position: "absolute" as const, left: 0, right: 0, textAlign: "center" as const, whiteSpace: "nowrap" as const, lineHeight: 1, textShadow: SHADOW };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#24301f", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatSpot place={place} W={CANVAS_W} H={H} amount={0.18} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: clubTop + 220, background: "linear-gradient(to bottom, rgba(0,0,0,.42), rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: logoTop - 160, bottom: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.35))" }} />

      <div style={{ ...line, top, paddingLeft: `${track}em`, fontFamily: SANS, fontWeight: 200, fontSize: wPx, letterSpacing: `${track}em` }}>{word}</div>
      {name && <div style={{ ...line, top: nameTop, paddingLeft: "0.2em", fontFamily: SERIF, fontWeight: 600, fontSize: nPx, letterSpacing: "0.2em" }}>{name}</div>}
      {club && <div style={{ ...line, top: clubTop, paddingLeft: "0.24em", fontFamily: SANS, fontWeight: 600, fontSize: cPx, letterSpacing: "0.24em", opacity: 0.85 }}>{club}</div>}
      <AgencyLogo data={data} height={24} style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: "center top" }} />
    </div>
  );
}
