import { notFound } from "next/navigation";
import { getFeedback } from "@/lib/repo";
import { buildRenderData } from "@/lib/render-data";
import { EditCanvas } from "@/templates";

export const dynamic = "force-dynamic";

/** A reported look exactly as it was when "Tem erros" was pressed (used by the nightly fixing routine). */
export default async function FeedbackRenderPage({ params }: { params: Promise<{ id: string }> }) {
  const f = getFeedback((await params).id);
  if (!f || !f.player_id || !f.content) notFound();
  const data = buildRenderData({ playerId: f.player_id, postType: f.post_type, photoId: f.photo_id, params: f.params, content: f.content });
  return (
    <div id="canvas" style={{ width: 1080, height: 1350, position: "relative", overflow: "hidden" }}>
      <EditCanvas data={data} />
    </div>
  );
}
