import { describe, expect, it } from "vitest";
import { dayShift, instantIn, wallClock } from "../timezone";
import { canonicalSlug, clock24, collegeSportOf, countryOf, parseBoxScore, parseIcsStarts, parseRoster, parseSchedule, positionPt, rosterPaths, sameName, stripRanking } from "./college";

describe("countryOf", () => {
  it("tells US hometowns apart from the rest of the world", () => {
    expect(countryOf("Culver City, California")).toBe("US");
    expect(countryOf("Bradenton, Fla.")).toBe("US");
    expect(countryOf("Austin, TX")).toBe("US");
    expect(countryOf("San Juan, Puerto Rico")).toBe("US");
    expect(countryOf("Lisbon, Portugal")).toBe("Portugal");
    expect(countryOf("Rio De Janeiro, Brazil")).toBe("Brasil");
    expect(countryOf("Sudbury, Ontario, Canada")).toBe("Canadá");
    expect(countryOf("Toronto, Ont.")).toBe("Canadá");
    expect(countryOf("Harrogate, England")).toBe("Inglaterra");
    expect(countryOf("Madrid, ESP")).toBe("Espanha");
    expect(countryOf("Lagos, Nigeria (IMG Academy)")).toBe("Nigéria");
  });
  it("leaves unknown places out instead of guessing", () => {
    expect(countryOf("")).toBeNull();
    expect(countryOf("Plaisir, Ile-de-France")).toBeNull();
  });
});

describe("positionPt", () => {
  it("maps roster positions to the four Portuguese labels", () => {
    expect(positionPt("Goalkeeper")).toBe("Guarda-redes");
    expect(positionPt(`GK 6'3"`)).toBe("Guarda-redes");
    expect(positionPt(`D 6'1" 171 lbs`)).toBe("Defesa");
    expect(positionPt("Defender/Midfielder")).toBe("Defesa");
    expect(positionPt(`MF 6'4" 193 lbs`)).toBe("Médio");
    expect(positionPt("F/M")).toBe("Avançado");
    expect(positionPt(`W 5'9"`)).toBe("Avançado");
  });
});

describe("parseRoster", () => {
  it("reads the classic Sidearm list", () => {
    const html = `<meta property="og:site_name" content="Lincoln Memorial University Athletics">
      <li class="sidearm-roster-player" data-player-url="/sports/mens-soccer/roster/daniel-miklosi/9330">
        <div class="sidearm-roster-player-image"><img data-src="/images/a.jpg?width=80"></div>
        <span class="sidearm-roster-player-position-long-short">Goalkeeper</span>
        <span class="sidearm-roster-player-jersey-number"> 1 </span>
        <div class="sidearm-roster-player-name"><h3><a href="/sports/mens-soccer/roster/daniel-miklosi/9330">Daniel Miklosi</a></h3></div>
        <a href="https://www.instagram.com/daniel.miklosi/">ig</a>
        <span class="sidearm-roster-player-academic-year">Sr.</span>
        <span class="sidearm-roster-player-hometown">Budapest, Hungary</span>
      </li>`;
    const r = parseRoster(html, "https://lmurailsplitters.com/sports/mens-soccer/roster")!;
    expect(r.siteName).toBe("Lincoln Memorial University");
    expect(r.players).toEqual([
      {
        name: "Daniel Miklosi",
        profileUrl: "https://lmurailsplitters.com/sports/mens-soccer/roster/daniel-miklosi/9330",
        position: "Goalkeeper",
        number: "1",
        classYear: "Sr.",
        hometown: "Budapest, Hungary",
        instagram: "daniel.miklosi",
        thumb: "https://lmurailsplitters.com/images/a.jpg",
      },
    ]);
  });

  it("reads the Nuxt payload (fields are indexes into the same array)", () => {
    const payload = [
      { firstName: 1, lastName: 2, hometown: 3, rosterPlayerId: 4, positionLong: 5, jerseyNumber: 6, academicYearShort: 7, instagramUsername: 8, image: 9 },
      "Herbert",
      "Kwakye-Amoah",
      "Accra, Ghana",
      19566,
      "Midfielder",
      8,
      "Fr.",
      "herbert.ka",
      { url: 10 },
      "/images/k.jpg",
    ];
    const html = `<script type="application/json" id="__NUXT_DATA__">${JSON.stringify(payload)}</script>`;
    const r = parseRoster(html, "https://fausports.com/sports/mens-soccer/roster")!;
    expect(r.platform).toBe("sidearm");
    expect(r.players[0]).toMatchObject({
      name: "Herbert Kwakye-Amoah",
      profileUrl: "https://fausports.com/sports/mens-soccer/roster/herbert-kwakye-amoah/19566",
      position: "Midfielder",
      number: "8",
      hometown: "Accra, Ghana",
      instagram: "herbert.ka",
      thumb: "https://fausports.com/images/k.jpg",
    });
  });

  it("is null for a page that is not a roster it knows", () => {
    expect(parseRoster("<html><body>Hello</body></html>", "https://example.com/sports/soccer/roster")).toBeNull();
  });
});

