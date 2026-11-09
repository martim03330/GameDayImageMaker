import * as cheerio from "cheerio";

/**
 * US college soccer (NCAA Division I and II, men's and women's) and basketball (Division I), for Prospeção.
 *
 * Programs: the NCAA's own member directory (web3.ncaa.org) lists every school that sponsors a sport in a
 * division, with its athletics website — the same list the NCAA publishes, so no school is guessed.
 * Rosters: almost every athletics site runs on Sidearm Sports, whose roster lives at
 * /sports/{mens|womens}-{soccer|basketball}/roster. Three versions of its page are read:
 *  • the current Nuxt app: every player is in the page's __NUXT_DATA__ payload (a "devalue" array, where
 *    an object's fields are indexes into that same array), whether or not the table is drawn server-side;
 *  • the older Knockout pages: one li.sidearm-roster-player per player.
 * Sites on other platforms are recorded and skipped.
 */

export type CollegeSport = "soccer" | "basketball";
export type CollegeProgram = { school: string; domain: string; division: "D1" | "D2"; gender: "M" | "F"; state: string; conference: string; sport: CollegeSport };

const DIRECTORY = "https://web3.ncaa.org/directory/api/directory/memberList?type=12";
/** The NCAA directory's sport codes (checked on the API: MSO 213 / WSO 348 D1 programs, MBB 365 / WBB 363). */
const SPORTS: Record<CollegeSport, { code: string; gender: "M" | "F" }[]> = {
  soccer: [
    { code: "MSO", gender: "M" },
    { code: "WSO", gender: "F" },
  ],
  basketball: [
    { code: "MBB", gender: "M" },
    { code: "WBB", gender: "F" },
  ],
};
const DIVISIONS = [
  { code: "I", division: "D1" as const },
  { code: "II", division: "D2" as const },
];

/**
 * Every men's and women's program of a sport, with its athletics domain: soccer in D1 and D2, basketball in
 * D1 only by default (~730 teams already; D2 would double the board).
 */
export async function fetchCollegePrograms(
  fetchJson: <T>(url: string) => Promise<T>,
  sport: CollegeSport = "soccer",
  divisions: ("D1" | "D2")[] = sport === "basketball" ? ["D1"] : ["D1", "D2"],
): Promise<CollegeProgram[]> {
  const out: CollegeProgram[] = [];
  for (const s of SPORTS[sport]) {
    for (const d of DIVISIONS.filter((x) => divisions.includes(x.division))) {
      const list = await fetchJson<{ nameOfficial: string; athleticWebUrl?: string | null; deactive?: string; conferenceName?: string | null; memberOrgAddress?: { state?: string | null } }[]>(
        `${DIRECTORY}&sportCode=${s.code}&division=${d.code}`,
      );
      for (const m of list) {
        const domain = (m.athleticWebUrl ?? "").trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
        if (!domain || m.deactive === "Y") continue;
        out.push({ school: m.nameOfficial, domain, division: d.division, gender: s.gender, state: (m.memberOrgAddress?.state ?? "").toUpperCase(), conference: clean(m.conferenceName), sport });
      }
    }
  }
  return out;
}

/**
 * The roster paths to try, in order (women's teams at schools without a men's team are often just "soccer" /
 * "basketball"; older Sidearm sites use the short slugs msoc / wsoc / mbball / wbball).
 */
export const rosterPaths = (gender: "M" | "F", sport: CollegeSport = "soccer") =>
  sport === "basketball"
    ? gender === "M"
      ? ["mens-basketball", "mbball", "basketball"]
      : ["womens-basketball", "wbball", "basketball"]
    : gender === "M"
      ? ["mens-soccer", "msoc", "soccer"]
      : ["womens-soccer", "wsoc", "soccer"];

/** The sport of a college roster / schedule URL, from its /sports/{slug}/ path: soccer unless it says basketball. */
export function collegeSportOf(url: string | null | undefined): CollegeSport {
  const slug = /\/sports\/([^/]+)\//.exec(url ?? "")?.[1] ?? "";
  return /bball|bask|bkb/.test(slug) ? "basketball" : "soccer";
}

/**
 * The sport's slug as Sidearm's payload (global_sport_name_slug) and WMT's API name it, whatever the site's own
 * path is (msoc, mbball…): "mens-soccer", "womens-basketball".
 */
export const canonicalSlug = (sport: CollegeSport, gender: "M" | "F") => `${gender === "F" ? "womens" : "mens"}-${sport}`;

export type RosterPlayer = {
  name: string;
  profileUrl: string;
  position: string;
  number: string;
  classYear: string;
  hometown: string;
  instagram: string;
  thumb: string;
};

const clean = (s: string | undefined | null) => (s ?? "").replace(/\s+/g, " ").trim();
const slug = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const IG = /instagram\.com\/([A-Za-z0-9_.]{2,30})/i;
const handleOf = (s: string) => {
  const h = clean(s).replace(/^@/, "");
  const m = IG.exec(h);
  const v = (m ? m[1] : h).replace(/\.+$/, "");
  return /^[A-Za-z0-9_.]{2,30}$/.test(v) ? v : "";
};

