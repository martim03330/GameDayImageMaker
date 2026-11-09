/* eslint-disable @next/next/no-img-element */
import { ourClub } from "./goalnatcaption";
import { capsEm } from "./natkit";
import { FLANK_SHADOW, NatFlankFrame } from "./natflank";
import { SANS } from "./shared";
import { CANVAS_W, type RenderData } from "./types";

/**
 * Natural goal · flank: his real celebration photo full-bleed and "GO" | "AL" split around his head, big
 * caps at his eye line, behind him. At the foot, small: his full name, then his club's exact name. No score.
 * The NEYOD logo alone at the top.
 */
export function Goalnatflank({ data }: { data: RenderData }) {
  const { content, params } = data;
  const ts = params.textScale ?? 1;
  const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
  const club = ourClub(data).toUpperCase();
  return (
    <NatFlankFrame
      data={data}
      word={content.kicker || "GOAL"}
      foot={({ k, bottom }) => {
        const clubSize = Math.min(19 * k * ts, (CANVAS_W - 120) / Math.max(1, capsEm(club, 0.22)));
        const nameSize = Math.min(30 * k * ts, (CANVAS_W - 120) / Math.max(1, capsEm(name, 0.1)));
        const clubTop = bottom - clubSize;
        const nameTop = clubTop - 14 * k - nameSize;
        const line = (text: string, top: number, px: number, tracking: number, opacity = 1) =>
          text ? (
            <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: px, lineHeight: 1, letterSpacing: `${tracking}em`, paddingLeft: `${tracking}em`, whiteSpace: "nowrap", opacity, textShadow: FLANK_SHADOW }}>
              {text}
            </div>
          ) : null;
        return {
          height: bottom - nameTop,
          node: (
            <>
              {line(name, nameTop, nameSize, 0.1)}
              {line(club, clubTop, clubSize, 0.22, 0.92)}
            </>
          ),
        };
      }}
    />
  );
}
