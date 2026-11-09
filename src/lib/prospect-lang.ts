/**
 * Prospeção messages in the player's own language. Shared by the server (defaults, storage) and the page
 * (which language each player gets). No imports: safe in client components.
 *
 * His language is guessed from his nationality as zerozero writes it (in Portuguese); the user can override
 * it per player. Templates use {nome}, {clube}, {adversario}; a part between [[ ]] is dropped when his next
 * opponent is not known yet.
 */

export const LANGS = ["pt", "en", "es", "fr", "ar"] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_LABEL: Record<Lang, string> = { pt: "Português", en: "English", es: "Español", fr: "Français", ar: "العربية" };

const PT = ["Portugal", "Brasil", "Angola", "Cabo Verde", "Moçambique", "Guiné-Bissau", "São Tomé e Príncipe", "Timor-Leste", "Timor Leste"];
const ES = ["Espanha", "Argentina", "Uruguai", "Colômbia", "Chile", "Venezuela", "Peru", "Paraguai", "México", "Equador", "Bolívia", "Cuba", "Costa Rica", "Panamá", "Honduras", "Guatemala", "El Salvador", "Nicarágua", "República Dominicana", "Guiné Equatorial", "Porto Rico"];
const FR = ["França", "Senegal", "Costa do Marfim", "Mali", "Camarões", "Guiné", "Burkina Faso", "Benim", "Togo", "Gabão", "Níger", "Congo", "RD Congo", "República Democrática do Congo", "Chade", "Madagáscar", "Haiti", "Luxemburgo", "Bélgica", "Suíça", "Mónaco", "República Centro-Africana", "Comores", "Ilhas Comores", "Djibouti", "Guiné (Conacri)", "Burquina Fasso"];
const AR = ["Emirados Árabes Unidos", "Catar", "Qatar", "Arábia Saudita", "Egito", "Palestina", "Síria", "Jordânia", "Iraque", "Líbano", "Kuwait", "Koweit", "Bahrein", "Barém", "Omã", "Iémen", "Marrocos", "Argélia", "Tunísia", "Líbia", "Sudão", "Mauritânia"];

/** The language his messages go out in: chosen by hand, else from his nationality (English by default). */
export function langOf(nationality: string, override = ""): Lang {
  if ((LANGS as readonly string[]).includes(override)) return override as Lang;
  const n = nationality.trim();
  if (!n) return "pt";
  if (PT.includes(n)) return "pt";
  if (ES.includes(n)) return "es";
  if (FR.includes(n)) return "fr";
  if (AR.includes(n)) return "ar";
  return "en";
}

export type Templates = { message: string; plans: string; followup: string };

/** The sport a prospect plays: each has its own messages (basketball: 2–3 games a week, no football words). */
export const SPORTS = ["soccer", "basketball"] as const;
export type Sport = (typeof SPORTS)[number];
export const SPORT_LABEL: Record<Sport, string> = { soccer: "Futebol", basketball: "Basquetebol" };
export const sportOf = (s: string | null | undefined): Sport => (s === "basketball" ? "basketball" : "soccer");

/** Small stable hash: the same player always gets the same variation. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Picks one option of every {{a|b|c}} (stable per seed: the same recipient always gets the same text). */
export function pickVariations(template: string, seed: string): string {
  let n = 0;
  return template.replace(/\{\{([^{}]*\|[^{}]*)\}\}/g, (_, options: string) => {
    const opts = options.split("|");
    return opts[hash(`${seed}#${n++}`) % opts.length];
  });
}

/**
 * Fills a message for one player.
 *  • {{a|b|c}}: variations — one is picked per player (stable: copying twice gives the same text), so the
 *    messages sent one after another are not identical (Instagram flags the same text sent to many people);
 *  • [[…]] is kept only when his next opponent is known;
 *  • {nome}, {clube}, {adversario} are his data.
 */
export function fillTemplate(template: string, v: { nome: string; clube: string; adversario: string }, seed = ""): string {
  let t = template;
  // Templates saved before the [[ ]] convention (Portuguese): drop the clause by its words.
  if (!v.adversario) t = t.replace(/,?\s*contra o \{adversario\}/g, "");
  // His data first (so variations that contain {clube} work), then the variations, then the [[ ]] parts.
  t = t.replaceAll("{nome}", v.nome).replaceAll("{clube}", v.clube).replaceAll("{adversario}", v.adversario);
  t = pickVariations(t, seed);
  t = t.replace(/\[\[([\s\S]*?)\]\]/g, (_, inner: string) => (v.adversario ? inner : ""));
  return t.replace(/ +([!?.,])/g, "$1").replace(/  +/g, " ");
}

