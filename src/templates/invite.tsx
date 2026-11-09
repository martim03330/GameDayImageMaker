/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { shade } from "@/lib/color";
import { BODONI } from "./cover";
import { cutMask, Film } from "./fx";
import { bodyW, clubTone, sentenceCase, teamsOf } from "./notify";
import { placeByFace } from "./outline";
import { AgencyLogo, SANS } from "./shared";
import { matchFacts } from "./strokes";
import { mix, niceDate, titleCase } from "./wall";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

const CARD = "#f6f1e6";
const INK = "#26221d";
const GREY = "#8a8277";
const GOLD = "#b6a07a";

/** Bodoni Moda 500: advance widths per 100px (measured in the browser). */
const BOD_W: Record<string, number> = { a: 53.9, b: 61.7, c: 51.4, d: 61.7, e: 52.6, f: 35.4, g: 60.3, h: 60.4, i: 31, j: 31.3, k: 61.6, l: 35.7, m: 86.9, n: 60.4, o: 56.3, p: 61.7, q: 61.7, r: 45.7, s: 44.3, t: 34.5, u: 59.3, v: 55, w: 78, x: 57.9, y: 56.2, z: 47.2, A: 78.4, B: 67.1, C: 71.8, D: 73.8, E: 62.6, F: 60.4, G: 74.7, H: 77.4, I: 39.9, J: 47.7, K: 72.6, L: 61.1, M: 88.4, N: 77.6, O: 75.7, P: 65.2, Q: 75.7, R: 73.1, S: 57.5, T: 68.1, U: 73, V: 78.2, W: 103.7, X: 77.8, Y: 74.6, Z: 59.5, " ": 25, ".": 21.6, ",": 23.2, "-": 35.9, "'": 21.6, "/": 40, ":": 22 };
const bodEm = (t: string) => [...t.normalize("NFD").replace(/\p{M}/gu, "")].reduce((a, c) => a + (BOD_W[c] ?? (/\d/.test(c) ? 56 : 60)) / 100, 0);
/** Spaced caps in Inter 500: width at `size` with `track` em of letter-spacing. */
const capsW = (t: string, size: number, track: number) => bodyW(t, size) * 1.08 + t.length * track * size;

/**
 * Invite: a formal invitation to the match. On a calm, deep club-tone ground, a cream card with a thin
 * inset gold line; centred on it, small spaced "YOU ARE INVITED", the fixture in Bodoni (each club on its
 * own line, a quiet "v" between, names as stored, home first), a short rule, "17 October, 15:00" and the
 * ground in small caps, and "MATCHDAY" at the foot of the card. The player stands beside it in natural
 * colour, his shoulder just in front of the card's edge, never over the type.
 */
