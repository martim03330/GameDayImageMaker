/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties, ReactNode } from "react";
import { shade } from "@/lib/color";
import { cutMask, Film } from "./fx";
import { rng } from "./kit";
import { competitionOf, crestsOf, OwnPhotoBlur, placeByFace, sceneOf } from "./outline";
import { AgencyLogo } from "./shared";
import { goodStats } from "./column";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { clubColour, INTER, niceDate, titleCase } from "./wall";
import { gameDate, nameCase, ourScore, sides, teamCase } from "./gradient";

/** Face height on the canvas per framing: the player stays big behind the card. */
const FACE_H: Record<string, number> = { chest: 190, waist: 150, knees: 124, full: 104 };

/** Inter Bold, mixed case: rough advance per 1px of font size. */
const BOLD = 0.6;
const fit = (t: string, width: number, max: number, ratio = BOLD) => Math.min(max, width / Math.max(1, [...t].length * ratio));

/** A small white football: outline, centre pentagon and the seams out to the edge. */
function Ball({ size, faded = false }: { size: number; faded?: boolean }) {
  const pent = Array.from({ length: 5 }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return [12 + Math.cos(a) * 4.2, 12 + Math.sin(a) * 4.2];
  });
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity: faded ? 0.45 : 1 }}>
      <circle cx={12} cy={12} r={10.6} fill="none" stroke="#ffffff" strokeWidth={1.6} />
      <polygon points={pent.map((p) => p.join(",")).join(" ")} fill="#ffffff" />
      {pent.map(([x, y], i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        return <line key={i} x1={x} y1={y} x2={12 + Math.cos(a) * 10.6} y2={12 + Math.sin(a) * 10.6} stroke="#ffffff" strokeWidth={1.4} />;
      })}
    </svg>
  );
}

/** A small boot-less "assist" mark: a ring with an arrow through it. */
function AssistMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx={12} cy={12} r={10.6} fill="none" stroke="#ffffff" strokeWidth={1.6} />
      <path d="M6.5 12h10M13 8l4 4-4 4" fill="none" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Ligue 1 player card (Mason Greenwood, Marseille): the stand behind him melted into a soft blur, the player
 * big in front, and a tall glass card drawn only as a thin white rounded outline laid over his body — kicker
 * and crest along its top, his name big and bold, "#10 Forward", one line of numbers and an inner box holding
 * a grid of little footballs (one per goal). Matchday swaps the numbers for the kick-off and the inner box for
 * the two crests and the ground; goal / result for the score between the crests.
 */
