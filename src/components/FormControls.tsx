"use client";

/* eslint-disable @next/next/no-img-element */
import type { EditContent, TemplateId, TemplateParams } from "@/lib/types";
import { TEMPLATES } from "@/templates";
import type { PhotoOption } from "./ContentFields";

const CHECKER = "repeating-conic-gradient(#e5e5e5 0% 25%, #fafafa 0% 50%) 50% / 12px 12px";
const SLIDES = ["1 · Capa", "2 · Registo", "3 · Números"] as const;

/** Looks that draw the 3-slide form carousel. */
export const FORM_LOOKS = TEMPLATES.filter((t) => t.fits.includes("form"));

/**
 * The form carousel's controls: its style, how many of his latest games count, and the photo of each of the
 * three slides (cover, record, numbers). Shared by Criar and the editor.
 */
export function FormControls(props: {
  photos: PhotoOption[];
  /** The photo of each slide (index 0..2). */
  slidePhotos: (string | null)[];
  onSlidePhoto: (slide: number, id: string) => void;
  params: TemplateParams;
  onParams: (p: TemplateParams) => void;
  content?: EditContent;
}) {
  const { params } = props;
  const ready = props.photos.filter((p) => p.kind === "player" && p.status === "done");
  return (
    <div className="space-y-5">
      <div>
        <span className="label">Estilo</span>
        <div className="flex flex-wrap gap-2">
          {FORM_LOOKS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => props.onParams({ ...params, templateId: t.id as TemplateId })}
              className={`rounded-full px-3 py-1 text-sm ${params.templateId === t.id ? "bg-neutral-900 text-white" : "border border-neutral-200 hover:bg-neutral-50"}`}
            >
              {t.label.replace(/^Forma · /, "").replace(/ \(3 imagens\)$/, "")}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span className="label">Últimos jogos que contam</span>
        <div className="flex gap-2">
          {[5, 6, 8, 10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => props.onParams({ ...params, formGames: n })}
              className={`rounded-full px-3 py-1 text-sm ${(params.formGames ?? 6) === n ? "bg-neutral-900 text-white" : "border border-neutral-200 hover:bg-neutral-50"}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      {SLIDES.map((label, i) => (
        <div key={label} className="space-y-2">
          <span className="text-sm font-medium">Foto da imagem {label}</span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {ready.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => props.onSlidePhoto(i, p.id)}
                className={`relative aspect-[3/4] w-14 shrink-0 overflow-hidden rounded-md border-2 ${props.slidePhotos[i] === p.id ? "border-blue-600" : "border-transparent"}`}
                style={{ background: CHECKER }}
              >
                <img src={p.url} alt="" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