export function Invite({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = (story ? 1.38 : 1) * (params.textScale ?? 1);
  const ty = params.textY ?? 0;
  const club = clubTone(data);
  const f = matchFacts(data);

  /* ---- the logo, at the foot under the card ---- */
  const logoScale = params.logoScale ?? 1;
  const logoH = (story ? 88 : 52) * logoScale;
  const logoBottom = (story ? H - STORY_BOTTOM : 56) - (params.logoY ?? 0);
  const logoTop = H - logoBottom - logoH;

  /* ---- the card ---- */
  const cardX = story ? 64 : 64;
  const cardW = story ? 650 : 580;
  const cardTop = (story ? STORY_TOP + 10 : 92) + ty;
  const cardBottom = logoTop - (story ? 90 : 64) + ty;
  const cardH = cardBottom - cardTop;
  const inset = 22 * k;
  const pad = (story ? 56 : 70) * k;
  const innerW = cardW - 2 * pad;
  const cx = cardX + cardW / 2;

  const label = "YOU ARE INVITED";
  const lSize = Math.min(16 * k, innerW / Math.max(1, capsW(label, 1, 0.42)));
  const teams = teamsOf(data);
  const fixtureLines = teams.length === 2 ? teams : [teams[0] || titleCase(f.comp) || "Matchday"];
  const fSize = Math.max(28, Math.min(62 * k, ...fixtureLines.map((t) => innerW / Math.max(1, bodEm(t)))));
  const vSize = fSize * 0.6;
  const when = [niceDate(content.date), f.time].filter(Boolean).join(", ");
  const wSize = Math.min(32 * k, innerW / Math.max(1, bodEm(when)));
  const venue = ((content.venue ?? "").trim() || titleCase(f.venue)).toUpperCase();
  const gSize = Math.max(10, Math.min(14 * k, innerW / Math.max(1, capsW(venue, 1, 0.2))));
  const foot = (content.kicker || "Matchday").toUpperCase();
  const footSize = 14 * k;

  // The centre block: fixture, rule, date, ground — set around the card's optical middle.
  const fLead = fSize * 1.12;
  const vGap = teams.length === 2 ? vSize * 1.5 : 0;
  const fixtureH = fixtureLines.length * fLead + vGap;
  const blockH = fixtureH + 46 * k + 2 + 40 * k + wSize * 1.1 + (venue ? 20 * k + gSize : 0);
  const labelTop = cardTop + inset + 78 * k;
  const footTop = cardBottom - inset - 70 * k - footSize;
  const mid = (labelTop + lSize + footTop) / 2;
  const blockTop = mid - blockH / 2 - 6 * k;
  const ruleY = blockTop + fixtureH + 46 * k;
  const whenTop = ruleY + 2 + 40 * k;
  const venueTop = whenTop + wSize * 1.1 + 20 * k;

  /* ---- the player, beside the card, his shoulder just over its edge ---- */
  const sizes = story ? { chest: 250, waist: 196, knees: 154, full: 122 } : { chest: 200, waist: 156, knees: 122, full: 96 };
  const probe = placeByFace(data, 800, 300, sizes);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceHalfW = (probe.faceH / face[3]) * (data.photoAspect ?? 0.6) * face[2] * 0.5;
  // His face clear of the card by ~44px (the card covers his near shoulder), his head ≥40px inside the frame.
  const faceX = Math.min(CANVAS_W - 40 - faceHalfW - probe.faceH * 0.3, Math.max(story ? 840 : 830, cardX + cardW + 44 + faceHalfW));
  const box = placeByFace(data, faceX, (story ? STORY_TOP + 200 : 170) + probe.faceH * 0.2, sizes);
  const chin = box.top + face[1] * box.height + box.faceH;
  const footFade = `linear-gradient(to bottom, #000 0, #000 ${H - (story ? 320 : 220) - box.top}px, transparent ${H - box.top}px)`;

  const ground = mix(shade(club, -0.6), "#1b1c1f", 0.38); // calm: the club tone, deep and a little greyed
  const caps = { fontFamily: SANS, whiteSpace: "nowrap" as const, lineHeight: 1, textAlign: "center" as const };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: ground }}>
      {/* Calm ground: deep club tone, a soft light where he stands. */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(55% 45% at ${(faceX / CANVAS_W) * 100}% ${(chin / H) * 100}%, ${mix(shade(club, -0.3), "#3a3b3f", 0.35)}, transparent 80%)`, opacity: 0.85 }} />

      {/* The player, standing just behind the card's edge (his face always clear of it). */}
      <div style={{ position: "absolute", left: faceX - box.faceH * 1.8, top: chin + box.faceH * 0.5, width: box.faceH * 3.6, height: box.faceH * 5, borderRadius: "50%", background: "rgba(0,0,0,.3)", filter: `blur(${story ? 70 : 50}px)` }} />
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, WebkitMaskImage: footFade, maskImage: footFade }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", display: "block", maxWidth: "none", filter: "contrast(1.03)", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* The card, lifted off the ground by a long soft shade. */}
      <div style={{ position: "absolute", left: cardX, top: cardTop, width: cardW, height: cardH, background: CARD, borderRadius: 4, boxShadow: `0 ${30 * k}px ${80 * k}px rgba(0,0,0,.38), 0 ${3 * k}px ${10 * k}px rgba(0,0,0,.18)` }}>
        <div style={{ position: "absolute", inset, border: `${story ? 1.6 : 1.2}px solid ${GOLD}` }} />
        <div style={{ position: "absolute", inset: inset + 7 * k, border: `${story ? 0.8 : 0.6}px solid ${GOLD}`, opacity: 0.6 }} />
      </div>

      {/* The invitation. */}
      <div style={{ position: "absolute", left: cardX, width: cardW, top: labelTop, ...caps, fontWeight: 500, fontSize: lSize, letterSpacing: "0.42em", paddingLeft: "0.42em", color: INK }}>{label}</div>
      <div style={{ position: "absolute", left: cx - 18 * k, top: labelTop + lSize + 30 * k, width: 36 * k, height: 1, background: GOLD }} />
      {fixtureLines.map((t, i) => (
        <div key={i} style={{ position: "absolute", left: cardX, width: cardW, top: blockTop + i * (fLead + vGap), height: fLead, textAlign: "center", fontFamily: BODONI, fontWeight: 500, fontSize: fSize, lineHeight: `${fLead}px`, whiteSpace: "nowrap", color: INK, letterSpacing: "-0.005em" }}>{t}</div>
      ))}
      {teams.length === 2 && (
        <div style={{ position: "absolute", left: cardX, width: cardW, top: blockTop + fLead + (vGap - vSize) / 2 - vSize * 0.12, textAlign: "center", fontFamily: BODONI, fontStyle: "italic", fontWeight: 500, fontSize: vSize, lineHeight: 1, color: GREY }}>v</div>
      )}
      <div style={{ position: "absolute", left: cx - 40 * k, top: ruleY, width: 80 * k, height: story ? 1.5 : 1.2, background: INK, opacity: 0.7 }} />
      {when && <div style={{ position: "absolute", left: cardX, width: cardW, top: whenTop, textAlign: "center", fontFamily: BODONI, fontWeight: 500, fontSize: wSize, lineHeight: 1.1, whiteSpace: "nowrap", color: INK }}>{when}</div>}
      {venue && <div style={{ position: "absolute", left: cardX, width: cardW, top: venueTop, ...caps, fontWeight: 500, fontSize: gSize, letterSpacing: "0.2em", paddingLeft: "0.2em", color: GREY }}>{venue}</div>}
      <div style={{ position: "absolute", left: cardX, width: cardW, top: footTop, ...caps, fontWeight: 500, fontSize: footSize, letterSpacing: "0.46em", paddingLeft: "0.46em", color: INK }}>{sentenceCase(foot).toUpperCase()}</div>

      <AgencyLogo data={data} height={22} style={{ position: "absolute", left: cx, bottom: logoBottom, transform: `translateX(-50%) scale(${logoScale})`, transformOrigin: "center bottom" }} />
      <Film strength={0.1} />
    </div>
  );
}
