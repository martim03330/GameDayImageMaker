"use client";

import Link from "next/link";
import { useState } from "react";
import { copyEditAction } from "@/app/actions";

type PlayerOption = { id: string; name: string; club: string };

/**
 * "Mesma edit para outros jogadores": copies this look and title to the chosen players (each with their
 * own game and best photo), so the agency's posts that day look like one series. Then exports them all.
 */
export function Series({ editId, playerName, players, save }: { editId: string; playerName: string; players: PlayerOption[]; save: () => Promise<unknown> }) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [sameColors, setSameColors] = useState(true);
  const [busy, setBusy] = useState(false);
  const [made, setMade] = useState<{ id: string; name: string }[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const toggle = (id: string) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? "";

  async function copy() {
    if (!chosen.length || busy) return;
    setBusy(true);
    setStatus(null);
    try {
      await save();
      const out = await copyEditAction({ editId, playerIds: chosen, sameColors });
      setMade(out.map((e) => ({ id: e.id, name: nameOf(e.playerId) })));
      setChosen([]);
      setStatus(`${out.length} edit${out.length === 1 ? "" : "s"} criada${out.length === 1 ? "" : "s"} ✓ — abre cada uma para conferir a foto antes de exportar.`);
    } catch (e) {
      setStatus(`Não foi possível criar (${e instanceof Error ? e.message : "erro"}).`);
    } finally {
      setBusy(false);
    }
  }

  /** One after the other (each export opens Chromium): this one first, then the copies. */
  async function exportAll(format: "post" | "story" = "post") {
    if (busy) return;
    setBusy(true);
    await save();
    const all = [{ id: editId, name: playerName }, ...made];
    let ok = 0;
    for (const [i, e] of all.entries()) {
      setStatus(`A exportar ${i + 1} de ${all.length} (${e.name})…`);
      try {
        const res = await fetch(`/api/edits/${e.id}/export?format=${format}`, { cache: "no-store" });
        if (!res.ok) throw new Error();
        const blob = await res.blob();
        const name = /filename="([^"]+)"/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? `edit-${i + 1}.jpg`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        ok++;
      } catch {
        /* reported in the summary below */
      }
    }
    setStatus(ok === all.length ? `${ok} ${format === "story" ? "histórias" : "edits"} exportadas para Instagram ✓ — estão em Transferências › GameDay.` : `Exportadas ${ok} de ${all.length}. Abre as que faltam e exporta à mão.`);
    setBusy(false);
  }

  if (!players.length) return null;

  return (
    <div className="card space-y-4 p-5">
      <div>
        <span className="label">Mesma edit para outros jogadores</span>
        <p className="muted mt-1 text-xs">Mesmo estilo e título para todos, cada um com o seu jogo, emblemas e a melhor foto dele.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {players.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => toggle(p.id)}
            className={`rounded-lg border px-3 py-2 text-left text-sm ${chosen.includes(p.id) ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 hover:bg-neutral-50"}`}
          >
            <div className="font-medium">{p.name}</div>
            {p.club && <div className={`text-xs ${chosen.includes(p.id) ? "text-neutral-300" : "text-neutral-500"}`}>{p.club}</div>}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={sameColors} onChange={(e) => setSameColors(e.target.checked)} />
        Mesmas cores em todos (desliga para usar as cores do clube de cada um)
      </label>
      <div className="flex flex-wrap gap-2">
        <button className="btn" onClick={copy} disabled={busy || !chosen.length}>
          {chosen.length ? `Aplicar a ${chosen.length} jogador${chosen.length === 1 ? "" : "es"}` : "Escolhe os jogadores"}
        </button>
        {made.length > 0 && (
          <>
            <button className="btn-ghost" onClick={() => exportAll("post")} disabled={busy}>
              ⬇ Exportar todas ({made.length + 1})
            </button>
            <button className="btn-ghost" onClick={() => exportAll("story")} disabled={busy}>
              ⬇ Todas em história ({made.length + 1})
            </button>
          </>
        )}
      </div>
      {status && <p className={`text-sm ${status.startsWith("Não foi") || status.startsWith("Exportadas") ? "text-red-700" : "text-green-700"}`}>{status}</p>}
      {made.length > 0 && (
        <ul className="space-y-1 text-sm">
          {made.map((e) => (
            <li key={e.id}>
              <Link href={`/edits/${e.id}`} target="_blank" className="underline hover:text-neutral-600">
                Abrir a edit de {e.name} ↗
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
