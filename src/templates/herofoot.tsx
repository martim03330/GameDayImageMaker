/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { cutMask } from "./fx";
import { FACES, wordEm } from "./goalhero";
import { heroClub, heroName } from "./goalherosplit";
import { heroFoot, heroLogo, HERO_GROUND, matchWord, spacedName } from "./heroghost";
import { placeByFace } from "./outline";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/**
 * Hero · foot (matchday) — goalherofoot carried to matchday: logo and wide-spaced name at the top, the player big
 * in the upper/middle part, and the kicker ("MATCHDAY") enormous across his faded legs, sitting just above
 * heromatch's quiet fixture foot at the bottom. The word never reaches his face.
 */
const FACE = FACES.anton;

export function Herofoot({ data }: { data: RenderData }) {
  const { params } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const club = heroClub(data);
  const M = 64;

  /* ---- top: logo, name ---- */
  const logoTop = (story ? STORY_TOP : 52) + (params.logoY ?? 0) * -1;
  const name = heroName(data);
  const nameSize = Math.min((story ? 34 : 28) * ts, 760 / Math.max(1, name.length * 1.05));
  const nameTop = logoTop + (story ? 150 : 104);
  const nameBottom = nameTop + nameSize;

  /* ---- the fixture foot at the bottom ---- */
  const foot = heroFoot(data, club);
  const word = matchWord(data);
  const em = Math.max(0.5, wordEm(FACE, word));
  const fullSize = Math.min((CANVAS_W - 2 * M) / em, (story ? 400 : 300) / FACE.cap) * ts;
  const baseline = foot.top - (story ? 64 : 44) + (params.textY ?? 0);

  /* ---- the player: his top just under the name, shrunk until his head clears the word ---- */
  const base = story ? { chest: 400, waist: 340, knees: 250, full: 186 } : { chest: 290, waist: 245, knees: 185, full: 142 };
  const faceX = 540 + (params.side === "left" ? -60 : params.side === "right" ? 40 : 0);
  const gap = story ? 60 : 36;
  const f = data.face ?? [0.38, 0.08, 0.24, 0.12];
  let box = placeByFace(data, faceX, nameBottom + 300, base);
  let chin = 0;
  let size = fullSize;
  for (let shrink = 1; shrink > 0.6; shrink -= 0.06) {
    const sizes = Object.fromEntries(Object.entries(base).map(([n, v]) => [n, v * shrink]));
    let faceTop = nameBottom + 300;
    for (let i = 0; i < 3; i++) faceTop += nameBottom + gap - (placeByFace(data, faceX, faceTop, sizes).top - (params.playerY ?? 0));
    box = placeByFace(data, faceX, faceTop, sizes);
    chin = box.top + (f[1] + f[3]) * box.height;
    // The word's cap line stays ~half a face under his chin.
    const roomCap = baseline - (chin + box.faceH * 0.6);
    size = Math.min(fullSize, roomCap / FACE.cap);
    if (size >= fullSize * 0.8) break;
  }
  size = Math.max(60, size);
  const lean = Math.max(-100, Math.min(100, (CANVAS_W - (2 * box.left + box.width)) / 2));
  box = { ...box, left: box.left + lean };
  const cap = size * FACE.cap;
  const capTop = baseline - cap;

  // His legs fade into the ground behind the word, gone before the fixture.
  const fadeFrom = Math.max(chin + 40, capTop - (story ? 300 : 220));
  const fade = `linear-gradient(to bottom, #000 0, #000 ${fadeFrom}px, rgba(0,0,0,.4) ${capTop + cap * 0.3}px, transparent ${baseline + 10}px)`;

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: HERO_GROUND }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 50% at 50% 42%, #ffffff, transparent 75%)" }} />

      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: fade, maskImage: fade }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {foot.node}

      {/* The word, in front of his faded legs, just above the fixture. */}
      <svg width={CANVAS_W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <text x={CANVAS_W / 2} y={baseline} textAnchor="middle" style={{ fontFamily: FACE.family, fontWeight: FACE.weight, fontSize: size, fill: club }}>
          {word}
        </text>
      </svg>

      {spacedName(name, nameTop, nameSize, club)}
      {heroLogo(data, logoTop)}
    </div>
  );
}
