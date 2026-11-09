import { shade, vivid } from "@/lib/color";
import { ARCHIVO_BLACK, cutMask, DMSERIF, Film, Furniture } from "./fx";
import { INK, Micro, Paper } from "./kit";
import { AgencyLogo, factRows } from "./shared";
import { CANVAS_H, CANVAS_W, type RenderData } from "./types";

/** Three moments side by side on colour discs, a stat under each (Georgia "Dawgs vs Knights" / chronophotography). */
export function Sequence({ data }: { data: RenderData }) {
  const { params, content } = data;
  const accent = vivid(params.primary === "#10131c" ? params.accent : params.primary);
  const discs = [accent, "#ffffff", shade(accent, -0.55)];
  const photos = data.cutouts.length ? data.cutouts : [];
  const facts = factRows(data);
  const fallback = [
    { value: data.player.number ? `#${data.player.number}` : "", label: content.lastName },
    { value: "", label: data.club?.name ?? "" },
    { value: "", label: data.player.position },
  ];
  const labels = [0, 1, 2].map((i) => facts[i] ?? fallback[i]);
  const h = 700 * (params.playerScale ?? 1);

  return (
    <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, overflow: "hidden", color: INK }}>
      <Paper color="#ecebe8" />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${INK}0d 1px, transparent 1px), linear-gradient(90deg, ${INK}0d 1px, transparent 1px)`, backgroundSize: "54px 54px" }} />
      <Furniture data={data} color={INK} accent={accent} />

      <div style={{ position: "absolute", left: 0, right: 0, top: 190, textAlign: "center", lineHeight: 0.9 }}>
        <span style={{ fontFamily: DMSERIF, fontStyle: "italic", fontSize: 130 * (params.textScale ?? 1) }}>{content.firstName} </span>
        <span style={{ fontFamily: ARCHIVO_BLACK, fontSize: 104 * (params.textScale ?? 1), textTransform: "uppercase", letterSpacing: "-0.02em" }}>{content.kicker.split(" ")[0]}</span>
        <Micro color={INK} style={{ marginTop: 16, opacity: 0.7 }}>
          {content.subline}
        </Micro>
      </div>

      {[0, 1, 2].map((i) => {
        const p = photos[i % Math.max(1, photos.length)];
        const cx = 190 + i * 350;
        const w = h * (p?.aspect ?? 0.5);
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: cx - 150, top: 640, width: 300, height: 300, borderRadius: "50%", background: discs[i], boxShadow: i === 1 ? `inset 0 0 0 2px ${INK}22` : undefined }} />
            <div style={{ position: "absolute", left: cx - 130, width: 260, bottom: 176, height: 30, borderRadius: "50%", background: "rgba(0,0,0,.35)", filter: "blur(10px)" }} />
            {p && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.url}
                alt=""
                style={{
                  position: "absolute",
                  height: h,
                  width: w,
                  left: cx - w / 2,
                  bottom: 190,
                  transform: `rotate(${(i - 1) * 3}deg) ${photos.length === 1 && i === 1 ? "scaleX(-1)" : ""}`,
                  filter: "contrast(1.05)",
                  ...cutMask(p.cut),
                }}
              />
            )}
            <div style={{ position: "absolute", left: cx - 160, width: 320, bottom: 88, textAlign: "center" }}>
              <div style={{ fontFamily: ARCHIVO_BLACK, fontSize: 48, lineHeight: 1 }}>{labels[i].value}</div>
              <Micro color={INK} style={{ marginTop: 6 }}>
                {labels[i].label}
              </Micro>
            </div>
          </div>
        );
      })}
      <AgencyLogo data={data} onLight height={28} style={{ position: "absolute", left: "50%", bottom: 30, transform: "translateX(-50%)" }} />
      <Film strength={1.1} />
    </div>
  );
}
