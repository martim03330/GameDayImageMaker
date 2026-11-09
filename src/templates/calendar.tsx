/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { figureBox, Film, GradedFigure, HeadLayer } from "./fx";
import { AgencyLogo, CONDENSED, DISPLAY, fitSize } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const MONTHS = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
const G = { x: 380, y: 330, w: 640, h: 880 };

/** The month as a calendar: game days show the opponent crest and score, scoring days light up in club colour. */
export function Calendar({ data }: { data: RenderData }) {
  const { params, content } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const ref = data.matches[0] ? new Date(`${data.matches[0].date}T12:00:00`) : new Date();
  const y = ref.getFullYear();
  const mo = ref.getMonth();
  const month = data.matches.filter((m) => m.date.startsWith(`${y}-${String(mo + 1).padStart(2, "0")}`));
  const first = (new Date(y, mo, 1).getDay() + 6) % 7; // Monday first
  const days = new Date(y, mo + 1, 0).getDate();
  const rows = Math.ceil((first + days) / 7);
  const cw = (G.w - 6 * 6) / 7;
  const ch = (G.h - (rows - 1) * 6) / rows;
  const box = figureBox(data, 230, 0, 1060);
  const totals = { g: month.reduce((a, m) => a + m.goals, 0), a: month.reduce((a, m) => a + m.assists, 0) };

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#111214", color: "#fff" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 40, textAlign: "center", fontFamily: DISPLAY, fontSize: fitSize(MONTHS[mo], 980, 230), lineHeight: 0.9, color: accent }}>{MONTHS[mo]}</div>
      <GradedFigure data={data} box={box} rim="rgba(255,255,255,.45)" />
      {Array.from({ length: rows * 7 }, (_, i) => {
        const d = i - first + 1;
        if (d < 1 || d > days) return null;
        const iso = `${y}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const m = month.find((x) => x.date === iso);
        const hot = m && m.goals + m.assists > 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: G.x + (i % 7) * (cw + 6),
              top: G.y + Math.floor(i / 7) * (ch + 6),
              width: cw,
              height: ch,
              background: hot ? accent : m ? "#2c2e33" : "#1b1c20",
              padding: 8,
              fontFamily: CONDENSED,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 18, opacity: 0.8 }}>{d}</div>
            {m && (
              <div style={{ position: "absolute", inset: 10, top: 34, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                {m.opponentCrest && <img src={m.opponentCrest} alt="" style={{ width: Math.min(60, ch * 0.35), height: Math.min(60, ch * 0.35), objectFit: "contain" }} />}
                <div style={{ fontWeight: 800, fontSize: 18 }}>
                  {m.goalsFor}-{m.goalsAgainst}
                </div>
                {hot && (
                  <div style={{ fontWeight: 800, fontSize: 14 }}>
                    {m.goals ? `⚽×${m.goals}` : ""} {m.assists ? `🅰×${m.assists}` : ""}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      <HeadLayer data={data} box={box} />
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 40, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: CONDENSED, fontWeight: 800, fontSize: 30, letterSpacing: "0.08em" }}>
        <span>
          {content.firstName.toUpperCase()} {content.lastName.toUpperCase()}
        </span>
        <span style={{ color: accent }}>
          {totals.g} G · {totals.a} A · {month.length} J
        </span>
        <AgencyLogo data={data} height={28} />
      </div>
      <Film strength={1} />
    </div>
  );
}
