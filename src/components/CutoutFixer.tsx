"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hand touch-up of a photo's cutout (api/photos/[id]/mask). The mask lives in an offscreen canvas as alpha
 * (opaque = part of him); the view draws the photo and tints red what is left out, so holes in the shirt or a
 * missing hand show at a glance. "Pintar" puts pixels back (their real colours are still in the cutout),
 * "Apagar" takes them out, "Tapar buracos" closes the small holes enclosed by his body in one go, and
 * "Reparar com IA" loads SAM's repaired matte (holes that touch his outline too) to check and touch up.
 * "É ele" / "Não é ele" drop green / red points (on him, on a team-mate or opponent stuck to him) and
 * "Separar jogador" takes the others out of the cutout.
 */
type Mode = "add" | "erase" | "keep" | "drop";
type Pt = { x: number; y: number };

const MAX_UNDO = 25;

export function CutoutFixer({ photoId, onClose, onSaved }: { photoId: string; onClose: () => void; onSaved: () => void }) {
  const view = useRef<HTMLCanvasElement>(null);
  const mask = useRef<HTMLCanvasElement | null>(null);
  const rgb = useRef<HTMLImageElement | null>(null);
  const undo = useRef<ImageData[]>([]);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [mode, setMode] = useState<Mode>("add");
  const [brush, setBrush] = useState(40);
  const [zoom, setZoom] = useState(1);
  const [result, setResult] = useState(false);
  const [busy, setBusy] = useState<string | null>("A carregar o recorte…");
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const [points, setPoints] = useState<{ keep: Pt[]; drop: Pt[] }>({ keep: [], drop: [] });
  const [, redraw] = useState(0);

  // Load the colours and the mask; the mask becomes the alpha of a white canvas.
  useEffect(() => {
    const load = (part: string) =>
      new Promise<HTMLImageElement>((ok, fail) => {
        const i = new Image();
        i.onload = () => ok(i);
        i.onerror = fail;
        i.src = `/api/photos/${photoId}/mask?part=${part}&t=${Date.now()}`;
      });
    Promise.all([load("rgb"), load("alpha")])
      .then(([c, a]) => {
        const m = document.createElement("canvas");
        m.width = a.naturalWidth;
        m.height = a.naturalHeight;
        const g = m.getContext("2d", { willReadFrequently: true })!;
        g.drawImage(a, 0, 0);
        const d = g.getImageData(0, 0, m.width, m.height);
        for (let i = 0; i < d.data.length; i += 4) {
          const v = d.data[i];
          d.data[i] = d.data[i + 1] = d.data[i + 2] = 255;
          d.data[i + 3] = v;
        }
        g.putImageData(d, 0, 0);
        mask.current = m;
        rgb.current = c;
        setSize({ w: m.width, h: m.height });
        setBusy(null);
      })
      .catch(() => setBusy("Não foi possível abrir o recorte."));
  }, [photoId]);

  // Draw: the photo, then red over what the mask leaves out (or, in "resultado", only what it keeps).
  useEffect(() => {
    const c = view.current;
    const m = mask.current;
    if (!c || !m || !rgb.current) return;
    c.width = m.width;
    c.height = m.height;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, c.width, c.height);
    g.drawImage(rgb.current, 0, 0, c.width, c.height);
    const o = document.createElement("canvas");
    o.width = c.width;
    o.height = c.height;
    const og = o.getContext("2d")!;
    if (result) {
      og.drawImage(m, 0, 0);
      og.globalCompositeOperation = "source-in";
      og.drawImage(rgb.current, 0, 0, c.width, c.height);
      g.fillStyle = "#1d2430";
      g.fillRect(0, 0, c.width, c.height);
      g.drawImage(o, 0, 0);
    } else {
      og.fillStyle = "rgba(230, 30, 60, .55)";
      og.fillRect(0, 0, o.width, o.height);
      og.globalCompositeOperation = "destination-out";
      og.drawImage(m, 0, 0);
      g.drawImage(o, 0, 0);
    }
  });

  const snapshot = () => {
    const m = mask.current!;
    undo.current.push(m.getContext("2d")!.getImageData(0, 0, m.width, m.height));
    if (undo.current.length > MAX_UNDO) undo.current.shift();
  };

  const toImage = (e: React.PointerEvent) => {
    const r = view.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * size!.w) / r.width, y: ((e.clientY - r.top) * size!.h) / r.height };
  };

  const paint = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const g = mask.current!.getContext("2d")!;
    g.save();
    g.globalCompositeOperation = mode === "add" ? "source-over" : "destination-out";
    g.strokeStyle = g.fillStyle = "#fff";
    g.lineWidth = brush;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(from.x, from.y);
    g.lineTo(to.x, to.y);
    g.stroke();
    g.restore();
    redraw((n) => n + 1);
  };

  // Holes: background regions not connected to the photo's border, up to 4% of his area (a real gap
  // between arm and body is usually bigger; anything filled by mistake comes out with "Apagar").
  const fillHoles = () => {
    const m = mask.current!;
    snapshot();
    const g = m.getContext("2d")!;
    const d = g.getImageData(0, 0, m.width, m.height);
    const W = m.width;
    const H = m.height;
    const n = W * H;
    const bg = new Uint8Array(n);
    let fig = 0;
    for (let i = 0; i < n; i++) {
      if (d.data[i * 4 + 3] < 128) bg[i] = 1;
      else fig++;
    }
    const seen = new Uint8Array(n);
    const stack = new Int32Array(n);
    const flood = (start: number, mark: (i: number) => void) => {
      let top = 0;
      stack[top++] = start;
      seen[start] = 1;
      while (top) {
        const i = stack[--top];
        mark(i);
        const x = i % W;
        const push = (j: number) => {
          if (bg[j] && !seen[j]) {
            seen[j] = 1;
            stack[top++] = j;
          }
        };
        if (x > 0) push(i - 1);
        if (x < W - 1) push(i + 1);
        if (i >= W) push(i - W);
        if (i < n - W) push(i + W);
      }
    };
    for (let x = 0; x < W; x++) for (const i of [x, (H - 1) * W + x]) if (bg[i] && !seen[i]) flood(i, () => {});
    for (let y = 0; y < H; y++) for (const i of [y * W, y * W + W - 1]) if (bg[i] && !seen[i]) flood(i, () => {});
    const limit = fig * 0.04;
    let filled = 0;
    for (let i = 0; i < n; i++) {
      if (!bg[i] || seen[i]) continue;
      const region: number[] = [];
      flood(i, (j) => region.push(j));
      if (region.length > limit) continue;
      for (const j of region) d.data[j * 4 + 3] = 255;
      filled++;
    }
    g.putImageData(d, 0, 0);
    setBusy(filled ? null : "Não encontrei buracos fechados — usa o pincel nos que tocam a borda.");
    redraw((x) => x + 1);
  };

  // A proposal from the server (repair / separate) replaces the mask on screen (undoable); nothing is saved
  // until "Guardar".
  const propose = async (res: Response, done: string) => {
    if (!res.ok) throw new Error(await res.text());
    const url = URL.createObjectURL(await res.blob());
    const img = await new Promise<HTMLImageElement>((ok, fail) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = fail;
      i.src = url;
    });
    URL.revokeObjectURL(url);
    snapshot();
    const m = mask.current!;
    const g = m.getContext("2d")!;
    g.clearRect(0, 0, m.width, m.height);
    g.drawImage(img, 0, 0, m.width, m.height);
    setBusy(done);
    redraw((n) => n + 1);
  };

  const separate = async () => {
    setBusy("A separar o jogador dos outros… (pode demorar até um minuto)");
    try {
      const xy = (ps: Pt[]) => ps.map((p) => [Math.round(p.x), Math.round(p.y)]);
      const res = await fetch(`/api/photos/${photoId}/mask?separate=1`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keep: xy(points.keep), drop: xy(points.drop) }) });
      await propose(res, "Separado — confirma em \"Ver resultado\". Se sobrar alguém, põe mais pontos vermelhos nele e separa outra vez.");
      setPoints({ keep: points.keep, drop: [] });
    } catch {
      setBusy("Não foi possível separar — confirma que há pelo menos um ponto verde em cima dele.");
    }
  };

  const repair = async () => {
    setBusy("A IA está a reparar o recorte… (pode demorar até um minuto)");
    try {
      await propose(await fetch(`/api/photos/${photoId}/mask?part=repair&t=${Date.now()}`), "Reparado — confirma em \"Ver resultado\" e guarda.");
    } catch {
      setBusy("Não foi possível reparar com IA.");
    }
  };

  const save = async () => {
    setBusy("A guardar…");
    const blob = await new Promise<Blob | null>((ok) => mask.current!.toBlob(ok, "image/png"));
    const res = await fetch(`/api/photos/${photoId}/mask`, { method: "POST", body: blob, headers: { "Content-Type": "image/png" } });
    if (!res.ok) return setBusy("Não foi possível guardar.");
    onSaved();
    onClose();
  };

  const restore = async () => {
    if (!confirm("Voltar ao recorte original desta foto? As correções feitas à mão perdem-se.")) return;
    setBusy("A repor…");
    const res = await fetch(`/api/photos/${photoId}/mask`, { method: "DELETE" });
    if (!res.ok) return setBusy("Esta foto não tem um recorte anterior para repor.");
    onSaved();
    onClose();
  };

  const btn = (on: boolean) => `rounded-md px-3 py-1.5 text-sm ${on ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="flex max-h-full w-full max-w-5xl flex-col gap-3 rounded-xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 font-semibold">Corrigir recorte</span>
          <button className={btn(mode === "add")} onClick={() => setMode("add")}>
            🖌 Pintar jogador
          </button>
          <button className={btn(mode === "erase")} onClick={() => setMode("erase")}>
            ⌫ Apagar
          </button>
          <span className="mx-1 h-6 w-px bg-neutral-200" />
          <button className={btn(mode === "keep")} onClick={() => setMode("keep")}>
            ✚ É ele
          </button>
          <button className={btn(mode === "drop")} onClick={() => setMode("drop")}>
            ✖ Não é ele
          </button>
          <button className={btn(false)} disabled={!size || !points.keep.length} onClick={separate}>
            Separar jogador
          </button>
          {(points.keep.length > 0 || points.drop.length > 0) && (
            <button className="text-xs text-neutral-500 underline" onClick={() => setPoints({ keep: [], drop: [] })}>
              limpar pontos
            </button>
          )}
          <span className="mx-1 h-6 w-px bg-neutral-200" />
          <label className="flex items-center gap-2 text-sm">
            Pincel
            <input type="range" min={6} max={200} value={brush} onChange={(e) => setBrush(+e.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            Zoom
            <input type="range" min={1} max={4} step={0.25} value={zoom} onChange={(e) => setZoom(+e.target.value)} />
          </label>
          <button
            className={btn(false)}
            disabled={!size}
            onClick={() => {
              // A few seconds on a big cutout: show the message first, then run.
              setBusy("A tapar buracos…");
              setTimeout(fillHoles, 30);
            }}
          >
            Tapar buracos
          </button>
          <button className={btn(false)} disabled={!size} onClick={repair}>
            ✦ Reparar com IA
          </button>
          <button
            className={btn(false)}
            disabled={!undo.current.length}
            onClick={() => {
              const d = undo.current.pop();
              if (d) mask.current!.getContext("2d")!.putImageData(d, 0, 0);
              redraw((n) => n + 1);
            }}
          >
            ↶ Desfazer
          </button>
          <button className={btn(result)} onClick={() => setResult((r) => !r)}>
            {result ? "Ver máscara" : "Ver resultado"}
          </button>
        </div>
        <p className="text-xs text-neutral-500">
          A vermelho está o que fica <b>fora</b> do recorte. Pinta por cima dos buracos na camisola ou do que falte (mão, cabelo); apaga o que sobre do fundo. As cores são as da foto original.
          {" "}Outro jogador colado a ele? Com <b>✚ É ele</b> clica no tronco, na cabeça e nas pernas dele; com <b>✖ Não é ele</b> clica em cada um dos outros; depois <b>Separar jogador</b>.
        </p>
        <div className="relative min-h-0 flex-1 overflow-auto rounded-lg bg-neutral-900" style={{ height: "70vh" }}>
          {size && (
            <div style={{ position: "relative", height: `${70 * zoom}vh`, aspectRatio: `${size.w} / ${size.h}`, margin: "0 auto" }}>
              <canvas
                ref={view}
                className="h-full w-full touch-none"
                style={{ cursor: mode === "keep" || mode === "drop" ? "crosshair" : "none" }}
                onPointerDown={(e) => {
                  if (mode === "keep" || mode === "drop") {
                    const p = toImage(e);
                    setPoints((ps) => ({ ...ps, [mode]: [...ps[mode], p] }));
                    return;
                  }
                  e.currentTarget.setPointerCapture(e.pointerId);
                  snapshot();
                  const p = toImage(e);
                  last.current = p;
                  paint(p, p);
                }}
                onPointerMove={(e) => {
                  const r = view.current!.getBoundingClientRect();
                  setCursor({ x: e.clientX - r.left, y: e.clientY - r.top });
                  if (!last.current) return;
                  const p = toImage(e);
                  paint(last.current, p);
                  last.current = p;
                }}
                onPointerUp={() => (last.current = null)}
                onPointerLeave={() => setCursor(null)}
              />
              {(["keep", "drop"] as const).flatMap((kind) =>
                points[kind].map((p, i) => (
                  <span
                    key={kind + i}
                    className="pointer-events-none absolute flex items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white shadow"
                    style={{ left: `${(p.x / size.w) * 100}%`, top: `${(p.y / size.h) * 100}%`, width: 20, height: 20, transform: "translate(-50%, -50%)", background: kind === "keep" ? "#16a34a" : "#dc2626" }}
                  >
                    {kind === "keep" ? "+" : "×"}
                  </span>
                )),
              )}
              {cursor && view.current && mode !== "keep" && mode !== "drop" && (
                <div
                  className="pointer-events-none absolute rounded-full border-2"
                  style={{
                    left: cursor.x,
                    top: cursor.y,
                    width: (brush * view.current.getBoundingClientRect().width) / size.w,
                    height: (brush * view.current.getBoundingClientRect().width) / size.w,
                    transform: "translate(-50%, -50%)",
                    borderColor: mode === "add" ? "#3b82f6" : "#f43f5e",
                  }}
                />
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {busy && <span className="text-sm text-neutral-600">{busy}</span>}
          <button className="ml-auto text-sm text-neutral-500 underline" onClick={restore}>
            Repor recorte original
          </button>
          <button className={btn(false)} onClick={onClose}>
            Cancelar
          </button>
          <button className="btn" disabled={!size} onClick={save}>
            Guardar recorte
          </button>
        </div>
      </div>
    </div>
  );
}
