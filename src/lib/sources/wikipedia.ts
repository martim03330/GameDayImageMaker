import { fetchJson } from "./http";

type Summary = { title?: string; coordinates?: { lat: number; lon: number }; originalimage?: { source: string; width: number } };

export type CityInfo = { title: string; lat?: number; lon?: number; imageUrl?: string };

/** A city's main photo and coordinates from Wikipedia (pt first, then en). Photos are Wikimedia Commons (CC licences). */
export async function fetchCity(name: string, stadium?: string): Promise<CityInfo | null> {
  // Stadium names include the city in some cases ("Estádio Dr. José de Matos Viana do Castelo") – use the city only.
  void stadium;
  for (const lang of ["pt", "en"]) {
    try {
      const s = await fetchJson<Summary>(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name.replace(/ /g, "_"))}`);
      if (!s.title) continue;
      let imageUrl = s.originalimage?.source;
      // Ask Commons for a standard 1920px rendition (other widths are rejected) instead of a huge original.
      if (imageUrl && s.originalimage && s.originalimage.width > 1920) {
        const m = imageUrl.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/(\w)\/(\w\w)\/([^?]+)/);
        if (m) imageUrl = `${m[1]}/thumb/${m[2]}/${m[3]}/${m[4]}/1920px-${m[4]}`;
      }
      return { title: s.title, lat: s.coordinates?.lat, lon: s.coordinates?.lon, imageUrl };
    } catch {
      /* try next language */
    }
  }
  return null;
}

type CommonsPage = { title: string; index?: number; imageinfo?: { width: number; height: number; mime: string; thumburl?: string; url: string }[] };

const BAD = /montage|collage|map|mapa|flag|bandeira|coat|brasão|logo|seal|diagram|plan|A\d+ |road|estrada|highway|stamp|poster|interior|church interior|museum|statue detail/i;
const GOOD = /skyline|panorama|panoramic|sunset|night|view|vista|aerial|aérea|harbou?r|waterfront|river|cityscape|old town|centro/i;

/** Up to `max` wide, high-res landmark / skyline photos of a city from Wikimedia Commons (CC licences), as 1920px URLs. */
export async function fetchCityPhotos(city: string, max = 8, queries?: string[], mustContain?: string): Promise<string[]> {
  const seen = new Map<string, { url: string; score: number }>();
  // Commons search is fuzzy: only keep files whose title actually names the city.
  const norm = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const key = norm((mustContain ?? city).split(/[,(]/)[0].trim());
  for (const q of queries ?? [`${city} skyline`, `${city} panorama`, `${city} city view`, `${city} night`, `${city} aerial`, `${city} old town`]) {
    const api =
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=20" +
      `&gsrsearch=${encodeURIComponent(q)}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1920`;
    const d = await fetchJson<{ query?: { pages?: Record<string, CommonsPage> } }>(api).catch(() => ({}) as { query?: undefined });
    for (const p of Object.values(d.query?.pages ?? {})) {
      const ii = p.imageinfo?.[0];
      if (!ii || ii.mime !== "image/jpeg" || BAD.test(p.title) || !norm(p.title).includes(key)) continue;
      const ratio = ii.width / ii.height;
      if (ii.width < 1600 || ratio < 1.2 || ratio > 4) continue;
      const score = (GOOD.test(p.title) ? 2 : 0) + Math.min(ii.width / 4000, 1) - (p.index ?? 0) / 40;
      const prev = seen.get(p.title);
      if (!prev || prev.score < score) seen.set(p.title, { url: ii.thumburl ?? ii.url, score });
    }
  }
  return [...seen.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.url);
}

// Wikidata "instance of": football stadium, stadium, sports venue, multi-purpose stadium.
const STADIUM_TYPES = new Set(["Q1154710", "Q483110", "Q1076486", "Q2338524"]);

type WdSearch = { search?: { id: string }[] };
type WdEntities = { entities: Record<string, { claims: Record<string, { mainsnak: { datavalue?: { value: unknown } } }[]> }> };

/** The Commons category of the first of these Wikidata items that is a stadium. */
async function categoryOf(ids: string[]): Promise<string | null> {
  if (!ids.length) return null;
  const d = await fetchJson<WdEntities>(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims&ids=${ids.join("|")}`);
  for (const id of ids) {
    const claims = d.entities[id]?.claims ?? {};
    const kinds = (claims.P31 ?? []).map((c) => (c.mainsnak.datavalue?.value as { id?: string })?.id);
    const cat = claims.P373?.[0]?.mainsnak.datavalue?.value;
    if (typeof cat === "string" && kinds.some((k) => k && STADIUM_TYPES.has(k))) return cat;
  }
  return null;
}

