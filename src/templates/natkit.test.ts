import { describe, expect, it } from "vitest";
import { aboveHead, fitAbove, pickTextSpot, type NatPlace } from "./natkit";

// He stands in the middle (face at x 540, y 700, 200 px tall); an opponent stands on the left.
const place: NatPlace = {
  frame: { bg: null, fig: null, plain: null },
  fx: 540,
  fy: 700,
  fs: 200,
  faceW: 150,
  box: { left: 380, top: 560, width: 320, height: 1300 },
  people: [{ x0: 20, y0: 640, x1: 330, y1: 1700 }],
};

describe("pickTextSpot", () => {
  it("takes the free side over the side another player stands on", () => {
    const left = { x0: 60, y0: 800, x1: 360, y1: 1100 };
    const right = { x0: 720, y0: 800, x1: 1020, y1: 1100 };
    expect(pickTextSpot(place, [left, right])).toMatchObject({ index: 1, crowded: false });
  });
  it("never puts a block on his face", () => {
    const face = { x0: 400, y0: 600, x1: 700, y1: 800 };
    const legs = { x0: 400, y0: 1400, x1: 700, y1: 1600 };
    expect(pickTextSpot(place, [face, legs]).index).toBe(1);
  });
  it("says when even the best spot sits over someone", () => {
    expect(pickTextSpot(place, [{ x0: 60, y0: 800, x1: 360, y1: 1100 }]).crowded).toBe(true);
  });
  it("keeps the first candidate on a tie (the look's preferred spot)", () => {
    const a = { x0: 720, y0: 200, x1: 1020, y1: 400 };
    const b = { x0: 720, y0: 300, x1: 1020, y1: 500 };
    expect(pickTextSpot(place, [a, b]).index).toBe(0);
  });
  it("only knows about him when the other people were never measured", () => {
    const left = { x0: 60, y0: 800, x1: 360, y1: 1100 };
    expect(pickTextSpot({ ...place, people: undefined }, [left]).crowded).toBe(false);
  });
});

describe("aboveHead", () => {
  it("gives the band above his hair when the block fits there", () => {
    expect(aboveHead(place, 170, 300, 60, 1020)).toEqual({ x0: 60, y0: 170, x1: 1020, y1: 470 });
  });
  it("gives nothing when the block would reach his head", () => {
    expect(aboveHead(place, 170, 400, 60, 1020)).toBeNull();
  });
});

describe("fitAbove", () => {
  it("keeps the block as is when it fits, shrinks it a little when that is enough, and gives up below the limit", () => {
    expect(fitAbove(place, 170, 300)).toBe(1);
    expect(fitAbove(place, 170, 400)).toBeCloseTo(316 / 400);
    expect(fitAbove(place, 170, 600)).toBeNull();
  });
});
