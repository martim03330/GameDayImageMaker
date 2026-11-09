import { expect, test } from "vitest";
import { skipReason } from "./rules";

test("skip reasons: already done > no photo > no game", () => {
  expect(skipReason({ hasPhoto: false, fixture: null, done: true })).toBe("já feita");
  expect(skipReason({ hasPhoto: false, fixture: {}, done: false })).toBe("sem foto");
  expect(skipReason({ hasPhoto: true, fixture: null, done: false })).toBe("sem jogo esta semana");
  expect(skipReason({ hasPhoto: true, fixture: {}, done: false })).toBeNull();
});

import { agencyLooks, rebookError, spielerId, stripAgency } from "./rules";

test("agency looks: never hidden ones, never looks that print NEYOD or an editor credit", () => {
  expect(agencyLooks(["fixture", "filmframe", "pressphoto", "slats", "swiss", "gone"], ["gone"])).toEqual(["fixture", "swiss"]);
});

test("copying an edit never carries the agency branding", () => {
  const p = stripAgency({ templateId: "swiss", agencyId: "a1", agencyWeek: "2026-10-19", side: "right" });
  expect(p).toEqual({ templateId: "swiss", side: "right" });
});

test("same Transfermarkt player whatever the slug or host", () => {
  expect(spielerId("https://www.transfermarkt.pt/moises-conceicao/profil/spieler/740856")).toBe("740856");
  expect(spielerId("https://www.transfermarkt.com/m-c/profil/spieler/740856?x=1")).toBe("740856");
  expect(spielerId("https://www.zerozero.pt/jogador/x/1")).toBeNull();
});

test("the week's look cannot change once its edits exist, and must be free", () => {
  expect(rebookError({ booked: "a", look: "b", weekEdits: 2, free: ["b"] })).toBe("As edits desta semana já foram feitas com o estilo reservado");
  expect(rebookError({ booked: null, look: "x", weekEdits: 0, free: ["b"] })).toBe("Este estilo não está livre esta semana");
  expect(rebookError({ booked: "a", look: "b", weekEdits: 0, free: ["b"] })).toBeNull();
  expect(rebookError({ booked: "a", look: "a", weekEdits: 3, free: [] })).toBeNull();
});
