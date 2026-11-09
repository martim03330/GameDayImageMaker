"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useTransition } from "react";
import { createPlayerAction, searchPlayersAction } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";

type Result = Awaited<ReturnType<typeof searchPlayersAction>>[number];

/** Adds a player, or a coach with role="coach" (same profile, listed under Treinadores). */
export function AddPlayer({ role = "player" }: { role?: "player" | "coach" }) {
  const coach = role === "coach";
  const [name, setName] = useState("");
  const [zz, setZz] = useState("");
  const [tm, setTm] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [searching, startSearch] = useTransition();

  const search = () =>
    startSearch(async () => {
      setResults(await searchPlayersAction(name));
    });

  // Clicking a chosen result again unselects it.
  const pick = (r: Result) => {
    if (r.source === "zerozero") setZz(zz === r.url ? "" : r.url);
    else setTm(tm === r.url ? "" : r.url);
  };

  return (
    <form action={createPlayerAction} className="space-y-6">
      <input type="hidden" name="role" value={role} />
      <div>
        <label className="label">{coach ? "Nome do treinador" : "Nome do jogador"}</label>
        <div className="flex gap-2">
          <input
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                search();
              }
            }}
            className="input"
            placeholder={coach ? "Bruno Conceição" : "Moisés Conceição"}
          />
          <button type="button" className="btn-ghost whitespace-nowrap" onClick={search} disabled={searching || name.trim().length < 3}>
            {searching ? "A procurar…" : "Procurar no zerozero / Transfermarkt"}
          </button>
        </div>
      </div>

      {results && (
        <div className="rounded-xl border border-neutral-200">
          {results.length === 0 && <p className="muted p-4">Nada encontrado. Cola os links à mão em baixo.</p>}
          {results.map((r) => {
            const chosen = r.url === zz || r.url === tm;
            return (
              <button
                key={r.url}
                type="button"
                onClick={() => pick(r)}
                className={`flex w-full items-center gap-4 border-b border-neutral-100 px-4 py-3 text-left last:border-0 hover:bg-neutral-50 ${chosen ? "bg-blue-50" : ""}`}
              >
                {r.photoUrl ? (
                  <img src={r.photoUrl} alt="" className="h-10 w-10 rounded-full bg-neutral-100 object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-neutral-200" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{r.name}</div>
                  <div className="muted truncate">{r.club ?? "—"}</div>
                </div>
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-600">{r.source === "zerozero" ? "zerozero" : "Transfermarkt"}</span>
                {chosen ? <span className="text-sm text-blue-700">✓ escolhido (clica para tirar)</span> : <span className="text-sm text-neutral-400">escolher</span>}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">Link zerozero</label>
          <div className="flex gap-2">
            <input name="zerozero_url" value={zz} onChange={(e) => setZz(e.target.value)} className="input" placeholder="https://www.zerozero.pt/jogador/…" />
            {zz && (
              <button type="button" className="btn-ghost px-3" onClick={() => setZz("")} title="Limpar">
                ✕
              </button>
            )}
          </div>
        </div>
        <div>
          <label className="label">Link Transfermarkt</label>
          <div className="flex gap-2">
            <input name="transfermarkt_url" value={tm} onChange={(e) => setTm(e.target.value)} className="input" placeholder="https://www.transfermarkt.pt/…/profil/spieler/…" />
            {tm && (
              <button type="button" className="btn-ghost px-3" onClick={() => setTm("")} title="Limpar">
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="muted">Com os links, a app vai buscar sozinha o perfil, o clube, o emblema, todos os jogos da época e os próximos jogos.</p>
      <SubmitButton pending="A adicionar e a buscar dados…">{coach ? "Adicionar treinador" : "Adicionar jogador"}</SubmitButton>
    </form>
  );
}
