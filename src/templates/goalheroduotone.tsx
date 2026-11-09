import { luminance, shade } from "@/lib/color";
import { GradientMapDefs } from "./fx";
import { HeroFxFrame, HeroWordSvg } from "./goalherobw";
import { heroBase } from "./goalheroshadow";
import type { RenderData } from "./types";

/**
 * Goal hero · duotone — the goal-hero layout with the player as a duotone gradient map: shadows in the deep club
 * colour, highlights in off-white (with the club colour itself in the mid-tones). The enormous word goes in
 * near-black ink for contrast; the name stays in the club colour. Light / yellow clubs are pushed dark enough
 * that the face still reads (a colour treatment only, never a blur).
 */
const INK = "#16181d";

export function Goalheroduotone({ data }: { data: RenderData }) {
  const b = heroBase(data);
  // Shadows: the club colour taken deep (never lighter than ~5% luminance, so eyes and features hold).
  let dark = shade(b.club, -0.55);
  for (let i = 0; i < 8 && luminance(dark) > 0.035; i++) dark = shade(dark, -0.2);
  // Mid-tones: the club colour, kept in the middle of the range (yellow clubs would wash the skin out).
  let mid = b.club;
  for (let i = 0; i < 8 && luminance(mid) > 0.1; i++) mid = shade(mid, -0.12);
  const light = "#faf7f0";
  const id = "ghduo";
  return (
    <HeroFxFrame
      data={data}
      b={b}
      defs={<GradientMapDefs id={id} dark={dark} mid={mid} light={light} />}
      word={<HeroWordSvg b={b} fill={INK} />}
      imgStyle={{ filter: `brightness(1.14) url(#${id})` }}
    />
  );
}
