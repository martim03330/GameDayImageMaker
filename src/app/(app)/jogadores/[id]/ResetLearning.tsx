"use client";

import { resetLearningAction } from "@/app/actions";

export function ResetLearning({ playerId }: { playerId: string }) {
  return (
    <button
      className="mt-4 text-sm text-red-600 hover:underline"
      onClick={() => {
        if (confirm("Apagar tudo o que a app aprendeu sobre este jogador?")) void resetLearningAction(playerId);
      }}
    >
      Recomeçar aprendizagem
    </button>
  );
}
