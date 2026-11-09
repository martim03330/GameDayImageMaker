/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { NAT_SHADOW } from "./natbug";
import { ArcWord, arcGeom, arcPlace } from "./natarc";
import { NatFigure, NatGround, OFF_WHITE, capsEm } from "./natkit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Natural goal · arc: his real celebration photo full-bleed and almost untouched; "GOAL" in medium caps on a
 * gentle arc centred over his head, a halo of type clear of his hair. At the foot, on a soft local shade, his
 * full name and under it his club's exact name, small. No score. The NEYOD logo alone at the top (under the
 * name if the halo needs the top).
 */
export function Goalnatarc({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.36 : 1;
  const M = story ? 64 : 56;

  const lh = story ? 88 : 52;
  const logoTop0 = story ? STORY_TOP : 46;
  const word = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'").trim();
  const want = { fx: params.side === "left" ? 440 : params.side === "right" ? 640 : 540, fy: story ? 680 : 530, fs: story ? 236 : 162 };
  const base = (story ? 116 : 86) * ts;
  const fit = arcPlace(data, H, want, word, base, M, logoTop0 + lh + 60, story ? STORY_TOP : 60);
  const { place, halo } = fit;
  const dy = params.textY ?? 0;
  const logoUp = halo ? fit.arc.capTop + dy - (logoTop0 + lh) >= 56 : place.fy - place.fs * 0.8 - (logoTop0 + lh) >= 40;
  const bottomY = story ? STORY_BOTTOM : CANVAS_H - 54;

  /* ---- the foot, bottom-up: name, club ---- */
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  const footBottom = (logoUp ? bottomY : bottomY - lh - Math.round(56 * k)) - dy;
  const clubSize = Math.min(17 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(club, 0.26)));
  const nameSize = Math.min(34 * k * ts, (CANVAS_W - 2 * M) / Math.max(1, capsEm(name, 0.12)));
  const clubTop = footBottom - clubSize;
  const nameTop = clubTop - (club ? 18 * k : 0) - nameSize;
  // No headroom for the halo: the arc closes over his name instead, centred.
  const arc = halo ? fit.arc : arcGeom(place, word, base, M, { cx: CANVAS_W / 2, bottom: nameTop - Math.round(36 * k) });
  const shadeTop = (halo ? nameTop : arc.capTop) - (story ? 300 : 230);
  const logoTop = (logoUp ? logoTop0 : bottomY - lh) - (params.logoY ?? 0);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#2b3a2a", color: OFF_WHITE }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      {place.frame.plain && <NatFigure data={data} place={place} W={CANVAS_W} H={H} />}

      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: halo ? Math.max(arc.base0 + dy + 60, logoTop + 200) : logoTop + 200, background: "linear-gradient(to bottom, rgba(0,0,0,.26), rgba(0,0,0,.1) 60%, rgba(0,0,0,0))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: shadeTop, bottom: 0, background: "linear-gradient(to bottom, rgba(6,10,6,0), rgba(6,10,6,.36) 45%, rgba(6,10,6,.6))" }} />

      <div style={{ position: "absolute", left: 0, top: dy, width: CANVAS_W, height: H }}>
        <ArcWord id="gna" word={word} cx={arc.cx} cy={arc.cy} R={arc.R} size={arc.size} H={H} />
      </div>

      {name && (
        <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: nameSize, lineHeight: 1, letterSpacing: "0.12em", paddingLeft: "0.12em", whiteSpace: "nowrap", color: "#fff", textShadow: NAT_SHADOW }}>
          {name}
        </div>
      )}
      {club && (
        <div style={{ position: "absolute", left: 0, right: 0, top: clubTop, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: clubSize, lineHeight: 1, letterSpacing: "0.26em", paddingLeft: "0.26em", whiteSpace: "nowrap", opacity: 0.9, textShadow: NAT_SHADOW }}>
          {club}
        </div>
      )}

      <AgencyLogo
        data={data}
        height={24}
        style={{ position: "absolute", left: "50%", top: logoTop, transform: `translateX(-50%) scale(${params.logoScale ?? 1})`, transformOrigin: logoUp ? "center top" : "center bottom" }}
      />
    </div>
  );
}