/**
 * The stadium's Commons category, through Wikidata (so a "Campo Municipal" never matches a town's photos).
 * zerozero names often differ from Wikipedia's ("Ta'Qali" / "Ta' Qali", "… Sport Club" / "… SC"): the label
 * search is tried first, then Wikipedia's full-text search, which tolerates those differences.
 */
async function stadiumCategory(name: string): Promise<string | null> {
  const bare = name.replace(/^(Est[áa]dio|Estadio|Stadium|Stadion|Campo)\s+/i, "").trim();
  for (const [lang, q] of [["en", name], ["pt", name], ["en", `${bare} stadium`]]) {
    const s = await fetchJson<WdSearch>(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&type=item&limit=5&language=${lang}&search=${encodeURIComponent(q)}`,
    );
    const cat = await categoryOf((s.search ?? []).map((e) => e.id));
    if (cat) return cat;
  }
  for (const lang of ["en", "pt"]) {
    const w = await fetchJson<{ query?: { pages?: Record<string, { index?: number; pageprops?: { wikibase_item?: string } }> } }>(
      `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrlimit=4&prop=pageprops&ppprop=wikibase_item` +
        `&gsrsearch=${encodeURIComponent(`${bare} stadium`)}`,
    );
    const ids = Object.values(w.query?.pages ?? {})
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      .map((p) => p.pageprops?.wikibase_item)
      .filter((x): x is string => !!x);
    const cat = await categoryOf(ids);
    if (cat) return cat;
  }
  return null;
}

export type StadiumPhoto = { url: string; title: string; width: number; height: number };

/**
 * Wide, high-resolution JPEGs from the stadium's own Commons category (1920px renditions). Unfiltered by
 * content. Throws when Wikimedia can't be reached, so the caller doesn't take it for "no photos".
 */
export async function fetchStadiumPhotoCandidates(name: string): Promise<StadiumPhoto[]> {
  const cat = await stadiumCategory(name);
  if (!cat) return [];
  const out: StadiumPhoto[] = [];
  let subcats = 0;
  const list = async (category: string, depth: number) => {
    const d = await fetchJson<{ query?: { pages?: Record<string, CommonsPage & { ns?: number }> } }>(
      "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=categorymembers&gcmtype=file|subcat&gcmlimit=80" +
        `&gcmtitle=${encodeURIComponent(`Category:${category}`)}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1920`,
    );
    for (const p of Object.values(d.query?.pages ?? {})) {
      // A few sub-categories only ("Matches at …", "Interior of …"): big grounds have dozens.
      if (p.ns === 14 && depth > 0 && !BAD.test(p.title) && subcats++ < 4) await list(p.title.replace(/^Category:/, ""), depth - 1);
      const ii = p.imageinfo?.[0];
      if (!ii || ii.mime !== "image/jpeg" || BAD.test(p.title)) continue;
      const ratio = ii.width / ii.height;
      if (ii.width < 1920 || ratio < 1.2 || ratio > 3) continue;
      out.push({ url: ii.thumburl ?? ii.url, title: p.title, width: ii.width, height: ii.height });
    }
  };
  await list(cat, 1);
  return [...new Map(out.map((p) => [p.title, p])).values()];
}