describe("schedules and box scores", () => {
  it("reads times, rankings and the calendar feed", () => {
    expect(clock24("7 p.m.")).toBe("19:00");
    expect(clock24("4:00 PM PDT")).toBe("16:00");
    expect(clock24("TBA")).toBe("");
    expect(stripRanking("#11 Virginia")).toBe("Virginia");
    expect(stripRanking("No. 5 Indiana")).toBe("Indiana");
    const ics = "BEGIN:VEVENT\nUID:vcal_24677-fausports.com\nDTSTART:20260820T230000Z\nEND:VEVENT\nBEGIN:VEVENT\nUID:vcal_24692-fausports.com\nDTSTART;VALUE=DATE:20261106\nEND:VEVENT";
    const starts = parseIcsStarts(ics);
    expect(starts.get("24677")?.toISOString()).toBe("2026-08-20T23:00:00.000Z");
    expect(starts.has("24692")).toBe(false);
  });

  it("reads a classic schedule line", () => {
    const html = `<title>2026 Men's Soccer Schedule</title><li class="sidearm-schedule-game sidearm-schedule-away-game L" data-game-id="11742">
      <div class="sidearm-schedule-game-opponent-logo"><img data-src="/images/logos/pba.png?width=80"></div>
      <div class="sidearm-schedule-game-opponent-date"><span>Aug 27 (Thu)</span><span>7:00 pm</span></div>
      <div class="sidearm-schedule-game-opponent-name"><span>#12</span> <a href="http://pba.com">Palm Beach Atlantic University</a></div>
      <div class="sidearm-schedule-game-result">L, 0-2</div>
      <div class="sidearm-schedule-game-location"><span>West Palm Beach, FL</span></div>
      <ul><li class="sidearm-schedule-game-links-boxscore"><a href="/sports/mens-soccer/stats/2026/pba/boxscore/11742">Box Score</a></li></ul></li>`;
    const [g] = parseSchedule(html, "https://lmurailsplitters.com/sports/mens-soccer/schedule")!;
    expect(g).toMatchObject({ id: "11742", date: "2026-08-27", time: "19:00", opponent: "Palm Beach Atlantic University", home: false, neutral: false, result: { us: 0, them: 2 }, boxscoreUrl: "https://lmurailsplitters.com/sports/mens-soccer/stats/2026/pba/boxscore/11742" });
  });

  it("reads goals and assists from the player tables, substitutes included", () => {
    const html = `<table><thead><tr><th>#</th><th>Player</th><th>Pos</th><th>G</th><th>A</th><th>MIN</th></tr></thead>
      <tbody><tr><td>Starters</td><td></td></tr><tr><td>7</td><td>Csato, Xavi</td><td>FWD</td><td>1</td><td>0</td><td>66</td></tr></tbody></table>
      <table><tbody><tr><td>Substitutes</td><td></td></tr><tr><td>10</td><td>Aiello, Francesco</td><td>FWD</td><td>0</td><td>1</td><td>29</td></tr></tbody></table>`;
    const b = parseBoxScore(html);
    expect(b.players).toEqual([
      { name: "Xavi Csato", goals: 1, assists: 0, minutes: 66, started: true },
      { name: "Francesco Aiello", goals: 0, assists: 1, minutes: 29, started: false },
    ]);
    expect(sameName("Xavi Csato", "Xavi Csató")).toBe(true);
    expect(sameName("Daniel Benedek Miklosi", "Daniel Miklosi")).toBe(true);
    expect(sameName("David Roberts", "David Robertson")).toBe(false);
  });
});

describe("kick-off zones", () => {
  it("turns a US local time into Portugal's, with the day change", () => {
    const at = instantIn("2026-11-03", "16:00", "America/Los_Angeles")!;
    expect(at.toISOString()).toBe("2026-11-04T00:00:00.000Z");
    expect(wallClock(at, "Europe/Lisbon")).toEqual({ date: "2026-11-04", time: "00:00" });
    expect(dayShift("2026-11-03", "2026-11-04")).toBe(1);
    // Summer time on both sides: 4 p.m. PDT is midnight in Lisbon too (UTC−7 vs UTC+1).
    expect(wallClock(instantIn("2026-09-12", "16:00", "America/Los_Angeles")!, "Europe/Lisbon")).toEqual({ date: "2026-09-13", time: "00:00" });
  });
});

