import { startInspirationWatch } from "./lib/inspiration";
import { startSceneWorker } from "./lib/scenes";
import { syncDue } from "./lib/sync";

/**
 * Background sync. Every 3 minutes: live score of games in progress (instant goal suggestions);
 * full refresh every 10 minutes around a player's game, every 3 hours otherwise.
 */
const g = globalThis as unknown as { syncTimer?: NodeJS.Timeout };
if (!g.syncTimer) {
  const run = () => syncDue().catch((e) => console.error("[sync]", e));
  setTimeout(run, 15_000);
  g.syncTimer = setInterval(run, 3 * 60 * 1000);
}

// Club scenery library: generated on this Mac in the background (see src/lib/scenes.ts).
startSceneWorker();

// Daily reference feed from the Pinterest boards set in Definições.
startInspirationWatch();
