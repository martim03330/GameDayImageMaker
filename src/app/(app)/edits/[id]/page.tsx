import { notFound } from "next/navigation";
import { aiEnabled } from "@/lib/ai";
import { getClub, getEdit, getPlayer, hiddenLooks, listClubs, listPhotos, listPlayers } from "@/lib/repo";
import { defaultStyle, renderContext } from "@/lib/render-data";
import { fileUrl } from "@/lib/storage";
import { clipAnchors, clipPath, getClip } from "@/lib/clips/store";
import { ClipPanel } from "./ClipPanel";
import { Editor } from "./Editor";

export const dynamic = "force-dynamic";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const edit = getEdit((await params).id);
  if (!edit) notFound();
  const player = getPlayer(edit.player_id)!;
  const photos = listPhotos(player.id).map((p) => ({
    id: p.id,
    url: fileUrl(p.cutout_status === "done" ? p.cutout : p.file)!,
    kind: p.kind,
    status: p.cutout_status,
  }));

  // Video stories: the ball-following clip editor above the usual look editor.
  const clip = edit.post_type === "clip" && edit.params.clipId ? getClip(edit.params.clipId) : null;
  const clipPanel = clip ? (
    <ClipPanel
      clipId={clip.id}
      editId={edit.id}
      initial={{ status: clip.status, progress: clip.progress, anchors: clipAnchors(clip), zoom: clip.zoom, trim_start: clip.trim_start, trim_end: clip.trim_end, path: clip.status === "pronto" ? await clipPath(clip.id) : null }}
    />
  ) : null;

  return (
    <>
    {clipPanel}
    <Editor
      edit={edit}
      playerName={`${player.first_name} ${player.last_name}`}
      clubColors={(({ primary, accent }) => ({ primary, accent }))(defaultStyle(getClub(player.club_id)))}
      aiOn={aiEnabled()}
      ctx={renderContext(player.id)}
      photos={photos}
      clubs={listClubs().map((c) => ({ id: c.id, name: c.name }))}
      hiddenLooks={hiddenLooks()}
      otherPlayers={listPlayers()
        .filter((p) => p.id !== player.id)
        .map((p) => ({ id: p.id, name: `${p.first_name} ${p.last_name}`.trim(), club: getClub(p.club_id)?.name ?? "" }))}
    />
    </>
  );
}
