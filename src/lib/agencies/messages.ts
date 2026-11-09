import { pickVariations } from "@/lib/prospect-lang";

/**
 * Messages to player agencies (the user's own service: never mentions NEYOD). Templates use {agencia}
 * and {jogadores}; {{a|b}} variations keep consecutive messages from being identical (Instagram flags
 * the same text sent to many accounts). No server imports: safe in client components.
 */

/** 1st message (the offer), the plans (when they answer) and the follow-up (3 days without an answer). */
export type AgencyTemplates = { message: string; plans: string; followup: string };

export const AGENCY_DEFAULTS: Record<"pt" | "en", AgencyTemplates> = {
  pt: {
    message: `{{Olá|Boas|Olá, tudo bem?}} {agencia}! {{Faço edições de matchday para jogadores de futebol|Trabalho a fazer edições de matchday para jogadores}} e {{reparei na vossa página|tenho acompanhado a vossa página}}.

{{A proposta é simples|Queria propor-vos uma coisa}}: todos os fins de semana, uma edição de matchday para cada um dos vossos {jogadores} jogadores, com o jogo, o clube e o vosso logótipo. O estilo é o mesmo para todos os jogadores da agência e exclusivo vosso, nenhuma outra agência o usa.

{{Os jogadores partilham nas contas deles|Cada jogador partilha na sua conta}}, o que faz crescer a página da agência, e com mais qualidade vêm mais seguidores.

{{Para verem a qualidade|Para perceberem o nível das edições}}, o primeiro fim de semana é grátis para 3 jogadores à vossa escolha. Depois são 15 € por jogador por fim de semana (12 € a partir de 10 jogadores).

{{Querem experimentar este fim de semana?|Posso preparar o teste para este fim de semana?}}`,
    plans: `{{Obrigado pela resposta!|Boa, obrigado!}} Os planos são estes, sempre por jogador e por fim de semana:

• Matchday: 15 € (12 € a partir de 10 jogadores)
• Matchday + Golo: 20 €
• Completo (matchday, golo, equipa da semana e estatísticas): 28 €

O primeiro fim de semana é grátis para 3 jogadores à vossa escolha. Para começar só preciso de uma foto com boa qualidade de cada jogador e do logótipo da agência (de preferência em PNG com fundo transparente). {{Que jogadores querem no teste?|Quais são os 3 jogadores para o teste?}}`,
    followup: `{{Olá|Boas}} {agencia}! {{Só para saber se viram a minha mensagem|Volto só a perguntar}} sobre as edições de matchday para os vossos jogadores. O primeiro fim de semana é grátis para 3 jogadores, {{sem compromisso|sem qualquer compromisso}}. {{Querem experimentar?|Fica a proposta!}}`,
  },
  en: {
    message: `{{Hi|Hello}} {agencia}! {{I make matchday graphics for football players|I design matchday edits for football players}} and {{came across your page|have been following your page}}.

{{The idea is simple|I'd like to offer you something}}: every weekend, a matchday edit for each of your {jogadores} players, with the game, the club and your logo. The style is the same for all of your players and exclusive to you, no other agency uses it.

{{Players share them on their own accounts|Each player shares it on his account}}, which grows the agency's page, and better quality brings more followers.

{{To see the quality|So you can judge the level}}, the first weekend is free for 3 players of your choice. After that it is €15 per player per weekend (€12 from 10 players).

{{Would you like to try it this weekend?|Shall I prepare the trial for this weekend?}}`,
    plans: `{{Thanks for getting back to me!|Great, thanks!}} These are the plans, always per player and per weekend:

• Matchday: €15 (€12 from 10 players)
• Matchday + Goal: €20
• Complete (matchday, goal, team of the week and stats): €28

The first weekend is free for 3 players of your choice. To start I only need one good-quality photo of each player and the agency's logo (ideally a PNG with a transparent background). {{Which players would you like in the trial?|Which 3 players should I do for the trial?}}`,
    followup: `{{Hi|Hello}} {agencia}! {{Just checking whether you saw my message|Following up}} about matchday edits for your players. The first weekend is free for 3 players, {{no strings attached|no commitment}}. {{Want to give it a try?|The offer stands!}}`,
  },
};

/** One message for one agency: its name and number of players, then the variations (stable per agency). */
export function fillAgency(template: string, v: { agencia: string; jogadores: number }, seed: string): string {
  const t = template.replaceAll("{agencia}", v.agencia).replaceAll("{jogadores}", String(v.jogadores));
  return pickVariations(t, seed).replace(/ +([!?.,])/g, "$1").replace(/  +/g, " ");
}