export const DEFAULTS: Record<Lang, Templates> = {
  pt: {
    message: `{{Olá|Boas|Viva}} {nome}! {{Tudo bem?|Espero que estejas bem.|Como estás?}} {{Vi que jogas no {clube}.|Tenho acompanhado o {clube} e reparei em ti.|Vi que estás no {clube} esta época.}}

{{Já trabalho com uma empresa de gestão de jogadores e faço as edições de Instagram dos atletas|Trabalho com uma empresa de gestão de jogadores e trato das edições de Instagram dos atletas|Faço as edições de Instagram dos jogadores de uma empresa de gestão de carreiras com quem trabalho}}: {{o Matchday antes de cada jogo e a edição de Golo no próprio dia em que marcam|o post de Matchday antes de cada jogo e o de Golo no dia em que marcam|os posts de dia de jogo e de golo, sempre a tempo}}, com o nome, os emblemas e as fotos de cada um.

{{Queria oferecer-te|Gostava de te oferecer|Posso oferecer-te}} uma edição para o jogo deste fim de semana[[, contra o {adversario}]]. {{Só preciso que me mandes uma foto tua com boa qualidade|Para isso só preciso de uma foto tua com boa qualidade|Basta mandares-me uma foto tua com boa qualidade}} (de jogo ou de corpo inteiro) e eu trato do resto {{💪|⚽|🔥}}

{{Podes ver exemplos no destaque MATCHDAY do meu perfil|Tens exemplos no destaque MATCHDAY aqui do perfil|É só veres o destaque MATCHDAY no meu perfil}} 👀

{{Se depois gostares e quiseres ter isto todas as semanas, os planos começam nos 15€/mês.|Se gostares e quiseres continuar todas as semanas, os planos começam nos 15€/mês.|Depois, se quiseres isto todas as semanas, há planos a partir de 15€/mês.}}`,
    plans: `{{Boa|Ótimo|Perfeito}} {nome}! Aqui estão as opções 👇

📸 BASE · 15€/mês
Uma edição à tua escolha no mês (Matchday, Golo, Resultado…), em post + story

⚽ MATCHDAY · 50€/mês
Matchday antes de todos os jogos do mês (post + story)

🔥 COMPLETO · 70€/mês (recomendado)
Matchday + edição de Golo/Assistência no próprio dia + Resultado do jogo

🏆 PRO · 100€/mês
Tudo do Completo + Homem do Jogo, Equipa da Semana, resumo das tuas estatísticas do mês, posts especiais (renovação, transferência, aniversário) e um estilo só teu

Como funciona:
• Pagas no início do mês (MB Way se estiveres em Portugal; transferência bancária, Revolut ou PayPal se estiveres no estrangeiro) e o plano renova até dizeres que paras
• O Matchday chega na véspera ou na manhã do jogo; o Golo até 2h depois do fim
• Só precisas de me mandar fotos tuas com boa qualidade (de jogo ou de corpo inteiro); eu trato do resto
• Época inteira paga de uma vez: 10 meses pelo preço de 8

Qualquer edição extra, fora do plano, fica a 15€.

Qual te interessa mais?`,
    followup: `{{Olá|Boas|Viva}} {nome}! {{Só para saber se viste a minha mensagem 🙂|Não sei se chegaste a ver a minha mensagem 🙂|Passo só para saber se viste a mensagem que te mandei 🙂}}

{{A oferta continua de pé|A proposta mantém-se|Continua de pé a oferta}}: uma edição para o teu próximo jogo, à borla. {{Basta mandares-me uma foto tua com boa qualidade.|Só preciso de uma foto tua com boa qualidade.|É só mandares uma foto tua com boa qualidade.}} Tens exemplos no destaque MATCHDAY do perfil.`,
  },
  en: {
    message: `{{Hi|Hey|Hello}} {nome}! {{Hope you're doing well.|Hope all is good.|How are you doing?}} {{I saw you play for {clube}.|I've been following {clube} and noticed you.|I saw you're at {clube} this season.}}

{{I work with a football player management company and I create the Instagram edits for its athletes|I work with a player management company and handle the Instagram edits for its athletes|I make the Instagram edits for the players of a football management company I work with}}: {{the Matchday post before every game and the Goal post on the same day you score|a Matchday post before each game and a Goal post the day you score|game-day and goal posts, always on time}}, with your name, the club crests and your own photos.

{{I'd like to offer you|I'd love to offer you|I can offer you}} a free edit for this weekend's game[[ against {adversario}]]. {{All I need is a good-quality photo of you|I just need a good-quality photo of you|Just send me a good-quality photo of you}} (in-game or full body) and I'll take care of the rest {{💪|⚽|🔥}}

{{You can see examples in the MATCHDAY highlight on my profile|Check out the MATCHDAY highlight on my profile for examples|Just tap the MATCHDAY highlight on my profile}} 👀

{{If you like it and want this every week, plans start at €15/month.|If you enjoy it and want it every week, plans start from €15/month.|Afterwards, if you'd like this every week, there are plans from €15/month.}}`,
    plans: `{{Great|Awesome|Perfect}}, {nome}! Here are the options 👇

📸 BASIC · €15/month
One edit of your choice each month (Matchday, Goal, Result…), as post + story

⚽ MATCHDAY · €50/month
Matchday before every game of the month (post + story)

🔥 COMPLETE · €70/month (recommended)
Matchday + Goal/Assist edit on the same day + Full-time result

🏆 PRO · €100/month
Everything in Complete + Man of the Match, Team of the Week, your monthly stats recap, special posts (renewal, transfer, birthday) and a style made just for you

How it works:
• You pay at the start of each month (bank transfer, Revolut or PayPal) and the plan renews until you tell me to stop
• Matchday arrives the day before or the morning of the game; Goal within 2 hours of the final whistle
• You just send me good-quality photos of you (in-game or full body); I take care of the rest
• Full season paid upfront: 10 months for the price of 8

Any extra edit outside your plan is €15.

Which one interests you most?`,
    followup: `{{Hi|Hey|Hello}} {nome}! {{Just checking whether you saw my message 🙂|Not sure if you saw my message 🙂|Just following up on my message 🙂}}

{{The offer still stands|My offer is still open|The offer is still on}}: a free edit for your next game. {{Just send me a good-quality photo of you.|All I need is a good-quality photo of you.|Send me a good-quality photo and it's yours.}} Examples in the MATCHDAY highlight on my profile.`,
  },
  es: {
    message: `{{¡Hola|¡Buenas|¡Qué tal}} {nome}! {{¿Cómo estás?|Espero que estés bien.|¿Todo bien?}} {{Vi que juegas en el {clube}.|He estado siguiendo al {clube} y me fijé en ti.|Vi que estás en el {clube} esta temporada.}}

{{Trabajo con una empresa de representación de futbolistas y hago las ediciones de Instagram de sus jugadores|Trabajo con una agencia de futbolistas y me encargo de las ediciones de Instagram de sus jugadores|Hago las ediciones de Instagram de los jugadores de una agencia con la que trabajo}}: {{el Matchday antes de cada partido y la edición de Gol el mismo día que marcas|un post de Matchday antes de cada partido y uno de Gol el día que marcas|posts de día de partido y de gol, siempre a tiempo}}, con tu nombre, los escudos y tus fotos.

{{Me gustaría regalarte|Quiero regalarte|Te puedo regalar}} una edición para el partido de este fin de semana[[ contra el {adversario}]]. {{Solo necesito que me mandes una foto tuya de buena calidad|Solo necesito una foto tuya de buena calidad|Basta con que me mandes una foto tuya de buena calidad}} (de partido o de cuerpo entero) y yo me encargo del resto {{💪|⚽|🔥}}

{{Puedes ver ejemplos en el destacado MATCHDAY de mi perfil|Tienes ejemplos en el destacado MATCHDAY de mi perfil|Solo mira el destacado MATCHDAY en mi perfil}} 👀

{{Si te gusta y quieres tenerlo cada semana, los planes empiezan en 15 €/mes.|Si te gusta y quieres seguir cada semana, hay planes desde 15 €/mes.|Después, si lo quieres cada semana, los planes empiezan en 15 €/mes.}}`,
    plans: `¡{{Genial|Perfecto|Estupendo}}, {nome}! Estas son las opciones 👇

📸 BÁSICO · 15 €/mes
Una edición a tu elección cada mes (Matchday, Gol, Resultado…), en post + story

⚽ MATCHDAY · 50 €/mes
Matchday antes de todos los partidos del mes (post + story)

🔥 COMPLETO · 70 €/mes (recomendado)
Matchday + edición de Gol/Asistencia el mismo día + Resultado del partido

🏆 PRO · 100 €/mes
Todo lo del Completo + Jugador del Partido, Equipo de la Semana, resumen de tus estadísticas del mes, posts especiales (renovación, fichaje, cumpleaños) y un estilo solo para ti

Cómo funciona:
• Pagas a principio de mes (transferencia, Revolut o PayPal) y el plan se renueva hasta que me digas que pare
• El Matchday llega la víspera o la mañana del partido; el Gol, hasta 2 horas después del final
• Solo tienes que mandarme fotos tuyas de buena calidad (de partido o de cuerpo entero); yo me encargo del resto
• Temporada completa pagada de una vez: 10 meses al precio de 8

Cualquier edición extra, fuera del plan, cuesta 15 €.

¿Cuál te interesa más?`,
    followup: `{{¡Hola|¡Buenas|¡Qué tal}} {nome}! {{Solo quería saber si viste mi mensaje 🙂|No sé si llegaste a ver mi mensaje 🙂|Te escribo para saber si viste mi mensaje 🙂}}

{{La oferta sigue en pie|La propuesta sigue vigente|Sigue en pie la oferta}}: una edición gratis para tu próximo partido. {{Solo mándame una foto tuya de buena calidad.|Solo necesito una foto tuya de buena calidad.|Basta con una foto tuya de buena calidad.}} Tienes ejemplos en el destacado MATCHDAY del perfil.`,
  },
  fr: {
    message: `{{Salut|Bonjour|Hello}} {nome} ! {{J'espère que tu vas bien.|Comment ça va ?|J'espère que tout va bien.}} {{J'ai vu que tu joues à {clube}.|Je suis {clube} et je t'ai remarqué.|J'ai vu que tu es à {clube} cette saison.}}

{{Je travaille avec une agence de gestion de joueurs et je réalise les visuels Instagram de ses athlètes|Je travaille avec une agence de joueurs et je m'occupe des visuels Instagram de ses athlètes|Je fais les visuels Instagram des joueurs d'une agence avec laquelle je travaille}} : {{le Matchday avant chaque match et le visuel But le jour même où tu marques|un visuel Matchday avant chaque match et un visuel But le jour où tu marques|les visuels jour de match et but, toujours à temps}}, avec ton nom, les écussons et tes photos.

{{J'aimerais t'offrir|Je voudrais t'offrir|Je peux t'offrir}} un visuel pour le match de ce week-end[[ contre {adversario}]]. {{Il me faut juste une photo de toi de bonne qualité|J'ai seulement besoin d'une photo de toi de bonne qualité|Envoie-moi simplement une photo de toi de bonne qualité}} (en match ou en pied) et je m'occupe du reste {{💪|⚽|🔥}}

{{Tu peux voir des exemples dans la story à la une MATCHDAY de mon profil|Des exemples dans la story à la une MATCHDAY de mon profil|Regarde la story à la une MATCHDAY sur mon profil}} 👀

{{Si ça te plaît et que tu veux ça chaque semaine, les formules commencent à 15 €/mois.|Si tu aimes et que tu veux continuer chaque semaine, il y a des formules dès 15 €/mois.|Ensuite, si tu veux ça chaque semaine, les formules commencent à 15 €/mois.}}`,
    plans: `{{Super|Parfait|Génial}}, {nome} ! Voici les formules 👇

📸 BASE · 15 €/mois
Un visuel au choix chaque mois (Matchday, But, Résultat…), en post + story

⚽ MATCHDAY · 50 €/mois
Matchday avant tous les matchs du mois (post + story)

🔥 COMPLET · 70 €/mois (recommandé)
Matchday + visuel But/Passe décisive le jour même + Résultat du match

🏆 PRO · 100 €/mois
Tout le Complet + Homme du match, Équipe de la semaine, bilan de tes stats du mois, posts spéciaux (prolongation, transfert, anniversaire) et un style rien que pour toi

Comment ça marche :
• Tu paies en début de mois (virement, Revolut ou PayPal) et la formule se renouvelle jusqu'à ce que tu me dises d'arrêter
• Le Matchday arrive la veille ou le matin du match ; le But dans les 2 heures après la fin
• Tu m'envoies simplement des photos de toi de bonne qualité (en match ou en pied) ; je m'occupe du reste
• Saison complète payée d'avance : 10 mois pour le prix de 8

Tout visuel en plus, hors formule, est à 15 €.

Laquelle t'intéresse le plus ?`,
    followup: `{{Salut|Bonjour|Hello}} {nome} ! {{Je voulais juste savoir si tu avais vu mon message 🙂|Je ne sais pas si tu as vu mon message 🙂|Je reviens vers toi pour mon message 🙂}}

{{L'offre tient toujours|Ma proposition tient toujours|L'offre est toujours valable}} : un visuel offert pour ton prochain match. {{Envoie-moi simplement une photo de toi de bonne qualité.|Il me faut juste une photo de toi de bonne qualité.|Une photo de toi de bonne qualité suffit.}} Des exemples dans la story à la une MATCHDAY du profil.`,
  },
  ar: {
    message: `{{مرحباً|أهلاً|السلام عليكم}} {nome}! {{أتمنى أن تكون بخير.|كيف حالك؟|أرجو أن تكون بأفضل حال.}} {{رأيت أنك تلعب في {clube}.|أتابع {clube} ولفت انتباهي أداؤك.|رأيت أنك مع {clube} هذا الموسم.}}

{{أعمل مع شركة لإدارة اللاعبين وأصمم منشورات إنستغرام للاعبيها|أعمل مع وكالة لاعبين وأتولى تصميم منشورات إنستغرام للاعبيها|أصمم منشورات إنستغرام للاعبي شركة إدارة لاعبين أعمل معها}}: {{تصميم يوم المباراة قبل كل مباراة وتصميم الهدف في نفس اليوم الذي تسجل فيه|منشور يوم المباراة قبل كل مباراة ومنشور الهدف يوم تسجيله|منشورات يوم المباراة والأهداف في وقتها دائماً}}، باسمك وشعارات الأندية وصورك.

{{أود أن أهديك|يسعدني أن أهديك|أستطيع أن أهديك}} تصميماً مجانياً لمباراة نهاية هذا الأسبوع[[ ضد {adversario}]]. {{كل ما أحتاجه صورة لك بجودة جيدة|أحتاج فقط صورة لك بجودة جيدة|يكفي أن ترسل لي صورة لك بجودة جيدة}} (من مباراة أو بكامل الجسم) وسأتولى الباقي {{💪|⚽|🔥}}

{{يمكنك رؤية أمثلة في القصص المميزة MATCHDAY في حسابي|تجد أمثلة في القصص المميزة MATCHDAY في حسابي|فقط شاهد القصص المميزة MATCHDAY في حسابي}} 👀

{{إذا أعجبك وأردت ذلك كل أسبوع، تبدأ الباقات من 15 يورو شهرياً.|وإذا أعجبك وأردت الاستمرار أسبوعياً، توجد باقات تبدأ من 15 يورو شهرياً.|وبعدها، إن أردت ذلك كل أسبوع، تبدأ الباقات من 15 يورو شهرياً.}}`,
    plans: `{{رائع|ممتاز|جميل}} يا {nome}! هذه هي الباقات 👇

📸 الأساسية · 15 يورو شهرياً
تصميم واحد تختاره كل شهر (يوم المباراة، هدف، نتيجة…) كمنشور + ستوري

⚽ يوم المباراة · 50 يورو شهرياً
تصميم يوم المباراة قبل كل مباريات الشهر (منشور + ستوري)

🔥 الكاملة · 70 يورو شهرياً (ننصح بها)
يوم المباراة + تصميم الهدف أو التمريرة الحاسمة في نفس اليوم + نتيجة المباراة

🏆 الاحترافية · 100 يورو شهرياً
كل ما في الكاملة + رجل المباراة، تشكيلة الأسبوع، ملخص إحصائياتك الشهرية، منشورات خاصة (تجديد العقد، الانتقال، عيد الميلاد) وأسلوب تصميم خاص بك

طريقة العمل:
• تدفع في بداية كل شهر (تحويل بنكي أو Revolut أو PayPal) وتتجدد الباقة حتى تطلب الإيقاف
• يصلك تصميم يوم المباراة قبلها بيوم أو صباح المباراة، وتصميم الهدف خلال ساعتين من نهايتها
• فقط أرسل لي صوراً لك بجودة جيدة (من مباراة أو بكامل الجسم) وأنا أتولى الباقي
• الموسم كاملاً بدفعة واحدة: 10 أشهر بسعر 8

أي تصميم إضافي خارج الباقة بسعر 15 يورو.

أي باقة تهمك أكثر؟`,
    followup: `{{مرحباً|أهلاً|السلام عليكم}} {nome}! {{أردت فقط التأكد من أنك رأيت رسالتي 🙂|لست متأكداً إن كنت قد رأيت رسالتي 🙂|أتابع معك بخصوص رسالتي 🙂}}

{{العرض ما زال قائماً|ما زال عرضي قائماً|العرض لا يزال سارياً}}: تصميم مجاني لمباراتك القادمة. {{فقط أرسل لي صورة لك بجودة جيدة.|كل ما أحتاجه صورة لك بجودة جيدة.|تكفي صورة لك بجودة جيدة.}} تجد أمثلة في القصص المميزة MATCHDAY في الحساب.`,
  },
};

