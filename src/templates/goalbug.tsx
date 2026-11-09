/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { luminance, shade, vivid } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { placeByFace, scoreOf, sceneOf } from "./outline";
import { AgencyLogo, positionAbbr, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const WHITE = "#ffffff";
const INK = "#0d0f14";
const MARGIN = 60;

/** Inter 700 / 800 capitals: advance widths per 100px (measured in the browser). */
const I7: Record<string, number> = { A: 76, B: 66.2, C: 74, D: 72.2, E: 60.7, F: 58.7, G: 75.1, H: 74.7, I: 28.1, J: 58.4, K: 71.9, L: 56.5, M: 93.2, N: 76.2, O: 77, P: 64.8, Q: 77.7, R: 65.7, S: 65.5, T: 66.8, U: 73.2, V: 76, W: 105.7, X: 73.8, Y: 73.1, Z: 66.4, "-": 46.8, " ": 23.7, "'": 26, ".": 28 };
const I8: Record<string, number> = { A: 78.3, B: 66.5, C: 74.3, D: 72.2, E: 61, F: 58.6, G: 75.2, H: 74.8, I: 28.6, J: 59, K: 73.8, L: 56.5, M: 94.3, N: 76.6, O: 77.3, P: 65.2, Q: 78.2, R: 66.2, S: 66, T: 67.7, U: 72.7, V: 78.3, W: 107.7, X: 76.1, Y: 75.2, Z: 67.9, "-": 47.1, " ": 21.9, "'": 27, ".": 29 };
const plain = (t: string) => [...t.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")];
const capsEm = (t: string, table: Record<string, number>, tracking = 0) => plain(t).reduce((a, c) => a + (table[c] ?? 66) / 100 + tracking, 0);

/** The team as written in the bug: the club name exactly as stored ("SC Vianense SAD"), in caps — never a
 * three-letter code (the user's rule: club names are never shortened). */
function code(name: string): string {
  return name.toUpperCase().trim();
}

/**
 * Goal bug: a premium TV-broadcast moment. The celebrating player big over his own photo softly blurred; a
 * sleek score bug top left (two team codes, the scoring side in club colour, a tiny competition tag), the
 * agency mark where a channel puts its logo, and one thin lower third: the title in a club-colour block,
 * his full name and "No. 7 · RW". Nothing else.
 */
export function Goalbug({ data }: { data: RenderData }) {
  const { params, content } = data;
  // Native Instagram story (1080×1920): the bug under the profile bar, the lower third above the reply bar,
  // everything a size up and the player filling the extra height.
  const CH = data.canvasH ?? CANVAS_H;
  const story = CH > 1400;
  const ts = (params.textScale ?? 1) * (story ? 1.3 : 1);

  let club = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  if (luminance(club) > 0.45) club = vivid(params.accent);
  if (luminance(club) > 0.45) club = shade(club, -0.4);
  if (luminance(club) < 0.03) club = shade(club, 0.25);
  const clubText = luminance(club) > 0.4 ? INK : WHITE;

  const f = matchFacts(data);
  const score = scoreOf(data, "–");

  /* ---- who is home ---- */
  const oursName = data.club?.name ?? "";
  const lc = (s?: string) => (s ?? "").toLowerCase().trim();
  const weHost = content.home ?? (lc(content.homeTeam) === lc(oursName) ? true : lc(content.awayTeam) === lc(oursName) ? false : true);
  const typedOpp = (weHost ? content.awayTeam : content.homeTeam) || f.opp;
  const ourCode = code(oursName || (weHost ? content.homeTeam : content.awayTeam) || "");
  const oppCode = typedOpp ? code(typedOpp) : "";
  const sides = (weHost ? [{ c: ourCode, ours: true }, { c: oppCode, ours: false }] : [{ c: oppCode, ours: false }, { c: ourCode, ours: true }]).filter((s) => s.c);
  // Full club names in the bug: each side shrinks to stay within ~300px.
  const bugSize = (t: string) => Math.max(13, Math.min(21, 300 / Math.max(1, capsEm(t, I7, 0.08))));
  const tag = (f.comp || f.round || "").trim();
  const tagSize = 11;
  const tagMax = story ? 440 : 520;
  const tagFit = Math.min(tagSize, tagMax / Math.max(1, capsEm(tag, I7, 0.2)));

  /* ---- the player, big ---- */
  const faceX = 540 + (params.side === "left" ? -70 : params.side === "right" ? 70 : 0);
  const sizes = story ? { chest: 400, waist: 320, knees: 258, full: 204 } : { chest: 300, waist: 236, knees: 190, full: 150 };
  const headY = story ? STORY_TOP + 250 : 236;
  let box = placeByFace(data, faceX, headY, sizes);
  // Arms flung wide: keep the raised fists inside the frame.
  const wide = Math.min(1, 1120 / box.width);
  if (wide < 1) box = placeByFace(data, faceX, headY, Object.fromEntries(Object.entries(sizes).map(([k, v]) => [k, v * wide])));
  // An arm raised to one side: centre the whole figure rather than the face (a little), so the fist stays in.
  const lean = Math.max(-130, Math.min(130, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const own = data.bgPhotoUrl;
  const back = own ?? sceneOf(data);

  /* ---- the lower third ---- */
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const H = 92 * ts;
  const kSize = 40 * ts;
  const kTrack = 0.06;
  const kW = capsEm(kicker, I8, kTrack) * kSize + 2 * 30 * ts;
  const first = (content.firstName ?? "").trim();
  const last = (content.lastName ?? "").trim();
  const meta = [data.player.number ? `No. ${data.player.number.replace(/\D/g, "") || data.player.number}` : "", positionAbbr(data.player.position)].filter(Boolean).join("  ·  ");
  const metaLine = meta || (oursName ? oursName.toUpperCase() : "");
  const panelPad = 30 * ts;
  const panelMax = CANVAS_W - 2 * MARGIN - kW;
  const nameTrack = 0.02;
  const nameEm = capsEm(first ? `${first} ${last}` : last, I7, nameTrack);
  const nameSize = Math.min(34 * ts, (panelMax - 2 * panelPad) / Math.max(1, nameEm));
  const ltTop = (story ? STORY_BOTTOM - H - 4 : 1048) + (params.textY ?? 0);
  const bugTop = story ? STORY_TOP : 64;

  const caps = (size: number, weight: number, track: number, extra?: CSSProperties): CSSProperties => ({
    fontFamily: SANS,
    fontWeight: weight,
    fontSize: size,
    letterSpacing: `${track}em`,
    lineHeight: 1,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    ...extra,
  });
  const cell = (w: number, bg: string): CSSProperties => ({ width: "auto", minWidth: w, padding: "0 14px", boxSizing: "border-box", height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: bg });

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CH, overflow: "hidden", background: shade(club, -0.7), color: WHITE }}>
      {/* The ground: his own photo, laid under the cutout and softly out of focus (a wider, darker blur at the edges). */}
      {back ? (
        <>
          <img
            src={back}
            alt=""
            style={{ position: "absolute", left: -90, top: -90, width: CANVAS_W + 180, height: CH + 180, maxWidth: "none", objectFit: "cover", filter: "blur(40px) saturate(.85) brightness(.6)" }}
          />
          {own && (
            <img
              src={own}
              alt=""
              style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "blur(20px) saturate(.9) brightness(.74) contrast(1.04)" }}
            />
          )}
        </>
      ) : (
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(80% 60% at 50% 38%, ${shade(club, -0.35)}, ${shade(club, -0.8)})` }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 70% at 50% 40%, transparent 50%, rgba(0,0,0,.38))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: story ? 520 : 260, background: "linear-gradient(to bottom, rgba(0,0,0,.32), transparent)" }} />

      {/* The player, big, natural colour. */}
      {data.photoUrl && (
        <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", filter: "contrast(1.05) saturate(1.04)", ...cutMask(data.cut) }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: story ? 760 : 420, background: "linear-gradient(to bottom, transparent, rgba(0,0,0,.42))" }} />

      {/* Score bug, top left. */}
      <div style={{ position: "absolute", left: MARGIN, top: bugTop, display: "flex", flexDirection: "column", alignItems: "flex-start", transform: `scale(${ts})`, transformOrigin: "left top" }}>
        <div style={{ display: "flex", boxShadow: "0 8px 24px rgba(0,0,0,.28)", borderRadius: 3, overflow: "hidden" }}>
          {sides[0] && (
            <div style={cell(82, sides[0].ours ? club : "rgba(13,15,20,.84)")}>
              <span style={caps(bugSize(sides[0].c), 700, 0.08, { color: sides[0].ours ? clubText : WHITE, paddingLeft: "0.08em", whiteSpace: "nowrap" })}>{sides[0].c}</span>
            </div>
          )}
          {sides.length === 2 && (
            <>
              <div style={cell(score ? 84 : 52, "#f4f4f2")}>
                <span style={caps(score ? 24 : 18, 800, 0.02, { color: INK, fontVariantNumeric: "tabular-nums", textTransform: "none" })}>{score || "v"}</span>
              </div>
              <div style={cell(82, sides[1].ours ? club : "rgba(13,15,20,.84)")}>
                <span style={caps(bugSize(sides[1].c), 700, 0.08, { color: sides[1].ours ? clubText : WHITE, paddingLeft: "0.08em", whiteSpace: "nowrap" })}>{sides[1].c}</span>
              </div>
            </>
          )}
        </div>
        {tag && (
          <div style={{ marginTop: 6, height: 22, padding: "0 10px", display: "flex", alignItems: "center", background: "rgba(13,15,20,.62)", borderRadius: 2 }}>
            <span style={caps(tagFit, 600, 0.2, { color: "rgba(255,255,255,.88)", paddingLeft: "0.2em" })}>{tag}</span>
          </div>
        )}
      </div>

      {/* The lower third: title block in club colour, then name and number on dark glass, a hairline under it. */}
      <div style={{ position: "absolute", left: MARGIN, top: ltTop, display: "flex", height: H, boxShadow: "0 16px 40px rgba(0,0,0,.3)" }}>
        <div style={{ width: kW, height: H, background: club, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={caps(kSize, 800, kTrack, { color: clubText, paddingLeft: `${kTrack}em`, fontStyle: "italic" })}>{kicker}</span>
        </div>
        <div
          style={{
            height: H,
            padding: `0 ${panelPad + 6}px 0 ${panelPad}px`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 11 * ts,
            background: "rgba(12,14,19,.66)",
            backdropFilter: "blur(18px) saturate(1.2)",
            WebkitBackdropFilter: "blur(18px) saturate(1.2)",
          }}
        >
          <div style={caps(nameSize, 700, nameTrack, { color: WHITE })}>
            {first && <span style={{ fontWeight: 400 }}>{first} </span>}
            {last}
          </div>
          {metaLine && <div style={caps(15 * ts, 500, 0.16, { color: "rgba(255,255,255,.72)", textTransform: "none" })}>{metaLine}</div>}
        </div>
      </div>
      <div style={{ position: "absolute", left: MARGIN, top: ltTop + H, width: kW, height: 4, background: shade(club, -0.35) }} />

      {/* The agency mark where a channel puts its logo. */}
      <AgencyLogo
        data={data}
        height={story ? 28 : 20}
        style={{ position: "absolute", right: MARGIN, top: (story ? STORY_TOP : 60) - (params.logoY ?? 0), transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right top", opacity: 0.95 }}
      />
      <Film strength={0.16} />
    </div>
  );
}
