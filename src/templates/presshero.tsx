import { DMSERIF } from "./fx";
import { NatFigure, NatGround, natPlace } from "./natkit";
import { PHOTO_TEXT_SHADOW, clubOnDark, linesAt, pressArticles, pressDateLabel, sourceLabel } from "./presskit";
import { AgencyLogo, SANS } from "./shared";
import { CANVAS_H, CANVAS_W, STORY_BOTTOM, STORY_TOP, type RenderData } from "./types";

/**
 * Press · hero quote: his own match photo full-bleed (natural), and over a soft local shade at the foot the
 * lead headline (the first article) set big in a serif as a quote, exactly as published, its outlet and date
 * under it; then the other articles as a small list of "OUTLET  headline" lines. "IN THE NEWS" small at
 * the top, the NEYOD logo opposite. His face stays clear: the type shrinks before it climbs that high.
 */
export function Presshero({ data }: { data: RenderData }) {
  const { params, content } = data;
  const ts = params.textScale ?? 1;
  const H = data.canvasH ?? CANVAS_H;
  const story = H > 1400;
  const k = story ? 1.3 : 1;
  const M = story ? 70 : 64;
  const W = CANVAS_W - 2 * M;

  const place = natPlace(data, CANVAS_W, H, {
    fx: params.side === "left" ? 460 : params.side === "right" ? 620 : 540,
    fy: story ? 560 : 300,
    fs: story ? 230 : 150,
  });

  const arts = pressArticles(data, 6);
  const [lead, ...rest] = arts;
  const top = (story ? STORY_TOP : 46) - (params.logoY ?? 0);
  const bottom = (story ? STORY_BOTTOM : CANVAS_H - 56) + (params.textY ?? 0);
  const faceBottom = place.fy + place.fs * 0.62;
  const ceiling = faceBottom + 80 * k;

  /* ---- sizes: the quote as big as fits (≤ 4 lines), the list small ---- */
  const quoteMark = (s: number) => s * 0.62;
  const srcSize = Math.round(14 * k);
  let listSize = (rest.length > 3 ? 17 : 19) * k * ts;
  const listLine = (a: (typeof arts)[number]) => `${sourceLabel(a)}   ${a.title}`;
  const listH = (ls: number) => (rest.length ? 34 * k + rest.reduce((h, a) => h + linesAt(listLine(a), ls, W, 0.5) * ls * 1.3, 0) + (rest.length - 1) * 12 * k : 0);
  const blockH = (s: number, ls: number) => quoteMark(s) + linesAt(lead?.title ?? "", s, W, 0.46) * s * 1.06 + 22 * k + srcSize + listH(ls);
  let size = (story ? 96 : 76) * ts;
  while (size > 34 * k && (blockH(size, listSize) > bottom - ceiling || linesAt(lead?.title ?? "", size, W, 0.46) > 4)) size -= 2;
  while (listSize > 12 * k && blockH(size, listSize) > bottom - ceiling) listSize -= 1;
  const blockTop = bottom - blockH(size, listSize);
  const club = clubOnDark(params);

  const kicker = (content.kicker || "IN THE NEWS").toUpperCase();
  const sub = (content.subline || "").toUpperCase();
  const kSize = Math.round(19 * k * ts);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: H, overflow: "hidden", background: "#22301f", color: "#fff" }}>
      <NatGround place={place} W={CANVAS_W} H={H} />
      <NatFigure data={data} place={place} W={CANVAS_W} H={H} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: top + 220 * k, background: "linear-gradient(to bottom, rgba(0,0,0,.34), rgba(0,0,0,0))" }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: blockTop - 240 * k,
          bottom: 0,
          background: "linear-gradient(to bottom, rgba(5,8,8,0), rgba(5,8,8,.5) 26%, rgba(5,8,8,.78) 55%, rgba(5,8,8,.86))",
        }}
      />

      {/* Kicker, top left. */}
      <div style={{ position: "absolute", top: top + 6 * k, left: M, textShadow: PHOTO_TEXT_SHADOW }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: kSize, letterSpacing: "0.3em", lineHeight: 1, whiteSpace: "nowrap" }}>{kicker}</div>
        {sub && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: Math.round(13 * k * ts), letterSpacing: "0.24em", marginTop: 12 * k, opacity: 0.9, whiteSpace: "nowrap" }}>{sub}</div>}
      </div>

      {/* The lead headline as the quote, then the others. */}
      {lead && (
        <div style={{ position: "absolute", left: M, width: W, bottom: H - bottom }}>
          <div style={{ fontFamily: DMSERIF, fontSize: size * 1.25, lineHeight: 1, height: quoteMark(size), color: club, overflow: "visible" }} aria-hidden>
            “
          </div>
          <div style={{ fontFamily: DMSERIF, fontSize: size, lineHeight: 1.06, letterSpacing: "-0.01em", textShadow: "0 2px 18px rgba(0,0,0,.35)" }}>{lead.title}</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: srcSize, letterSpacing: "0.22em", lineHeight: 1, marginTop: 22 * k, whiteSpace: "nowrap" }}>
            <span style={{ color: club }}>{`— ${sourceLabel(lead)}`}</span>
            {lead.date && <span style={{ opacity: 0.75, fontWeight: 600 }}>{` · ${pressDateLabel(lead.date)}`}</span>}
          </div>
          {rest.length > 0 && (
            <div style={{ marginTop: 34 * k - 1, borderTop: "1px solid rgba(255,255,255,.32)", paddingTop: 0, display: "flex", flexDirection: "column", gap: 12 * k }}>
              <div style={{ height: 22 * k - 12 * k }} />
              {rest.map((a, i) => (
                <div key={i} style={{ fontFamily: SANS, fontSize: listSize, lineHeight: 1.3 }}>
                  <span style={{ fontWeight: 800, fontSize: listSize * 0.78, letterSpacing: "0.16em", color: club, marginRight: "0.9em", whiteSpace: "nowrap" }}>{sourceLabel(a)}</span>
                  <span style={{ fontWeight: 500, opacity: 0.94 }}>{a.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <AgencyLogo data={data} height={24} style={{ position: "absolute", top, right: M, transform: `scale(${params.logoScale ?? 1})`, transformOrigin: "right top" }} />
    </div>
  );
}
