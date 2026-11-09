import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { absPath } from "./storage";
import type { ChatMessage, EditContent, TemplateParams } from "./types";

const MODEL = "claude-opus-5";

export const aiEnabled = () => !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

let client: Anthropic | null = null;
const anthropic = () => (client ??= new Anthropic());

/** Request options shared by every call: server-side fallback if the main model declines. */
const BASE = {
  model: MODEL,
  max_tokens: 16000,
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default" as const,
  output_config: { effort: "low" as const },
};

const TEMPLATE_IDS = ["spotlight", "poster", "monumental", "data", "halftone", "neon", "card", "editorial", "announce", "fixture", "stretch", "repeat", "closeup", "torn", "brush", "frame", "city", "portrait", "crests", "archive", "kaleido", "sequence", "serif", "windows", "smear", "stamp", "arch", "skyline", "postcard", "exposure", "streetposter", "slices", "ticket", "magazine", "riso", "tactics", "programme", "infographic", "calendar", "rising", "steps", "pitch", "floor", "cinematic", "panels", "checker", "gothic", "speed", "doodle", "memory", "waves", "halo", "burst", "comic", "sticker", "gaze", "scorecol", "shield", "jersey", "sideword", "duel", "syllables", "gilded", "roundel", "silhouette", "paperlight", "script", "mono", "window", "matchserif", "scoreline", "broadcast", "simple"] as const;

// Every field is nullable: null means "leave as is".
const ParamsPatch = z.object({
  templateId: z.enum(TEMPLATE_IDS).nullable(),
  side: z.enum(["left", "right"]).nullable(),
  bgStyle: z.enum(["rays", "pitch", "photo"]).nullable(),
  primary: z.string().nullable().describe("hex colour of the background"),
  accent: z.string().nullable().describe("hex colour of highlights"),
  text: z.string().nullable().describe("hex colour of main text"),
  grain: z.boolean().nullable(),
  insetTilt: z.number().nullable().describe("degrees, -8..8"),
  playerX: z.number().nullable().describe("horizontal offset of the player in px on a 1080px canvas, -300..300, positive = right"),
  playerY: z.number().nullable().describe("vertical offset in px, -300..300, positive = down"),
  playerScale: z.number().nullable().describe("player size multiplier, 0.6..1.5, 1 = default"),
  textScale: z.number().nullable().describe("name/title size multiplier, 0.7..1.3"),
});

const ContentPatch = z.object({
  kicker: z.string().nullable(),
  subline: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  stats: z.array(z.object({ label: z.string(), value: z.string() })).nullable(),
  until: z.string().nullable(),
  homeTeam: z.string().nullable(),
  awayTeam: z.string().nullable(),
  homeGoals: z.string().nullable(),
  awayGoals: z.string().nullable(),
  date: z.string().nullable(),
  time: z.string().nullable(),
  venue: z.string().nullable(),
});

const ChatResult = z.object({
  reply: z.string().describe("short answer to the user in European Portuguese (pt-PT), 1-2 sentences"),
  params: ParamsPatch,
  content: ContentPatch,
  photoId: z.string().nullable().describe("id of another player photo to use, or null"),
});

const SYSTEM = `És o assistente de design de uma app que cria imagens de futebol para o Instagram (1080×1350) para os jogadores de uma agência.
O utilizador não é designer. Pede alterações em linguagem natural ("mais para a direita", "põe o nome maior", "fundo mais escuro", "troca a foto").
Traduz o pedido em alterações concretas aos parâmetros. Só altera o que foi pedido: tudo o resto fica null.
Offsets são em píxeis numa tela de 1080 de largura: "um bocadinho" ≈ 40px, "mais" ≈ 100px.
Nunca alteres a cara nem a foto do jogador em si; só posição, escala, cores, textos e modelo.
Responde sempre em português de Portugal, curto e simpático.`;

export type ChatOutcome = {
  reply: string;
  params: TemplateParams;
  content: EditContent;
  photoId: string | null;
};

const clean = <T extends object>(patch: T) =>
  Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== null)) as Partial<{ [K in keyof T]: NonNullable<T[K]> }>;

