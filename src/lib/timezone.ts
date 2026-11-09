/**
 * Kick-off times for players abroad. zerozero.pt lists every game in Portugal's time (Europe/Lisbon);
 * an edit for a club in another time zone shows the local kick-off with Portugal's next to it.
 */

export const PORTUGAL_TZ = "Europe/Lisbon";

/** League / club words → IANA time zone, for clubs that have no time zone set by hand. */
const GUESSES: [RegExp, string][] = [
  [/malta|valletta|sliema|birkirkara|hamrun|floriana|gozo/i, "Europe/Malta"],
  [/bulgar|efbet|sofia|varna|plovdiv|cherno more|ludogorets/i, "Europe/Sofia"],
  [/cyprus|cypriot|nicosia|limassol|larnaca/i, "Asia/Nicosia"],
  [/greece|greek|super league greece|athens|thessaloniki/i, "Europe/Athens"],
  [/romania|superliga|bucure/i, "Europe/Bucharest"],
  [/spain|laliga|la liga|segunda/i, "Europe/Madrid"],
  [/france|ligue 1|ligue 2|national/i, "Europe/Paris"],
  [/italy|serie a|serie b|serie c/i, "Europe/Rome"],
  [/germany|bundesliga/i, "Europe/Berlin"],
  [/england|premier league|championship|league one|league two|efl/i, "Europe/London"],
  [/switzerland|swiss/i, "Europe/Zurich"],
  [/poland|ekstraklasa/i, "Europe/Warsaw"],
  [/netherlands|eredivisie|eerste divisie/i, "Europe/Amsterdam"],
  [/belgium|jupiler|pro league/i, "Europe/Brussels"],
  [/turkey|süper lig|super lig/i, "Europe/Istanbul"],
  [/luxembourg|luxemburgo/i, "Europe/Luxembourg"],
  [/andorra/i, "Europe/Andorra"],
  [/qatar|doha|al bidda|al sadd|al duhail|al rayyan|al gharafa/i, "Asia/Qatar"],
  [/sweden|swedish|allsvenskan|superettan/i, "Europe/Stockholm"],
];

/**
 * Second clock a player can ask for next to the local kick-off (his own country, his family's…): the
 * zone and the short tag written after the time. Portugal stays the default.
 */
export const REF_ZONES: { tz: string; tag: string; name: string; en: string }[] = [
  { tz: PORTUGAL_TZ, tag: "PT", name: "Portugal", en: "Portugal" },
  { tz: "Europe/Stockholm", tag: "SWE", name: "Suécia", en: "Sweden" },
  { tz: "Europe/London", tag: "UK", name: "Reino Unido", en: "UK" },
  { tz: "Europe/Madrid", tag: "ESP", name: "Espanha", en: "Spain" },
  { tz: "Europe/Paris", tag: "FRA", name: "França", en: "France" },
  { tz: "America/Sao_Paulo", tag: "BRT", name: "Brasil", en: "Brazil" },
];

/**
 * Each nationality's own clock (Portuguese country names, as zerozero and the college rosters write them):
 * the second time an edit shows by default is the one at home — a Norwegian at a California school gets
 * "13:00 (22:00 NOR)", a Portuguese player abroad "(… PT)". Countries with several zones use the capital's
 * (or the main football city's). The tags follow FIFA's codes; the ones REF_ZONES already used stay.
 */
