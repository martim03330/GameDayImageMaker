"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clientPlayerAction } from "@/app/actions";

export type Client = { id: string; name: string; club: string; division: string; thumb: string; playerId: string | null; photos: number; edits: number; lastEdit: string | null };

/**
 * The paying clients (prospects marked "cliente"): kept here, never in the agency's Jogadores list, and their
 * edits never carry the NEYOD logo. From here: his photos and data, the full Criar page with every look,
 * and his latest edit.
 */
export function Clients({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  // His internal player is created the first time it is needed, then the page opens.
  const go = async (c: Client, to: "fotos" | "criar") => {
    setBusy(c.id + to);
    const pid = c.playerId ?? (await clientPlayerAction(c.id));
    setBusy(null);
    if (pid) router.push(to === "fotos" ? `/jogadores/${pid}?from=clientes` : `/criar?player=${pid}`);
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="section-title">Clientes</h2>
        <span className="muted">Muda o estado de um jogador para &quot;cliente&quot; e ele aparece aqui. Sem logo da NEYOD.</span>
      </div>
      {clients.length === 0 ? (
        <p className="muted">Ainda não há clientes.</p>
      ) : (
        <div className="divide-y divide-neutral-100">
          {clients.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-4 py-3">
              {c.thumb ? <img src={c.thumb} alt="" className="h-12 w-12 rounded-full bg-neutral-100 object-cover" /> : <div className="h-12 w-12 rounded-full bg-neutral-100" />}
              <div className="min-w-48 flex-1">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-neutral-500">
                  {c.club} · {c.division} · {c.photos} {c.photos === 1 ? "foto" : "fotos"} · {c.edits} {c.edits === 1 ? "edit" : "edits"}
                </div>
              </div>
              <button type="button" className="btn-ghost" disabled={!!busy} onClick={() => go(c, "fotos")}>
                {busy === c.id + "fotos" ? "A abrir…" : "Fotos e dados"}
              </button>
              <button type="button" className="btn" disabled={!!busy} onClick={() => go(c, "criar")}>
                {busy === c.id + "criar" ? "A abrir…" : "Criar edit"}
              </button>
              {c.lastEdit && (
                <Link href={`/edits/${c.lastEdit}`} className="text-sm text-blue-600 hover:underline">
                  Última edit ↗
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
