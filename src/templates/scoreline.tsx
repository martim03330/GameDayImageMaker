/* eslint-disable @next/next/no-img-element */
import { shade, vivid } from "@/lib/color";
import { cutMask, DMSERIF, Film } from "./fx";
import { rng } from "./kit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/**
 * Editorial score poster: the result set in one enormous cream serif that bleeds off the canvas, the
 * photo left to breathe underneath, and the two team names whispered in small lowercase serif
 * (OGC Nice "1-0", Ensemble & Maintenant).
 */
export function Scoreline({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 31);
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const cream = "#efe8dd";
  const scene = (data.club?.stadiumImages ?? [])[0] ?? data.bgPhotoUrl;
  // Without a generated scene it falls back to the photo itself: blurred, as club photos carry their own text.
  const own = !(data.club?.stadiumImages ?? []).length;

  // The result, or the minute of the goal, or the title's first word: always one short, huge line.
  const score = content.homeGoals != null && content.awayGoals != null && String(content.homeGoals) !== "" ? `${content.homeGoals}-${content.awayGoals}` : "";
  const word = postType === "result" || postType === "goal" ? score || content.kicker.split(" ")[0] : content.kicker.split(" ")[0];
  const left = r() < 0.5;
  const size = Math.min(1050, 1500 / Math.max(2, [...word].length * 0.62)) * (params.textScale ?? 1);

  const aspect = data.photoAspect ?? 0.6;
  const height = 1210 * (params.playerScale ?? 1);
  const width = height * aspect;
  const teams = [content.homeTeam || data.club?.name, content.awayTeam].filter(Boolean) as string[];

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: shade(accent, -0.78), color: cream }}>
      {scene && <img src={scene} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: `saturate(.85) contrast(1.05) brightness(.8)${own ? " blur(26px)" : ""}` }} />}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${shade(accent, -0.75)}cc, transparent 40%, ${shade(accent, -0.8)}dd)` }} />

      {/* The player, life-size, standing in the scene. */}
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{
            position: "absolute",
            left: 540 - width / 2 + (left ? 190 : -190) + (params.playerX ?? 0),
            bottom: -(params.playerY ?? 0),
            width,
            height,
            maxWidth: "none",
            filter: "contrast(1.05) drop-shadow(0 30px 50px rgba(0,0,0,.45))",
            ...cutMask(data.cut),
          }}
        />
      )}

      {/* The number, bleeding off the top and bottom. */}
      <div
        data-bleed
        style={{
          position: "absolute",
          // Bleeding off the side of the canvas, like a magazine cover number.
          [left ? "left" : "right"]: -size * 0.22,
          top: 660 - size * 0.62,
          fontFamily: DMSERIF,
          fontSize: size,
          lineHeight: 0.8,
          color: cream,
          whiteSpace: "nowrap",
          mixBlendMode: "screen",
          opacity: 0.94,
        }}
      >
        {word}
      </div>

      {/* Whispered labels, lowercase, beside the number. */}
      <div
        style={{
          position: "absolute",
          // On the opposite side of the number, so nothing sits on top of it.
          [left ? "right" : "left"]: 70,
          width: 360,
          top: 170,
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: 28,
          lineHeight: 1.35,
          color: cream,
          textAlign: left ? "right" : "left",
          textShadow: "0 4px 18px rgba(0,0,0,.5)",
        }}
      >
        {teams.length ? teams.map((t, i) => <div key={i}>{t.toLowerCase()}</div>) : <div>{`${content.firstName} ${content.lastName}`.toLowerCase()}</div>}
        <div style={{ fontSize: 20, opacity: 0.75, marginTop: 10 }}>{content.subline.toLowerCase()}</div>
      </div>

      {/* Player's name, small, bottom corner opposite the number. */}
      <div style={{ position: "absolute", [left ? "right" : "left"]: 70, bottom: 110, textAlign: left ? "right" : "left", fontFamily: DMSERIF, fontSize: 40, lineHeight: 1.1 }}>
        {content.lastName}
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 15, letterSpacing: "0.3em", opacity: 0.8, marginTop: 8, textTransform: "uppercase" }}>
          {[data.player.position, content.kicker].filter(Boolean).join(" · ")}
        </div>
      </div>
      <AgencyLogo data={data} height={30} style={{ position: "absolute", left: "50%", bottom: 46, transform: "translateX(-50%)" }} />
      <Film strength={0.8} />
    </div>
  );
}