/**
 * Emails to agencies WITHOUT Instagram: the full offer (the account created and managed: identity, every
 * player's matchday each weekend, extra posts, stories) with its own, higher prices. Same {agencia} /
 * {jogadores} / {{a|b}} rules as the Instagram messages. Never mentions NEYOD.
 */
export type AgencyEmailTemplates = { subject: string; body: string; followupSubject: string; followup: string };

export const EMAIL_DEFAULTS: Record<"pt" | "en", AgencyEmailTemplates> = {
  pt: {
    subject: "{{Instagram para a|Proposta de Instagram para a}} {agencia}",
    body: `{{Olá|Bom dia}},

{{Chamo-me Martim e trabalho|Sou o Martim e trabalho}} na criação de conteúdo para jogadores de futebol: edições de matchday, golos e resultados para Instagram. Reparei que a {agencia} ainda não tem uma página de Instagram e queria propor-vos criá-la e geri-la.

O que inclui:
• Criação do perfil, com identidade visual própria, bio, destaques e as primeiras publicações;
• Todos os fins de semana, uma edição de matchday para cada um dos vossos {jogadores} jogadores, com um estilo exclusivo da agência;
• Golos, resultados e anúncios de novos jogadores, mais 2 publicações extra por semana e stories.

{{Porque vale a pena|Os benefícios}}:
• Os jogadores ganham visibilidade junto de clubes e treinadores;
• A agência ganha credibilidade quando quer representar novos jogadores;
• Os jogadores partilham as publicações nas suas contas, por isso a página cresce desde o primeiro dia — e com mais qualidade vêm mais seguidores.

Preços:
• Criação da conta e identidade visual: 250 € (pagamento único)
• Gestão mensal: 450 €/mês até 10 jogadores, 750 €/mês de 11 a 25 jogadores, 990 €/mês a partir de 26 jogadores

Para verem a qualidade antes de decidirem, faço gratuitamente o primeiro fim de semana para 3 jogadores à vossa escolha.

{{Têm disponibilidade para falarmos esta semana?|Posso enviar-vos alguns exemplos e marcar uma chamada rápida?}}

{{Cumprimentos|Com os melhores cumprimentos}},
Martim`,
    followupSubject: "Re: Instagram para a {agencia}",
    followup: `{{Olá|Bom dia}},

{{Volto só a escrever|Escrevo só para saber se receberam o meu email}} sobre a criação e gestão do Instagram da {agencia}. O primeiro fim de semana é grátis para 3 jogadores, sem compromisso, para verem a qualidade das edições.

{{Fico a aguardar|Qualquer dúvida, estou disponível}}.

Cumprimentos,
Martim`,
  },
  en: {
    subject: "Instagram for {agencia}",
    body: `{{Hello|Good morning}},

My name is Martim and I create content for football players: matchday, goal and result graphics for Instagram. I noticed {agencia} does not have an Instagram page yet and I would like to offer to create and manage it for you.

What it includes:
• The profile set up, with its own visual identity, bio, highlights and the first posts;
• Every weekend, a matchday graphic for each of your {jogadores} players, in a style exclusive to your agency;
• Goals, results and new-signing announcements, plus 2 extra posts a week and stories.

{{Why it is worth it|The benefits}}:
• Players gain visibility with clubs and coaches;
• The agency gains credibility when approaching new players;
• Players share the posts on their own accounts, so the page grows from day one — and better quality brings more followers.

Prices:
• Account set-up and visual identity: €250 (one-off)
• Monthly management: €450/month up to 10 players, €750/month for 11 to 25 players, €990/month from 26 players

So you can judge the quality first, I will do the first weekend for free for 3 players of your choice.

{{Would you have time for a quick call this week?|May I send you a few examples and book a short call?}}

Best regards,
Martim`,
    followupSubject: "Re: Instagram for {agencia}",
    followup: `{{Hello|Good morning}},

{{Just following up|I wanted to check whether you received my email}} about creating and managing {agencia}'s Instagram. The first weekend is free for 3 players, no commitment, so you can see the quality of the work.

Best regards,
Martim`,
  },
};

/** A mailto: link that opens the user's mail program with recipient, subject and text filled in. */
export function mailtoUrl(to: string, subject: string, body: string): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
