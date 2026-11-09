"use client";

import { useFormStatus } from "react-dom";

/** Form submit button that shows a pending label while the server action runs. */
export function SubmitButton({ children, pending, className = "btn" }: { children: React.ReactNode; pending: string; className?: string }) {
  const { pending: busy } = useFormStatus();
  return (
    <button className={className} disabled={busy}>
      {busy ? pending : children}
    </button>
  );
}