/**
 * Basketball (US college, NCAA D1): the same offer, tone and variations as football, but no football words
 * (goal, match, pitch, kick-off, ⚽), "your next game" instead of "this weekend's game" (they play 2–3 games a
 * week) and the Gameday / Final score posts. The highlight on the profile is still called MATCHDAY.
 * Arabic falls back to English (every US college athlete reads English; the user can save his own).
 */
const BASKETBALL: Record<Exclude<Lang, "ar">, Templates> = {
  pt: {
    message: `{{Olá|Boas|Viva}} {nome}! {{Tudo bem?|Espero que estejas bem.|Como estás?}} {{Vi que jogas no {clube}.|Tenho acompanhado o {clube} e reparei em ti.|Vi que estás no {clube} esta época.}}

{{Já trabalho com uma empresa de gestão de atletas e faço as edições de Instagram dos jogadores|Trabalho com uma empresa de gestão de atletas e trato das edições de Instagram dos jogadores|Faço as edições de Instagram dos atletas de uma empresa de gestão de carreiras com quem trabalho}}: {{o Gameday antes de cada jogo e o Resultado na própria noite|o post de Gameday antes de cada jogo e o do Resultado logo a seguir|os posts de dia de jogo e de resultado, sempre a tempo}}, com o nome, os emblemas e as fotos de cada um.

{{Queria oferecer-te|Gostava de te oferecer|Posso oferecer-te}} uma edição para o teu próximo jogo[[, contra {adversario}]]. {{Só preciso que me mandes uma foto tua com boa qualidade|Para isso só preciso de uma foto tua com boa qualidade|Basta mandares-me uma foto tua com boa qualidade}} (de jogo ou de corpo inteiro) e eu trato do resto {{💪|🏀|🔥}}

{{Podes ver exemplos no destaque MATCHDAY do meu perfil|Tens exemplos no destaque MATCHDAY aqui do perfil|É só veres o destaque MATCHDAY no meu perfil}} 👀

{{Se depois gostares e quiseres ter isto todas as semanas, os planos começam nos 15€/mês.|Se gostares e quiseres continuar todas as semanas, os planos começam nos 15€/mês.|Depois, se quiseres isto todas as semanas, há planos a partir de 15€/mês.}}`,
    plans: `{{Boa|Ótimo|Perfeito}} {nome}! Aqui estão as opções 👇

📸 BASE · 15€/mês
Uma edição à tua escolha no mês (Gameday, Resultado, Estatísticas…), em post + story

🏀 GAMEDAY · 50€/mês
Gameday antes de todos os jogos do mês (post + story)

🔥 COMPLETO · 70€/mês (recomendado)
Gameday + o Resultado do jogo com as tuas estatísticas (pontos, ressaltos, assistências) na própria noite

🏆 PRO · 100€/mês
Tudo do Completo + Jogador do Jogo, Equipa da Semana, resumo das tuas estatísticas do mês, posts especiais (compromisso, transferência, aniversário) e um estilo só teu

Como funciona:
• Pagas no início do mês (MB Way se estiveres em Portugal; transferência bancária, Revolut ou PayPal se estiveres no estrangeiro) e o plano renova até dizeres que paras
• O Gameday chega na véspera ou na manhã do jogo; o Resultado até 2h depois do fim
• Só precisas de me mandar fotos tuas com boa qualidade (de jogo ou de corpo inteiro); eu trato do resto
• Época inteira paga de uma vez: 5 meses pelo preço de 4

Qualquer edição extra, fora do plano, fica a 15€.

Qual te interessa mais?`,
    followup: `{{Olá|Boas|Viva}} {nome}! {{Só para saber se viste a minha mensagem 🙂|Não sei se chegaste a ver a minha mensagem 🙂|Passo só para saber se viste a mensagem que te mandei 🙂}}

{{A oferta continua de pé|A proposta mantém-se|Continua de pé a oferta}}: uma edição para o teu próximo jogo, à borla. {{Basta mandares-me uma foto tua com boa qualidade|Só preciso de uma foto tua com boa qualidade|É só mandares uma foto tua com boa qualidade}} (de jogo ou de corpo inteiro). Tens exemplos no destaque MATCHDAY do perfil.`,
  },
  en: {
    message: `{{Hi|Hey|Hello}} {nome}! {{Hope you're doing well.|Hope all is good.|How are you doing?}} {{I saw you play for {clube}.|I've been following {clube} and noticed you.|I saw you're at {clube} this season.}}

{{I work with an athlete management company and I create the Instagram edits for its players|I work with a player management company and handle the Instagram edits for its athletes|I make the Instagram edits for the athletes of a management company I work with}}: {{a Gameday post before every game and a Final score post the same night|the Gameday graphic before each game and the Final score right after|game-day and final-score posts, always on time}}, with your name, the team logos and your own photos.

{{I'd like to offer you|I'd love to offer you|I can offer you}} a free edit for your next game[[ against {adversario}]]. {{All I need is a good-quality photo of you|I just need a good-quality photo of you|Just send me a good-quality photo of you}} (in-game or full body) and I'll take care of the rest {{💪|🏀|🔥}}

{{You can see examples in the MATCHDAY highlight on my profile|Check out the MATCHDAY highlight on my profile for examples|Just tap the MATCHDAY highlight on my profile}} 👀

{{If you like it and want this every week, plans start at €15/month.|If you enjoy it and want it every week, plans start from €15/month.|Afterwards, if you'd like this every week, there are plans from €15/month.}}`,
    plans: `{{Great|Awesome|Perfect}}, {nome}! Here are the options 👇

📸 BASIC · €15/month
One edit of your choice each month (Gameday, Final score, Stat line…), as post + story

🏀 GAMEDAY · €50/month
Gameday before every game of the month (post + story)

🔥 COMPLETE · €70/month (recommended)
Gameday + the Final score with your stat line (points, rebounds, assists) the same night

🏆 PRO · €100/month
Everything in Complete + Player of the Game, Team of the Week, your monthly stats recap, special posts (commitment, transfer, birthday) and a style made just for you

How it works:
• You pay at the start of each month (bank transfer, Revolut or PayPal) and the plan renews until you tell me to stop
• Gameday arrives the day before or the morning of the game; the Final score within 2 hours of the final buzzer
• You just send me good-quality photos of you (in-game or full body); I take care of the rest
• Full season paid upfront: 5 months for the price of 4

Any extra edit outside your plan is €15.

Which one interests you most?`,
    followup: `{{Hi|Hey|Hello}} {nome}! {{Just checking whether you saw my message 🙂|Not sure if you saw my message 🙂|Just following up on my message 🙂}}

{{The offer still stands|My offer is still open|The offer is still on}}: a free edit for your next game. {{Just send me a good-quality photo of you|All I need is a good-quality photo of you|Send me a good-quality photo of you}} (in-game or full body) and it's yours. Examples in the MATCHDAY highlight on my profile.`,
  },
  es: {
    message: `{{¡Hola|¡Buenas|¡Qué tal}} {nome}! {{¿Cómo estás?|Espero que estés bien.|¿Todo bien?}} {{Vi que juegas en {clube}.|He estado siguiendo a {clube} y me fijé en ti.|Vi que estás en {clube} esta temporada.}}

{{Trabajo con una empresa de representación de deportistas y hago las ediciones de Instagram de sus jugadores|Trabajo con una agencia de deportistas y me encargo de las ediciones de Instagram de sus jugadores|Hago las ediciones de Instagram de los jugadores de una agencia con la que trabajo}}: {{el Gameday antes de cada partido y el Resultado esa misma noche|un post de Gameday antes de cada partido y uno del Resultado justo después|posts de día de partido y de resultado, siempre a tiempo}}, con tu nombre, los escudos y tus fotos.

{{Me gustaría regalarte|Quiero regalarte|Te puedo regalar}} una edición para tu próximo partido[[ contra {adversario}]]. {{Solo necesito que me mandes una foto tuya de buena calidad|Solo necesito una foto tuya de buena calidad|Basta con que me mandes una foto tuya de buena calidad}} (de partido o de cuerpo entero) y yo me encargo del resto {{💪|🏀|🔥}}

{{Puedes ver ejemplos en el destacado MATCHDAY de mi perfil|Tienes ejemplos en el destacado MATCHDAY de mi perfil|Solo mira el destacado MATCHDAY en mi perfil}} 👀

{{Si te gusta y quieres tenerlo cada semana, los planes empiezan en 15 €/mes.|Si te gusta y quieres seguir cada semana, hay planes desde 15 €/mes.|Después, si lo quieres cada semana, los planes empiezan en 15 €/mes.}}`,
    plans: `¡{{Genial|Perfecto|Estupendo}}, {nome}! Estas son las opciones 👇

📸 BÁSICO · 15 €/mes
Una edición a tu elección cada mes (Gameday, Resultado, Estadísticas…), en post + story

🏀 GAMEDAY · 50 €/mes
Gameday antes de todos los partidos del mes (post + story)

🔥 COMPLETO · 70 €/mes (recomendado)
Gameday + el Resultado del partido con tus estadísticas (puntos, rebotes, asistencias) esa misma noche

🏆 PRO · 100 €/mes
Todo lo del Completo + Jugador del Partido, Equipo de la Semana, resumen de tus estadísticas del mes, posts especiales (compromiso, traspaso, cumpleaños) y un estilo solo para ti

Cómo funciona:
• Pagas a principio de mes (transferencia, Revolut o PayPal) y el plan se renueva hasta que me digas que pare
• El Gameday llega la víspera o la mañana del partido; el Resultado, hasta 2 horas después del final
• Solo tienes que mandarme fotos tuyas de buena calidad (de partido o de cuerpo entero); yo me encargo del resto
• Temporada completa pagada de una vez: 5 meses al precio de 4

Cualquier edición extra, fuera del plan, cuesta 15 €.

¿Cuál te interesa más?`,
    followup: `{{¡Hola|¡Buenas|¡Qué tal}} {nome}! {{Solo quería saber si viste mi mensaje 🙂|No sé si llegaste a ver mi mensaje 🙂|Te escribo para saber si viste mi mensaje 🙂}}

{{La oferta sigue en pie|La propuesta sigue vigente|Sigue en pie la oferta}}: una edición gratis para tu próximo partido. {{Solo mándame una foto tuya de buena calidad|Solo necesito una foto tuya de buena calidad|Basta con una foto tuya de buena calidad}} (de partido o de cuerpo entero). Tienes ejemplos en el destacado MATCHDAY del perfil.`,
  },
  fr: {
    message: `{{Salut|Bonjour|Hello}} {nome} ! {{J'espère que tu vas bien.|Comment ça va ?|J'espère que tout va bien.}} {{J'ai vu que tu joues à {clube}.|Je suis {clube} et je t'ai remarqué.|J'ai vu que tu es à {clube} cette saison.}}

{{Je travaille avec une agence de gestion d'athlètes et je réalise les visuels Instagram de ses joueurs|Je travaille avec une agence d'athlètes et je m'occupe des visuels Instagram de ses joueurs|Je fais les visuels Instagram des athlètes d'une agence avec laquelle je travaille}} : {{le Gameday avant chaque match et le visuel Résultat le soir même|un visuel Gameday avant chaque match et un visuel Résultat juste après|les visuels jour de match et résultat, toujours à temps}}, avec ton nom, les logos des équipes et tes photos.

{{J'aimerais t'offrir|Je voudrais t'offrir|Je peux t'offrir}} un visuel pour ton prochain match[[ contre {adversario}]]. {{Il me faut juste une photo de toi de bonne qualité|J'ai seulement besoin d'une photo de toi de bonne qualité|Envoie-moi simplement une photo de toi de bonne qualité}} (en match ou en pied) et je m'occupe du reste {{💪|🏀|🔥}}

{{Tu peux voir des exemples dans la story à la une MATCHDAY de mon profil|Des exemples dans la story à la une MATCHDAY de mon profil|Regarde la story à la une MATCHDAY sur mon profil}} 👀

{{Si ça te plaît et que tu veux ça chaque semaine, les formules commencent à 15 €/mois.|Si tu aimes et que tu veux continuer chaque semaine, il y a des formules dès 15 €/mois.|Ensuite, si tu veux ça chaque semaine, les formules commencent à 15 €/mois.}}`,
    plans: `{{Super|Parfait|Génial}}, {nome} ! Voici les formules 👇

📸 BASE · 15 €/mois
Un visuel au choix chaque mois (Gameday, Résultat, Stats…), en post + story

🏀 GAMEDAY · 50 €/mois
Gameday avant tous les matchs du mois (post + story)

🔥 COMPLET · 70 €/mois (recommandé)
Gameday + le Résultat du match avec tes stats (points, rebonds, passes décisives) le soir même

🏆 PRO · 100 €/mois
Tout le Complet + Joueur du match, Équipe de la semaine, bilan de tes stats du mois, posts spéciaux (engagement, transfert, anniversaire) et un style rien que pour toi

Comment ça marche :
• Tu paies en début de mois (virement, Revolut ou PayPal) et la formule se renouvelle jusqu'à ce que tu me dises d'arrêter
• Le Gameday arrive la veille ou le matin du match ; le Résultat dans les 2 heures après la fin
• Tu m'envoies simplement des photos de toi de bonne qualité (en match ou en pied) ; je m'occupe du reste
• Saison complète payée d'avance : 5 mois pour le prix de 4

Tout visuel en plus, hors formule, est à 15 €.

Laquelle t'intéresse le plus ?`,
    followup: `{{Salut|Bonjour|Hello}} {nome} ! {{Je voulais juste savoir si tu avais vu mon message 🙂|Je ne sais pas si tu as vu mon message 🙂|Je reviens vers toi pour mon message 🙂}}

{{L'offre tient toujours|Ma proposition tient toujours|L'offre est toujours valable}} : un visuel offert pour ton prochain match. {{Envoie-moi simplement une photo de toi de bonne qualité|Il me faut juste une photo de toi de bonne qualité|Une photo de toi de bonne qualité suffit}} (en match ou en pied). Des exemples dans la story à la une MATCHDAY du profil.`,
  },
};

/** The built-in messages for a sport and language (basketball in Arabic: the English ones). */
export function defaultsFor(sport: Sport, lang: Lang): Templates {
  if (sport === "basketball") return BASKETBALL[lang === "ar" ? "en" : lang];
  return DEFAULTS[lang];
}
