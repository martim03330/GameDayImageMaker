import { db } from "@/lib/db";
import { allTemplates, braveKey, braveUsage, collegeScanState, igSearchState, listProspects, sampleSource, scanState } from "@/lib/prospects";
import { listFixtures } from "@/lib/repo";
import { Clients } from "./Clients";
import { ProspectBoard } from "./ProspectBoard";

export const dynamic = "force-dynamic";

/**
 * Prospeção: Liga 3 and Campeonato de Portugal players to offer edits to. The app prepares the list, a
 * sample matchday for each player and the message; the user sends it himself from his own Instagram.
 */
export default function ProspectingPage() {
  const prospects = listProspects().map((p) => ({
    ...p,
    // His next opponent (known once the sample synced him): the message names it.
    opponent: p.player_id ? (listFixtures(p.player_id)[0]?.opponent ?? "") : "",
  }));
  // Model looks: the agency's recent matchday edits (the samples copy one of them onto each prospect).
  const models = (
    db()
      .prepare(
        `SELECT e.id, e.params, e.created_at, p.first_name, p.last_name FROM edits e JOIN players p ON p.id = e.player_id
         WHERE e.post_type = 'matchday' AND p.role = 'player' AND json_extract(e.params, '$.agencyId') IS NULL ORDER BY e.created_at DESC LIMIT 30`,
      )
      .all() as { id: string; params: string; created_at: string; first_name: string; last_name: string }[]
  ).map((m) => ({ id: m.id, label: `${JSON.parse(m.params).templateId} · ${m.first_name} ${m.last_name} · ${m.created_at.slice(0, 10)}` }));
  // Clients: prospects marked "cliente", with their photos and edits (their internal player's).
  const clients = prospects
    .filter((p) => p.status === "cliente")
    .map((p) => {
      const pid = p.player_id;
      const count = (sql: string) => (pid ? ((db().prepare(sql).pluck().get(pid) as number) ?? 0) : 0);
      return {
        id: p.id,
        name: p.name,
        club: p.club,
        division: p.division,
        thumb: p.thumb_url,
        playerId: pid,
        photos: count("SELECT COUNT(*) FROM photos WHERE player_id = ? AND kind = 'player'"),
        edits: count("SELECT COUNT(*) FROM edits WHERE player_id = ?"),
        lastEdit: pid ? ((db().prepare("SELECT id FROM edits WHERE player_id = ? ORDER BY created_at DESC LIMIT 1").pluck().get(pid) as string | undefined) ?? null) : null,
      };
    });
  const today = new Date().toISOString().slice(0, 10);
  const contactedToday = prospects.filter((p) => p.contacted_at?.slice(0, 10) === today).length;
  const source = sampleSource();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Prospeção</h1>
        <p className="muted mt-1.5 max-w-3xl">
          Jogadores da Liga 3 e do Campeonato de Portugal (lidos do zerozero) e os internacionais do futebol (NCAA D1 e D2) e do basquetebol (NCAA D1) universitário dos EUA. A 1ª mensagem oferece-lhe uma edição para o jogo deste fim de semana (no basquetebol, para o próximo jogo)
          e pede-lhe uma foto com qualidade; quando ele a mandar, preparas a edit e escolhes o melhor estilo. És tu que envias, do teu Instagram, um a
          um: até ~20 por dia para a conta não ser limitada.
        </p>
      </div>
      <Clients clients={clients} />
      <ProspectBoard
        prospects={prospects}
        models={models}
        modelId={source}
        templates={{ soccer: allTemplates("soccer"), basketball: allTemplates("basketball") }}
        scan={scanState()}
        college={collegeScanState()}
        ig={igSearchState()}
        hasBraveKey={!!braveKey()}
        braveUsage={braveUsage()}
        contactedToday={contactedToday}
      />
    </div>
  );
}
