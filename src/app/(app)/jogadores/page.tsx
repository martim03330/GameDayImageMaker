/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getClub, listPlayers } from "@/lib/repo";
import { fileUrl } from "@/lib/storage";
import { deletePlayerAction } from "@/app/actions";
import { ConfirmDelete } from "@/components/ConfirmDelete";
import { AddPlayer } from "./AddPlayer";

export const dynamic = "force-dynamic";

export default function PlayersPage() {
  const players = listPlayers().filter((p) => p.role !== "coach");

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-semibold tracking-tight">Jogadores</h1>

      <div className="card">
        <h2 className="section-title mb-6">Adicionar jogador</h2>
        <AddPlayer />
      </div>

      <div className="card divide-y divide-neutral-100 p-0">
        {players.length === 0 && <p className="muted p-7">Sem jogadores.</p>}
        {players.map((p) => {
          const club = getClub(p.club_id);
          const img = p.photo_url ?? fileUrl(club?.crest);
          return (
            <div key={p.id} className="flex items-center gap-2 pr-5 hover:bg-neutral-50">
              <Link href={`/jogadores/${p.id}`} className="flex min-w-0 flex-1 items-center gap-4 px-7 py-4">
                {img ? (
                  <img src={img} alt="" className="h-11 w-11 rounded-full bg-neutral-100 object-cover" />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-neutral-200" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium">
                    {p.first_name} {p.last_name}
                  </div>
                  <div className="muted">{[club?.name, club?.league, p.position].filter(Boolean).join(" · ")}</div>
                </div>
                <span className={`text-xs ${p.sync_error ? "text-red-600" : "text-neutral-400"}`}>
                  {p.sync_error
                    ? "Erro ao atualizar"
                    : p.last_sync
                      ? `Atualizado ${new Date(p.last_sync).toLocaleDateString("pt-PT")}`
                      : p.zerozero_url || p.transfermarkt_url
                        ? "Por atualizar"
                        : "Sem links"}
                </span>
              </Link>
              <ConfirmDelete
                action={deletePlayerAction}
                id={p.id}
                label="Apagar"
                question={`Apagar ${p.first_name} ${p.last_name}? Os jogos, fotos e edits dele também são apagados.`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
