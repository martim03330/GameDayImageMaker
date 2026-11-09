/* eslint-disable @next/next/no-img-element -- templates are screenshotted, next/image adds nothing here */
import type { CSSProperties } from "react";
import { hueOf, luminance, shade, vivid } from "@/lib/color";
import { rng } from "./kit";
import { standing } from "./mist";
import { clubDeep, lift, PRINT_GRAIN } from "./column";
import { crestsOf, scoreOf } from "./outline";
import { AgencyLogo, DISPLAY } from "./shared";
import { matchFacts } from "./strokes";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";
import { INTER, interEm, mix } from "./wall";

const PAPER = "#efebe4";
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** "SAT 10 OCT" → "10.10.2026" (the year from the next fixture when it is the same month). */
export function dotDate(data: RenderData, d: string): string {
  const m = d.toUpperCase().match(/(\d{1,2})\s+([A-Z]{3})/);
  if (!m || MONTHS.indexOf(m[2]) < 0) return d.toUpperCase();
  const mo = MONTHS.indexOf(m[2]);
  const fy = /^(\d{4})-(\d{2})/.exec(data.fixtures?.[0]?.date ?? "");
  const now = new Date();
  const y = fy && Number(fy[2]) === mo + 1 ? Number(fy[1]) : mo < now.getMonth() - 2 ? now.getFullYear() + 1 : now.getFullYear();
  return `${m[1].padStart(2, "0")}.${String(mo + 1).padStart(2, "0")}.${y}`;
}

/** A team name on one or two balanced lines ("POHANG / STEELERS", "GWANGJU FC"). */
function teamLines(name: string): string[] {
  const words = name.toUpperCase().split(/\s+/).filter(Boolean);
  if (words.length < 2 || name.length <= 10) return [words.join(" ")];
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (d < diff) [diff, best] = [d, i];
  }
  // A trailing "FC" / "SC" stays with its name rather than making a second line of its own.
  const tail = words.slice(best).join(" ");
  const head = words.slice(0, best).join(" ");
  if (/^(FC|SC|CF|AC|CD|UD|SAD|AFC|SL|GD|AD|CA)$/.test(tail) || /^(FC|SC|CF|AC|CD|UD|AFC|SL|GD|AD|CA|US|USC)$/.test(head)) return [words.join(" ")];
  return [head, tail];
}

/**
 * The club crest as one soft tint: its shape in `color`, its darker inks denser than the light ones, so the
 * emblem keeps a hint of its drawing while staying a pale watermark.
 */
function TintDefs({ id, color }: { id: string; color: string }) {
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id={id} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.19 -0.38 -0.06 1 0" result="a" />
        <feFlood floodColor={color} />
        <feComposite in2="a" operator="in" />
      </filter>
    </svg>
  );
}

/**
 * Warm paper matchday poster (Pohang Steelers v Gwangju FC): off-white grainy paper with thin dark club
 * bars at the very top and bottom, a huge pale watermark of the club crest behind the full-body action
 * player (soft floor shadow), the two crests small at the top, the fixture in bold dark caps stacked
 * right of his head (date --- ground --- kick-off) and the two teams stacked on the other side.
 */