/** One chat turn in the editor: returns the assistant's reply and the updated edit. */
export async function editChat(input: {
  message: string;
  history: ChatMessage[];
  params: TemplateParams;
  content: EditContent;
  photoId: string | null;
  photos: { id: string; label: string }[];
  playerNotes: string;
}): Promise<ChatOutcome> {
  const state = JSON.stringify({ params: input.params, content: input.content, photoId: input.photoId, photos: input.photos });
  const messages: Anthropic.Beta.BetaMessageParam[] = [
    ...input.history.slice(-10).map((m) => ({ role: m.role, content: m.text }) as Anthropic.Beta.BetaMessageParam),
    {
      role: "user",
      content: `Estado atual da edit:\n${state}\n\nPreferências do jogador: ${input.playerNotes || "—"}\n\nPedido: ${input.message}`,
    },
  ];

  const res = await anthropic().beta.messages.parse({
    ...BASE,
    system: SYSTEM,
    messages,
    output_config: { ...BASE.output_config, format: betaZodOutputFormat(ChatResult) },
  });
  if (res.stop_reason === "refusal" || !res.parsed_output) {
    return { reply: "Não consegui fazer essa alteração. Tenta explicar de outra forma.", ...input };
  }
  const out = res.parsed_output;
  const params = { ...input.params, ...clean(out.params) } as TemplateParams;
  const content = { ...input.content, ...clean(out.content) } as EditContent;
  const photoId = out.photoId && input.photos.some((p) => p.id === out.photoId) ? out.photoId : input.photoId;
  return { reply: out.reply, params, content, photoId };
}

const StyleAnalysis = z.object({
  templateId: z.enum(TEMPLATE_IDS).describe("closest of our templates"),
  side: z.enum(["left", "right"]).describe("side where the player photo is"),
  bgStyle: z.enum(["rays", "pitch", "photo"]),
  primary: z.string().describe("dominant background hex colour"),
  accent: z.string().describe("highlight hex colour"),
  text: z.string().describe("main text hex colour"),
  notes: z.string().describe("2-4 short sentences in pt-PT describing this style: layout, typography, effects, mood"),
});

export type StyleAnalysisResult = z.infer<typeof StyleAnalysis>;

const MEDIA: Record<string, "image/png" | "image/jpeg" | "image/webp" | "image/gif"> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/** Looks at a reference edit (an old post the player liked) and maps it to our template parameters. */
export async function analyzeReference(rel: string): Promise<StyleAnalysisResult | null> {
  const data = fs.readFileSync(absPath(rel)).toString("base64");
  const res = await anthropic().beta.messages.parse({
    ...BASE,
    output_config: { effort: "medium", format: betaZodOutputFormat(StyleAnalysis) },
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: MEDIA[path.extname(rel).toLowerCase()] ?? "image/png", data } },
          {
            type: "text",
            text: `Esta é uma edit de Instagram que um jogador de futebol gosta. Analisa o estilo e diz qual dos nossos modelos é o mais parecido:
spotlight = nome grande empilhado de um lado e jogador recortado do outro; poster = título gigante texturado, gráfico inclinado, nome em baixo;
monumental = apelido gigante atrás do jogador; data = estilo transmissão TV com números e grelha; halftone = retro anos 90, meio-tom, duotone, papel;
neon = fundo escuro com brilhos e contornos neon; card = carta estilo FUT; editorial = foto inteira a preto e branco com serifa elegante;
announce = anúncio "É OFICIAL"/"HERE WE GO" com emblemas; fixture = cartaz de dia de jogo com os dois emblemas;
stretch = letras altíssimas esticadas atrás do jogador; repeat = palavra repetida em linhas (GOAL GOAL GOAL) com estilhaços;
closeup = cara gigante em grande plano + corpo inteiro + letras 3D em papel; torn = camadas de papel rasgado; brush = pinceladas de tinta e texto manuscrito;
frame = moldura tipo polaroid com o jogador a sair dela; city = tiras rasgadas com a cidade; portrait = retrato escuro de perfil com números dourados;
crests = só os dois emblemas em papel, minimalista.`,
          },
        ],
      },
    ],
  });
  return res.stop_reason === "refusal" ? null : res.parsed_output;
}
