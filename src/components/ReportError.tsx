"use client";

import { useState } from "react";
import { reportErrorAction } from "@/app/actions";
import { FEEDBACK_TAGS, type EditContent, type FeedbackTag, type PostType, type TemplateParams } from "@/lib/types";

type Props = {
  playerId: string;
  editId?: string | null;
  photoId: string | null;
  postType: PostType;
  params: TemplateParams;
  content: EditContent;
  /** Small round button over a variant card instead of a full button. */
  compact?: boolean;
  onReported?: () => void;
};

/** "Tem erros" button: pick what is wrong in one or two taps, optional note. */
export function ReportError({ compact = false, onReported, ...edit }: Props) {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<FeedbackTag[]>([]);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const toggle = (t: FeedbackTag) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  async function send() {
    await reportErrorAction({ ...edit, tags, note });
    setSent(true);
    setOpen(false);
    setTags([]);
    setNote("");
    onReported?.();
  }

  return (
    <div className={compact ? "absolute top-3 right-3 z-10" : "relative"} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={
          compact
            ? `rounded-md px-2.5 py-1 text-xs font-medium ${sent ? "bg-amber-500 text-white" : "bg-black/65 text-white hover:bg-red-600"}`
            : `btn-ghost ${sent ? "border-amber-400 text-amber-700" : "hover:border-red-300 hover:text-red-700"}`
        }
      >
        {sent ? "✓ Reportado" : "⚠ Tem erros"}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-neutral-200 bg-white p-4 text-left text-neutral-900 shadow-xl">
          <div className="mb-3 text-sm font-medium">O que está mal?</div>
          <div className="flex flex-wrap gap-1.5">
            {FEEDBACK_TAGS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t.id)}
                className={`rounded-full px-3 py-1 text-xs ${tags.includes(t.id) ? "bg-red-600 text-white" : "bg-neutral-100 hover:bg-neutral-200"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (tags.length || note) && void send()}
            className="input mt-3"
            placeholder="Descrição (opcional)"
          />
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" className="btn-ghost py-1.5" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button type="button" className="btn py-1.5" disabled={!tags.length && !note.trim()} onClick={send}>
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
