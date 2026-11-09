"use client";

/* eslint-disable @next/next/no-img-element */
import type { EditContent, TemplateParams } from "@/lib/types";
import type { PhotoOption } from "./ContentFields";

const CHECKER = "repeating-conic-gradient(#e5e5e5 0% 25%, #fafafa 0% 50%) 50% / 12px 12px";

/**
 * The welcome post's three photos, each with its own size: the portrait in the middle, the black-and-white
 * one on the left and him playing, laid over the portrait in the middle. Lets the user pick and resize
 * them without asking anyone.
 */
export function WelcomeControls(props: {
  photos: PhotoOption[];
  mainId: string | null;
  onMain: (id: string) => void;
  content: EditContent;
  onContent: (c: EditContent) => void;
  params: TemplateParams;
  onParams: (p: TemplateParams) => void;
}) {
  const { photos, content, params } = props;
  const ready = photos.filter((p) => p.kind === "player" && p.status === "done");

  const slot = (
    title: string,
    hint: string,
    chosen: string | null | undefined,
    pick: (id: string) => void,
    size: number,
    setSize: (v: number) => void,
  ) => (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-[11px] text-neutral-500">{hint}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {ready.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => pick(p.id)}
            className={`relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-md border-2 ${chosen === p.id ? "border-blue-600" : "border-transparent"}`}
            style={{ background: CHECKER }}
          >
            <img src={p.url} alt="" className="h-full w-full object-contain" />
          </button>
        ))}
      </div>
      <label className="flex items-center gap-3 text-xs text-neutral-600">
        Tamanho
        <input type="range" min={0.2} max={1.5} step={0.05} value={size} onChange={(e) => setSize(Number(e.target.value))} className="flex-1" />
        <span className="w-10 text-right tabular-nums">{Math.round(size * 100)}%</span>
        {size !== 1 && (
          <button type="button" onClick={() => setSize(1)} className="text-[11px] underline">
            repor
          </button>
        )}
      </label>
    </div>
  );

  return (
    <div className="space-y-5">
      {slot("Foto do meio", "a principal", props.mainId, props.onMain, params.playerScale ?? 1, (v) => props.onParams({ ...params, playerScale: v }))}
      {slot(
        "Foto da esquerda",
        "preto e branco",
        content.backdropPhotoId,
        (id) => props.onContent({ ...content, backdropPhotoId: id }),
        content.ghostScale ?? 1,
        (v) => props.onContent({ ...content, ghostScale: v }),
      )}
      {slot(
        "Foto a jogar",
        "ao centro, à frente",
        content.actionPhotoId,
        (id) => props.onContent({ ...content, actionPhotoId: id }),
        content.actionScale ?? 1,
        (v) => props.onContent({ ...content, actionScale: v }),
      )}
    </div>
  );
}
