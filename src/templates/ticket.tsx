/* eslint-disable @next/next/no-img-element */
import { vivid } from "@/lib/color";
import { BARCODE, cityCode, cutMask, Film, SLAB } from "./fx";
import { opponentOf, Paper } from "./kit";
import { AgencyLogo, MONO } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

const T = { x: 70, y: 170, w: 940, h: 1060, stub: 760, rot: -4 };
const INK = "#1a1a1a";

/** Match ticket (matchday) or boarding pass from the old club's city to the new one (transfer). */
export function Ticket({ data }: { data: RenderData }) {
  const { params, content, postType } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const city = data.club?.cityImages?.[0] ?? data.club?.cityImageUrl ?? data.bgPhotoUrl;
  const boarding = postType === "transfer" || postType === "renewal";
  const notch = `radial-gradient(circle 26px at 0 ${T.stub}px, #0000 97%, #000) 0 0 / 51% 100% no-repeat, radial-gradient(circle 26px at 100% ${T.stub}px, #0000 97%, #000) 100% 0 / 51% 100% no-repeat`;
  const from = data.fromClub ?? null;
  const to = data.toClub ?? data.club;
  const label = (t: string, v: string, big = false) => (
    <div>
      <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: "0.12em", opacity: 0.6 }}>{t}</div>
      <div style={{ fontFamily: big ? SLAB : MONO, fontSize: big ? 44 : 26, fontWeight: 700 }}>{v || "—"}</div>
    </div>
  );

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", background: "#111", color: INK }}>
      {city && <img src={city} alt="" style={{ position: "absolute", inset: -40, width: CANVAS_W + 80, height: CANVAS_H + 80, objectFit: "cover", filter: "blur(18px) brightness(.55)" }} />}
      <AgencyLogo data={data} height={34} style={{ position: "absolute", left: 60, top: 60 }} />

      <div style={{ position: "absolute", left: T.x, top: T.y, width: T.w, height: T.h, transform: `rotate(${T.rot}deg)`, filter: "drop-shadow(0 30px 40px #0009)" }}>
        <div style={{ position: "absolute", inset: 0, WebkitMask: notch, mask: notch, overflow: "hidden", borderRadius: 18 }}>
          <Paper color="#f3ead7" strength={1.2} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 110, background: accent }} />
          <div style={{ position: "absolute", left: 40, top: 30, fontFamily: SLAB, fontSize: 44, color: "#fff" }}>{boarding ? "BOARDING PASS" : "MATCH TICKET"}</div>
          <div style={{ position: "absolute", right: 40, top: 38, fontFamily: MONO, fontSize: 22, color: "#fff" }}>{data.agency.name}</div>
          {/* the player photo lives in the left column of the main part */}
          <div style={{ position: "absolute", left: 0, top: 110, width: 430, height: T.stub - 110, overflow: "hidden", background: `color-mix(in srgb, ${accent} 18%, transparent)` }}>
            {data.photoUrl && (
              <img
                src={data.photoUrl}
                alt=""
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: 0,
                  height: (T.stub - 110) * 1.05 * (params.playerScale ?? 1),
                  maxWidth: "none",
                  transform: `translateX(calc(-50% + ${params.playerX ?? 0}px))`,
                  ...cutMask(data.cut),
                }}
              />
            )}
          </div>
          <div style={{ position: "absolute", left: 470, right: 40, top: 150 }}>
            {boarding ? (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: from ? "space-between" : "flex-end", gap: 20 }}>
                  {from ? <div style={{ fontFamily: SLAB, fontSize: 104, lineHeight: 1 }}>{cityCode(from.name)}</div> : <div style={{ fontFamily: MONO, fontSize: 20 }}>TO</div>}
                  <svg width={120} height={50}>
                    <path d="M5 45 Q60 -10 115 45" fill="none" stroke={INK} strokeWidth={3} strokeDasharray="6 8" />
                    <text x={52} y={22} fontSize={22}>✈</text>
                  </svg>
                  <div style={{ fontFamily: SLAB, fontSize: 104, lineHeight: 1, color: accent }}>{cityCode(to?.name)}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 16, marginTop: 6 }}>
                  <span>{from?.city ?? from?.name ?? ""}</span>
                  <span>{to?.city ?? to?.name ?? ""}</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: SLAB, fontSize: 64, lineHeight: 1 }}>{(data.club?.name ?? "").toUpperCase()}</div>
                <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: "0.4em", margin: "10px 0", color: accent }}>VERSUS</div>
                <div style={{ fontFamily: SLAB, fontSize: 64, lineHeight: 1 }}>{opponentOf(data).toUpperCase()}</div>
              </>
            )}
            <div style={{ height: 3, background: INK, margin: "34px 0 26px" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
              {label("PASSENGER", `${content.firstName} ${content.lastName}`.toUpperCase())}
              {label(boarding ? "CONTRATO" : "DATA", boarding ? (content.until ? `ATÉ ${content.until}` : content.kicker) : content.date ?? "")}
              {label(boarding ? "PORTA" : "HORA", boarding ? data.player.number : content.time ?? "")}
              {label(boarding ? "CLASS" : "STADIUM", boarding ? "STAR" : (content.venue || data.club?.stadium || "").replace(/^Estádio /, ""))}
            </div>
          </div>
          <div style={{ position: "absolute", left: 30, right: 30, top: T.stub, borderTop: `4px dotted ${INK}66` }} />
          <div style={{ position: "absolute", left: 50, right: 50, top: T.stub + 40, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {label("SEC", data.player.number || "07", true)}
            {label("ROW", content.lastName.slice(0, 1).toUpperCase(), true)}
            {label("SEAT", content.kicker.split(" ")[0], true)}
            <div style={{ fontFamily: BARCODE, fontSize: 110, lineHeight: 1 }}>{`${content.lastName}${data.player.number}`.toUpperCase()}</div>
          </div>
          <div style={{ position: "absolute", left: 50, bottom: 40, fontFamily: MONO, fontSize: 16, letterSpacing: "0.12em", opacity: 0.7 }}>
            {content.subline.toUpperCase()}
          </div>
        </div>
      </div>
      <Film strength={1.1} />
    </div>
  );
}
