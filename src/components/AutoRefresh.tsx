"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Refreshes server data periodically while `active` (e.g. photos still being cut out). */
export function AutoRefresh({ active, every = 3000 }: { active: boolean; every?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => router.refresh(), every);
    return () => clearInterval(t);
  }, [active, every, router]);
  return null;
}