export function Glass({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const seed = params.seed ?? 10;
  const r = rng(seed);
  const mirror = params.side === "left";
  const ts = params.textScale ?? 1;
  const club = clubColour(data);

  // ---- the player, big, face in the upper part ----
  const faceX = 540 + (mirror ? -1 : 1) * (55 + r() * 30);
  const box = placeByFace(data, faceX, 175 + r() * 25, FACE_H);
  const face = data.face ?? [0.38, 0.08, 0.24, 0.12];
  const faceCx = box.left + (face[0] + face[2] / 2) * box.width;
  const faceBottom = box.top + (face[1] + face[3]) * box.height;

  // ---- the card, over his body ----
  const cardW = 500;
  const pad = 40;
  const inner = cardW - pad * 2;

  // ---- words ----
  const md = sides(data);
  const kicker = titleCase(content.kicker.toUpperCase().replace(/^IT'S\s+/, ""));
  const first = nameCase(content.firstName.trim());
  const last = nameCase(content.lastName.trim());
  const lines = [first, last].filter(Boolean);
  const nameSize = Math.min(78 * ts, ...lines.map((l) => fit(l, inner, 78)));
  const role = [data.player.number ? `#${data.player.number}` : "", titleCase(data.player.position.toUpperCase())].filter(Boolean).join(" ");
  const comp = competitionOf(data) || md.comp;

  const stats = goodStats(data);
  const val = (re: RegExp) => stats.find((s) => re.test(s.label));
  const goals = Number(val(/^goals?$/i)?.value ?? 0) || 0;
  const assists = Number(val(/^assists?$/i)?.value ?? 0) || 0;
  const sc = ourScore(data);

  // The numbers line: "12 Match **10 Goals**".
  let lineA = "";
  let lineB = "";
  if (postType === "matchday") {
    lineA = niceDate(gameDate(data)).replace(/^(\w{3}) (\d+) (\w{3})\w*$/, "$1 $2 $3");
    lineB = md.time;
  } else if (postType === "goal") {
    lineA = md.opp ? `vs ${teamCase(md.opp)}` : "";
    lineB = goals ? `${goals} ${goals === 1 ? "Goal" : "Goals"}` : kicker;
  } else if (postType === "result") {
    const rating = val(/rating/i);
    const mins = val(/min/i);
    lineA = mins ? `${mins.value} Minutes` : md.opp ? `vs ${teamCase(md.opp)}` : "";
    lineB = rating ? `${rating.value} Rating` : goals ? `${goals} ${goals === 1 ? "Goal" : "Goals"}` : assists ? `${assists} ${assists === 1 ? "Assist" : "Assists"}` : "";
  } else {
    const games = val(/games?|match|apps/i);
    const best = stats.find((s) => /goal/i.test(s.label) && Number(s.value) > 0) ?? stats.find((s) => s !== games && String(s.value) !== "0");
    lineA = games ? `${games.value} ${Number(games.value) === 1 ? "Match" : "Matches"}` : "";
    lineB = best ? `${best.value} ${titleCase(best.label.toUpperCase())}` : "";
  }
  const lineSize = fit(`${lineA} ${lineB}`, inner, 34 * ts, 0.56);

  // ---- the inner box ----
  const boxW = inner - 40;
  let boxBody: ReactNode = null;
  const crests = crestsOf(data);
  if (postType === "matchday" || postType === "goal" || postType === "result") {
    const mid = postType === "matchday" || !sc ? "vs" : sc.text;
    const venue = postType === "matchday" && md.venue ? titleCase(md.venue) : postType !== "matchday" && comp ? titleCase(comp) : "";
    boxBody = (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {crests[0] && <img src={crests[0]} alt="" style={{ width: 74, height: 74, objectFit: "contain", filter: "drop-shadow(0 3px 8px rgba(0,0,0,.35))" }} />}
          <span style={{ fontFamily: INTER, fontWeight: mid === "vs" ? 400 : 700, fontSize: mid === "vs" ? 26 : 46, color: "#ffffff", letterSpacing: mid === "vs" ? "0.02em" : "-0.01em" }}>{mid}</span>
          {crests[1] && <img src={crests[1]} alt="" style={{ width: 74, height: 74, objectFit: "contain", filter: "drop-shadow(0 3px 8px rgba(0,0,0,.35))" }} />}
        </div>
        {venue && <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: fit(venue, boxW - 30, 19, 0.55), color: "rgba(255,255,255,.85)", whiteSpace: "nowrap" }}>{venue}</div>}
      </div>
    );
  } else if (goals + assists > 0) {
    const icons = [...Array.from({ length: Math.min(goals, 24) }, () => "g"), ...Array.from({ length: Math.min(assists, 24 - Math.min(goals, 24)) }, () => "a")];
    const per = icons.length <= 6 ? icons.length : Math.ceil(icons.length / Math.ceil(icons.length / 8));
    const size = Math.min(44, (boxW - 40) / Math.max(per, 1) - 12);
    boxBody = (
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, width: (size + 12) * per, rowGap: 14 }}>
        {icons.map((k, i) => (k === "g" ? <Ball key={i} size={size} /> : <AssistMark key={i} size={size} />))}
      </div>
    );
  } else {
    const others = stats.filter((s) => !/games?|match|apps/i.test(s.label) && `${s.value} ${titleCase(s.label.toUpperCase())}` !== lineB);
    const nonZero = others.filter((s) => String(s.value).trim() !== "0");
    const rest = nonZero.slice(0, 3);
    boxBody = rest.length ? (
      <div style={{ display: "flex", gap: 34 }}>
        {rest.map((s, i) => (
          <div key={i} style={{ textAlign: "center", color: "#ffffff" }}>
            <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 40, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontFamily: INTER, fontWeight: 400, fontSize: 16, marginTop: 6, opacity: 0.85 }}>{titleCase(s.label.toUpperCase())}</div>
          </div>
        ))}
      </div>
    ) : null;
  }
  const cardH = boxBody ? 580 : 440;
  const boxTop = cardH - 30 - 170;
  const cardTop = Math.min(CANVAS_H - 150 - cardH, Math.max(420, faceBottom + 70));
  const cardLeft = Math.max(90, Math.min(CANVAS_W - 90 - cardW, faceCx - cardW / 2 + (mirror ? 60 : -60)));
  const legend = postType !== "matchday" && postType !== "goal" && postType !== "result" && goals + assists > 0 && assists > 0;

  const shadow = "0 1px 3px rgba(0,0,0,.35), 0 2px 20px rgba(0,0,0,.45)";
  const txt: CSSProperties = { fontFamily: INTER, color: "#ffffff", whiteSpace: "nowrap", textShadow: shadow };
  const scene = !data.bgPhotoUrl ? sceneOf(data) : null;
  const compLines = comp ? titleCase(comp).split(/\s+/).reduce<string[]>((acc, w) => {
    if (acc.length && (acc[acc.length - 1] + " " + w).length <= 12) acc[acc.length - 1] += " " + w;
    else acc.push(w);
    return acc;
  }, []).slice(0, 3) : [];

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: shade(club, -0.6) }}>
      {/* The stand: his own photo (or the ground) melted into a blur. */}
      {data.bgPhotoUrl ? (
        <OwnPhotoBlur data={data} blur={30} style={{ filter: "blur(30px) saturate(1.1) brightness(.85)" }} />
      ) : scene ? (
        <img src={scene} alt="" style={{ position: "absolute", left: -60, top: -60, width: CANVAS_W + 120, height: CANVAS_H + 120, maxWidth: "none", objectFit: "cover", filter: "blur(16px) brightness(.8)" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(90% 70% at 50% 35%, ${shade(club, -0.2)}, ${shade(club, -0.7)})` }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.18), rgba(0,0,0,.05) 40%, rgba(0,0,0,.4))" }} />

      {/* The player. */}
      {data.photoUrl && (
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 18px 40px rgba(0,0,0,.35))" }}>
          <img src={data.photoUrl} alt="" style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, maxWidth: "none", ...cutMask(data.cut) }} />
        </div>
      )}

      {/* Competition mark (top corner). */}
      {compLines.length > 0 && (
        <div style={{ position: "absolute", top: 70, [mirror ? "left" : "right"]: 70, textAlign: mirror ? "left" : "right", ...txt }}>
          {compLines.map((l, i) => (
            <div key={i} style={{ fontFamily: INTER, fontWeight: 800, fontSize: Math.min(30, 240 / Math.max(4, l.length * 0.62)), lineHeight: 1.05, letterSpacing: "-0.01em", textTransform: "uppercase" }}>
              {l}
            </div>
          ))}
        </div>
      )}

      {/* The glass card. */}
      <div
        style={{
          position: "absolute",
          left: cardLeft,
          top: cardTop,
          width: cardW,
          height: cardH,
          borderRadius: 30,
          border: "2.5px solid rgba(255,255,255,.95)",
          background: "linear-gradient(160deg, rgba(20,22,28,.26), rgba(20,22,28,.4) 45%, rgba(20,22,28,.5))",
          boxShadow: "0 0 0 1px rgba(0,0,0,.06), 0 20px 60px rgba(0,0,0,.15)",
        }}
      >
        {/* Top row: kicker, crest. */}
        {kicker && <div style={{ ...txt, position: "absolute", left: pad, top: 34, fontWeight: 500, fontSize: fit(kicker, inner - 80, 24, 0.55) }}>{kicker}</div>}
        {data.club?.crestUrl && (
          <img src={data.club.crestUrl} alt="" style={{ position: "absolute", right: pad - 6, top: 22, width: 56, height: 56, objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.35))" }} />
        )}
        {/* Name and role. */}
        <div style={{ position: "absolute", left: pad, top: 118 }}>
          {lines.map((l, i) => (
            <div key={i} style={{ ...txt, fontWeight: 700, fontSize: nameSize, lineHeight: 0.98, letterSpacing: "-0.025em" }}>
              {l}
            </div>
          ))}
          {role && <div style={{ ...txt, fontWeight: 400, fontSize: 21, marginTop: 12, opacity: 0.95 }}>{role}</div>}
        </div>
        {/* The numbers line. */}
        {(lineA || lineB) && (
          <div style={{ ...txt, position: "absolute", left: 0, right: 0, top: boxBody ? boxTop - lineSize - 26 : cardH - 44 - lineSize * 1.2, textAlign: "center", fontSize: lineSize }}>
            {lineA && <span style={{ fontWeight: 400 }}>{lineA}</span>}
            {lineA && lineB && " "}
            {lineB && <span style={{ fontWeight: 700 }}>{lineB}</span>}
          </div>
        )}
        {/* Inner box. */}
        {boxBody && (
          <div
            style={{
              position: "absolute",
              left: (cardW - boxW) / 2,
              top: boxTop,
              width: boxW,
              height: 170,
              borderRadius: 20,
              border: "2px solid rgba(255,255,255,.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(160deg, rgba(255,255,255,.08), rgba(0,0,0,.22))",
            }}
          >
            {boxBody}
          </div>
        )}
        {legend && (
          <div style={{ ...txt, position: "absolute", left: 0, right: 0, bottom: 6, textAlign: "center", fontSize: 13, opacity: 0.8, fontWeight: 500 }}>
            {goals} {goals === 1 ? "goal" : "goals"} · {assists} {assists === 1 ? "assist" : "assists"}
          </div>
        )}
      </div>

      <AgencyLogo data={data} height={30} style={{ position: "absolute", bottom: 56, left: 540 - 90, width: 180, opacity: 0.95 }} />
      <Film strength={0.45} />
    </div>
  );
}