export function Emblemfade({ data }: { data: RenderData }) {
  // Native story (1080×1920): the backdrop runs the full height, the poster itself is centred (no stretched
  // post edges at the top and bottom).
  const H = data.canvasH ?? CANVAS_H;
  const dy = H > CANVAS_H ? (H - CANVAS_H) / 2 : 0;
  const { params, content, postType } = data;
  const r = rng(params.seed ?? 65);
  const mirror = params.side === "left";
  const deep = clubDeep(data);
  const ink = luminance(deep) > 0.18 ? shade(deep, -0.4) : deep;
  const tint = mix(PAPER, luminance(deep) < 0.06 ? (hueOf(deep) === null ? shade(deep, 0.35) : vivid(deep)) : deep, 0.26);
  const ts = params.textScale ?? 1;
  const md = matchFacts(data);

  // ---- the player: full body, feet on a floor well above the logos ----
  const floor = 1060 + Math.round(r() * 20);
  const cx = 540 + (mirror ? 14 : -14);
  const placed = standing(data, { cx, headTop: 350, floor, maxFace: 104, framing: "full" });
  const { box, style: figMask } = lift(data, placed, 350 + placed.faceH * 0.2);

  // ---- the watermark: our crest, huge and pale, centred on the body ----
  const crestBig = data.club?.crestUrl ?? null;
  const markSize = 860 + Math.round(r() * 60);
  const markCx = 540 + (mirror ? -30 : 30);
  const markCy = Math.min(760, box.faceTop + 330);

  // ---- teams, ours with our side of the fixture ----
  const home = (content.homeTeam || (content.home === false ? md.opp : data.club?.name) || "").trim();
  const away = (content.awayTeam || (content.home === false ? data.club?.name : md.opp) || "").trim();
  const score = scoreOf(data, " - ");
  const showScore = (postType === "result" || postType === "goal") && !!score;
  // The team column sits between the margin and the body; a wide pose (a kick, arms out) leaves no room
  // down there, so the teams move up beside the head, opposite the fixture.
  const bodyGap = mirror ? CANVAS_W - (box.left + box.width) : box.left;
  const wide = box.width / box.height > 0.62 || bodyGap < 250;
  const teamEdge = wide ? 96 : bodyGap - 24 - 250 < 110 ? 110 : 150 + (r() - 0.5) * 20;
  const headGap = mirror ? CANVAS_W - (box.faceCx + (data.face?.[2] ?? 0.2) * box.width * 0.75) : box.faceCx - (data.face?.[2] ?? 0.2) * box.width * 0.75;
  const colW = wide ? Math.max(170, Math.min(250, headGap - 44 - teamEdge)) : Math.max(180, Math.min(250, bodyGap - 24 - teamEdge));
  const teamBlock: { text: string; size: number; weight: number; gap?: number }[] = [];
  const hl = home ? teamLines(home) : [];
  const al = away ? teamLines(away) : [];
  const all = [...hl, ...al];
  const teamSize = Math.min(42 * ts, ...all.map((l) => colW / Math.max(3, interEm(l, 0.01))));
  hl.forEach((t) => teamBlock.push({ text: t, size: teamSize, weight: 800 }));
  if (hl.length && al.length) teamBlock.push({ text: showScore ? score : "VS.", size: showScore ? teamSize * 1.9 : teamSize, weight: 800, gap: showScore ? 8 : 0 });
  al.forEach((t) => teamBlock.push({ text: t, size: teamSize, weight: 800 }));

  // ---- fixture block beside the head ----
  const comp = md.comp;
  const info: string[][] = [];
  if (postType === "matchday") {
    if (md.date) info.push([dotDate(data, md.date)]);
    if (md.venue) info.push(teamLines(md.venue));
    if (md.time) info.push([md.time]);
  } else {
    const kicker = (postType === "result" ? content.kicker || "FULL TIME" : content.kicker).toUpperCase();
    if (kicker) info.push(teamLines(kicker));
    const name = [content.firstName, content.lastName].filter(Boolean).join(" ").toUpperCase();
    if (postType === "goal" && name) info.push(teamLines(name));
    if (md.date) info.push([dotDate(data, md.date)]);
  }
  // Beside the head, never over it: the block's width is what is left between the face and the margin.
  const faceHalf = (data.face?.[2] ?? 0.2) * box.width * 0.85 + 16;
  const room = mirror ? box.faceCx - faceHalf - 44 - 96 : CANVAS_W - 96 - (box.faceCx + faceHalf + 44);
  const infoW = Math.max(190, Math.min(300, room));
  const infoSize = Math.min(32 * ts, ...info.flat().map((l) => infoW / Math.max(3, interEm(l, 0.01))));
  const compSize = comp ? Math.min(17, infoW / Math.max(1, interEm(comp, 0.12))) : 0;
  const round = md.round;
  const roundSize = round ? Math.min(14, infoW / Math.max(1, interEm(round, 0.14))) : 0;

  // Block beside the head, on the far side from the face's centre; the teams lower down on the other side.
  const blockW = Math.max(...info.flat().map((l) => interEm(l, 0.01) * infoSize), comp ? interEm(comp, 0.12) * compSize : 0, round ? interEm(round, 0.14) * roundSize : 0);
  const infoEdge = Math.min(CANVAS_W - 96, Math.max(box.faceCx + faceHalf + 44 + blockW, 800));
  const infoLeftEdge = Math.max(96, Math.min(box.faceCx - faceHalf - 44 - blockW, 280));
  const infoTop = Math.max(240, box.faceTop - 60);
  const teamTop = wide ? infoTop + 30 : Math.max(infoTop + 250, box.faceTop + box.faceH * 3.1);

  const crests = crestsOf(data);
  const small: CSSProperties = { fontFamily: INTER, fontWeight: 800, color: ink, whiteSpace: "nowrap", lineHeight: 1.12 };
  const infoSide: CSSProperties = mirror ? { left: infoLeftEdge, textAlign: "left" } : { right: CANVAS_W - infoEdge, textAlign: "right" };
  const teamSide: CSSProperties = mirror ? { right: teamEdge, textAlign: "right" } : { left: teamEdge, textAlign: "left" };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: PAPER }}>
      <TintDefs id="emblemfade-tint" color={tint} />
      {/* Paper: a warm light pool and darker corners. */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(85% 70% at 50% 42%, rgba(255,255,255,.55), transparent 70%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 95% at 50% 45%, transparent 60%, rgba(70,55,40,.08) 100%)" }} />

      <div style={{ position: "absolute", left: 0, top: dy, width: CANVAS_W, height: CANVAS_H }}>
      {/* The pale emblem. */}
      {crestBig ? (
        <img
          src={crestBig}
          alt=""
          data-bleed
          style={{ position: "absolute", left: markCx - markSize / 2, top: markCy - markSize / 2, width: markSize, height: markSize, objectFit: "contain", filter: "url(#emblemfade-tint)", opacity: 0.72 }}
        />
      ) : (
        <div
          data-bleed
          style={{ position: "absolute", left: 0, right: 0, top: markCy - 420, textAlign: "center", fontFamily: DISPLAY, fontSize: 760, lineHeight: 1, color: tint }}
        >
          {data.player.number || ""}
        </div>
      )}

      {/* Floor shadow: a wide soft pool and a darker contact under the boots. */}
      {data.photoUrl && box.feet && (
        <>
          <div style={{ position: "absolute", left: box.left + box.width * 0.05, width: box.width * 0.9, top: floor - 26, height: 52, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(60,45,35,.28), rgba(60,45,35,0))", filter: "blur(8px)" }} />
          <div style={{ position: "absolute", left: box.left + box.width * 0.18, width: box.width * 0.64, top: floor - 9, height: 18, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(30,22,18,.42), rgba(30,22,18,0))", filter: "blur(4px)" }} />
        </>
      )}
      {data.photoUrl && (
        <div style={{ position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height, filter: "drop-shadow(0 10px 18px rgba(50,35,25,.16))" }}>
          <img src={data.photoUrl} alt="" style={{ width: "100%", height: "100%", maxWidth: "none", display: "block", filter: "contrast(1.03) saturate(.98)", ...figMask }} />
        </div>
      )}
      {!box.feet && <div style={{ position: "absolute", left: 0, right: 0, top: 1080, height: 270, background: `linear-gradient(to bottom, ${PAPER}00, ${PAPER} 55%)` }} />}

      {/* Crests, small, top centre. */}
      {crests.length > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 118, display: "flex", justifyContent: "center", gap: 18 }}>
          {crests.map((c, i) => (
            <img key={i} src={c} alt="" style={{ width: 84, height: 84, objectFit: "contain" }} />
          ))}
        </div>
      )}

      {/* Fixture block beside the head. */}
      <div style={{ position: "absolute", top: infoTop, ...infoSide }}>
        {comp && <div style={{ ...small, fontSize: compSize, letterSpacing: "0.12em", marginBottom: round ? 4 : 18 }}>{comp}</div>}
        {round && <div style={{ ...small, fontWeight: 600, fontSize: roundSize, letterSpacing: "0.14em", opacity: 0.7, marginBottom: 18 }}>{round}</div>}
        {info.map((lines, i) => (
          <div key={i}>
            {i > 0 && <div style={{ ...small, fontSize: infoSize * 0.8, lineHeight: 0.9, letterSpacing: "0.02em", margin: "2px 0 4px" }}>---</div>}
            {lines.map((l, j) => (
              <div key={j} style={{ ...small, fontSize: infoSize, letterSpacing: "0.01em" }}>
                {l}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* The two teams, stacked. */}
      {teamBlock.length > 0 && (
        <div style={{ position: "absolute", top: teamTop, ...teamSide }}>
          {teamBlock.map((t, i) => (
            <div key={i} style={{ ...small, fontSize: t.size, fontWeight: t.weight, letterSpacing: "0.01em", lineHeight: 1.1, margin: t.gap ? `${t.gap}px 0` : undefined }}>
              {t.text}
            </div>
          ))}
        </div>
      )}

      <AgencyLogo data={data} height={36} onLight style={{ position: "absolute", left: 540, bottom: 64, transform: "translateX(-50%)", color: ink }} />


      </div>
      <div style={{ position: "absolute", inset: 0, backgroundImage: PRINT_GRAIN, opacity: 0.07, mixBlendMode: "multiply", pointerEvents: "none" }} />
      {/* Thin club bars at the very top and bottom edges of the whole story. */}
      <div data-bleed style={{ position: "absolute", left: 0, right: 0, top: 0, height: 16, background: ink }} />
      <div data-bleed style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 16, background: ink }} />
    </div>
  );
}
