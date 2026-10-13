/* Configuração geral do site. */
export const SITE = {
  brand: 'BATTLE BOTS',
  signature: 'Um projeto feito por Lucas',
  nav: [
    { to: '/', label: 'Início' },
    { to: '/montar', label: 'Montar Robô' },
    { to: '/construcao', label: 'Construção' },
    { to: '/legado', label: 'Legado' },
    { to: '/sobre', label: 'Sobre' },
  ],
} as const;