/** Reads one roster page (any of the Sidearm versions); null when the page is not a Sidearm roster. */
export function parseRoster(html: string, pageUrl: string): { players: RosterPlayer[]; siteName: string; platform: string } | null {
  const $ = cheerio.load(html);
  const origin = new URL(pageUrl).origin;
  const sport = /\/sports\/([^/]+)\/roster/.exec(new URL(pageUrl).pathname)?.[1] ?? "soccer";
  const siteName = clean($('meta[property="og:site_name"]').attr("content"))
    .replace(/\s*-\s*Official Athletics Website$/i, "")
    .replace(/\s+Athletics$/i, "");
  const abs = (u: string | undefined) => (!u ? "" : u.startsWith("http") ? u : u.startsWith("//") ? `https:${u}` : origin + (u.startsWith("/") ? u : `/${u}`));

  const nuxt = $("script#__NUXT_DATA__").html();
  if (nuxt) {
    const players = fromNuxt(nuxt, origin, sport);
    if (players.length) return { players, siteName, platform: players[0].profileUrl.includes("/roster/player/") ? "wmt" : "sidearm" };
  }

  const old = $("li.sidearm-roster-player");
  if (old.length) {
    const players: RosterPlayer[] = [];
    old.each((_, li) => {
      const el = $(li);
      const a = el.find(".sidearm-roster-player-name a").first();
      const name = clean(a.text());
      if (!name) return;
      let instagram = "";
      el.find("a[href*='instagram.com']").each((_, x) => {
        instagram ||= handleOf($(x).attr("href") ?? "");
      });
      players.push({
        name,
        profileUrl: abs(el.attr("data-player-url") || a.attr("href")),
        position: clean(el.find(".sidearm-roster-player-position-long-short").first().text()) || clean(el.find(".sidearm-roster-player-position").first().text()),
        number: clean(el.find(".sidearm-roster-player-jersey-number").first().text()),
        classYear: clean(el.find(".sidearm-roster-player-academic-year").first().text()),
        hometown: clean(el.find(".sidearm-roster-player-hometown").first().text()),
        instagram,
        thumb: abs((el.find(".sidearm-roster-player-image img").attr("data-src") || el.find(".sidearm-roster-player-image img").attr("src") || "").replace(/\?.*$/, "")),
      });
    });
    return { players, siteName, platform: "sidearm-classic" };
  }
  return null;
}

/**
 * Players from a Nuxt devalue payload: a flat array where objects hold indexes into the array (-1 =
 * undefined). A player is an object with firstName / lastName / hometown / rosterPlayerId.
 */
function fromNuxt(json: string, origin: string, sport: string): RosterPlayer[] {
  let arr: unknown[];
  try {
    arr = JSON.parse(json) as unknown[];
  } catch {
    return [];
  }
  const at = (i: unknown, depth = 0): unknown => {
    if (typeof i !== "number" || i < 0 || i >= arr.length) return undefined;
    let v = arr[i];
    // Wrappers: ["Reactive", n], ["ShallowReactive", n], ["Ref", n]…
    if (Array.isArray(v) && typeof v[0] === "string" && v.length === 2 && typeof v[1] === "number" && /^(Shallow)?(Reactive|Ref)$/.test(v[0])) v = at(v[1], depth);
    return v;
  };
  const str = (i: unknown) => {
    const v = at(i);
    return typeof v === "string" || typeof v === "number" ? clean(String(v)) : "";
  };
  // Instagram can sit in instagramUsername or in the socialMedia list (objects with a url / platform).
  const deepText = (i: unknown, depth: number): string => {
    if (depth > 4) return "";
    const v = at(i);
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return v.map((x) => deepText(x, depth + 1)).join(" ");
    if (v && typeof v === "object") return Object.values(v).map((x) => deepText(x, depth + 1)).join(" ");
    return "";
  };
  const firstImage = (i: unknown) => /https?:\/\/\S+?\.(?:jpe?g|png|webp)/i.exec(deepText(i, 0))?.[0] ?? "";
  const named = (i: unknown) => {
    const v = at(i);
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const o = v as Record<string, unknown>;
      return str(o.name) || str(o.title) || str(o.abbreviation);
    }
    return str(i);
  };
  // WMT social links: [{ social_network: { name: "Instagram" }, account: "handle" }].
  const wmtInstagram = (i: unknown) => {
    const list = at(i);
    if (!Array.isArray(list)) return "";
    for (const x of list) {
      const l = at(x) as Record<string, unknown> | undefined;
      if (!l || typeof l !== "object") continue;
      if (/instagram/i.test(named(l.social_network))) return handleOf(str(l.account));
    }
    return "";
  };
  const seen = new Set<string>();
  const out: RosterPlayer[] = [];
  for (const o of arr) {
    if (!o || typeof o !== "object" || Array.isArray(o)) continue;
    const r = o as Record<string, unknown>;
    // WMT Digital sites (UCLA…): the same kind of payload with snake_case fields and a slug.
    if ("first_name" in r && "last_name" in r && "hometown" in r && "slug" in r) {
      const name = str(r.full_name) || clean(`${str(r.first_name)} ${str(r.last_name)}`);
      const sl = str(r.slug);
      if (!name || !sl || seen.has(sl)) continue;
      seen.add(sl);
      out.push({
        name,
        profileUrl: `${origin}/sports/${sport}/roster/player/${sl}`,
        position: named(r.player_position),
        number: str(r.jersey_number_label) || str(r.jersey_number),
        classYear: named(r.class_level),
        hometown: str(r.hometown),
        instagram: wmtInstagram(r.social_links),
        thumb: firstImage(r.master_photo),
      });
      continue;
    }
    if (!("firstName" in r && "lastName" in r && "hometown" in r && "rosterPlayerId" in r)) continue;
    const first = str(r.firstName);
    const last = str(r.lastName);
    const name = clean(`${first} ${last}`);
    const rid = str(r.rosterPlayerId);
    if (!name || !rid || seen.has(rid)) continue;
    seen.add(rid);
    const img = at(r.image) as Record<string, unknown> | undefined;
    const imgUrl = img && typeof img === "object" ? str(img.absoluteUrl) || str(img.url) : "";
    let instagram = handleOf(str(r.instagramUsername));
    if (!instagram) instagram = handleOf(IG.exec(deepText(r.socialMedia, 0))?.[0] ?? "");
    out.push({
      name,
      profileUrl: `${origin}/sports/${sport}/roster/${slug(name)}/${rid}`,
      position: str(r.positionLong) || str(r.positionShort),
      number: str(r.jerseyNumber),
      classYear: str(r.academicYearShort) || str(r.academicYearLong),
      hometown: str(r.hometown),
      instagram,
      thumb: imgUrl.startsWith("/") ? origin + imgUrl : imgUrl,
    });
  }
  return out;
}

