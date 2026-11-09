import type { CutEdges, EditContent, Pose, PostType, TemplateParams } from "@/lib/types";
import type { RenderClub, RenderData, RenderFixture, RenderMatch } from "./types";
import type { NatAlign } from "./natgeom";
import { dayShift, instantIn, isoFromShortDate, PORTUGAL_TZ, refTag, venueZone, wallClock } from "@/lib/timezone";

export type RenderPhoto = {
  url: string;
  cutoutUrl: string | null;
  kind?: string;
  face?: [number, number, number, number] | null;
  aspect?: number | null;
  /** Head-and-shoulders crop (face takes a big share of the height) rather than full body. */
  bust?: boolean;
  /** 0..1 match of the shirt with the current club's colours. */
  kit?: number;
  /** The user set the kit by hand (true = current club, false = another club); undefined = colour match. */
  kitByUser?: boolean;
  cut?: CutEdges;
  /** Face height in pixels of the ORIGINAL photo: how far this photo can be enlarged before it looks soft. */
  facePx?: number;
  pose?: Pose;
  facing?: "left" | "right" | "front";
  /** Only the head (face over ~38% of the cutout's height): fine for face close-ups, nothing else. */
  headOnly?: boolean;
  /** Part of another player stayed in the cutout: left out of automatic picks too. */
  messy?: boolean;
  /** Blurred or too far away to look professional: left out of automatic picks. */
  soft?: boolean;
  /** Where the cutout sits in the original (NATURAL looks frame from it); null = not measured yet. */
  natAlign?: NatAlign | null;
  /** Other people in the original (0..1 boxes) and his own box: the looks keep their text off them. */
  others?: number[][] | null;
  himBox?: number[] | null;
};

/** Plain, serialisable lookups so the browser can build previews without the database. */
export type RenderContext = {
  playerClubId: string | null;
  photos: Record<string, RenderPhoto>;
  clubs: Record<string, RenderClub>;
  agency: { name: string; logoUrl: string | null; logoDarkUrl: string | null; tagline?: string; studio?: string };
  player: { number: string; position: string; nationality?: string };
  /** Full club name → how the agency writes it in edits ("Académica OAF" → "AAC/OAF"). */
  teamNames?: Record<string, string>;
  matches?: RenderMatch[];
  fixtures?: RenderFixture[];
  /** Real photos of the ground each game (zerozero id) is played at, when good ones exist. */
  venues?: Record<string, { name: string; images: string[] }>;
  /** The player's second clock (PlayerPrefs.refTz); Portugal when unset. */
  refTz?: string;
  /** Its tag ("NOR", "PT"…), when it is not simply refTag(refTz). */
  refTag?: string;
};

/** Clubs written the agency's way everywhere, also in edits saved before the short name was set. */
function renameTeams(c: EditContent, names: Record<string, string> | undefined): EditContent {
  if (!names) return c;
  const fix = (t: string | undefined) => (t ? t.replace(/[^·—|]+/g, (part) => { const k = part.trim(); return names[k] ? part.replace(k, names[k]) : part; }) : t);
  return { ...c, homeTeam: fix(c.homeTeam), awayTeam: fix(c.awayTeam), subline: fix(c.subline) ?? "" };
}

/** Edits are written in English: Portuguese month abbreviations in older content ("19 SET") become English ("19 SEP"). */
const PT_MONTHS: Record<string, string> = { FEV: "FEB", ABR: "APR", MAI: "MAY", AGO: "AUG", SET: "SEP", OUT: "OCT", DEZ: "DEC" };
function englishMonth(d?: string): string | undefined {
  return d?.replace(/\b(FEV|ABR|MAI|AGO|SET|OUT|DEZ)\b/gi, (m) => {
    const en = PT_MONTHS[m.toUpperCase()];
    return m === m.toUpperCase() ? en : en.charAt(0) + en.slice(1).toLowerCase();
  });
}

/**
 * Players abroad: zerozero gives the kick-off in Portugal's time, a US school its own zone (content.timeTz).
 * The edit shows the local time with the player's second clock next to it — Portugal's unless he chose another, "15:00 (13:00 PT)", "19:30 (17:30 SWE)";
 * looks that set the time as a big number use timeLocal/timePt, and timeRef is that clock's tag.
 */
function kickoff(c: EditContent, tz: string | undefined, refTz: string | undefined, tagOf?: string): Partial<EditContent> {
  const t = (c.time ?? "").trim();
  if (!/^\d{1,2}:\d{2}$/.test(t) || t === "00:00") return {};
  const iso = isoFromShortDate(c.date);
  if (!iso) return {};
  // The stored time is Portugal's (zerozero) unless the source said otherwise (college: the school's zone).
  const at = instantIn(iso, t, c.timeTz || PORTUGAL_TZ);
  if (!at) return {};
  // A US away game is in the other school's state: its clock is the local one.
  const local = wallClock(at, venueZone(c.venue, tz) || PORTUGAL_TZ);
  const other = wallClock(at, refTz || PORTUGAL_TZ);
  // The edit shows the local day (a late game abroad can already be the next day there).
  const day = local.date !== iso ? { date: shortDay(local.date) } : {};
  // Same clock in both places (a Portuguese club, or abroad in the player's own zone): one time only.
  if (local.time === other.time && local.date === other.date) return local.time === t ? day : { ...day, time: local.time, timeLocal: local.time };
  // The second clock on another day than the game: "16:00 (00:00 PT +1)".
  const shift = dayShift(local.date, other.date);
  const tag = `${tagOf || refTag(refTz || PORTUGAL_TZ)}${shift ? ` ${shift > 0 ? "+" : ""}${shift}` : ""}`;
  return { ...day, time: `${local.time} (${other.time} ${tag})`, timeLocal: local.time, timePt: other.time, timeRef: tag };
}

