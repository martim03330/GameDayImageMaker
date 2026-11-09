export type SourceId = "zerozero" | "transfermarkt" | "college";

export type ExternalProfile = {
  source: SourceId;
  url: string;
  /** Source-specific player id (zerozero numeric id / transfermarkt spieler id). */
  externalId?: string;
  fullName?: string;
  knownAs?: string;
  birthDate?: string /* YYYY-MM-DD */;
  nationality?: string;
  position?: string;
  foot?: string;
  heightCm?: number;
  shirtNumber?: string;
  clubName?: string;
  clubUrl?: string;
  clubCrestUrl?: string /* absolute, largest available */;
  photoUrl?: string;
  marketValue?: string;
  contractUntil?: string;
  agent?: string;
};

export type Participation = "played" | "unused_sub" | "not_in_squad";

export type ExternalMatch = {
  source: SourceId;
  externalId: string;
  date: string /* YYYY-MM-DD */;
  competition: string;
  matchday: string;
  team: string;
  opponent: string;
  home: boolean;
  goalsFor: number;
  goalsAgainst: number;
  minutes: number;
  goals: number;
  assists: number;
  yellow: number;
  red: number;
  started?: boolean;
  matchUrl?: string;
  photosUrl?: string;
  opponentCrestUrl?: string;
  /** Short competition code as shown by the source (e.g. zerozero "L3", transfermarkt "PT3A"). */
  competitionShort?: string;
  /** Kick-off time HH:MM (local, when known). */
  time?: string;
  /** Result from the player's team perspective. */
  result?: "W" | "D" | "L";
  /** Whether the player took part. Games where he did not play have minutes 0. */
  participation?: Participation;
  /** Minute subbed on / off, when applicable. */
  subbedIn?: number;
  subbedOut?: number;
  /** Player rating when the source provides one (zerozero, sparse). */
  rating?: number;
  teamCrestUrl?: string;
};

export type ExternalFixture = {
  source: SourceId;
  externalId: string;
  date: string;
  time?: string;
  competition: string;
  matchday?: string;
  team: string;
  opponent: string;
  home: boolean;
  matchUrl?: string;
  opponentCrestUrl?: string;
  teamCrestUrl?: string;
  /** IANA zone date / time are in (college: the school's); unset = Portugal, as zerozero gives them. */
  timeZone?: string;
  /** The ground, when the source names it. */
  venue?: string;
};

export type SearchResult = {
  source: SourceId;
  name: string;
  club?: string;
  url: string;
  photoUrl?: string;
  /** Extra disambiguation info (full name, birth date, position, age...). */
  fullName?: string;
  birthDate?: string;
  position?: string;
  age?: number;
};
