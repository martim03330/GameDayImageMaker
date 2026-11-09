import { describe, expect, it } from "vitest";
import { generateVariants, isBold } from "./index";

const base = { templateId: "simple", side: "right", primary: "#0b3d91", accent: "#ffffff", text: "#ffffff", bgStyle: "rays" } as never;

describe("US school players get the loud gameday looks", () => {
  it("fills half the matchday grid with bold looks", () => {
    for (const seed of [1, 7, 42]) {
      const grid = generateVariants(base, "matchday", undefined, 12, {}, [], true, seed, [], {}, true);
      expect(grid.length).toBe(12);
      expect(grid.filter((p) => isBold(p.templateId)).length).toBeGreaterThanOrEqual(6);
      expect(new Set(grid.map((p) => p.templateId)).size).toBe(12);
    }
  });
  it("leaves other players' grids alone", () => {
    const grid = generateVariants(base, "matchday", undefined, 12, {}, [], true, 7, [], {}, false);
    expect(grid.filter((p) => isBold(p.templateId)).length).toBeLessThan(6);
  });
});
