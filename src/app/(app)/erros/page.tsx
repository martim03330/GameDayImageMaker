import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { resolveFeedbackAction } from "@/app/actions";
import { Preview } from "@/components/Preview";
import { SubmitButton } from "@/components/SubmitButton";
import { DATA_DIR } from "@/lib/db";
import { getPlayer, listFeedback, recentlyResolvedFeedback } from "@/lib/repo";
import { renderContext } from "@/lib/render-data";
import { FEEDBACK_TAGS, POST_TYPES } from "@/lib/types";
import { TEMPLATES } from "@/templates";
import { composeRenderData } from "@/templates/compose";

export const dynamic = "force-dynamic";

const tagLabel = (id: string) => FEEDBACK_TAGS.find((t) => t.id === id)?.label ?? id;

/** Latest report written by the nightly fixing routine (scripts/auto-fix), if any. */
function lastAutoRun(): { when: Date; text: string } | null {
  const dir = path.join(DATA_DIR, "auto-fix", "reports");
  try {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
    const last = files.at(-1);
    if (!last) return null;
    const full = path.join(dir, last);
    return { when: fs.statSync(full).mtime, text: fs.readFileSync(full, "utf8").trim() };
  } catch {
    return null;
  }
}

/** Everything reported with "Tem erros". Open reports push the look down in the variants until marked as fixed. */
export default function ErrorsPage() {
  const reports = listFeedback();
  const fixed = recentlyResolvedFeedback(12);
  const auto = lastAutoRun();
  const byTemplate = Object.entries(
    reports.reduce<Record<string, number>>((acc, r) => ((acc[r.template_id] = (acc[r.template_id] ?? 0) + 1), acc), {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Erros reportados</h1>
        <p className="muted mt-1.5">
          Cada reporte faz o programa evitar esse estilo logo (3 reportes num tipo de publicação e deixa de aparecer) e fica na lista para ser
          corrigido.
        </p>
      </div>

      <div className="card space-y-3 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="label">Correção automática</span>
          <span className="muted text-sm">
            {auto ? `Última vez: ${auto.when.toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}` : "Ainda não correu"} · corre
            todas as noites
          </span>
        </div>
        <p className="text-sm text-neutral-600">
          Todas as noites o Claude lê os erros abertos, vê as edições, corrige os estilos e marca aqui o que fez. Antes de mexer guarda uma
          cópia de segurança, e se algo deixar de funcionar desfaz a alteração.
        </p>
        {auto && <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 text-xs text-neutral-700">{auto.text}</pre>}
      </div>

      {fixed.length > 0 && (
        <div className="space-y-3">
          <span className="label">Corrigidos recentemente</span>
          <ul className="space-y-2">
            {fixed.map((f) => (
              <li key={f.id} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs text-green-700">{f.resolved_by === "auto" ? "automático" : "manual"}</span>
                <span className="font-medium">{TEMPLATES.find((t) => t.id === f.template_id)?.label ?? f.template_id}</span>
                <span className="text-neutral-500">{f.tags.map(tagLabel).join(", ")}</span>
                {f.resolution && <span className="text-neutral-700">— {f.resolution}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {byTemplate.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {byTemplate.map(([id, n]) => (
            <span key={id} className="rounded-full bg-white px-3 py-1 text-sm shadow-sm">
              {TEMPLATES.find((t) => t.id === id)?.label ?? id} <span className="text-red-600">×{n}</span>
            </span>
          ))}
        </div>
      )}

      {reports.length === 0 ? (
        <div className="card text-sm text-neutral-600">Sem erros por resolver.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((r) => {
            const player = r.player_id ? getPlayer(r.player_id) : null;
            return (
              <div key={r.id} className="card space-y-4 p-5">
                {player && r.content && (
                  <div className="overflow-hidden rounded-lg">
                    <Preview data={composeRenderData(renderContext(player.id), { postType: r.post_type, photoId: r.photo_id, params: r.params, content: r.content })} />
                  </div>
                )}
                <div className="text-sm">
                  <span className="font-medium">{TEMPLATES.find((t) => t.id === r.template_id)?.label}</span>
                  <span className="text-neutral-500">
                    {" "}
                    · {POST_TYPES.find((t) => t.id === r.post_type)?.label} · {player ? `${player.first_name} ${player.last_name}` : "—"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {r.tags.map((t) => (
                    <span key={t} className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-700">
                      {tagLabel(t)}
                    </span>
                  ))}
                </div>
                {r.note && <p className="text-sm text-neutral-700">“{r.note}”</p>}
                <div className="flex items-center justify-between">
                  {r.edit_id ? (
                    <Link href={`/edits/${r.edit_id}`} className="text-sm text-blue-600 hover:underline">
                      Abrir edit
                    </Link>
                  ) : (
                    <span />
                  )}
                  <form action={resolveFeedbackAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <SubmitButton className="btn-ghost py-1.5" pending="…">
                      ✓ Resolvido
                    </SubmitButton>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
