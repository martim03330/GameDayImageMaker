/**
 * A stored image as a CSS mask: a capped-size copy (/api/files ?w=2000). Chromium silently fails on masks
 * from huge cutouts (e.g. 2653×5258) and then hides what they mask.
 */
export const maskUrl = (u: string | null | undefined): string =>
  !u ? "" : u.startsWith("/api/files/") && !u.includes("?") ? `${u}?w=2000` : u;
