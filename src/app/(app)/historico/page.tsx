/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Preview } from "@/components/Preview";
import { getClub, listPlayers, listPostedEdits } from "@/lib/repo";
import { renderContext } from "@/lib/render-data";
import { fileUrl } from "@/lib/storage";
import { POST_TYPES } from "@/lib/types";
import { TEMPLATES } from "@/templates";
import { composeRenderData } from "@/templates/compose";
import { ReleaseButton } from "./ReleaseButton";

export const dynamic = "force-dynamic";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** The weekend an edit was posted for: Saturday of that week (posts made Mon–Fri are for the coming weekend). */
function weekendOf(iso: string): { key: string; label: string } {
  const d = new Date(iso);
  const day = d.getDay(); // 0 = Sunday
  const sat = new Date(d);
  sat.setDate(d.getDate() + (day === 0 ? -1 : 6 - day));
  const sun = new Date(sat);
  sun.setDate(sat.getDate() + 1);
  const key = sat.toLocaleDateString("sv-SE");
  const label =
    sat.getMonth() === sun.getMonth()
      ? `${sat.getDate()}–${sun.getDate()} ${MONTHS[sat.getMonth()]} ${sat.getFullYear()}`
      : `${sat.getDate()} ${MONTHS[sat.getMonth()]} – ${sun.getDate()} ${MONTHS[sun.getMonth()]} ${sun.getFullYear()}`;
  return { key, label };
}

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

/** Edits chosen for each weekend: their looks are not proposed again for that player until recovered. */
export default function HistoryPage() {
  const edits = listPostedEdits();
  const players = Object.fromEntries(listPlayers().map((p) => [p.id, p]));
  const lookLabel = (id: string) => TEMPLATES.find((t) => t.id === id)?.label ?? id;
  const typeLabel = (id: string) => POST_TYPES.find((t) => t.id === id)?.label ?? id;

  const groups: { key: string; label: string; items: typeof edits }[] = [];
  for (const e of edits) {
    const w = weekendOf(e.posted_at!);
    let g = groups.find((x) => x.key === w.key);
    if (!g) groups.push((g = { ...w, items: [] }));
    g.items.push(e);
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Histórico</h1>
        <p className="muted mt-1.5 max-w-2xl">
          As edits escolhidas para cada fim de semana. O estilo de uma edit escolhida deixa de ser proposto a esse jogador, para não se repetir. Se quiseres voltar a usá-lo, carrega em «Recuperar».
        </p>
      </div>

      {groups.length === 0 && (
        <p className="card p-5 text-sm">
          Ainda não há nada aqui. Numa edit, carrega em <span className="font-medium">«Usar no fim de semana»</span> e ela aparece neste histórico.
        </p>
      )}

      {groups.map((g) => (
        <section key={g.key}>
          <h2 className="section-title mb-5">Fim de semana de {g.label}</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {g.items.map((e) => {
              const p = players[e.player_id];
              return (
                <div key={e.id} className={e.released ? "opacity-60" : ""}>
                  <Link href={`/edits/${e.id}`} className="block aspect-[4/5] overflow-hidden rounded-xl bg-neutral-200">
                    {e.output ? (
                      <img src={`${fileUrl(e.output)}?v=${encodeURIComponent(e.posted_at ?? "")}`} alt="" className="h-full w-full object-cover" />
                    ) : (
                      // Not exported yet: draw it live from the edit, so the weekend reads at a glance.
                      <Preview data={composeRenderData(renderContext(e.player_id), { postType: e.post_type, photoId: e.photo_id, params: e.params, content: e.content })} />
                    )}
                  </Link>
                  <div className="mt-2 text-sm font-medium">
                    {p ? `${p.first_name} ${p.last_name}`.trim() : "—"}
                    {p && getClub(p.club_id) && <span className="font-normal text-neutral-500"> · {getClub(p.club_id)!.short_name || getClub(p.club_id)!.name}</span>}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {lookLabel(e.params.templateId)} · {typeLabel(e.post_type)} · escolhida a {dayLabel(e.posted_at!)}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {e.released ? <span className="text-xs text-green-700">Estilo recuperado</span> : <span className="text-xs text-neutral-500">Estilo bloqueado para ele</span>}
                    <ReleaseButton id={e.id} released={!!e.released} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