/* ---------------- hometown → country ---------------- */

const US = new Set(
  [
    "alabama", "alaska", "arizona", "arkansas", "california", "colorado", "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho", "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana", "maine", "maryland", "massachusetts", "michigan", "minnesota", "mississippi", "missouri", "montana", "nebraska", "nevada", "new hampshire", "new jersey", "new mexico", "new york", "north carolina", "north dakota", "ohio", "oklahoma", "oregon", "pennsylvania", "rhode island", "south carolina", "south dakota", "tennessee", "texas", "utah", "vermont", "virginia", "washington", "west virginia", "wisconsin", "wyoming",
    "district of columbia", "washington dc", "washington d.c.", "d.c.", "dc", "puerto rico", "guam", "u.s. virgin islands", "virgin islands", "american samoa", "northern mariana islands",
    "usa", "u.s.a.", "u.s.", "us", "united states", "united states of america",
    // AP style
    "ala.", "ariz.", "ark.", "calif.", "cal.", "colo.", "conn.", "del.", "fla.", "ga.", "ill.", "ind.", "kan.", "kans.", "ky.", "la.", "md.", "mass.", "mich.", "minn.", "miss.", "mo.", "mont.", "neb.", "nebr.", "nev.", "n.h.", "n.j.", "n.m.", "n.y.", "n.c.", "n.d.", "okla.", "ore.", "pa.", "penn.", "r.i.", "s.c.", "s.d.", "tenn.", "tex.", "vt.", "va.", "wash.", "w.va.", "w. va.", "wis.", "wisc.", "wyo.", "p.r.",
    // postal codes
    "al", "ak", "az", "ar", "ca", "co", "ct", "de", "fl", "ga", "hi", "id", "il", "in", "ia", "ks", "ky", "la", "me", "md", "ma", "mi", "mn", "ms", "mo", "mt", "ne", "nv", "nh", "nj", "nm", "ny", "nc", "nd", "oh", "ok", "or", "pa", "ri", "sc", "sd", "tn", "tx", "ut", "vt", "va", "wa", "wv", "wi", "wy", "pr", "gu", "vi",
  ],
);