export const NATION_ZONES: { names: string[]; tz: string; tag: string; en: string }[] = [
  { names: ["Portugal"], tz: "Europe/Lisbon", tag: "PT", en: "Portugal" },
  { names: ["Brasil"], tz: "America/Sao_Paulo", tag: "BRT", en: "Brazil" },
  { names: ["Suécia"], tz: "Europe/Stockholm", tag: "SWE", en: "Sweden" },
  { names: ["Inglaterra", "Reino Unido", "Escócia", "País de Gales", "Irlanda do Norte"], tz: "Europe/London", tag: "UK", en: "UK" },
  { names: ["Espanha"], tz: "Europe/Madrid", tag: "ESP", en: "Spain" },
  { names: ["França"], tz: "Europe/Paris", tag: "FRA", en: "France" },
  { names: ["Canadá"], tz: "America/Toronto", tag: "CAN", en: "Canada" },
  { names: ["Estados Unidos"], tz: "America/New_York", tag: "USA", en: "USA" },
  { names: ["Alemanha"], tz: "Europe/Berlin", tag: "GER", en: "Germany" },
  { names: ["Itália"], tz: "Europe/Rome", tag: "ITA", en: "Italy" },
  { names: ["Suíça"], tz: "Europe/Zurich", tag: "SUI", en: "Switzerland" },
  { names: ["Países Baixos"], tz: "Europe/Amsterdam", tag: "NED", en: "Netherlands" },
  { names: ["Bélgica"], tz: "Europe/Brussels", tag: "BEL", en: "Belgium" },
  { names: ["Luxemburgo"], tz: "Europe/Luxembourg", tag: "LUX", en: "Luxembourg" },
  { names: ["Áustria"], tz: "Europe/Vienna", tag: "AUT", en: "Austria" },
  { names: ["Dinamarca"], tz: "Europe/Copenhagen", tag: "DEN", en: "Denmark" },
  { names: ["Noruega"], tz: "Europe/Oslo", tag: "NOR", en: "Norway" },
  { names: ["Finlândia"], tz: "Europe/Helsinki", tag: "FIN", en: "Finland" },
  { names: ["Islândia"], tz: "Atlantic/Reykjavik", tag: "ISL", en: "Iceland" },
  { names: ["República da Irlanda", "Irlanda"], tz: "Europe/Dublin", tag: "IRL", en: "Ireland" },
  { names: ["Polónia"], tz: "Europe/Warsaw", tag: "POL", en: "Poland" },
  { names: ["Chéquia", "República Checa"], tz: "Europe/Prague", tag: "CZE", en: "Czechia" },
  { names: ["Eslováquia"], tz: "Europe/Bratislava", tag: "SVK", en: "Slovakia" },
  { names: ["Hungria"], tz: "Europe/Budapest", tag: "HUN", en: "Hungary" },
  { names: ["Roménia"], tz: "Europe/Bucharest", tag: "ROU", en: "Romania" },
  { names: ["Bulgária"], tz: "Europe/Sofia", tag: "BUL", en: "Bulgaria" },
  { names: ["Grécia"], tz: "Europe/Athens", tag: "GRE", en: "Greece" },
  { names: ["Chipre"], tz: "Asia/Nicosia", tag: "CYP", en: "Cyprus" },
  { names: ["Croácia"], tz: "Europe/Zagreb", tag: "CRO", en: "Croatia" },
  { names: ["Sérvia"], tz: "Europe/Belgrade", tag: "SRB", en: "Serbia" },
  { names: ["Eslovénia"], tz: "Europe/Ljubljana", tag: "SVN", en: "Slovenia" },
  { names: ["Bósnia e Herzegovina"], tz: "Europe/Sarajevo", tag: "BIH", en: "Bosnia" },
  { names: ["Montenegro"], tz: "Europe/Podgorica", tag: "MNE", en: "Montenegro" },
  { names: ["Kosovo"], tz: "Europe/Belgrade", tag: "KOS", en: "Kosovo" },
  { names: ["Albânia"], tz: "Europe/Tirane", tag: "ALB", en: "Albania" },
  { names: ["Macedónia do Norte"], tz: "Europe/Skopje", tag: "MKD", en: "North Macedonia" },
  { names: ["Ucrânia"], tz: "Europe/Kyiv", tag: "UKR", en: "Ukraine" },
  { names: ["Bielorrússia"], tz: "Europe/Minsk", tag: "BLR", en: "Belarus" },
  { names: ["Moldávia"], tz: "Europe/Chisinau", tag: "MDA", en: "Moldova" },
  { names: ["Lituânia"], tz: "Europe/Vilnius", tag: "LTU", en: "Lithuania" },
  { names: ["Letónia"], tz: "Europe/Riga", tag: "LVA", en: "Latvia" },
  { names: ["Estónia"], tz: "Europe/Tallinn", tag: "EST", en: "Estonia" },
  { names: ["Rússia"], tz: "Europe/Moscow", tag: "RUS", en: "Russia" },
  { names: ["Turquia"], tz: "Europe/Istanbul", tag: "TUR", en: "Turkey" },
  { names: ["Andorra"], tz: "Europe/Andorra", tag: "AND", en: "Andorra" },
  { names: ["Malta"], tz: "Europe/Malta", tag: "MLT", en: "Malta" },
  { names: ["Israel"], tz: "Asia/Jerusalem", tag: "ISR", en: "Israel" },
  { names: ["Palestina"], tz: "Asia/Gaza", tag: "PLE", en: "Palestine" },
  { names: ["Líbano"], tz: "Asia/Beirut", tag: "LBN", en: "Lebanon" },
  { names: ["Síria"], tz: "Asia/Damascus", tag: "SYR", en: "Syria" },
  { names: ["Jordânia"], tz: "Asia/Amman", tag: "JOR", en: "Jordan" },
  { names: ["Iraque"], tz: "Asia/Baghdad", tag: "IRQ", en: "Iraq" },
  { names: ["Arábia Saudita"], tz: "Asia/Riyadh", tag: "KSA", en: "Saudi Arabia" },
  { names: ["Catar", "Qatar"], tz: "Asia/Qatar", tag: "QAT", en: "Qatar" },
  { names: ["Emirados Árabes Unidos"], tz: "Asia/Dubai", tag: "UAE", en: "UAE" },
  { names: ["Kuwait", "Koweit"], tz: "Asia/Kuwait", tag: "KUW", en: "Kuwait" },
  { names: ["Bahrein", "Barém"], tz: "Asia/Bahrain", tag: "BHR", en: "Bahrain" },
  { names: ["Omã"], tz: "Asia/Muscat", tag: "OMA", en: "Oman" },
  { names: ["Iémen"], tz: "Asia/Aden", tag: "YEM", en: "Yemen" },
  { names: ["Irão"], tz: "Asia/Tehran", tag: "IRN", en: "Iran" },
  { names: ["Egito"], tz: "Africa/Cairo", tag: "EGY", en: "Egypt" },
  { names: ["Marrocos"], tz: "Africa/Casablanca", tag: "MAR", en: "Morocco" },
  { names: ["Argélia"], tz: "Africa/Algiers", tag: "ALG", en: "Algeria" },
  { names: ["Tunísia"], tz: "Africa/Tunis", tag: "TUN", en: "Tunisia" },
  { names: ["Líbia"], tz: "Africa/Tripoli", tag: "LBY", en: "Libya" },
  { names: ["Sudão"], tz: "Africa/Khartoum", tag: "SDN", en: "Sudan" },
  { names: ["Senegal"], tz: "Africa/Dakar", tag: "SEN", en: "Senegal" },
  { names: ["Gâmbia"], tz: "Africa/Banjul", tag: "GAM", en: "Gambia" },
  { names: ["Guiné-Bissau"], tz: "Africa/Bissau", tag: "GNB", en: "Guinea-Bissau" },
  { names: ["Guiné (Conacri)", "Guiné"], tz: "Africa/Conakry", tag: "GUI", en: "Guinea" },
  { names: ["Cabo Verde"], tz: "Atlantic/Cape_Verde", tag: "CPV", en: "Cape Verde" },
  { names: ["Mali"], tz: "Africa/Bamako", tag: "MLI", en: "Mali" },
  { names: ["Burquina Fasso", "Burkina Faso"], tz: "Africa/Ouagadougou", tag: "BFA", en: "Burkina Faso" },
  { names: ["Costa do Marfim"], tz: "Africa/Abidjan", tag: "CIV", en: "Ivory Coast" },
  { names: ["Gana"], tz: "Africa/Accra", tag: "GHA", en: "Ghana" },
  { names: ["Togo"], tz: "Africa/Lome", tag: "TOG", en: "Togo" },
  { names: ["Benim"], tz: "Africa/Porto-Novo", tag: "BEN", en: "Benin" },
  { names: ["Nigéria"], tz: "Africa/Lagos", tag: "NGA", en: "Nigeria" },
  { names: ["Serra Leoa"], tz: "Africa/Freetown", tag: "SLE", en: "Sierra Leone" },
  { names: ["Libéria"], tz: "Africa/Monrovia", tag: "LBR", en: "Liberia" },
  { names: ["Camarões"], tz: "Africa/Douala", tag: "CMR", en: "Cameroon" },
  { names: ["Gabão"], tz: "Africa/Libreville", tag: "GAB", en: "Gabon" },
  { names: ["Congo"], tz: "Africa/Brazzaville", tag: "CGO", en: "Congo" },
  { names: ["RD Congo", "República Democrática do Congo"], tz: "Africa/Kinshasa", tag: "COD", en: "DR Congo" },
  { names: ["Angola"], tz: "Africa/Luanda", tag: "ANG", en: "Angola" },
  { names: ["Moçambique"], tz: "Africa/Maputo", tag: "MOZ", en: "Mozambique" },
  { names: ["São Tomé e Príncipe"], tz: "Africa/Sao_Tome", tag: "STP", en: "São Tomé" },
  { names: ["Quénia"], tz: "Africa/Nairobi", tag: "KEN", en: "Kenya" },
  { names: ["Uganda"], tz: "Africa/Kampala", tag: "UGA", en: "Uganda" },
  { names: ["Zâmbia"], tz: "Africa/Lusaka", tag: "ZAM", en: "Zambia" },
  { names: ["Zimbabué"], tz: "Africa/Harare", tag: "ZIM", en: "Zimbabwe" },
  { names: ["África do Sul"], tz: "Africa/Johannesburg", tag: "RSA", en: "South Africa" },
  { names: ["Madagáscar"], tz: "Indian/Antananarivo", tag: "MAD", en: "Madagascar" },
  { names: ["Maurícia"], tz: "Indian/Mauritius", tag: "MRI", en: "Mauritius" },
  { names: ["Argentina"], tz: "America/Argentina/Buenos_Aires", tag: "ARG", en: "Argentina" },
  { names: ["Uruguai"], tz: "America/Montevideo", tag: "URU", en: "Uruguay" },
  { names: ["Paraguai"], tz: "America/Asuncion", tag: "PAR", en: "Paraguay" },
  { names: ["Chile"], tz: "America/Santiago", tag: "CHI", en: "Chile" },
  { names: ["Bolívia"], tz: "America/La_Paz", tag: "BOL", en: "Bolivia" },
  { names: ["Peru"], tz: "America/Lima", tag: "PER", en: "Peru" },
  { names: ["Equador"], tz: "America/Guayaquil", tag: "ECU", en: "Ecuador" },
  { names: ["Colômbia"], tz: "America/Bogota", tag: "COL", en: "Colombia" },
  { names: ["Venezuela"], tz: "America/Caracas", tag: "VEN", en: "Venezuela" },
  { names: ["México"], tz: "America/Mexico_City", tag: "MEX", en: "Mexico" },
  { names: ["Guatemala"], tz: "America/Guatemala", tag: "GUA", en: "Guatemala" },
  { names: ["Honduras"], tz: "America/Tegucigalpa", tag: "HON", en: "Honduras" },
  { names: ["El Salvador"], tz: "America/El_Salvador", tag: "SLV", en: "El Salvador" },
  { names: ["Costa Rica"], tz: "America/Costa_Rica", tag: "CRC", en: "Costa Rica" },
  { names: ["Panamá"], tz: "America/Panama", tag: "PAN", en: "Panama" },
  { names: ["Jamaica"], tz: "America/Jamaica", tag: "JAM", en: "Jamaica" },
  { names: ["Haiti"], tz: "America/Port-au-Prince", tag: "HAI", en: "Haiti" },
  { names: ["República Dominicana"], tz: "America/Santo_Domingo", tag: "DOM", en: "Dominican Rep." },
  { names: ["Trindade e Tobago"], tz: "America/Port_of_Spain", tag: "TRI", en: "Trinidad" },
  { names: ["Barbados"], tz: "America/Barbados", tag: "BRB", en: "Barbados" },
  { names: ["Bahamas"], tz: "America/Nassau", tag: "BAH", en: "Bahamas" },
  { names: ["Bermudas"], tz: "Atlantic/Bermuda", tag: "BER", en: "Bermuda" },
  { names: ["Ilhas Caimão"], tz: "America/Cayman", tag: "CAY", en: "Cayman" },
  { names: ["Porto Rico"], tz: "America/Puerto_Rico", tag: "PUR", en: "Puerto Rico" },
  { names: ["Cuba"], tz: "America/Havana", tag: "CUB", en: "Cuba" },
  { names: ["Japão"], tz: "Asia/Tokyo", tag: "JPN", en: "Japan" },
  { names: ["República da Coreia", "Coreia do Sul"], tz: "Asia/Seoul", tag: "KOR", en: "Korea" },
  { names: ["China"], tz: "Asia/Shanghai", tag: "CHN", en: "China" },
  { names: ["Taiwan"], tz: "Asia/Taipei", tag: "TPE", en: "Taiwan" },
  { names: ["Índia"], tz: "Asia/Kolkata", tag: "IND", en: "India" },
  { names: ["Paquistão"], tz: "Asia/Karachi", tag: "PAK", en: "Pakistan" },
  { names: ["Singapura"], tz: "Asia/Singapore", tag: "SGP", en: "Singapore" },
  { names: ["Austrália"], tz: "Australia/Sydney", tag: "AUS", en: "Australia" },
  { names: ["Nova Zelândia"], tz: "Pacific/Auckland", tag: "NZL", en: "New Zealand" },
];

