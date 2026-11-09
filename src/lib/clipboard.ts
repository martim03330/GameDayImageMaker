/**
 * Copies text inside the click itself. The old way (Clipboard API after opening Instagram) failed with
 * "Write permission denied": once the new tab takes focus the page may no longer write to the clipboard.
 * A hidden textarea + execCommand("copy") works synchronously in the click; the Clipboard API is the fallback.
 */
export function copyText(text: string): boolean {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  ta.remove();
  if (!ok) navigator.clipboard?.writeText(text).catch(() => alert("Não consegui copiar a mensagem: copia-a do quadro do modo envio."));
  return ok;
}
