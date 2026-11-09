"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

/** "← Voltar": goes back in history when there is one, otherwise to `fallback`. */
export function BackLink({ fallback, label = "Voltar" }: { fallback: string; label?: string }) {
  const router = useRouter();
  return (
    <Link
      href={fallback}
      onClick={(e) => {
        if (window.history.length > 1) {
          e.preventDefault();
          router.back();
        }
      }}
      className="mb-6 inline-flex items-center gap-2 rounded-lg px-2 py-1 -ml-2 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
    >
      ← {label}
    </Link>
  );
}