const norm = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

/** The zone of a nationality ("Noruega" → Europe/Oslo), or undefined when unknown or empty. */
export function nationZone(nationality: string | null | undefined): string | undefined {
  const n = norm(nationality ?? "");
  if (!n) return undefined;
  return NATION_ZONES.find((z) => z.names.some((name) => norm(name) === n))?.tz;
}

/**
 * The tag of a player's second clock. Zones shared by two nationalities (Kosovo has no IANA zone of its own
 * and uses Belgrade's) would read the other country's tag, so his own nationality's tag wins when it is his zone.
 */
export function playerRefTag(prefs: { refTz?: string } | null | undefined, nationality: string | null | undefined): string {
  const tz = playerRefTz(prefs, nationality);
  const n = norm(nationality ?? "");
  const own = NATION_ZONES.find((z) => z.tz === tz && z.names.some((name) => norm(name) === n));
  return own?.tag ?? refTag(tz);
}

/** The second clock of a player: the one he chose, else his nationality's, else Portugal's. */
export function playerRefTz(prefs: { refTz?: string } | null | undefined, nationality: string | null | undefined): string {
  return prefs?.refTz || nationZone(nationality) || PORTUGAL_TZ;
}

export const refTag = (tz: string | undefined) => REF_ZONES.find((z) => z.tz === tz)?.tag ?? NATION_ZONES.find((z) => z.tz === tz)?.tag ?? "PT";
/** "SWE" → "Sweden" (edits are in English). */
export const refName = (tag: string | undefined) => {
  // "PT +1": the second clock is already on the next day.
  const [t, shift] = (tag ?? "").split(" ");
  return `${REF_ZONES.find((z) => z.tag === t)?.en ?? NATION_ZONES.find((z) => z.tag === t)?.en ?? "Portugal"}${shift ? ` ${shift}` : ""}`;
};

