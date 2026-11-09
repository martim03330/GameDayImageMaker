/* eslint-disable @next/next/no-img-element */
import { listInspiration } from "@/lib/inspiration";
import { getSettings } from "@/lib/repo";
import { fileUrl } from "@/lib/storage";
import { InspirationGrid } from "./InspirationGrid";

export const dynamic = "force-dynamic";

/** References collected from the Pinterest boards: the raw material for new looks. */
export default function InspirationPage() {
  const boards = (getSettings().pinterest_boards ?? "").split(/[\n,]+/).filter((b) => b.trim());
  const items = listInspiration().map((i) => ({ id: i.id, url: fileUrl(i.file)!, source: i.source, created_at: i.created_at }));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Inspiração</h1>
        <p className="muted mt-1.5">
          Referências que a app vai buscar todos os dias aos teus boards do Pinterest. Guarda lá o que gostares; aqui ficam as novidades, para servirem de base a estilos novos.
        </p>
      </div>
      {boards.length === 0 && (
        <p className="card p-5 text-sm">
          Ainda não há nenhum board configurado. Vai a <span className="font-medium">Definições</span> e cola lá o endereço da tua pasta do Pinterest.
        </p>
      )}
      <InspirationGrid items={items} hasBoards={boards.length > 0} />
    </div>
  );
}
