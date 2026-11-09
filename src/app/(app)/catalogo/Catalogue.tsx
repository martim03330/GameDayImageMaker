"use client";

import { useTransition } from "react";
import { toggleLookAction } from "@/app/actions";
import { Preview } from "@/components/Preview";
import type { EditContent, Framing, PostType, TemplateId, TemplateParams } from "@/lib/types";
import { composeRenderData, type RenderContext } from "@/templates/compose";

export function Catalogue(props: {
  ctx: RenderContext;
  postType: PostType;
  style: TemplateParams;
  content: EditContent;
  photos: { id: string; bust: boolean; kit: number; feet: boolean }[];
  looks: { id: TemplateId; label: string; fits: boolean; photo: "full" | "bust" | "any"; feet: boolean; fixedFrame: boolean }[];
  /** Forces one framing on every look (used by the automatic layout check). */
  framing?: Framing;
  /** Looks the user removed: shown last, greyed, with "Repor". */
  hidden: string[];
}) {
  const [pending, start] = useTransition();
  const cycle: Framing[] = ["waist", "full", "chest", "knees"];
  let k = 0;
  const feetPhoto = props.photos.find((p) => p.feet)?.id ?? null;
  const pick = (want: string) => {
    const pool = want === "any" ? props.photos : props.photos.filter((p) => p.bust === (want === "bust"));
    return (pool[0] ?? props.photos[0])?.id ?? null;
  };
  const off = (id: string) => props.hidden.includes(id);
  const looks = [...props.looks]
    .sort((a, b) => Number(off(a.id)) - Number(off(b.id)) || Number(b.fits) - Number(a.fits)).map((l) => ({ ...l, framing: l.fixedFrame ? undefined : props.framing ?? cycle[k++ % cycle.length] }));
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
      {looks.map((l) => (
        <div key={l.id} className={l.fits && (!l.feet || feetPhoto) && !off(l.id) ? "" : "opacity-40"}>
          <div className="overflow-hidden rounded-xl shadow-sm" data-look={l.id} data-fits={!off(l.id) && l.fits && (!l.feet || feetPhoto) && (l.photo !== "full" || props.photos.some((p) => !p.bust)) ? "1" : "0"}>
            <Preview
              data={composeRenderData(props.ctx, {
                postType: props.postType,
                photoId: l.feet ? feetPhoto ?? pick(l.photo) : pick(l.photo),
                params: { ...props.style, templateId: l.id, framing: l.framing },
                content: props.content,
              })}
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-sm font-medium">
            <span>
              {l.label}
              {off(l.id) && <span className="ml-2 text-xs font-normal text-neutral-500">retirado</span>}
              {l.feet && !feetPhoto && <span className="ml-2 text-xs font-normal text-amber-700">precisa de foto com os pés</span>}
            </span>
            <button
              disabled={pending}
              onClick={() => start(() => toggleLookAction(l.id))}
              className="rounded-full border border-neutral-200 px-3 py-0.5 text-xs font-normal hover:bg-neutral-50 disabled:opacity-50"
            >
              {off(l.id) ? "Repor" : "Retirar"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