/** The club's time zone: set by hand, else guessed from its league and name, else Portugal. */
export function clubTimezone(c: { timezone?: string | null; league?: string; name?: string } | null | undefined): string {
  if (!c) return PORTUGAL_TZ;
  if (c.timezone) return c.timezone;
  // Portuguese leagues first: "Liga Portugal", "Liga 3", "Taça de Portugal" never mean abroad.
  if (/portugal|liga 3|campeonato de portugal|taça/i.test(c.league ?? "")) return PORTUGAL_TZ;
  const text = `${c.league ?? ""} ${c.name ?? ""}`;
  return GUESSES.find(([re]) => re.test(text))?.[1] ?? PORTUGAL_TZ;
}

/** Minutes east of UTC for a zone at a given instant. */
function offset(tz: string, at: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(at);
  const n = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"));
  return Math.round((asUtc - at.getTime()) / 60000);
}

/** "13:00" Portugal time on a date → the same instant in `tz` ("15:00"). Null when the zones agree. */
export function localFromPortugal(dateIso: string, hhmm: string, tz: string): string | null {
  if (!tz || tz === PORTUGAL_TZ) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m || !/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) return null;
  const noon = new Date(`${dateIso}T12:00:00Z`);
  const diff = offset(tz, noon) - offset(PORTUGAL_TZ, noon);
  if (!diff) return null;
  const mins = (Number(m[1]) * 60 + Number(m[2]) + diff + 1440) % 1440;
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}

