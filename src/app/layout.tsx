import type { Metadata } from "next";
import { Montserrat, Anton, Barlow_Condensed, Bebas_Neue, Fraunces, Inter, JetBrains_Mono, Mr_Dafoe, Space_Grotesk, DM_Serif_Display, Archivo_Black, Archivo, Alfa_Slab_One, Rubik_Mono_One, Dela_Gothic_One, Libre_Barcode_128, UnifrakturMaguntia, Permanent_Marker, Bangers, Caveat_Brush, Bodoni_Moda, Orbitron, Great_Vibes, Unbounded } from "next/font/google";
import "./globals.css";

const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });
const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  weight: ["500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const bebas = Bebas_Neue({ variable: "--font-bebas", weight: "400", subsets: ["latin"] });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", weight: ["500", "700"], subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", weight: ["500", "700"], subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", weight: ["500", "600"], style: ["normal", "italic"], subsets: ["latin"] });

const script = Mr_Dafoe({ variable: "--font-script", weight: "400", subsets: ["latin"] });

const serifDisplay = DM_Serif_Display({ variable: "--font-dmserif", weight: "400", style: ["normal", "italic"], subsets: ["latin"] });
const archivoBlack = Archivo_Black({ variable: "--font-archivo-black", weight: "400", subsets: ["latin"] });
const montserrat = Montserrat({ variable: "--font-montserrat", weight: ["500", "600"], subsets: ["latin"] });
const archivo = Archivo({ variable: "--font-archivo", weight: ["300", "400", "600"], subsets: ["latin"] });

const slab = Alfa_Slab_One({ variable: "--font-slab", weight: "400", subsets: ["latin"] });
const rubikMono = Rubik_Mono_One({ variable: "--font-rubikmono", weight: "400", subsets: ["latin"] });
const dela = Dela_Gothic_One({ variable: "--font-dela", weight: "400", subsets: ["latin"] });
const barcode = Libre_Barcode_128({ variable: "--font-barcode", weight: "400", subsets: ["latin"] });

const gothic = UnifrakturMaguntia({ variable: "--font-gothic", weight: "400", subsets: ["latin"] });
const marker = Permanent_Marker({ variable: "--font-marker", weight: "400", subsets: ["latin"] });

const bangers = Bangers({ variable: "--font-bangers", weight: "400", subsets: ["latin"] });
const caveat = Caveat_Brush({ variable: "--font-caveat", weight: "400", subsets: ["latin"] });

const bodoni = Bodoni_Moda({ variable: "--font-bodoni", weight: ["400", "500", "600", "700"], subsets: ["latin"] });
const orbitron = Orbitron({ variable: "--font-orbitron", weight: ["800", "900"], subsets: ["latin"] });
const vibes = Great_Vibes({ variable: "--font-vibes", weight: "400", subsets: ["latin"] });
// Wide, rounded premium display (form carousel · gold).
const unbounded = Unbounded({ variable: "--font-unbounded", weight: ["400", "500", "600", "700", "800"], subsets: ["latin"] });

const FONT_VARS = [unbounded, bodoni, orbitron, vibes, gothic, marker, bangers, caveat, anton, barlow, inter, bebas, grotesk, mono, fraunces, script, serifDisplay, archivoBlack, archivo, montserrat, slab, rubikMono, dela, barcode].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  title: "GameDay Image Maker",
  description: "Edits automáticas para os jogadores da agência",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT">
      <body className={`${FONT_VARS} antialiased`}>{children}</body>
    </html>
  );
}
