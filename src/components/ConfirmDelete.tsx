"use client";

/** Small delete form that asks for confirmation first. */
export function ConfirmDelete({
  action,
  id,
  label = "Apagar",
  question,
  className = "btn-danger",
}: {
  action: (fd: FormData) => void | Promise<void>;
  id: string;
  label?: string;
  question: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(question)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className={className}>{label}</button>
    </form>
  );
}