describe("zoneFromGames", () => {
  it("keeps a California school in Los Angeles although Phoenix reads its autumn games the same", async () => {
    const { zoneFromGames } = await import("../college");
    // 19:00 PDT on 12 Sep = 02:00 UTC on 13 Sep.
    const pairs = [{ at: new Date("2026-09-13T02:00:00Z"), date: "2026-09-12", time: "19:00" }];
    expect(zoneFromGames(pairs, "America/Los_Angeles")).toBe("America/Los_Angeles");
  });
  it("still corrects a wrong state zone when the games say otherwise", async () => {
    const { zoneFromGames } = await import("../college");
    const pairs = [{ at: new Date("2026-09-12T23:00:00Z"), date: "2026-09-12", time: "19:00" }];
    expect(zoneFromGames(pairs, "America/Los_Angeles")).toBe("America/New_York");
  });
});

describe("basketball", () => {
  it("tries the basketball roster slugs, soccer's unchanged", () => {
    expect(rosterPaths("M", "basketball")).toEqual(["mens-basketball", "mbball", "basketball"]);
    expect(rosterPaths("F", "basketball")).toEqual(["womens-basketball", "wbball", "basketball"]);
    expect(rosterPaths("M")).toEqual(["mens-soccer", "msoc", "soccer"]);
    expect(rosterPaths("F", "soccer")).toEqual(["womens-soccer", "wsoc", "soccer"]);
  });

  it("reads the sport from the page's path and names it as the platforms do", () => {
    expect(collegeSportOf("https://acusports.com/sports/mens-basketball/schedule")).toBe("basketball");
    expect(collegeSportOf("https://x.edu/sports/wbball/roster")).toBe("basketball");
    expect(collegeSportOf("https://x.edu/sports/basketball/schedule")).toBe("basketball");
    expect(collegeSportOf("https://x.edu/sports/msoc/schedule")).toBe("soccer");
    expect(collegeSportOf("https://x.edu/sports/womens-soccer/schedule")).toBe("soccer");
    expect(collegeSportOf(null)).toBe("soccer");
    expect(canonicalSlug("basketball", "F")).toBe("womens-basketball");
    expect(canonicalSlug("soccer", "M")).toBe("mens-soccer");
  });

  it("maps basketball positions to Base / Extremo / Poste", () => {
    for (const [pos, pt] of [
      ["G", "Base"], ["PG", "Base"], ["SG", "Base"], ["Guard", "Base"], ["Point Guard", "Base"],
      ["F", "Extremo"], ["SF", "Extremo"], ["Forward", "Extremo"], ["G/F", "Extremo"], ["Guard / Forward", "Extremo"],
      ["C", "Poste"], ["Center", "Poste"], ["PF", "Poste"], ["F/C", "Poste"], ["Forward / Center", "Poste"], [`C 6'11"`, "Poste"],
    ]) expect(positionPt(pos, "basketball"), pos).toBe(pt);
    // Football's "G" is still the goalkeeper.
    expect(positionPt("G")).toBe("Guarda-redes");
  });

  it("reads who played, minutes, points and the final score — never goals or assists", () => {
    const html = `<table><thead><tr><th>Team</th><th>1st half</th><th>2nd half</th><th>Total</th></tr></thead>
      <tbody><tr><td>Lamar University</td><td>31</td><td>50</td><td>81</td></tr><tr><td>Abilene Christian</td><td>39</td><td>44</td><td>83</td></tr></tbody></table>
      <table><thead><tr><th>#</th><th>Player</th><th>gs</th><th>min</th><th>fg</th><th>3pt</th><th>ft</th><th>orb-drb</th><th>reb</th><th>pf</th><th>a</th><th>to</th><th>blk</th><th>stl</th><th>pts</th></tr></thead>
      <tbody><tr><td>24</td><td>Dye, Isaac</td><td>*</td><td>31</td><td>6 - 9</td><td>4 - 5</td><td>2 - 2</td><td>0 - 2</td><td>2</td><td>4</td><td>0</td><td>1</td><td>0</td><td>0</td><td>18</td></tr>
      <tr><td>11</td><td>Yimga Moukouri, Victor</td><td></td><td>12</td><td>1 - 2</td><td>0 - 0</td><td>0 - 0</td><td>1 - 2</td><td>3</td><td>1</td><td>2</td><td>0</td><td>1</td><td>0</td><td>2</td></tr>
      <tr><td></td><td>Totals</td><td></td><td>200</td><td>30-60</td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td>83</td></tr></tbody></table>`;
    const b = parseBoxScore(html, "basketball");
    expect(b.totals).toEqual([
      { team: "Lamar University", total: 81 },
      { team: "Abilene Christian", total: 83 },
    ]);
    expect(b.players).toEqual([
      { name: "Isaac Dye", goals: 0, assists: 0, minutes: 31, started: true, points: 18 },
      { name: "Victor Yimga Moukouri", goals: 0, assists: 0, minutes: 12, started: false, points: 2 },
    ]);
    expect(b.scorers).toEqual([]);
    // The football reader finds no player lines in it (no G / A columns).
    expect(parseBoxScore(html).players).toEqual([]);
  });
});