const SHORT_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
/** "2026-11-04" → "4 NOV" (the format edits keep their date in). */
const shortDay = (iso: string) => `${Number(iso.slice(8, 10))} ${SHORT_MONTHS[Number(iso.slice(5, 7)) - 1]}`;

export function composeRenderData(
  ctx: RenderContext,
  input: { postType: PostType; photoId: string | null; params: TemplateParams; content: EditContent },
): RenderData {
  const photo = input.photoId ? ctx.photos[input.photoId] : undefined;
  const backdrop = input.content.backdropPhotoId ? ctx.photos[input.content.backdropPhotoId] : undefined;
  const inset = input.content.insetPhotoId ? ctx.photos[input.content.insetPhotoId] : undefined;
  const venue = input.content.gameId ? ctx.venues?.[input.content.gameId] : undefined;
  const sceneFor = (c: RenderClub): RenderClub =>
    input.params.scene
      ? { ...c, stadiumImages: [input.params.scene], backdrops: [input.params.scene] }
      : venue?.images.length
        ? { ...c, stadiumImages: venue.images }
        : c;
  // The edit's own generated scene, when it has one, leads the player's club; otherwise the real
  // ground of the game (home or away) replaces the generated stands, so random picks land on it too.
  const club = (id: string | null | undefined) => (id && ctx.clubs[id] ? (id === ctx.playerClubId ? sceneFor(ctx.clubs[id]) : ctx.clubs[id]) : null);

  return {
    postType: input.postType,
    params: input.params,
    // Never the day of the week (old edits stored "SAT 10 OCT"): only "10 OCT".
    content: { ...renameTeams(input.content, ctx.teamNames), date: englishMonth(input.content.date?.replace(/^\s*(MON|TUE|WED|THU|FRI|SAT|SUN|SEG|TER|QUA|QUI|SEX|SÁB|SAB|DOM)[A-ZÁ]*[,.]?\s+(?=\d)/i, "")),
      // Goal posts never show the score: a goal next to a final draw or defeat loses credibility (the user's rule).
      // …nor a score kept in the stats ("Score 0-0", "Resultado 2-1") by older goal edits.
      ...(input.postType === "goal"
        ? { homeGoals: "", awayGoals: "", stats: input.content.stats.filter((x) => !/^(score|result|resultado|placar|marcador)$/i.test(x.label.trim())) }
        : {}),
      ...kickoff(input.content, ctx.playerClubId ? ctx.clubs[ctx.playerClubId]?.timezone : undefined, ctx.refTz, ctx.refTag) },
    photoUrl: photo ? photo.cutoutUrl ?? photo.url : null,
    photoIsCutout: !!photo?.cutoutUrl,
    face: photo?.cutoutUrl ? photo.face ?? null : null,
    photoAspect: photo?.cutoutUrl ? photo.aspect ?? null : null,
    cut: photo?.cutoutUrl ? photo.cut ?? {} : {},
    facePx: photo?.facePx ?? 0,
    // Same kind of crop as the chosen photo, current-club kit first.
    cutouts: [
      ...(photo?.cutoutUrl ? [photo] : []),
      ...Object.entries(ctx.photos)
        .filter(([id, p]) => id !== input.photoId && p.kind === "player" && p.cutoutUrl && !!p.bust === !!photo?.bust && (p.kit ?? 0.5) >= 0.5)
        .map(([, p]) => p)
        .sort((a, b) => (b.kit ?? 0.5) - (a.kit ?? 0.5)),
    ].map((p) => ({ url: p.cutoutUrl!, original: p.url, aspect: p.aspect ?? null, face: p.face ?? null, cut: p.cut ?? {}, pose: p.pose, align: p.natAlign ?? null, others: p.others ?? null, himBox: p.himBox ?? null })),
    // Second full-length photo for two-photo layouts: sharp, feet in frame, current kit, a pose that differs.
    // A welcome post lays a photo of him playing over the portrait: the one picked by hand, else the best one.
    photo2Url:
      (input.postType === "welcome" && input.content.actionPhotoId ? ctx.photos[input.content.actionPhotoId]?.cutoutUrl : null) ??
      Object.entries(ctx.photos)
        .filter(([id, p]) => id !== input.photoId && !(input.postType === "welcome" && id === input.content.backdropPhotoId) && p.kind === "player" && p.cutoutUrl && !p.bust && (p.kit ?? 0.5) >= 0.5)
        .map(([, p]) => ({
          p,
          score:
            (p.soft ? -10 : 0) +
            ((p.cut?.bottom ?? 0) < 0.05 ? 3 : 0) +
            (p.pose && p.pose !== photo?.pose ? 1 : 0) +
            // Poses with presence (a stance, arms out) read best small; then the same kit as the main photo.
            (p.pose === "crouch" || p.pose === "open" ? 2 : p.pose === "action" || p.pose === "celebrate" ? 1.5 : p.pose === "standing" ? 0.5 : 0) +
            (p.kit ?? 0.5) * 2,
        }))
        .sort((a, b) => b.score - a.score)[0]?.p.cutoutUrl ?? null,
    ghost: input.postType === "welcome" && backdrop?.cutoutUrl ? { url: backdrop.cutoutUrl, face: backdrop.face ?? null, aspect: backdrop.aspect ?? null } : null,
    bgPhotoUrl: backdrop?.url ?? photo?.url ?? null,
    insetUrl: inset?.url ?? null,
    club: club(ctx.playerClubId),
    fromClub: club(input.content.fromClubId),
    toClub: club(input.content.toClubId),
    agency: ctx.agency,
    player: ctx.player,
    matches: ctx.matches ?? [],
    fixtures: ctx.fixtures ?? [],
  };
}
