/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { placeByFace, scoreOf } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const plain = (t: string) => t.normalize("NFD").replace(/\p{M}/gu, "");
/** Inter, mixed case, roughly: em width of a line (weights 400–600). */
const textEm = (t: string) =>
  [...plain(t)].reduce((a, c) => a + (c === " " ? 0.26 : /[A-Z]/.test(c) ? (c === "M" || c === "W" ? 0.86 : c === "I" ? 0.3 : 0.68) : /[il.,:'’|·]/.test(c) ? 0.27 : c === "—" || c === "–" ? 0.75 : /[mw]/.test(c) ? 0.84 : /\d/.test(c) ? 0.6 : 0.56), 0);
const named = (n: string) => (n === n.toUpperCase() ? titleCase(n) : n);

/**
 * Underline: the title in a clean medium-weight sans ("Matchday"), and under it one thick club-colour bar
 * that starts at the title's first letter and runs on behind the player, off the far edge of the canvas.
 * Under the bar, small: the fixture (home first, names as stored), the date and kick-off, the ground.
 * The player stands on the other side over a calm flat ground (light, or the club's deep tone).
 * params.side puts the player left or right; the type takes the other side.
 */
export function Underline({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const ts = (params.textScale ?? 1) * (story ? 1.32 : 1);
  const r = rng(params.seed ?? 11);
  const dark = r() < 0.4;
  const right = params.side !== "left"; // the player's side
  const M = story ? 72 : 64;

  /* ---- colours ---- */
  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.62) club = vivid(params.accent);
  if (luminance(club) > 0.62) club = shade(club, -0.35);
  if (dark && luminance(club) < 0.05) club = shade(club, 0.35);
  const ground = dark ? shade(club, -0.8) : "#eeece7";
  const ink = dark ? "#ffffff" : "#14161b";
  const soft = dark ? "rgba(255,255,255,.66)" : "rgba(20,22,27,.62)";

  /* ---- the words ---- */
  const kicker = (content.kicker || "MATCHDAY").replace(/’/g, "'");
  const title = kicker === kicker.toUpperCase() && !/^[A-Z]{2,4}$/.test(kicker) ? kicker.charAt(0) + kicker.slice(1).toLowerCase() : kicker;
  const colW = story ? 560 : 480;
  const titleSize = Math.min((story ? 150 : 118) * (params.textScale ?? 1), colW / Math.max(1, textEm(title) * 1.02));
  const barH = Math.round(Math.max(12, titleSize * 0.15));

  const f = matchFacts(data);
  const score = postType === "result" || postType === "goal" ? scoreOf(data, "–") : "";
  const lc = (s?: string) => (s ?? "").trim().toLowerCase();
  let home = content.homeTeam?.trim() ?? "";
  let away = content.awayTeam?.trim() ?? "";
  if (!home || !away) {
    const typed = [content.homeTeam, content.awayTeam].find((t) => t && lc(t) === lc(f.opp));
    const opp = typed ?? f.opp;
    const ours = data.club?.name ?? "";
    [home, away] = content.home === false ? [opp, ours] : [ours, opp];
  }
  const fixture = home && away ? `${named(home)} ${score || "v"} ${named(away)}` : named(home || away);
  const when = [niceDate(content.date), postType === "matchday" ? f.time : ""].filter(Boolean).join("  ·  ");
  const venue = titleCase(content.venue ?? "");
  const fixSize = Math.min(26 * ts, colW / Math.max(1, textEm(fixture) * 1.04));
  const lineSize = Math.min(21 * ts, colW / Math.max(1, textEm(when) * 1.02), venue ? colW / Math.max(1, textEm(venue) * 1.02) : 99);
  const lines = [
    { t: fixture, size: fixSize, weight: 600, color: ink },
    { t: when, size: lineSize, weight: 400, color: ink },
    { t: venue, size: lineSize, weight: 400, color: soft },
  ].filter((l) => l.t);
  const infoH = lines.reduce((a, l) => a + l.size * 1.42, 0);

  /* ---- vertical stack, from the mark up ---- */
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const logoH = story ? 88 : 52;
  const infoBottom = H - logoBottom - logoH - (story ? 66 : 72) + (params.textY ?? 0);
  const infoTop = infoBottom - infoH;
  const barTop = infoTop - (story ? 44 : 36) - barH;
  const titleTop = barTop - (story ? 26 : 20) - titleSize * 0.98;
  const crests = (content.home === false ? [f.oppCrest, f.ourCrest] : [f.ourCrest, f.oppCrest]).filter(Boolean) as string[];
  const crestS = story ? 58 : 42;
  const crestTop = titleTop - (story ? 44 : 34) - crestS;
  const x = right ? M : CANVAS_W - M;
  const align = right ? "left" : "right";
  const anchor = right ? { left: M } : { right: M };

  /* ---- the player ---- */
  const faceX = right ? (story ? 840 : 790) : story ? 240 : 290;
  const box = placeByFace(data, faceX, story ? STORY_TOP + 150 : 120, story ? { chest: 210, waist: 166, knees: 132, full: 104 } : { chest: 196, waist: 150, knees: 116, full: 92 });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground, color: ink }}>
      <div style={{ position: "absolute", inset: 0, background: dark ? `radial-gradient(70% 60% at ${right ? 68 : 32}% 40%, ${shade(club, -0.62)}, transparent 75%)` : `radial-gradient(70% 60% at ${right ? 68 : 32}% 38%, #f8f7f4, transparent 75%)` }} />

      {/* The underline: from the title's first letter, behind him, off the far edge. */}
      <div data-bleed style={{ position: "absolute", top: barTop, height: barH, background: club, ...(right ? { left: x, right: -20 } : { left: -20, right: CANVAS_W - x }) }} />

      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt=""
          style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }}
        />
      )}

      {crests.length > 0 && (
        <div style={{ position: "absolute", top: crestTop, ...anchor, display: "flex", gap: story ? 18 : 14, flexDirection: right ? "row" : "row-reverse" }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: crestS, height: crestS, objectFit: "contain" }} />
          ))}
        </div>
      )}

      <div style={{ position: "absolute", top: titleTop, ...anchor, fontFamily: SANS, fontWeight: 500, fontSize: titleSize, lineHeight: 1, letterSpacing: "-0.03em", whiteSpace: "nowrap", textAlign: align }}>{title}</div>

      <div style={{ position: "absolute", top: infoTop, ...anchor, width: colW, textAlign: align, fontFamily: SANS }}>
        {lines.map((l, i) => (
          <div key={i} style={{ fontSize: l.size, fontWeight: l.weight, color: l.color, lineHeight: 1.42, whiteSpace: "nowrap" }}>
            {l.t}
          </div>
        ))}
      </div>

      <AgencyLogo
        data={data}
        onLight={!dark}
        height={story ? 22 : 20}
        style={{ position: "absolute", bottom: logoBottom, ...anchor, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: right ? "left bottom" : "right bottom" }}
      />
      <Film strength={0.18} />
    </div>
  );
}
