"use client";

import { useTransition } from "react";
import { setEditPostedAction, setEditReleasedAction } from "@/app/actions";

/** Recuperar (the look can be proposed again for that player) / Bloquear; and a way out of the history. */
export function ReleaseButton({ id, released }: { id: string; released: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="ml-auto flex gap-1.5">
      <button
        disabled={pending}
        onClick={() => start(() => setEditReleasedAction(id, !released))}
        className="rounded-full border border-neutral-200 px-3 py-0.5 text-xs hover:bg-neutral-50 disabled:opacity-50"
      >
        {released ? "Bloquear" : "Recuperar"}
      </button>
      <button
        disabled={pending}
        title="Tirar do histórico (não foi publicada)"
        onClick={() => {
          if (confirm("Tirar esta edit do histórico? O estilo volta a ficar disponível para este jogador.")) start(() => setEditPostedAction(id, false));
        }}
        className="rounded-full border border-neutral-200 px-2 py-0.5 text-xs text-neutral-500 hover:bg-neutral-50 disabled:opacity-50"
      >
        ×
      </button>
    </div>
  );
}
