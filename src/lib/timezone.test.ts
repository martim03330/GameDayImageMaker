import { describe, expect, it } from "vitest";
import { nationZone, playerRefTag, playerRefTz, refName } from "./timezone";

describe("second clock from nationality", () => {
  it("uses the nationality's zone when none was chosen", () => {
    expect(playerRefTz({}, "Noruega")).toBe("Europe/Oslo");
    expect(playerRefTag({}, "Noruega")).toBe("NOR");
    expect(playerRefTz({}, "Maurícia")).toBe("Indian/Mauritius");
    expect(refName("NOR")).toBe("Norway");
  });
  it("keeps a clock chosen by hand", () => {
    expect(playerRefTz({ refTz: "Europe/Stockholm" }, "Noruega")).toBe("Europe/Stockholm");
    expect(playerRefTag({ refTz: "Europe/Stockholm" }, "Noruega")).toBe("SWE");
  });
  it("falls back to Portugal when the nationality is unknown", () => {
    expect(playerRefTz({}, "")).toBe("Europe/Lisbon");
    expect(playerRefTag({}, "Atlântida")).toBe("PT");
  });
  it("gives a shared zone the player's own tag", () => {
    expect(nationZone("Kosovo")).toBe("Europe/Belgrade");
    expect(playerRefTag({}, "Kosovo")).toBe("KOS");
    expect(playerRefTag({}, "Sérvia")).toBe("SRB");
    expect(playerRefTag({}, "Escócia")).toBe("UK");
  });
});

describe("venueZone", () => {
  it("puts a US away game in the venue's state", async () => {
    const { venueZone } = await import("./timezone");
    expect(venueZone("Orem, UT", "America/Los_Angeles")).toBe("America/Denver");
    expect(venueZone("Prairie View, TX", "America/Chicago")).toBe("America/Chicago");
    expect(venueZone("Stadion Ticha", "Europe/Sofia")).toBe("Europe/Sofia");
    expect(venueZone("", "America/Los_Angeles")).toBe("America/Los_Angeles");
  });
});

describe("tbdOpponent", () => {
  it("treats tournament slots as an undrawn opponent", async () => {
    const { tbdOpponent } = await import("./sync");
    expect(tbdOpponent("Southwestern Athletic Conference Championship")).toBe(true);
    expect(tbdOpponent("Final")).toBe(true);
    expect(tbdOpponent("America East Semifinal")).toBe(true);
    expect(tbdOpponent("Utah Valley")).toBe(false);
    expect(tbdOpponent("Binghamton University")).toBe(false);
  });
});
