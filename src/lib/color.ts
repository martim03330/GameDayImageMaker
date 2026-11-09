function parse(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0");
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

const toHex = (rgb: number[]) =>
  "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");

export function luminance(hex: string): number {
  const [r, g, b] = parse(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Mixes a colour with white (amount > 0) or black (amount < 0). */
export function shade(hex: string, amount: number): string {
  const target = amount > 0 ? 255 : 0;
  const t = Math.abs(amount);
  return toHex(parse(hex).map((v) => v + (target - v) * t));
}

const isNeutral = (hex: string) => {
  const l = luminance(hex);
  return l > 0.8 || l < 0.02;
};

function toHsl(hex: string): [number, number, number] {
  const [r, g, b] = parse(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function fromHsl(h: number, s: number, l: number): string {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return toHex([f(0), f(8), f(4)].map((v) => v * 255));
}

/** Hue in degrees of a clearly coloured club colour, or null for black / white / grey. */
export function hueOf(hex: string): number | null {
  const [h, s] = toHsl(hex);
  return s < 0.2 ? null : h;
}

/** Same hue, but bright and saturated enough to pop on a dark background. */
export function vivid(hex: string): string {
  const [h, s, l] = toHsl(hex);
  if (s < 0.08) return hex;
  return fromHsl(h, Math.max(s, 0.72), Math.min(Math.max(l, 0.52), 0.6));
}

/** Pick a vivid accent colour from a club's two colours. */
export function accentFor(primary: string, secondary: string): string {
  if (!isNeutral(secondary) && luminance(secondary) > 0.08) return secondary;
  if (luminance(primary) < 0.12) return vivid(primary);
  return primary;
}

/** 0..1: how well a shirt palette matches the club's two colours (1 = same kit). */
export function kitMatch(kit: string[] | undefined, primary: string, secondary: string): number {
  if (!kit?.length) return 0.5;
  // Compare hue for colourful tones and lightness for neutrals: black ≠ navy, white ≈ light grey.
  const d = (a: string, b: string) => {
    const [h1, s1, l1] = toHsl(a);
    const [h2, s2, l2] = toHsl(b);
    const n1 = s1 < 0.18 || l1 < 0.12 || l1 > 0.9;
    const n2 = s2 < 0.18 || l2 < 0.12 || l2 > 0.9;
    if (n1 && n2) return Math.abs(l1 - l2);
    if (n1 !== n2) return 0.5; // white / black kits: can't tell (away kit, training top…)
    const dh = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)) / 180;
    return dh * 0.75 + Math.abs(l1 - l2) * 0.25;
  };
  const best = (c: string) => Math.min(d(c, primary), d(c, secondary));
  // A colourful shirt of another hue is the only clear sign of a different club.
  const top = kit.slice(0, 2);
  return 1 - top.reduce((a, c) => a + best(c), 0) / top.length;
}
