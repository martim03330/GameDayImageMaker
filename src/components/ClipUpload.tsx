import { createClipAction } from "@/app/actions";
import { SubmitButton } from "@/components/SubmitButton";

/** The goal / assist video upload (player page and Criar): the app tracks the ball and opens the story. */
export function ClipUpload({ playerId }: { playerId: string }) {
  return (
    <form action={createClipAction.bind(null, playerId)} className="flex flex-wrap items-end gap-4">
      <label className="block">
        <span className="label">Vídeo (MP4 / MOV)</span>
        <input type="file" name="video" accept="video/mp4,video/quicktime,.mp4,.mov,.m4v" required className="text-sm" />
      </label>
      <label className="block">
        <span className="label">Lance</span>
        <select name="kind" className="input w-40">
          <option value="goal">Golo</option>
          <option value="assist">Assistência</option>
        </select>
      </label>
      <label className="block">
        <span className="label">Resultado</span>
        <input name="score" className="input w-28" placeholder="3-0" />
      </label>
      <SubmitButton pending="A carregar…">Criar story com vídeo</SubmitButton>
    </form>
  );
}
