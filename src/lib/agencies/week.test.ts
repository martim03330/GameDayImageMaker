import { expect, test } from "vitest";
import { freeLooks, pickFixture, suggestLook, weekStart } from "./week";

test("weekStart is the Monday", () => {
  expect(weekStart("2026-10-25")).toBe("2026-10-19");
  expect(weekStart("2026-10-19")).toBe("2026-10-19");
});

test("pickFixture: first game Fri–Mon of the week", () => {
  expect(pickFixture([{ id: "thu", date: "2026-10-22" }, { id: "sat", date: "2026-10-24" }], "2026-10-21")?.id).toBe("sat");
});

test("pickFixture: else the next game within 7 days", () => {
  expect(pickFixture([{ id: "wed", date: "2026-10-28" }], "2026-10-21")?.id).toBe("wed");
});

test("pickFixture: nothing within 7 days", () => {
  expect(pickFixture([{ id: "far", date: "2026-11-05" }], "2026-10-21")).toBeNull();
});

test("freeLooks drops looks of other agencies and NEYOD's", () => {
  expect(freeLooks(["a", "b", "c", "d"], ["a"], ["c"])).toEqual(["b", "d"]);
});

test("suggestLook is stable and from the list", () => {
  const s = suggestLook(["b", "d"], "x");
  expect(s).toBe(suggestLook(["b", "d"], "x"));
  expect(["b", "d"]).toContain(s);
  expect(suggestLook([], "x")).toBeNull();
});
