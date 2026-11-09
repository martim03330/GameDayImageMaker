/* Run: npx tsx scripts/test-sources.ts [--search] */
import { fetchImage, fetchMatches, fetchProfile, fetchUpcoming, searchPlayers } from "../src/lib/sources";
import type { ExternalMatch } from "../src/lib/sources";

const PLAYERS: { label: string; urls: string[] }[] = [
  {
    label: "Moisés Conceição (Vianense)",
    urls: [
      "https://www.zerozero.pt/jogador/moises-conceicao/526616",
      "https://www.transfermarkt.pt/moises-conceicao/profil/spieler/740856",
    ],
  },
  {
    label: "Diogo Tavares (Valletta FC)",
    urls: [
      "https://www.zerozero.pt/jogador/diogo-tavares/555084",
      "https://www.transfermarkt.pt/diogo-tavares/profil/spieler/558310",
    ],
  },
];

function fmtMatch(m: ExternalMatch) {
  const venue = m.home ? "vs" : "@ ";
  const extra = [
    m.goals ? `${m.goals}G` : "",
    m.assists ? `${m.assists}A` : "",
    m.yellow ? `${m.yellow}Y` : "",
    m.red ? `${m.red}R` : "",
    m.started ? "start" : m.minutes ? `sub${m.subbedIn != null ? " " + m.subbedIn + "'" : ""}` : m.participation,
    m.rating != null ? `rating ${m.rating}` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `  ${m.date} ${m.time ?? "     "} ${m.competition} ${m.matchday} | ${m.team} ${venue} ${m.opponent} ${m.goalsFor}-${m.goalsAgainst} (${m.result}) | ${m.minutes}' ${extra}\n      crest=${m.opponentCrestUrl ?? "-"} photos=${m.photosUrl ?? "-"}`;
}

async function main() {
  if (process.argv.includes("--search")) {
    for (const q of ["Moisés Conceição", "Diogo Tavares"]) {
      const r = await searchPlayers(q);
      console.log(`\n### search "${q}": ${r.length} results`);
      for (const x of r.slice(0, 12)) console.log(`  [${x.source}] ${x.name} | ${x.club ?? "-"} | ${x.birthDate ?? x.age ?? ""} | ${x.url}`);
    }
  }

  for (const p of PLAYERS) {
    for (const url of p.urls) {
      console.log(`\n================ ${p.label} — ${url}`);
      try {
        const profile = await fetchProfile(url);
        console.log("PROFILE", JSON.stringify(profile, null, 2));
        if (profile.clubCrestUrl) {
          const buf = await fetchImage(profile.clubCrestUrl);
          console.log(`crest download ok: ${buf.length} bytes`);
        }
      } catch (e) {
        console.error("profile failed:", (e as Error).message);
      }
      try {
        const matches = await fetchMatches(url);
        console.log(`MATCHES (${matches.length} this season, showing 5):`);
        matches.slice(0, 5).forEach((m) => console.log(fmtMatch(m)));
      } catch (e) {
        console.error("matches failed:", (e as Error).message);
      }
      try {
        const fx = await fetchUpcoming(url);
        console.log(`UPCOMING (${fx.length}, showing 4):`);
        fx.slice(0, 4).forEach((f) =>
          console.log(`  ${f.date} ${f.time ?? "--:--"} ${f.competition} ${f.matchday ?? ""} | ${f.team} ${f.home ? "vs" : "@ "} ${f.opponent} | crest=${f.opponentCrestUrl ?? "-"}`),
        );
      } catch (e) {
        console.error("upcoming failed:", (e as Error).message);
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
