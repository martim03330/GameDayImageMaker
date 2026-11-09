import Link from "next/link";
import { getPlayer, hiddenLooks, listPlayers } from "@/lib/repo";
import { defaultContent, playerStyle, renderContext } from "@/lib/render-data";
import { POST_TYPES, variedContent, type PostType } from "@/lib/types";
import { TEMPLATES } from "@/templates";
import { Catalogue } from "./Catalogue";

export const dynamic = "force-dynamic";

/** Every look side by side for one player and post type, to compare styles at a glance. */
export default async function CataloguePage({ searchParams }: { searchParams: Promise<{ player?: string; type?: string; alt?: string; framing?: string }> }) {
  const sp = await searchParams;
  const players = listPlayers();
  const player = getPlayer(sp.player ?? players[0]?.id ?? "") ?? players[0];
  if (!player) return <p className="muted">Sem jogadores.</p>;
  const type = (POST_TYPES.some((t) => t.id === sp.type) ? sp.type : "matchday") as PostType;
  const ctx = renderContext(player.id);
  const photos = Object.entries(ctx.photos)
    .filter(([, p]) => p.kind === "player" && p.cutoutUrl)
    .map(([id, p]) => ({ id, bust: !!p.bust, kit: p.kit ?? 0.5, feet: !p.bust && (p.cut?.bottom ?? 0) < 0.05 }))
    .sort((a, b) => b.kit - a.kit);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Catálogo de estilos</h1>
        <p className="muted mt-1.5">
          Todos os estilos com os dados reais do jogador. Os que não se usam neste tipo de publicação aparecem esbatidos. &ldquo;Retirar&rdquo; tira um estilo de
          vez: deixa de aparecer nas variantes e no editor (pode repor-se aqui em baixo).
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {players.map((p) => (
          <Link key={p.id} href={`/catalogo?player=${p.id}&type=${type}`} className={p.id === player.id ? "btn" : "btn-ghost"}>
            {p.first_name} {p.last_name}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {POST_TYPES.map((t) => (
          <Link key={t.id} href={`/catalogo?player=${player.id}&type=${t.id}`} className={t.id === type ? "btn" : "btn-ghost"}>
            {t.label}
          </Link>
        ))}
      </div>
      <Catalogue
        ctx={ctx}
        postType={type}
        style={playerStyle(player)}
        hidden={hiddenLooks()}
        framing={(["full", "knees", "waist", "chest"] as const).find((f) => f === sp.framing)}
        content={variedContent(defaultContent(player, type), type, sp.alt ? Number(sp.alt) : undefined)}
        photos={photos}
        looks={TEMPLATES.map((t) => ({ id: t.id, label: t.label, fits: t.fits.includes(type), photo: t.photo ?? "full", feet: !!t.feet, fixedFrame: !!t.fixedFrame }))}
      />
    </div>
  );
}
