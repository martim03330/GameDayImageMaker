"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { dismissInspirationAction, fetchInspirationAction } from "@/app/actions";

export function InspirationGrid({ items, hasBoards }: { items: { id: string; url: string; source: string; created_at: string }[]; hasBoards: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="btn"
          disabled={busy || !hasBoards}
          onClick={async () => {
            setBusy(true);
            setMsg("A ler os boards…");
            const n = await fetchInspirationAction();
            setMsg(n ? `${n} referências novas` : "Nada de novo desde a última vez");
            setBusy(false);
            router.refresh();
          }}
        >
          ⟳ Procurar agora
        </button>
        <span className="text-sm text-neutral-600">{msg ?? `${items.length} referências guardadas`}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
        {items.map((i) => (
          <div key={i.id} className="group relative">
            <a href={i.source} target="_blank" rel="noreferrer">
              <img src={i.url} alt="" className="w-full rounded-xl object-cover shadow-sm" />
            </a>
            <button
              type="button"
              title="Não interessa"
              onClick={async () => {
                await dismissInspirationAction(i.id);
                router.refresh();
              }}
              className="absolute top-2 right-2 hidden h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white group-hover:flex"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