/** Country (English, as rosters write it, or its 3-letter code) → the Portuguese name the app uses. */
const COUNTRIES: Record<string, string> = {
  canada: "Canadá", can: "Canadá", mexico: "México", méxico: "México", mex: "México",
  england: "Inglaterra", eng: "Inglaterra", scotland: "Escócia", sco: "Escócia", wales: "País de Gales", wal: "País de Gales", "northern ireland": "Irlanda do Norte", nir: "Irlanda do Norte",
  "united kingdom": "Reino Unido", uk: "Reino Unido", "u.k.": "Reino Unido", "great britain": "Reino Unido", gbr: "Reino Unido",
  ireland: "República da Irlanda", "republic of ireland": "República da Irlanda", irl: "República da Irlanda",
  spain: "Espanha", esp: "Espanha", portugal: "Portugal", por: "Portugal", france: "França", fra: "França", germany: "Alemanha", ger: "Alemanha", deu: "Alemanha",
  italy: "Itália", ita: "Itália", netherlands: "Países Baixos", "the netherlands": "Países Baixos", holland: "Países Baixos", ned: "Países Baixos", nld: "Países Baixos",
  belgium: "Bélgica", bel: "Bélgica", switzerland: "Suíça", sui: "Suíça", che: "Suíça", austria: "Áustria", aut: "Áustria", luxembourg: "Luxemburgo", lux: "Luxemburgo",
  denmark: "Dinamarca", den: "Dinamarca", dnk: "Dinamarca", sweden: "Suécia", swe: "Suécia", norway: "Noruega", nor: "Noruega", finland: "Finlândia", fin: "Finlândia", iceland: "Islândia", isl: "Islândia",
  poland: "Polónia", pol: "Polónia", "czech republic": "Chéquia", czechia: "Chéquia", cze: "Chéquia", slovakia: "Eslováquia", svk: "Eslováquia", hungary: "Hungria", hun: "Hungria",
  romania: "Roménia", rou: "Roménia", bulgaria: "Bulgária", bul: "Bulgária", serbia: "Sérvia", srb: "Sérvia", croatia: "Croácia", cro: "Croácia", hrv: "Croácia", slovenia: "Eslovénia", svn: "Eslovénia",
  "bosnia and herzegovina": "Bósnia e Herzegovina", bosnia: "Bósnia e Herzegovina", bih: "Bósnia e Herzegovina", montenegro: "Montenegro", mne: "Montenegro", "north macedonia": "Macedónia do Norte", macedonia: "Macedónia do Norte", albania: "Albânia", alb: "Albânia", kosovo: "Kosovo",
  greece: "Grécia", gre: "Grécia", cyprus: "Chipre", cyp: "Chipre", malta: "Malta", mlt: "Malta", turkey: "Turquia", türkiye: "Turquia", tur: "Turquia",
  ukraine: "Ucrânia", ukr: "Ucrânia", russia: "Rússia", rus: "Rússia", belarus: "Bielorrússia", lithuania: "Lituânia", ltu: "Lituânia", latvia: "Letónia", lva: "Letónia", estonia: "Estónia", est: "Estónia", moldova: "Moldávia", armenia: "Arménia",
  israel: "Israel", isr: "Israel",
  brazil: "Brasil", brasil: "Brasil", bra: "Brasil", argentina: "Argentina", arg: "Argentina", uruguay: "Uruguai", uru: "Uruguai", paraguay: "Paraguai", par: "Paraguai", chile: "Chile", chi: "Chile",
  colombia: "Colômbia", col: "Colômbia", venezuela: "Venezuela", ven: "Venezuela", peru: "Peru", per: "Peru", ecuador: "Equador", ecu: "Equador", bolivia: "Bolívia", bol: "Bolívia",
  "costa rica": "Costa Rica", crc: "Costa Rica", panama: "Panamá", pan: "Panamá", honduras: "Honduras", hon: "Honduras", guatemala: "Guatemala", gua: "Guatemala", "el salvador": "El Salvador", slv: "El Salvador", nicaragua: "Nicarágua",
  jamaica: "Jamaica", jam: "Jamaica", "trinidad and tobago": "Trindade e Tobago", trinidad: "Trindade e Tobago", tri: "Trindade e Tobago", "trinidad & tobago": "Trindade e Tobago", haiti: "Haiti", hai: "Haiti",
  "dominican republic": "República Dominicana", dom: "República Dominicana", cuba: "Cuba", bahamas: "Bahamas", "the bahamas": "Bahamas", barbados: "Barbados", bermuda: "Bermudas", "cayman islands": "Ilhas Caimão",
  "antigua and barbuda": "Antígua e Barbuda", grenada: "Granada", "saint lucia": "Santa Lúcia", "st. lucia": "Santa Lúcia", "st. kitts and nevis": "São Cristóvão e Neves", "saint kitts and nevis": "São Cristóvão e Neves", "st. vincent and the grenadines": "São Vicente e Granadinas", guyana: "Guiana", suriname: "Suriname", belize: "Belize", curacao: "Curaçau", curaçao: "Curaçau", aruba: "Aruba",
  nigeria: "Nigéria", nga: "Nigéria", ghana: "Gana", gha: "Gana", senegal: "Senegal", sen: "Senegal", "ivory coast": "Costa do Marfim", "cote d'ivoire": "Costa do Marfim", "côte d'ivoire": "Costa do Marfim", civ: "Costa do Marfim",
  cameroon: "Camarões", cmr: "Camarões", mali: "Mali", "burkina faso": "Burquina Fasso", guinea: "Guiné", "guinea-bissau": "Guiné-Bissau", "sierra leone": "Serra Leoa", liberia: "Libéria", gambia: "Gâmbia", "the gambia": "Gâmbia", togo: "Togo", benin: "Benim",
  "cape verde": "Cabo Verde", "cabo verde": "Cabo Verde", angola: "Angola", mozambique: "Moçambique", "south africa": "África do Sul", rsa: "África do Sul", zimbabwe: "Zimbabué", zambia: "Zâmbia", kenya: "Quénia", ken: "Quénia", uganda: "Uganda", tanzania: "Tanzânia", rwanda: "Ruanda", burundi: "Burundi", ethiopia: "Etiópia", eritrea: "Eritreia", somalia: "Somália", sudan: "Sudão", "south sudan": "Sudão do Sul",
  "dr congo": "RD Congo", "democratic republic of the congo": "RD Congo", "democratic republic of congo": "RD Congo", congo: "Congo", "republic of the congo": "Congo", gabon: "Gabão", "equatorial guinea": "Guiné Equatorial", botswana: "Botsuana", namibia: "Namíbia", malawi: "Malawi", madagascar: "Madagáscar", mauritius: "Maurícia",
  egypt: "Egito", morocco: "Marrocos", mar: "Marrocos", algeria: "Argélia", tunisia: "Tunísia", libya: "Líbia",
  "saudi arabia": "Arábia Saudita", "united arab emirates": "Emirados Árabes Unidos", uae: "Emirados Árabes Unidos", qatar: "Catar", kuwait: "Kuwait", bahrain: "Bahrein", oman: "Omã", jordan: "Jordânia", lebanon: "Líbano", iraq: "Iraque", iran: "Irão", syria: "Síria", palestine: "Palestina", yemen: "Iémen",
  japan: "Japão", jpn: "Japão", "south korea": "República da Coreia", korea: "República da Coreia", "republic of korea": "República da Coreia", kor: "República da Coreia", china: "China", chn: "China", "hong kong": "Hong Kong", taiwan: "Taiwan", india: "Índia", pakistan: "Paquistão", "sri lanka": "Sri Lanca", nepal: "Nepal", bangladesh: "Bangladesh",
  philippines: "Filipinas", phi: "Filipinas", thailand: "Tailândia", vietnam: "Vietname", indonesia: "Indonésia", malaysia: "Malásia", singapore: "Singapura", kazakhstan: "Cazaquistão", uzbekistan: "Uzbequistão",
  australia: "Austrália", aus: "Austrália", "new zealand": "Nova Zelândia", nzl: "Nova Zelândia", fiji: "Fiji", "papua new guinea": "Papua-Nova Guiné", samoa: "Samoa", tonga: "Tonga",
};