/** "13:00" Portugal time on a date → the same instant in `tz`, always ("13:00" when the zones agree). */
export function fromPortugal(dateIso: string, hhmm: string, tz: string): string | null {
  if (!tz || tz === PORTUGAL_TZ) return hhmm.trim();
  return localFromPortugal(dateIso, hhmm, tz) ?? hhmm.trim();
}

/** The instant a wall-clock time in `tz` stands for ("2026-11-03", "16:00", "America/Los_Angeles"). */
export function instantIn(dateIso: string, hhmm: string, tz: string): Date | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m || !/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) return null;
  const asUtc = Date.UTC(Number(dateIso.slice(0, 4)), Number(dateIso.slice(5, 7)) - 1, Number(dateIso.slice(8, 10)), Number(m[1]), Number(m[2]));
  // The zone's offset at that moment (measured twice so a DST change on the day lands right).
  let t = asUtc - offset(tz, new Date(asUtc)) * 60000;
  t = asUtc - offset(tz, new Date(t)) * 60000;
  return new Date(t);
}

/** An instant as date + wall-clock time in `tz`: { date: "2026-11-04", time: "00:00" }. */
export function wallClock(at: Date, tz: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(at);
  const n = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { date: `${n("year")}-${n("month")}-${n("day")}`, time: `${n("hour")}:${n("minute")}` };
}

