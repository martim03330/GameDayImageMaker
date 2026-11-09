import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import { parseAgencyPage, parseDirectory } from "./parse";

const fixture = (f: string) => readFileSync(join(__dirname, "__fixtures__", f), "utf8");
const dir = fixture("tm-dir-pt.html");
const agency = fixture("tm-agency-gestifute.html");

test("directory page (Portugal)", () => {
  const d = parseDirectory(dir);
  expect(d.agencies).toHaveLength(25);
  expect(d.agencies[0]).toMatchObject({ name: "Gestifute", tmId: "413", country: "Portugal", players: 180, tmUrl: "https://www.transfermarkt.pt/gestifute/beraterfirma/berater/413" });
  expect(d.agencies[1].name).toBe("Proeleven S.A.");
  expect(d.lastPage).toBe(13);
});

test("agency page: instagram, roster with clubs, pages", () => {
  const a = parseAgencyPage(agency);
  expect(a.instagram).toBe("polarissports");
  expect(a.players).toHaveLength(25);
  expect(a.players.find((p) => p.name === "Vitinha")).toMatchObject({ club: "Paris Saint-Germain", age: "26", position: "Médio Defensivo", tmUrl: "https://www.transfermarkt.pt/vitinha/profil/spieler/487469" });
  expect(a.lastPage).toBeGreaterThan(1);
});

import { findEmails } from "./parse";

test("emails published on a page: mailto and plain text, no image names or duplicates", () => {
  const html = `<a href="mailto:Geral@Agencia.pt?subject=x">Contacto</a> <p>info@agencia.pt · geral@agencia.pt</p> <img src="logo@2x.png"> <script>x="u@sentry.io"</script>`;
  expect(findEmails(html)).toEqual(["geral@agencia.pt", "info@agencia.pt"]);
});