/** Canadian provinces / Australian states / UK regions written without the country. */
const REGIONS: Record<string, string> = {
  ontario: "Canadá", "ont.": "Canadá", on: "Canadá", quebec: "Canadá", québec: "Canadá", "que.": "Canadá", qc: "Canadá", "british columbia": "Canadá", "b.c.": "Canadá", bc: "Canadá", alberta: "Canadá", "alta.": "Canadá", ab: "Canadá",
  manitoba: "Canadá", "man.": "Canadá", mb: "Canadá", saskatchewan: "Canadá", "sask.": "Canadá", sk: "Canadá", "nova scotia": "Canadá", "n.s.": "Canadá", ns: "Canadá", "new brunswick": "Canadá", "n.b.": "Canadá", nb: "Canadá",
  "prince edward island": "Canadá", "p.e.i.": "Canadá", pei: "Canadá", newfoundland: "Canadá", "newfoundland and labrador": "Canadá", "n.l.": "Canadá", nl: "Canadá", yukon: "Canadá",
  "new south wales": "Austrália", nsw: "Austrália", queensland: "Austrália", qld: "Austrália", victoria: "Austrália", vic: "Austrália", "western australia": "Austrália", "south australia": "Austrália", tasmania: "Austrália",
};

/**
 * Where a hometown is: "Lisbon, Portugal" → "Portugal", "Toronto, Ontario" → "Canadá", "Austin, Texas" → "US",
 * "Madrid, ESP" → "Espanha". null when it cannot be told (the player is left out rather than guessed).
 */
export function countryOf(hometown: string): string | null {
  // "Georgia" is always read as the US state: the country is rare enough on these rosters to ignore.
  const parts = clean(hometown.replace(/\([^)]*\)/g, " ").replace(/\s*\/.*$/, ""))
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return null;
  for (let i = parts.length - 1; i >= Math.max(0, parts.length - 2); i--) {
    const k = parts[i].toLowerCase().replace(/\s+/g, " ");
    if (US.has(k)) return "US";
    if (COUNTRIES[k]) return COUNTRIES[k];
    if (REGIONS[k]) return REGIONS[k];
  }
  return null;
}

