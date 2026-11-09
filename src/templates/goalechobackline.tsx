/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import { Film } from "./fx";
import { CentreLogo, caps, centredFoot, EchoLine, echoTones, FootFade, goalBox, Player, plain, WHITE } from "./goalechotitle";
import { capsEm } from "./rippleecho";
import { matchFacts } from "./strokes";
import { teamsOf } from "./notify";
import { CANVAS_H, CANVAS_W, STORY_TOP, type RenderData } from "./types";

/** Inter SemiBold numerals: advance widths per 1px of font size. */
const NUM_W: Record<string, number> = { "0": 0.604, "1": 0.38, "2": 0.618, "3": 0.594, "4": 0.612, "5": 0.566, "6": 0.583, "7": 0.553, "8": 0.604, "9": 0.583 };

/**
 * Goal echo backline: the celebrating player, sharp and in natural colour, on a deep club ground with one hairline
 * echo of his own edge offset behind him (Contorno eco) — and, from Backline, his shirt number set huge behind
 * him as a hairline outline drawn in the echo's own line and colour, so number and echo read as one drawing.
 * His surname wide-tracked at the top over a short rule and the kicker ("GOAL"); crests, the fixture (home first,
 * names exactly as stored, no score) and the competition small at the foot.
 */
export function Goalechobackline({ data }: { data: RenderData }) {
  const { params, content } = data;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.38 : 1;
  const ts = params.textScale ?? 1;
  const { deep, lift, echo, clubLine, whiteEcho } = echoTones(data);
  // The number in the other ink from the echo (white hairline beside a club echo, club hairline beside a white one).
  const numInk = whiteEcho ? clubLine : "rgba(255,255,255,.4)";
  const toRight = params.side !== "left";

  /* ---- top: surname, a hairline rule, the kicker ---- */
  const surname = (content.lastName || content.firstName || "").toUpperCase().normalize("NFC");
  const N_TRACK = 0.62;
  const nameSize = Math.min(30 * k, ((story ? 900 : 820) * ts) / Math.max(1, capsEm(surname, N_TRACK))) * ts;
  const kicker = (content.kicker || "GOAL").toUpperCase().replace(/’/g, "'");
  const K_TRACK = 0.5;
  const kSize = Math.max(11 * k, Math.min(15 * k, 640 / Math.max(1, capsEm(kicker, K_TRACK)))) * ts;
  const nameTop = (story ? STORY_TOP : 74) + (params.textY ?? 0);
  const ruleY = nameTop + nameSize + 26 * k;
  const kTop = ruleY + 24 * k;
  const clipTop = kTop + kSize + 30 * k;

  /* ---- foot: crests over the fixture and competition (his name is at the top) ---- */
  const foot = centredFoot(data, story, k, { name: false });
  const f = matchFacts(data);
  const ourHome = (() => {
    if (content.home !== undefined) return content.home !== false;
    const t = teamsOf(data);
    return !(t.length === 2 && (data.club?.name ?? "").toLowerCase() === t[1].toLowerCase());
  })();
  const crests = (ourHome ? [f.ourCrest, f.oppCrest] : [f.oppCrest, f.ourCrest]).filter(Boolean) as string[];
  const CR = (story ? 60 : 42) * ts;
  const crestTop = foot.top - (story ? 40 : 30) * k - CR;
  const footTop = crests.length ? crestTop : foot.top;

  /* ---- the player, centred ---- */
  const cx = 540 + (toRight ? 30 : -30);
  const box = goalBox(data, { faceX: cx, faceTop: story ? 470 : 300, cx, maxW: story ? 880 : 880, story, sizes: story ? { chest: 286, waist: 236, knees: 190, full: 152 } : undefined, minHead: clipTop + (story ? 30 : 22) });
  const dx = (toRight ? -1 : 1) * 28 * k;
  const dy = -24 * k;

  /* ---- the number behind him, a hairline ---- */
  const num = (data.player.number || "").replace(/\D/g, "").slice(0, 2);
  const numEm = plain(num).reduce((a, c) => a + (NUM_W[c] ?? 0.6), 0);
  const numSize = Math.min(story ? 1250 : 1060, (story ? 1000 : 960) / Math.max(0.5, numEm));
  // Cap top a little above his head, so it frames his shoulders; never into the foot.
  const numBase = Math.min(box.top - (story ? 30 : 20) + numSize * 0.727, footTop - (story ? 90 : 60));

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: deep, color: WHITE }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(66% 48% at 50% ${story ? 40 : 42}%, ${lift}, ${deep} 82%)` }} />

      {num && (
        <svg data-bleed width={CANVAS_W} height={H} style={{ position: "absolute", inset: 0 }} aria-hidden>
          <text x={540} y={numBase} textAnchor="middle" fontFamily="var(--font-inter), system-ui, sans-serif" fontWeight={600} fontSize={numSize} letterSpacing={-numSize * 0.02} fill="none" stroke={numInk} strokeWidth={story ? 2.2 : 1.8}>
            {num}
          </text>
        </svg>
      )}

      <EchoLine id="goalechobackline" data={data} box={box} H={H} dx={dx} dy={dy} clipTop={clipTop} color={echo} width={story ? 2.4 : 2} />
      <Player data={data} box={box} />
      <FootFade deep={deep} story={story} />

      {/* Top: surname, hairline, kicker. */}
      {surname && <div style={{ position: "absolute", left: 0, right: 0, top: nameTop, ...caps(nameSize, N_TRACK, 300) }}>{surname}</div>}
      <div style={{ position: "absolute", left: 540 - 22 * k, top: ruleY, width: 44 * k, height: 1, background: "rgba(255,255,255,.6)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: kTop, ...caps(kSize, K_TRACK, 500, { opacity: 0.78 }) }}>{kicker}</div>

      {/* Foot: crests, fixture, competition. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: crestTop, height: CR, display: "flex", justifyContent: "center", alignItems: "center", gap: 30 * k }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: CR, height: CR, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.35))" }} />
          ))}
        </div>
      )}
      {foot.node}

      <CentreLogo data={data} story={story} H={H} />
      <Film strength={0.18} />
    </div>
  );
}
