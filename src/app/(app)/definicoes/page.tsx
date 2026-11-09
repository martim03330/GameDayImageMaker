/* eslint-disable @next/next/no-img-element */
import { generateScenesAction, saveSettingsAction } from "@/app/actions";
import { AutoRefresh } from "@/components/AutoRefresh";
import { listClubs, listPlayers, getSettings } from "@/lib/repo";
import { listScenes, sceneQueue, TARGET_PER_CLUB } from "@/lib/scenes";
import { fileUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const s = getSettings();
  const ours = new Set(listPlayers().map((p) => p.club_id));
  const clubs = listClubs().filter((c) => ours.has(c.id));
  const queue = sceneQueue();
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">Definições</h1>
      <form action={saveSettingsAction} className="card space-y-4">
        <div>
          <label className="label">Nome da agência</label>
          <input name="agency_name" defaultValue={s.agency_name} className="input" />
        </div>
        <div>
          <label className="label">Logótipo da agência (PNG transparente, versão branca)</label>
          {s.agency_logo && (
            <div className="mb-2 inline-block rounded-md bg-neutral-900 p-3">
              <img src={fileUrl(s.agency_logo)!} alt="" className="h-12" />
            </div>
          )}
          <input type="file" name="agency_logo" accept="image/*" className="block text-sm" />
          {s.agency_logo && (
            <label className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
              <input type="checkbox" name="remove_logo" /> Remover logótipo
            </label>
          )}
        </div>
        <div>
          <label className="label">Boards do Pinterest (um por linha)</label>
          <p className="muted mb-2 text-xs">
            Endereços de pastas públicas, por exemplo https://pt.pinterest.com/dareck525/d/. A app lê-as uma vez por dia e guarda os pins novos em Inspiração.
          </p>
          <textarea name="pinterest_boards" defaultValue={s.pinterest_boards} rows={3} className="input font-mono text-xs" />
        </div>
        <button className="btn">Guardar</button>
      </form>

      <section className="card space-y-5">
        <AutoRefresh active={queue.length > 0} />
        <div>
          <h2 className="text-lg font-semibold">Cenários</h2>
          <form action={saveSettingsAction} className="mt-2">
            <input type="hidden" name="agency_name" value={s.agency_name} />
            <input type="hidden" name="pinterest_boards" value={s.pinterest_boards} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="scenes_paused" defaultChecked={s.scenes_paused === "1"} />
              Parar a geração de cenários (usa a placa gráfica e aquece o Mac)
            </label>
            <button className="btn-ghost mt-2 text-sm">Guardar</button>
          </form>
          <p className="muted mt-1 text-sm">
            Fundos gerados neste Mac para cada clube (estádio, noite, túnel, chuva, fumo…), nunca com pessoas. Cada clube chega sozinho a {TARGET_PER_CLUB}; a
            app gera mais quando o Mac está parado, e cada jogador recebe primeiro os que ainda não usou.
          </p>
          {queue.length > 0 && (
            <p className="mt-2 text-sm text-blue-700">
              A gerar: {queue.map((j) => `${j.club} (${j.edit_id ? "para uma edit" : `${j.count} cenários`}${j.status === "running" ? ", em curso" : ", na fila"})`).join(" · ")} — cerca de 2 min por cenário.
            </p>
          )}
        </div>
        {clubs.map((c) => {
          const scenes = listScenes(c.id);
          return (
            <div key={c.id} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium">
                  {c.name} <span className="muted text-sm font-normal">· {scenes.length} cenários</span>
                </span>
                <form action={generateScenesAction}>
                  <input type="hidden" name="club_id" value={c.id} />
                  <button className="btn-ghost text-sm">+ Gerar mais 4</button>
                </form>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {scenes.slice(0, 16).map((sc) => (
                  <img key={sc.id} src={fileUrl(sc.file)!} alt={sc.kind} title={sc.prompt} className="aspect-[4/5] w-full rounded object-cover" />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