/** Roster position words → the four Portuguese labels the page uses (combos take the first). */
export function positionPt(pos: string, sport: CollegeSport = "soccer"): string {
  if (sport === "basketball") return basketballPositionPt(pos);
  // Old pages glue the height and weight on: "D 6'1\" 171 lbs", "MF 6'4\"".
  const p = pos.toLowerCase().replace(/\d+'.*$|\d+\s*lbs.*$/, "").trim();
  const first = p.split(/[/,&-]| or /)[0].trim();
  const pick = (s: string) =>
    /goal|keeper|^gk$|^g$/.test(s)
      ? "Guarda-redes"
      : /def|back|^d$|^cb$|^fb$|^lb$|^rb$/.test(s)
        ? "Defesa"
        : /mid|^m$|^mf$|^cm$|^dm$|^am$|^cdm$|^cam$/.test(s)
          ? "Médio"
          : /for|strik|wing|attack|^f$|^fw$|^st$|^w$|^cf$/.test(s)
            ? "Avançado"
            : "";
  return pick(first) || pick(p.split(/\s+/)[0] ?? "");
}

/**
 * Basketball positions in Portuguese (as Portuguese commentary says them): guards → Base, wings and forwards →
 * Extremo, centers and power forwards → Poste. The hybrids sit where they play: G/F (a wing) → Extremo, F/C
 * → Poste; other combos take the first.
 */
function basketballPositionPt(pos: string): string {
  const p = pos.toLowerCase().replace(/\d+'.*$|\d+\s*lbs.*$/, "").replace(/\s+/g, " ").trim();
  const parts = p.split(/\s*(?:[/,&-]| or )\s*/).filter(Boolean);
  const one = (s: string) =>
    /^(pg|g|sg|cg)$|guard|point/.test(s)
      ? "Base"
      : /^(c|pf|post)$|center|centre|power/.test(s)
        ? "Poste"
        : /^(f|sf|w|wing)$|forward|wing/.test(s)
          ? "Extremo"
          : "";
  const kinds = parts.map(one).filter(Boolean);
  if (kinds.includes("Base") && kinds.includes("Extremo")) return "Extremo";
  if (kinds.includes("Extremo") && kinds.includes("Poste")) return "Poste";
  return kinds[0] ?? one(p.split(" ")[0] ?? "");
}

/* ---------------- schedules, results and box scores ---------------- */

/**
 * One game of a college team. `date` / `time` are the wall clock in the school's own zone (time '' = TBA);
 * `start` is the exact instant when the site gives it (Sidearm's calendar feed, WMT's API).
 */
export type CollegeGame = {
  id: string;
  start: Date | null;
  date: string;
  time: string;
  opponent: string;
  opponentLogo: string;
  home: boolean;
  neutral: boolean;
  venue: string;
  conference: boolean;
  exhibition: boolean;
  competition: string;
  result: { us: number; them: number } | null;
  boxscoreUrl: string;
};

const num = (s: string) => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : NaN);
/** "#11 Virginia", "No. 5 Indiana", "(RV) Duke", "RV Memphis" → the name alone (the ranking is not part of it). */
export const stripRanking = (s: string) => clean(s.replace(/^(?:#\s?\d+|No\.\s?\d+|\(\s?(?:\d+|RV)\s?\)|RV)\s+/, ""));
const EXHIBITION = /exhibition|scrimmage|alumni/i;

/** "7 p.m." / "7:30 PM" / "19:00" → "19:00"; TBA / TBD / All day → "". */
export function clock24(t: string): string {
  const m = /(\d{1,2})(?::(\d{2}))?\s*([ap])\.?\s*m\.?/i.exec(t);
  if (m) {
    let h = Number(m[1]) % 12;
    if (m[3].toLowerCase() === "p") h += 12;
    return `${String(h).padStart(2, "0")}:${m[2] ?? "00"}`;
  }
  const n = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  return n ? `${n[1].padStart(2, "0")}:${n[2]}` : "";
}

/** Sidearm's numeric sport id for the calendar feed (/calendar.ashx/calendar.ics?sport_id=N), from the page. */
export function sidearmSportId(html: string, sportSlug: string): string {
  const classic = /data-sport-id="(\d+)"/.exec(html)?.[1];
  if (classic) return classic;
  const json = cheerio.load(html)("script#__NUXT_DATA__").html();
  if (!json) return "";
  try {
    const arr = JSON.parse(json) as unknown[];
    const v = (i: unknown) => (typeof i === "number" && i >= 0 && i < arr.length ? arr[i] : undefined);
    for (const o of arr) {
      if (!o || typeof o !== "object" || Array.isArray(o)) continue;
      const r = o as Record<string, unknown>;
      if ("scheduleId" in r && v(r.global_sport_name_slug) === sportSlug) return String(v(r.id) ?? "");
    }
  } catch {
    /* not a payload */
  }
  return "";
}

/** Sidearm schedule page (Nuxt payload or the classic list). Times are as the site writes them: the school's zone. */
export function parseSchedule(html: string, pageUrl: string): CollegeGame[] | null {
  const $ = cheerio.load(html);
  const origin = new URL(pageUrl).origin;
  const abs = (u: string | undefined) => (!u ? "" : u.startsWith("http") ? u : u.startsWith("//") ? `https:${u}` : origin + (u.startsWith("/") ? u : `/${u}`));

  const nuxt = $("script#__NUXT_DATA__").html();
  if (nuxt) {
    let arr: unknown[] = [];
    try {
      arr = JSON.parse(nuxt) as unknown[];
    } catch {
      /* fall through to the classic page */
    }
    const at = (i: unknown): unknown => {
      if (typeof i !== "number" || i < 0 || i >= arr.length) return undefined;
      const v = arr[i];
      if (Array.isArray(v) && typeof v[0] === "string" && v.length === 2 && typeof v[1] === "number" && /^(Shallow)?(Reactive|Ref)$/.test(v[0])) return at(v[1]);
      return v;
    };
    const str = (i: unknown) => {
      const v = at(i);
      return typeof v === "string" || typeof v === "number" ? clean(String(v)) : "";
    };
    const obj = (i: unknown) => {
      const v = at(i);
      return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
    };
    const games: CollegeGame[] = [];
    const seen = new Set<string>();
    for (const o of arr) {
      if (!o || typeof o !== "object" || Array.isArray(o)) continue;
      const r = o as Record<string, unknown>;
      if (!("at_vs" in r && "opponent" in r && "location_indicator" in r && "date" in r)) continue;
      const id = str(r.id);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      const opp = obj(r.opponent);
      const name = stripRanking(str(opp?.title) || str(r.event_name));
      if (!name) continue;
      const when = str(r.date);
      const tba = at(r.tbd) === true || /tba|tbd/i.test(str(r.time));
      const res = obj(r.result);
      const us = num(str(res?.team_score));
      const them = num(str(res?.opponent_score));
      const box = obj(res?.boxscore);
      const img = obj(opp?.image);
      const ind = str(r.location_indicator).toUpperCase();
      const tournament = obj(r.tournament);
      games.push({
        id,
        start: null,
        date: when.slice(0, 10),
        time: tba ? "" : when.slice(11, 16),
        opponent: name,
        opponentLogo: str(img?.fullpath),
        home: ind === "H",
        neutral: ind === "N",
        venue: str(obj(r.facility)?.title) || str(r.location),
        conference: at(r.conference) === true,
        exhibition: ["E", "S"].includes(str(r.type).toUpperCase()) || EXHIBITION.test(`${name} ${str(r.event_name)}`),
        competition: str(tournament?.title),
        result: Number.isFinite(us) && Number.isFinite(them) ? { us, them } : null,
        boxscoreUrl: abs(str(box?.url)),
      });
    }
    if (games.length) return games;
  }

  const items = $("li.sidearm-schedule-game");
  if (!items.length) return null;
  // The classic page writes "Aug 27 (Thu)" with no year: the season's year comes from the page title / links.
  const season = Number(/(20\d\d)\s+(?:Men|Women)/i.exec($("title").text() + " " + $("h1, h2").first().text())?.[1] ?? /\/stats\/(20\d\d)\//.exec(html)?.[1] ?? new Date().getFullYear());
  const MON = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const games: CollegeGame[] = [];
  items.each((_, li) => {
    const el = $(li);
    const cls = el.attr("class") ?? "";
    const id = el.attr("data-game-id") ?? "";
    const nameEl = el.find(".sidearm-schedule-game-opponent-name").first();
    const name = stripRanking(clean(nameEl.find("a").first().text()) || clean(nameEl.text()));
    const spans = el.find(".sidearm-schedule-game-opponent-date span").map((__, x) => clean($(x).text())).get();
    const dm = /([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})/.exec(spans[0] ?? "");
    if (!id || !name || !dm) return;
    const mon = MON.indexOf(dm[1].toLowerCase());
    // Spring games (January–June) belong to the year after the autumn season.
    const year = mon >= 6 ? season : season + 1;
    const time = clock24(spans[1] ?? "");
    const rm = /([WLT])\s*,?\s*(\d+)\s*-\s*(\d+)/.exec(clean(el.find(".sidearm-schedule-game-result").first().text()));
    games.push({
      id,
      start: null,
      date: `${year}-${String(mon + 1).padStart(2, "0")}-${dm[2].padStart(2, "0")}`,
      time,
      opponent: name,
      opponentLogo: abs((el.find(".sidearm-schedule-game-opponent-logo img").attr("data-src") || el.find(".sidearm-schedule-game-opponent-logo img").attr("src") || "").replace(/\?.*$/, "")),
      home: /sidearm-schedule-home-game/.test(cls),
      neutral: /sidearm-schedule-neutral-game/.test(cls),
      venue: clean(el.find(".sidearm-schedule-game-location").first().text()),
      conference: /conference/.test(cls) || /\*/.test(clean(el.find(".sidearm-schedule-game-conference-conference").text())),
      exhibition: EXHIBITION.test(clean(el.text())),
      competition: "",
      result: rm ? { us: Number(rm[2]), them: Number(rm[3]) } : null,
      boxscoreUrl: abs(el.find(".sidearm-schedule-game-links-boxscore a").attr("href")),
    });
  });
  return games;
}

/**
 * Sidearm's calendar feed: game id → exact kick-off instant (DTSTART in UTC). Games without a time are
 * written as all-day dates (VALUE=DATE) and give no instant.
 */
export function parseIcsStarts(ics: string): Map<string, Date> {
  const out = new Map<string, Date>();
  for (const ev of ics.split("BEGIN:VEVENT").slice(1)) {
    const id = /UID:vcal_(\d+)/.exec(ev)?.[1];
    const st = /DTSTART(?:;[^:]*)?:(\d{8}T\d{6}Z)/.exec(ev)?.[1];
    if (!id || !st) continue;
    out.set(id, new Date(`${st.slice(0, 4)}-${st.slice(4, 6)}-${st.slice(6, 8)}T${st.slice(9, 11)}:${st.slice(11, 13)}:${st.slice(13, 15)}Z`));
  }
  return out;
}

type WmtEvent = {
  id: number;
  opponent_name?: string | null;
  opponent?: { name?: string | null } | null;
  opponent_logo?: { url?: string | null } | null;
  datetime?: string | null;
  is_all_day?: boolean | null;
  tba?: boolean | null;
  venue_type?: string | null;
  venue?: string | null;
  location?: string | null;
  is_conference?: boolean | null;
  is_exhibition?: boolean | null;
  status?: string | null;
  box_score_url?: string | null;
  wmt_stats2_iframe_url?: string | null;
};

/**
 * WMT Digital sites (UCLA…): the schedule is not in the page; their own JSON API gives it —
 * /website-api/sports (the sport's current schedule id) → /website-api/schedule-events. Results are not in
 * that list: they are read from each game's stats page (parseBoxScore).
 */
export async function fetchWmtSchedule(origin: string, sportSlug: string, fetchJson: <T>(url: string) => Promise<T>): Promise<{ games: CollegeGame[]; logoId: number | null }> {
  const sports = await fetchJson<{ data: { slug?: string; schedule_id?: number | null; team_logo_id?: number | null }[] }>(`${origin}/website-api/sports?per_page=100`);
  const sport = sports.data.find((x) => x.slug === sportSlug);
  if (!sport?.schedule_id) return { games: [], logoId: null };
  const ev = await fetchJson<{ data: WmtEvent[] }>(`${origin}/website-api/schedule-events?filter%5Bschedule_id%5D=${sport.schedule_id}&per_page=100&include=opponent,opponentLogo`);
  const games = ev.data
    .filter((e) => clean(e.opponent?.name ?? e.opponent_name))
    .map((e): CollegeGame => {
      const start = e.datetime ? new Date(e.datetime) : null;
      const timed = !!start && !e.is_all_day && !e.tba;
      return {
        id: String(e.id),
        start: timed ? start : null,
        date: e.datetime?.slice(0, 10) ?? "",
        time: "",
        opponent: stripRanking(clean(e.opponent?.name ?? e.opponent_name)),
        opponentLogo: e.opponent_logo?.url ?? "",
        home: e.venue_type === "home",
        neutral: e.venue_type === "neutral",
        venue: clean(e.venue) || clean(e.location),
        conference: !!e.is_conference,
        exhibition: !!e.is_exhibition || EXHIBITION.test(clean(e.opponent_name)),
        competition: "",
        result: null,
        boxscoreUrl: (e.status === "completed" && (e.wmt_stats2_iframe_url || e.box_score_url)) || "",
      };
    });
  return { games, logoId: sport.team_logo_id ?? null };
}

/** One player's line. `points` only on basketball box scores (goals / assists stay 0 there). */
export type BoxLine = { name: string; goals: number; assists: number; minutes: number; started: boolean; points?: number };
export type BoxScore = { players: BoxLine[]; scorers: { name: string; assist: string }[]; totals: { team: string; total: number }[] };

/** "Benedek Miklosi, Daniel" / "12 Lichter, Ole" → "Daniel Benedek Miklosi" / "Ole Lichter". */
const fromBoxName = (s: string) => {
  const n = clean(s.replace(/^#?\d+\s+/, "").replace(/\(.*?\)/g, ""));
  const [last, first] = n.split(",").map((x) => x.trim());
  return first ? `${first} ${last}` : n;
};

/**
 * A box score page — Sidearm (Nuxt or classic) or WMT's stats page. Player tables (Player · G · A [· MIN],
 * starters then substitutes), the scoring summary ("Ole Lichter (1) Assisted By: Kobi Thomas") and the
 * score by period (team · … · total).
 */
export function parseBoxScore(html: string, sport: CollegeSport = "soccer"): BoxScore {
  if (sport === "basketball") return parseBasketballBox(html);
  const $ = cheerio.load(html);
  const players: BoxLine[] = [];
  const scorers: { name: string; assist: string }[] = [];
  const totals: { team: string; total: number }[] = [];
  // Nuxt pages put the substitutes in a table of their own, with no header: it reads like the one before it.
  let lastHeads: string[] = [];
  $("table").each((_, t) => {
    let heads = $(t).find("thead th").map((__, h) => clean($(h).text())).get();
    const cap = clean($(t).find("caption").text());
    if (!heads.length && /^substitutes/i.test(clean($(t).find("tbody tr").first().text())) && lastHeads.length) heads = lastHeads;
    const gi = heads.indexOf("G");
    const ai = heads.indexOf("A");
    const pi = heads.indexOf("Player");
    if (gi >= 0 && ai >= 0 && pi >= 0) {
      lastHeads = heads;
      const mi = heads.findIndex((h) => /^min/i.test(h));
      let starters = !/^substitutes/i.test(clean($(t).find("tbody tr").first().text()));
      $(t)
        .find("tbody tr")
        .each((__, r) => {
          const cells = $(r).find("th, td").map((___, c) => clean($(c).text())).get();
          if (cells.length < heads.length - 1) {
            if (/substitutes/i.test(cells.join(" "))) starters = false;
            else if (/starters/i.test(cells.join(" "))) starters = true;
            return;
          }
          const name = fromBoxName(cells[pi] ?? "");
          if (!name || /^totals?$/i.test(name)) return;
          players.push({ name, goals: num(cells[gi] ?? "") || 0, assists: num(cells[ai] ?? "") || 0, minutes: mi >= 0 ? Number(/^(\d+)/.exec(cells[mi] ?? "")?.[1] ?? 0) : 0, started: starters });
        });
      return;
    }
    // Score by period (the first such table; shots / saves tables look alike): the last column is the total.
    if (!totals.length && (/score by period/i.test(cap) || (heads.includes("Total") && heads.length <= 6) || /^(?:1st|1)/i.test(heads[1] ?? ""))) {
      $(t)
        .find("tbody tr")
        .each((__, r) => {
          const cells = $(r).find("th, td").map((___, c) => clean($(c).text())).get().filter(Boolean);
          const total = num(cells[cells.length - 1] ?? "");
          const team = cells[0] ?? "";
          if (team && Number.isFinite(total) && !/^(shots|saves|corner|fouls|offsides)/i.test(team)) totals.push({ team, total });
        });
    }
  });
  // Scoring summary rows: time · team · "Ole Lichter (1) Assisted By: Kobi Thomas" (or "Name (PK)"). Used when
  // a page has no player table (WMT). Cautions ("#17 Name") and play-by-play tables are left out.
  $("table").each((_, t) => {
    const cap = clean($(t).find("caption").text());
    if (/caution|plays|period|statistics/i.test(cap) || $(t).find("thead th").length > 4) return;
    $(t)
      .find("tbody tr")
      .each((__, r) => {
        const cells = $(r).find("th, td").map((___, c) => clean($(c).text())).get();
        if (cells.length < 3 || !/^\d{1,3}:\d{2}$/.test(cells[0])) return;
        const desc = cells.slice(2).join(" ");
        if (!desc || desc.startsWith("#") || /card|caution/i.test(desc)) return;
        const name = clean(desc.split(/\(|assisted by|goal by/i)[0]);
        const assist = clean(/assisted by:?\s*(.*?)(?:goal by|$)/i.exec(desc)?.[1] ?? "").replace(/\.$/, "");
        if (name && name.split(" ").length <= 5) scorers.push({ name, assist });
      });
  });
  return { players, scorers, totals };
}

/**
 * A basketball box score (Sidearm): each team's table (# · Player · GS · MIN · FG … · PTS) and the score by
 * period. Only who played, his minutes and points, and the final score are read — no goals, assists or
 * scoring summary (basketball's "A" column is assists of another kind, and a wrong stat is worse than none).
 */
function parseBasketballBox(html: string): BoxScore {
  const $ = cheerio.load(html);
  const players: BoxLine[] = [];
  const totals: { team: string; total: number }[] = [];
  $("table").each((_, t) => {
    const heads = $(t).find("thead th").map((__, h) => clean($(h).text()).toLowerCase()).get();
    const pi = heads.indexOf("player");
    const mi = heads.indexOf("min");
    const ptsI = heads.indexOf("pts");
    if (pi >= 0 && mi >= 0 && ptsI >= 0) {
      const gs = heads.indexOf("gs");
      $(t)
        .find("tbody tr")
        .each((__, r) => {
          const cells = $(r).find("th, td").map((___, c) => clean($(c).text())).get();
          if (cells.length < heads.length - 1) return;
          const name = fromBoxName(cells[pi] ?? "");
          if (!name || /^(totals?|team)$/i.test(name)) return;
          const points = num(cells[ptsI] ?? "");
          players.push({ name, goals: 0, assists: 0, minutes: Number(/^(\d+)/.exec(cells[mi] ?? "")?.[1] ?? 0), started: gs >= 0 && /\*/.test(cells[gs] ?? ""), ...(Number.isFinite(points) ? { points } : {}) });
        });
      return;
    }
    // Score by period: Team · 1st half · 2nd half [· OT] · Total (women's: four quarters).
    if (!totals.length && heads[0] === "team" && heads[heads.length - 1] === "total") {
      $(t)
        .find("tbody tr")
        .each((__, r) => {
          const cells = $(r).find("th, td").map((___, c) => clean($(c).text())).get().filter(Boolean);
          const total = num(cells[cells.length - 1] ?? "");
          if (cells[0] && Number.isFinite(total)) totals.push({ team: cells[0], total });
        });
    }
  });
  return { players, scorers: [], totals };
}

const foldName = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z\s-]/g, " ").split(/[\s-]+/).filter((t) => t.length >= 2);

/** Is this box-score name the player? Same first and last name, or every box token inside his full name. */
export function sameName(box: string, player: string): boolean {
  const b = foldName(box);
  const p = foldName(player);
  if (b.length < 2 || p.length < 2) return false;
  if (b[0] === p[0] && b[b.length - 1] === p[p.length - 1]) return true;
  return b.every((t) => p.includes(t));
}
