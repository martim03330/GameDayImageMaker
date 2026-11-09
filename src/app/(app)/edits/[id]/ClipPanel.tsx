"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clipStateAction, saveClipAction } from "@/app/actions";
import { cropRect, type Anchor } from "@/lib/clips/path";

type PathData = { det: { fps: number; W: number; H: number; n: number; shots: [number, number][] }; x: number[]; y: number[]; bx: number[]; by: number[]; used: boolean[] } | null;
type State = { status: string; progress: string; anchors: Anchor[]; zoom: number; trim_start: number; trim_end: number | null; path: PathData };

/** The looks' video slots are 16:9: the window drawn here is the one the export will crop. */
const SLOT_ASPECT = 16 / 9;

/**
 * Video story editor: the clip with the virtual camera's window drawn over it. The window follows the
 * ball the app found; where it is wrong, pause and click the ball — the click becomes a point the path
 * must pass through and the path is recomputed at once. Zoom and trim are saved with the clip.
 */
export function ClipPanel({ clipId, editId, initial }: { clipId: string; editId: string; initial: State }) {
  const [s, setS] = useState<State>(initial);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [sharp, setSharp] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fps = s.path?.det.fps ?? 30;
  const frame = Math.min((s.path?.det.n ?? 1) - 1, Math.max(0, Math.round(t * fps)));

  // While the ball is being tracked: poll the status.
  useEffect(() => {
    if (s.status !== "a seguir") return;
    const id = setInterval(async () => {
      const next = await clipStateAction(clipId);
      if (next) setS(next);
    }, 2000);
    return () => clearInterval(id);
  }, [s.status, clipId]);

  // Keep the playhead in state while playing (for the overlay).
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (video.current) setT(video.current.currentTime);
      raf = requestAnimationFrame(tick);
    };
    if (playing) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const draw = useCallback(() => {
    const c = canvas.current;
    const v = video.current;
    const p = s.path;
    if (!c || !v || !p) return;
    const { W, H } = p.det;
    c.width = c.clientWidth;
    c.height = c.clientHeight;
    const k = c.width / W;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, c.width, c.height);
    const r = cropRect(p.x[frame], p.y[frame], W, H, s.zoom, SLOT_ASPECT);
    // Dim what stays outside the story.
    g.fillStyle = "rgba(0,0,0,.45)";
    g.fillRect(0, 0, c.width, c.height);
    g.clearRect(r.x * k, r.y * k, r.w * k, r.h * k);
    g.strokeStyle = "#22c55e";
    g.lineWidth = 3;
    g.strokeRect(r.x * k, r.y * k, r.w * k, r.h * k);
    // Where the app thinks the ball is (white; faint where it is only interpolated) and the user's clicks
    // near this moment (amber). The window does not chase it: it moves only when the ball nears its edge.
    g.fillStyle = p.used[frame] ? "#ffffff" : "rgba(255,255,255,.45)";
    g.beginPath();
    g.arc(p.bx[frame] * k, p.by[frame] * k, 5, 0, 7);
    g.fill();
    for (const a of s.anchors) {
      if (Math.abs(a.f - frame) > fps / 3) continue;
      g.strokeStyle = "#f59e0b";
      g.lineWidth = 3;
      g.beginPath();
      g.arc(a.x * k, a.y * k, 12, 0, 7);
      g.stroke();
    }
  }, [s, frame, fps]);
  useEffect(draw, [draw]);

  async function save(patch: Parameters<typeof saveClipAction>[1]) {
    setS((prev) => ({ ...prev, ...(patch as Partial<State>) }));
    const path = await saveClipAction(clipId, patch);
    const next = await clipStateAction(clipId);
    if (next) setS({ ...next, path: path ?? next.path });
  }

  /** A click on the video: the ball is here, at this moment. */
  async function addAnchor(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!s.path) return;
    video.current?.pause();
    const rect = e.currentTarget.getBoundingClientRect();
    const k = s.path.det.W / rect.width;
    const a = { f: frame, x: (e.clientX - rect.left) * k, y: (e.clientY - rect.top) * k };
    await save({ anchors: [...s.anchors.filter((x) => Math.abs(x.f - frame) > 1), a].sort((p, q) => p.f - q.f) });
  }

  function seek(sec: number) {
    if (!video.current) return;
    video.current.currentTime = Math.max(0, sec);
    setT(video.current.currentTime);
  }

  async function exportVideo() {
    setBusy("export");
    setMsg("");
    try {
      const res = await fetch(`/api/edits/${editId}/clip${sharp ? "?sharp=1" : ""}`, { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? "story.mp4";
      a.click();
      const saved = decodeURIComponent(res.headers.get("X-Saved-To") ?? "");
      setMsg(`Vídeo pronto ✓ (MP4 1080×1920, 60 fps, com som)${saved ? ` — guardado em ${saved}` : ""}`);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  const fmt = (sec: number) => `${Math.floor(sec / 60)}:${(sec % 60).toFixed(1).padStart(4, "0")}`;
  const duration = s.path ? s.path.det.n / fps : 0;
  // Measured on this Mac: RIFE ~0.5 s per 60 fps frame, Real-ESRGAN ~1.3 s more. Only the first export of a
  // cut pays it; changing the look, letters or colours reuses the processed video (seconds).
  const outFrames = Math.max(0, (s.trim_end ?? duration) - s.trim_start) * 60;
  const mins = (outFrames * (sharp ? 1.8 : 0.5)) / 60;
  const eta = `~${Math.max(1, Math.round(mins))}–${Math.max(2, Math.round(mins * 1.5))} min, ou segundos se já estiver processado`;

  return (
    <div className="card mb-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="section-title">Vídeo · seguir a bola</h2>
        <span className="muted">
          {s.status === "a seguir"
            ? `A seguir a bola… ${s.progress ? `(${s.progress} imagens)` : "(na fila)"}`
            : s.status === "pronto"
              ? "Pronto. O ponto branco é a bola; se estiver errado, pausa e clica em cima da bola. A janela verde segue-a com suavidade."
              : s.status}
        </span>
        <label className="ml-auto flex items-center gap-2 text-sm" title="Real-ESRGAN: recupera detalhe no recorte ampliado. Mais lento; ideal para o vídeo final.">
          <input type="checkbox" checked={sharp} disabled={busy === "export"} onChange={(e) => setSharp(e.target.checked)} />
          Nitidez extra (~3× mais lento)
        </label>
        <button type="button" className="btn" disabled={s.status !== "pronto" || busy === "export"} onClick={exportVideo}>
          {busy === "export" ? `A exportar… (${eta})` : "Exportar vídeo (MP4, 60 fps)"}
        </button>
      </div>
      {msg && <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">{msg}</div>}

      <div className="relative w-full max-w-4xl">
        <video
          ref={video}
          src={`/api/clips/${clipId}/video`}
          className="block w-full rounded-lg bg-black"
          playsInline
          onPlay={() => setPlaying(true)}
          onPause={() => (setPlaying(false), setT(video.current?.currentTime ?? 0))}
          onSeeked={() => setT(video.current?.currentTime ?? 0)}
          onLoadedMetadata={draw}
        />
        {s.path && <canvas ref={canvas} onClick={addAnchor} className="absolute inset-0 h-full w-full cursor-crosshair rounded-lg" title="Clica na bola para corrigir o seguimento neste momento" />}
      </div>

      <div className="flex max-w-4xl flex-wrap items-center gap-2">
        <button type="button" className="btn px-3 py-1.5" onClick={() => (video.current?.paused ? video.current.play() : video.current?.pause())}>
          {playing ? "Pausa" : "Play"}
        </button>
        <button type="button" className="btn-ghost px-2 py-1.5" title="Uma imagem atrás" onClick={() => seek(t - 1 / fps)}>
          ◀︎
        </button>
        <button type="button" className="btn-ghost px-2 py-1.5" title="Uma imagem à frente" onClick={() => seek(t + 1 / fps)}>
          ▶︎
        </button>
        <input type="range" className="flex-1" min={0} max={duration || 1} step={1 / fps} value={t} onChange={(e) => seek(Number(e.target.value))} />
        <span className="w-24 text-right text-sm tabular-nums">
          {fmt(t)} / {fmt(duration)}
        </span>
      </div>

      <div className="flex max-w-4xl flex-wrap items-center gap-6 text-sm">
        <label className="flex items-center gap-2">
          Zoom
          <input type="range" min={1} max={2.5} step={0.1} defaultValue={s.zoom} onMouseUp={(e) => save({ zoom: Number(e.currentTarget.value) })} onChange={(e) => setS({ ...s, zoom: Number(e.target.value) })} />
          <span className="tabular-nums">{s.zoom.toFixed(1)}×</span>
        </label>
        <span className="flex items-center gap-2">
          Corte: {fmt(s.trim_start)} → {fmt(s.trim_end ?? duration)}
          <button type="button" className="btn-ghost px-2 py-1" onClick={() => save({ trim_start: t })}>
            Início = agora
          </button>
          <button type="button" className="btn-ghost px-2 py-1" onClick={() => save({ trim_end: t })}>
            Fim = agora
          </button>
          <button type="button" className="btn-ghost px-2 py-1" onClick={() => save({ trim_start: 0, trim_end: null })}>
            Vídeo todo
          </button>
        </span>
      </div>

      {s.anchors.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="muted">Correções:</span>
          {s.anchors.map((a) => (
            <span key={a.f} className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-amber-900">
              <button type="button" className="hover:underline" onClick={() => seek(a.f / fps)}>
                {fmt(a.f / fps)}
              </button>
              <button type="button" title="Remover" className="px-1 hover:text-red-600" onClick={() => save({ anchors: s.anchors.filter((x) => x.f !== a.f) })}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
