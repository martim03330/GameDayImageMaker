import { describe, expect, it } from "vitest";
import { genderOf, isCollegeSource } from "./college";

describe("college club sources", () => {
  it("accepts soccer and basketball schedule pages, nothing else", () => {
    for (const u of [
      "https://gozips.com/sports/mens-soccer/schedule",
      "https://x.edu/sports/wsoc/schedule/",
      "https://acusports.com/sports/mens-basketball/schedule",
      "https://acusports.com/sports/womens-basketball/schedule",
      "https://x.edu/sports/mbball/schedule",
      "https://x.edu/sports/wbball/schedule",
      "https://x.edu/sports/basketball/schedule",
    ])
      expect(isCollegeSource(u), u).toBe(true);
    for (const u of ["https://x.edu/sports/football/schedule", "https://x.edu/sports/mens-basketball/roster", "https://www.zerozero.pt/equipa/x", null, ""]) expect(isCollegeSource(u), String(u)).toBe(false);
  });

  it("tells men's from women's on the basketball slugs too", () => {
    expect(genderOf("https://x.edu/sports/womens-basketball/schedule")).toBe("F");
    expect(genderOf("https://x.edu/sports/wbball/schedule")).toBe("F");
    expect(genderOf("https://x.edu/sports/mens-basketball/schedule")).toBe("M");
    expect(genderOf("https://x.edu/sports/mbball/schedule")).toBe("M");
    expect(genderOf("https://x.edu/sports/basketball/schedule")).toBeNull();
    expect(genderOf("https://x.edu/sports/wsoc/schedule")).toBe("F");
  });
});
