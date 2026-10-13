import type { LegacyEdition, MediaItem } from '@/types/content';

/* ==========================================================================
   LEGADO — EDIÇÕES
   Cada ano mostra todas as fotos e vídeos (pasta public/midia/legado/ANO)
   e, abaixo, o texto da edição em `description` (um parágrafo por item).
   As mídias foram otimizadas para a web a partir da pasta Legado do projeto.
   ========================================================================== */

const foto = (src: string, w: number, h: number): MediaItem => ({ kind: 'image', src, ratio: `${w}/${h}` });
const video = (src: string, poster: string, w: number, h: number): MediaItem => ({ kind: 'video', src, poster, ratio: `${w}/${h}` });

export const EDITIONS: LegacyEdition[] = [
  {
    year: '2022',
    cover: 'midia/legado/2022/foto-01.webp',
    photos: [
      foto('midia/legado/2022/foto-01.webp', 739, 1600),
      video('midia/legado/2022/video-01.mp4', 'midia/legado/2022/video-01.jpg', 464, 832),
      video('midia/legado/2022/video-02.mp4', 'midia/legado/2022/video-02.jpg', 480, 848),
      video('midia/legado/2022/video-03.mp4', 'midia/legado/2022/video-03.jpg', 480, 848),
      video('midia/legado/2022/video-04.mp4', 'midia/legado/2022/video-04.jpg', 576, 1024),
      video('midia/legado/2022/video-05.mp4', 'midia/legado/2022/video-05.jpg', 576, 576),
    ],
    description: [
      "A história das batalhas de robôs começou em 2022, com uma primeira edição experimental. Apenas dois robôs participaram: o Vermelhão e o Caldo Quinol. Naquele momento, a falta de experiência trouxe desafios básicos, como escolher os motores, construir as armas e definir quais baterias utilizar. Foram usados motores DC simples e houve uma tentativa de incorporar um motor brushless, mas a alimentação inadequada impediu o funcionamento esperado. Os robôs apresentaram problemas e não houve um vencedor definido. Mesmo assim, essa primeira experiência cumpriu um papel fundamental: dar o pontapé inicial ao projeto e mostrar o que precisava ser aprendido.",
    ],
  },
  {
    year: '2023',
    cover: 'midia/legado/2023/video-01.jpg',
    photos: [
      video('midia/legado/2023/video-01.mp4', 'midia/legado/2023/video-01.jpg', 576, 576),
      video('midia/legado/2023/video-02.mp4', 'midia/legado/2023/video-02.jpg', 576, 1024),
      video('midia/legado/2023/video-03.mp4', 'midia/legado/2023/video-03.jpg', 480, 848),
      video('midia/legado/2023/video-04.mp4', 'midia/legado/2023/video-04.jpg', 480, 848),
      video('midia/legado/2023/video-05.mp4', 'midia/legado/2023/video-05.jpg', 480, 848),
    ],
    description: [
      "Em 2023, o projeto avançou significativamente. Foi a primeira edição com controle por radiofrequência e com robôs projetados em CAD, cujos frames foram impressos em 3D. Também foram utilizados motores brushless A2212 nas rodas, mas sua alta rotação e seu baixo torque, na configuração adotada, dificultaram a tração. Quando acelerados ao máximo, alguns robôs chegavam a perder as rodas, que se soltavam durante os testes e confrontos. Um dos competidores acabou vencendo praticamente por W.O., por ser o único que conseguiu funcionar. Embora não tenha sido encontrado nenhum vídeo dessa edição, ela representou um salto importante em relação a 2022, principalmente no desenvolvimento e na fabricação das estruturas.",
    ],
  },
  {
    year: '2024',
    cover: 'midia/legado/2024/foto-01.webp',
    photos: [
      foto('midia/legado/2024/foto-01.webp', 1793, 1800),
      foto('midia/legado/2024/foto-02.webp', 1170, 636),
      foto('midia/legado/2024/foto-03.webp', 1170, 1144),
      foto('midia/legado/2024/foto-04.webp', 1170, 1167),
      foto('midia/legado/2024/foto-06.webp', 1170, 1148),
      foto('midia/legado/2024/foto-07.webp', 1170, 1163),
      foto('midia/legado/2024/foto-08.webp', 1170, 771),
      foto('midia/legado/2024/foto-09.webp', 1170, 1153),
      video('midia/legado/2024/video-01.mp4', 'midia/legado/2024/video-01.jpg', 480, 864),
      video('midia/legado/2024/video-02.mp4', 'midia/legado/2024/video-02.jpg', 848, 480),
      video('midia/legado/2024/video-03.mp4', 'midia/legado/2024/video-03.jpg', 478, 850),
      video('midia/legado/2024/video-04.mp4', 'midia/legado/2024/video-04.jpg', 848, 478),
      video('midia/legado/2024/video-05.mp4', 'midia/legado/2024/video-05.jpg', 352, 624),
      video('midia/legado/2024/video-06.mp4', 'midia/legado/2024/video-06.jpg', 352, 624),
      video('midia/legado/2024/video-07.mp4', 'midia/legado/2024/video-07.jpg', 464, 832),
    ],
    description: [
      "A edição de 2024 foi considerada a melhor batalha de robôs até então. A competição passou a contar com três modalidades: corrida de obstáculos, sumô e combate. Mais de cinco competidores participaram, com todos os robôs projetados e impressos em 3D e equipados com armas ativas, utilizando motores brushless e lâminas de alta rotação. Os confrontos provocaram danos significativos: os robôs se partiram e a intensidade das disputas empolgou a plateia. Além do espetáculo, houve uma grande evolução técnica, com melhor utilização das baterias LiPo e aprimoramento dos códigos de controle pelo celular. A turma do primeiro ano de Mecatrônica conquistou a vitória, marcando uma edição de forte crescimento em relação aos anos anteriores.",
    ],
  },
  {
    year: '2025',
    cover: 'midia/legado/2025/foto-01.webp',
    photos: [
      foto('midia/legado/2025/foto-01.webp', 1170, 699),
      foto('midia/legado/2025/foto-02.webp', 739, 1600),
      foto('midia/legado/2025/foto-03.webp', 739, 1600),
      video('midia/legado/2025/video-01.mp4', 'midia/legado/2025/video-01.jpg', 576, 1024),
    ],
    description: [
      "Em 2025, a principal novidade foi a introdução de checkpoints eletrônicos nas modalidades de corrida, permitindo registrar automaticamente a passagem dos robôs pelos pontos do percurso. Embora não tenha havido tantas mudanças quanto em 2024, a edição demonstrou progresso no aprimoramento dos veículos e na aplicação dos conhecimentos acumulados. A vitória ficou novamente com uma turma do primeiro ano de Mecatrônica, desta vez com um robô desenvolvido por novos participantes.",
    ],
  },
];

/** Fechamento exibido na página do Legado, abaixo da lista de anos. */
export const LEGACY_SUMMARY =
  'Ao longo dessas quatro edições, as batalhas passaram de uma experiência inicial, com dificuldades de funcionamento, para uma competição com diferentes modalidades, estruturas projetadas em CAD, impressão 3D, armas ativas e recursos eletrônicos de acompanhamento. Cada ano contribuiu para esse desenvolvimento, transformando os problemas encontrados em aprendizado para a edição seguinte.';
