import { notFound } from "next/navigation";
import { getEdit } from "@/lib/repo";
import { buildRenderData } from "@/lib/render-data";
import { EditCanvas, hasNativeStory } from "@/templates";
import { Motion } from "./Motion";

export const dynamic = "force-dynamic";

/**
 * Bare page the exporter captures.
 * ?format=story → 1080×1920: looks that support it draw a native story; others centre the post and carry
 * its own ground on above and below (first / last rows stretched), so the story has no bars.
 * ?motion=1 → layers are animated (the video exporter drives the timeline frame by frame).
 */
export default async function RenderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ format?: string; motion?: string; native?: string; slide?: string }> }) {
  const edit = getEdit((await params).id);
  if (!edit) notFound();
  const sp = await searchParams;
  const story = sp.format === "story";
  // Carousels (form posts): ?slide=2 draws that slide, with the photo chosen for it.
  const slide = sp.slide === "2" ? 2 : sp.slide === "3" ? 3 : sp.slide === "1" ? 1 : undefined;
  const data = buildRenderData({
    playerId: edit.player_id,
    postType: edit.post_type,
    photoId: (slide && edit.content.slidePhotos?.[slide - 1]) || edit.photo_id,
    params: slide ? { ...edit.params, slide } : edit.params,
    content: edit.content,
  });
  // The same look with no player and no text-bearing photo: only its ground, for the story's extensions.
  const ground = { ...data, photoUrl: null, photo2Url: null, cutouts: [], insetUrl: null };
  const post = (
    <div id="post" style={{ width: 1080, height: 1350, position: "relative", overflow: "hidden" }}>
      <EditCanvas data={data} />
    </div>
  );

  // ?native=1 forces the native story layout (to try a look before it is flagged `story`).
  if (story && (hasNativeStory(edit.params.templateId) || sp.native === "1")) {
    return (
      <>
        <div id="canvas" style={{ width: 1080, height: 1920, position: "relative", overflow: "hidden" }}>
          <div id="post" style={{ width: 1080, height: 1920, position: "relative", overflow: "hidden" }}>
            <EditCanvas data={{ ...data, canvasH: 1920 }} />
          </div>
        </div>
        {sp.motion && <Motion />}
      </>
    );
  }

  return (
    <>
      {story ? (
        <div id="canvas" style={{ width: 1080, height: 1920, position: "relative", overflow: "hidden", background: "#000" }}>
          {/* The look's own ground carried on above and below the post: its first and last rows (drawn without
              the player, so legs and arms are never smeared) stretched to fill the story, so the post reads as
              one full-screen picture — no bars, no blur. The post sits in Instagram's safe middle band. */}
          <div id="story-bg" style={{ position: "absolute", inset: 0 }}>
            {(["top", "bottom"] as const).map((edge) => {
              // Next to the post: its own edge row, stretched (exact colour, no seam). Further out: a row 40px in
              // from a softly blurred copy, so grain never turns into streaks; the two cross-fade.
              const far = `linear-gradient(${edge === "top" ? "to top" : "to bottom"}, transparent 0, transparent 40px, #000 200px)`;
              const strip = (blur: boolean) => (
                <div style={{ position: "absolute", left: 0, [edge]: 0, width: 1080, height: 2, overflow: "hidden", transform: "scaleY(143)", transformOrigin: edge === "top" ? "0 0" : "0 100%" }}>
                  <div style={{ position: "absolute", left: 0, top: edge === "top" ? (blur ? -40 : 0) : blur ? -1308 : -1348, width: 1080, height: 1350, filter: blur ? "blur(10px)" : undefined }}>
                    <EditCanvas data={ground} />
                  </div>
                </div>
              );
              return (
                <div key={edge} style={{ position: "absolute", left: 0, [edge]: 0, width: 1080, height: 286, overflow: "hidden" }}>
                  {strip(false)}
                  <div style={{ position: "absolute", inset: 0, WebkitMaskImage: far, maskImage: far }}>{strip(true)}</div>
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", left: 0, top: 285 }}>{post}</div>
        </div>
      ) : (
        <div id="canvas" style={{ width: 1080, height: 1350 }}>
          {post}
        </div>
      )}
      {sp.motion && <Motion />}
    </>
  );
}
