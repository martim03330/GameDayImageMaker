/**
 * Minimal polite HTTP layer for scraping: desktop Chrome UA, pt-PT, in-memory
 * cache (10 min) and >=1.1s spacing between requests to the same host.
 * Server-side only.
 */

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

// Wikimedia asks automated clients for an identifying agent and rate-limits browser ones (Wikidata answers 429).
const WIKIMEDIA_AGENT = "GameDayImageMaker/1.0 (local sports-graphics tool; wikimedia api)";
const isWikimedia = (host: string) => /(^|\.)(wikimedia|wikipedia|wikidata)\.org$/.test(host);
const agentFor = (host: string) => (isWikimedia(host) ? WIKIMEDIA_AGENT : USER_AGENT);

const CACHE_TTL_MS = 10 * 60 * 1000;
const MIN_GAP_MS = 1100;
const TIMEOUT_MS = 20_000;

type CacheEntry<T> = { expires: number; value: Promise<T> };
const cache = new Map<string, CacheEntry<unknown>>();
const nextSlotByHost = new Map<string, number>();

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Reserve a time slot for the host so concurrent callers are also spaced out. */
async function throttle(host: string) {
  const now = Date.now();
  const slot = Math.max(now, nextSlotByHost.get(host) ?? 0);
  // Wikimedia's API rate-limits bursts (429 with retry-after ~30s): space its calls more.
  nextSlotByHost.set(host, slot + (isWikimedia(host) ? 2500 : MIN_GAP_MS));
  if (slot > now) await sleep(slot - now);
}

export class SourceFetchError extends Error {
  constructor(
    message: string,
    public readonly url: string,
    public readonly status?: number,
    public readonly retryAfter?: number,
  ) {
    super(message);
    this.name = "SourceFetchError";
  }
}

async function rawFetch(url: string, accept: string, retries = 2): Promise<Response> {
  const host = new URL(url).host;
  try {
    return await fetchOnce(url, accept, host);
  } catch (e) {
    // Rate-limited by Wikimedia: wait what it asks (≤ 60s) and try again.
    if (!(e instanceof SourceFetchError) || e.status !== 429 || !isWikimedia(host) || retries <= 0) throw e;
    await sleep(Math.min(60, e.retryAfter ?? 30) * 1000);
    return rawFetch(url, accept, retries - 1);
  }
}

async function fetchOnce(url: string, accept: string, host: string): Promise<Response> {
  await throttle(host);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": agentFor(host),
        "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
        Accept: accept,
      },
      redirect: "follow",
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const hint =
        res.status === 403 || res.status === 429
          ? " (the site may be rate-limiting or blocking automated requests; try again later)"
          : "";
      throw new SourceFetchError(`HTTP ${res.status} ${res.statusText} while fetching ${url}${hint}`, url, res.status, Number(res.headers.get("retry-after")) || undefined);
    }
    return res;
  } catch (e) {
    if (e instanceof SourceFetchError) throw e;
    const msg = (e as Error)?.name === "AbortError" ? `timeout after ${TIMEOUT_MS}ms` : String((e as Error)?.message ?? e);
    throw new SourceFetchError(`Network error fetching ${url}: ${msg}`, url);
  } finally {
    clearTimeout(timer);
  }
}

function decode(buf: ArrayBuffer, contentType: string | null): string {
  const m = /charset=([^;]+)/i.exec(contentType ?? "");
  let charset = (m?.[1] ?? "utf-8").trim().toLowerCase();
  try {
    return new TextDecoder(charset).decode(buf);
  } catch {
    charset = "utf-8";
    return new TextDecoder(charset).decode(buf);
  }
}

function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (hit && hit.expires > Date.now()) return hit.value;
  const value = fn();
  cache.set(key, { expires: Date.now() + CACHE_TTL_MS, value });
  value.catch(() => cache.delete(key));
  return value;
}

export type TextResponse = { text: string; finalUrl: string };

export function fetchText(url: string): Promise<TextResponse> {
  return cached(`text:${url}`, async () => {
    const res = await rawFetch(url, "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    const buf = await res.arrayBuffer();
    return { text: decode(buf, res.headers.get("content-type")), finalUrl: res.url || url };
  });
}

export function fetchJson<T = unknown>(url: string): Promise<T> {
  return cached(`json:${url}`, async () => {
    const res = await rawFetch(url, "application/json");
    const text = decode(await res.arrayBuffer(), res.headers.get("content-type"));
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new SourceFetchError(`Invalid JSON from ${url}`, url);
    }
  });
}

/** Download an image (crest/photo). Cached like pages. */
export function fetchImage(url: string): Promise<Buffer> {
  return cached(`img:${url}`, async () => {
    const res = await rawFetch(url, "image/avif,image/webp,image/png,image/*,*/*;q=0.8");
    const type = res.headers.get("content-type") ?? "";
    if (type && !type.startsWith("image/") && !type.includes("octet-stream")) {
      throw new SourceFetchError(`Expected an image from ${url} but got "${type}"`, url);
    }
    return Buffer.from(await res.arrayBuffer());
  });
}

/** Forgets one page (long scans of thousands of big pages would otherwise keep them all in memory). */
export function forgetText(url: string) {
  cache.delete(`text:${url}`);
}

export function clearSourceCache() {
  cache.clear();
}
