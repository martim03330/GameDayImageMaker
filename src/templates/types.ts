import type { NatAlign } from "./natgeom";
import type { CutEdges, EditContent, PostType, TemplateParams } from "@/lib/types";

export const CANVAS_W = 1080;
export const CANVAS_H = 1350;

/**
 * Native stories (1080×1920): the band the type, crests and logo use. Measured on the user's phone in the
 * Instagram story composer (2026-10-14): the top bar ends ~150px down and the caption starts ~1690px, so
 * content runs from STORY_TOP to STORY_BOTTOM — no wasted space above or below. Grounds and the player
 * still run full-bleed. Change these two numbers to retune every story at once.
 */
export const STORY_TOP = 170;
export const STORY_BOTTOM = 1680;

export type RenderClub = {
  name: string;
  crestUrl: string | null;
  city?: string;
  founded?: string;
  stadium?: string;
  cityImageUrl?: string | null;
  /** Several city photos, so different looks show different places. */
  cityImages?: string[];
  stadiumImages?: string[];
  /** Generated scenery in the club colours (smoke, stage light), no stadium. */
  backdrops?: string[];
  coords?: string;
  /** IANA time zone of the club; kick-offs abroad show local time and Portugal's. */
  timezone?: string;
};

/** Everything a template needs, already resolved to URLs. Safe to pass to client components. */
export type RenderData = {
  /** Canvas height: 1350 for a post, 1920 when a look draws a native Instagram story. */
  canvasH?: number;
  postType: PostType;
  params: TemplateParams;
  content: EditContent;
  photoUrl: string | null;
  photoIsCutout: boolean;
  /** Where the face is inside the cutout (0..1), when detected. */
  face: [number, number, number, number] | null;
  /** Aspect ratio (w/h) of the cutout, for layouts that crop around the face. */
  photoAspect: number | null;
  /** Where the photo frame cuts the player; templates fade those edges so they look natural. */
  cut: CutEdges;
  /** Face height in pixels of the original photo (0 = unknown). */
  facePx: number;
  /** Another cutout of the same player, for two-photo layouts. */
  photo2Url: string | null;
  /** Welcome posts: the photo shown big in black and white behind him (picked by hand). */
  ghost?: { url: string; face: [number, number, number, number] | null; aspect: number | null } | null;
  /** Every cutout / original of the player (chosen photo first), for multi-photo layouts. */
  cutouts: { url: string; original: string; aspect: number | null; face: [number, number, number, number] | null; cut: CutEdges; pose?: string; /** Where the cutout sits in the original (natkit's exact framing). */ align?: NatAlign | null; /** Other people / him in the original, 0..1 boxes (natkit's people-aware layout); null = not measured. */ others?: number[][] | null; himBox?: number[] | null }[];
  bgPhotoUrl: string | null;
  insetUrl: string | null;
  club: RenderClub | null;
  fromClub: RenderClub | null;
  toClub: RenderClub | null;
  agency: { name: string; logoUrl: string | null; logoDarkUrl: string | null; tagline?: string; /** The user's own studio handle (an Instagram @), drawn small instead of the agency logo on his personal clients' edits. */ studio?: string };
  player: { number: string; position: string; nationality?: string };
  /** The player's latest games (newest first), for calendars and infographics. */
  matches: RenderMatch[];
  /** The player's next games (soonest first), for "up next" posts. */
  fixtures: RenderFixture[];
};

export type RenderFixture = {
  /** "2026-10-10" */
  date: string;
  /** "14:30" or "" */
  time: string;
  opponent: string;
  opponentCrest: string | null;
  home: boolean;
  competition: string;
};

export type RenderMatch = {
  date: string;
  opponent: string;
  opponentCrest: string | null;
  home: boolean;
  goalsFor: number;
  goalsAgainst: number;
  goals: number;
  assists: number;
  minutes: number;
};
