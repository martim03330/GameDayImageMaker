import { agencyEmailTemplates, agencyScanState, agencyTemplates, emailSearchState, listAgencies } from "@/lib/agencies/store";
import { AgencyBoard } from "./AgencyBoard";

export const dynamic = "force-dynamic";

/**
 * Agências: Portuguese player agencies (Transfermarkt) to offer weekly matchday edits to. The user's own
 * service — nothing here mentions NEYOD. The app prepares the list and the messages; the user checks
 * whether each agency already has a designer and sends the messages himself from his Instagram.
 */
export default async function AgenciesPage() {
  const agencies = listAgencies();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Agências</h1>
        <p className="muted mt-1.5 max-w-3xl">
          Agências de jogadores sediadas em Portugal (Transfermarkt). Abre o Instagram de cada uma, marca se já tem designer e envia a proposta às que não
          têm: o primeiro fim de semana é grátis para 3 jogadores. Até ~20 mensagens por dia, do teu Instagram.
        </p>
      </div>
      <div className="card">
        <h2 className="section-title">Preços</h2>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-5">
          {[
            ["Matchday", "15 € / jogador / fim de semana"],
            ["A partir de 10 jogadores", "12 € / jogador"],
            ["Matchday + Golo", "20 €"],
            ["Completo", "28 € (matchday, golo, equipa da semana, estatísticas)"],
            ["Teste", "1.º fim de semana grátis, 3 jogadores"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-neutral-50 p-3">
              <div className="font-medium">{k}</div>
              <div className="muted">{v}</div>
            </div>
          ))}
        </div>
        <h3 className="mt-5 text-sm font-semibold">Agências sem Instagram (por email): criação e gestão da conta</h3>
        <div className="mt-2 grid gap-3 text-sm sm:grid-cols-4">
          {[
            ["Criação + identidade", "250 € (uma vez)"],
            ["Gestão · até 10 jogadores", "450 € / mês"],
            ["Gestão · 11 a 25", "750 € / mês"],
            ["Gestão · 26+", "990 € / mês"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-neutral-50 p-3">
              <div className="font-medium">{k}</div>
              <div className="muted">{v}</div>
            </div>
          ))}
        </div>
      </div>
      <AgencyBoard
        agencies={agencies}
        templates={await agencyTemplates()}
        emailTemplates={await agencyEmailTemplates()}
        emailSearch={emailSearchState()}
        scan={agencyScanState()}
        contactedToday={agencies.filter((a) => a.contacted_at?.slice(0, 10) === today).length}
      />
    </div>
  );
}
