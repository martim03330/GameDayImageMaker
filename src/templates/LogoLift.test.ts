import { describe, expect, it } from "vitest";
import { dodgeOffset } from "./LogoLift";

// The agreed story logo: ~323×106 px, bottom centre.
const logo = { left: 379, top: 1674, w: 323, h: 106 };

describe("dodgeOffset", () => {
  it("leaves the logo where it is when no face is under it", () => {
    expect(dodgeOffset(logo, [[427, 0, 896, 719]], 1080, 1920)).toEqual([0, 0]);
  });
  it("slides it sideways off a face, same line", () => {
    const [dx, dy] = dodgeOffset(logo, [[480, 1640, 620, 1800]], 1080, 1920)!;
    expect(dy).toBe(0);
    expect(logo.left + dx + logo.w <= 480 - 16 || logo.left + dx >= 620 + 16).toBe(true);
  });
  it("moves it vertically only when the whole line is taken", () => {
    const [dx, dy] = dodgeOffset(logo, [[0, 1650, 1080, 1800]], 1080, 1920)!;
    expect(dx).toBe(0);
    expect(dy).toBeLessThan(0);
  });
});
