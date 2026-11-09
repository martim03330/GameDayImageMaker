"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { uploadPhotosAction } from "@/app/actions";
import type { PhotoKind } from "@/lib/types";

export function PhotoUploader({
  playerId,
  kind = "player",
  label = "Carregar fotos",
  multiple = true,
  onUploaded,
}: {
  playerId: string;
  kind?: PhotoKind;
  label?: string;
  multiple?: boolean;
  onUploaded?: (ids: string[]) => void;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const fd = new FormData();
    fd.set("player_id", playerId);
    fd.set("kind", kind);
    for (const f of Array.from(files)) fd.append("files", f);
    try {
      const ids = await uploadPhotosAction(fd);
      onUploaded?.(ids);
      router.refresh();
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <label
      className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-600 hover:border-neutral-500"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void upload(e.dataTransfer.files);
      }}
    >
      <span className="font-medium text-neutral-900">{busy ? "A carregar…" : label}</span>
      <span className="text-xs">Clica ou arrasta imagens para aqui</span>
      <input ref={input} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => upload(e.target.files)} />
    </label>
  );
}