/** Days between two ISO dates (b − a): +1 when the second clock is already on the next day. */
export const dayShift = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);

/** US state (postal code) → its main IANA zone (split states take the zone most of their schools are in). */
export const US_STATE_TZ: Record<string, string> = {
  AL: "America/Chicago", AK: "America/Anchorage", AZ: "America/Phoenix", AR: "America/Chicago", CA: "America/Los_Angeles", CO: "America/Denver",
  CT: "America/New_York", DE: "America/New_York", DC: "America/New_York", FL: "America/New_York", GA: "America/New_York", HI: "Pacific/Honolulu",
  ID: "America/Boise", IL: "America/Chicago", IN: "America/Indiana/Indianapolis", IA: "America/Chicago", KS: "America/Chicago", KY: "America/New_York",
  LA: "America/Chicago", ME: "America/New_York", MD: "America/New_York", MA: "America/New_York", MI: "America/Detroit", MN: "America/Chicago",
  MS: "America/Chicago", MO: "America/Chicago", MT: "America/Denver", NE: "America/Chicago", NV: "America/Los_Angeles", NH: "America/New_York",
  NJ: "America/New_York", NM: "America/Denver", NY: "America/New_York", NC: "America/New_York", ND: "America/Chicago", OH: "America/New_York",
  OK: "America/Chicago", OR: "America/Los_Angeles", PA: "America/New_York", RI: "America/New_York", SC: "America/New_York", SD: "America/Chicago",
  TN: "America/Chicago", TX: "America/Chicago", UT: "America/Denver", VT: "America/New_York", VA: "America/New_York", WA: "America/Los_Angeles",
  WV: "America/New_York", WI: "America/Chicago", WY: "America/Denver", PR: "America/Puerto_Rico",
};

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const PT = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

/** "17 OCT" / "17 OUT" (edits keep no year) → the nearest such date to today, as YYYY-MM-DD. */
export function isoFromShortDate(d: string | undefined, now = new Date()): string | null {
  const m = /(\d{1,2})\s+([A-Za-zÀ-ú]{3})/.exec(d ?? "");
  if (!m) return null;
  const mon = m[2].toUpperCase();
  let idx = MONTHS.indexOf(mon);
  if (idx < 0) idx = PT.indexOf(mon);
  if (idx < 0) return null;
  const day = Number(m[1]);
  const cands = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => new Date(Date.UTC(y, idx, day)));
  const best = cands.sort((a, b) => Math.abs(a.getTime() - now.getTime()) - Math.abs(b.getTime() - now.getTime()))[0];
  return best.toISOString().slice(0, 10);
}

/**
 * Where a US game is really played: a college away game is at the other school ("Orem, UT"), and the US
 * spans six zones, so the local kick-off is the venue state's clock, not the player's school's. Any other
 * game (or a venue with no "City, ST") keeps `tz`.
 */
export function venueZone(venue: string | null | undefined, tz: string | undefined): string | undefined {
  if (!tz || !/^(America|Pacific)\//.test(tz)) return tz;
  const st = /,\s*([A-Z]{2})\.?\s*$/.exec((venue ?? "").trim())?.[1];
  return (st && US_STATE_TZ[st]) || tz;
}
