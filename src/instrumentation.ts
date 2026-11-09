/** Starts the background sync (Node.js runtime only; the import is dropped from the edge bundle). */
export async function register() {
  // NO_BACKGROUND=1: a second server (the dev one used to try new looks on port 3101) must not sync too.
  if (process.env.NEXT_RUNTIME === "nodejs" && !process.env.NO_BACKGROUND) {
    await import("./instrumentation-node");
  }
}
