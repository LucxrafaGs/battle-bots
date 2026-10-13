import type { Diagram, DiagramView } from '@/types/content';
import { NETS_AVANCADO, NETS_BASICO, NETS_ESP32 } from './robos.generated';

/* ==========================================================================
   BIBLIOTECA DE DIAGRAMAS ELÉTRICOS
   Arquivos em public/diagramas/. Formatos: svg, png, jpg, webp, pdf.

   As pranchas SVG dos robôs são geradas por scripts/diagramas/gen.py a partir
   das pranchas originais de Lucas Rafael (16/11/2023). Cada fio leva o
   atributo data-net, e as cores/descrições das ligações vêm do arquivo
   gerado robos.generated.ts.

   Para cadastrar um novo diagrama:
   {
     id: 'eletrica-padrao',
     name: 'Elétrica padrão',
     group: 'Montagem elétrica A',
     description: 'Texto opcional.',
     views: [
       { kind: 'esquematico', file: 'diagramas/padrao-esquematico.svg', format: 'svg' },
       { kind: 'foto', file: 'diagramas/padrao-foto.jpg', format: 'jpg' },
     ],
     info: { Placa: '…', Driver: '…', Alimentação: '…' },
     downloads: [{ label: 'Esquemático (PDF)', file: 'diagramas/padrao.pdf' }],
   }
   ========================================================================== */

const views = (slug: string): DiagramView[] => [
  { kind: 'ligacao', file: `diagramas/${slug}/ligacao.svg`, format: 'svg' },
  { kind: 'esquematico', file: `diagramas/${slug}/esquematico.svg`, format: 'svg' },
  { kind: 'blocos', file: `diagramas/${slug}/energia-sinal.svg`, format: 'svg' },
  { kind: 'tabela', file: `diagramas/${slug}/tabela.svg`, format: 'svg' },
  { kind: 'passo-a-passo', file: `diagramas/${slug}/passo-a-passo.svg`, format: 'svg' },
  { kind: 'original', file: `diagramas/${slug}/original.webp`, format: 'webp' },
];

const downloads = (slug: string, nome: string) => [
  { label: `Pranchas completas — ${nome} (PDF)`, file: `diagramas/${slug}/pranchas-${slug}.pdf` },
  { label: 'Ligação física (SVG)', file: `diagramas/${slug}/ligacao.svg` },
  { label: 'Esquemático (SVG)', file: `diagramas/${slug}/esquematico.svg` },
  { label: 'Energia e sinal (SVG)', file: `diagramas/${slug}/energia-sinal.svg` },
  { label: 'Tabela de ligações (SVG)', file: `diagramas/${slug}/tabela.svg` },
  { label: 'Passo a passo (SVG)', file: `diagramas/${slug}/passo-a-passo.svg` },
  { label: 'Prancha original (PDF)', file: `diagramas/${slug}/original.pdf` },
];

export const DIAGRAMS: Diagram[] = [
  {
    id: 'robo-basico',
    name: 'Robô básico',
    group: 'Robôs de batalha',
    description:
      'Arduino Nano controlado por Bluetooth (HC-06), ponte H L298N para dois motores TT e arma ativa com motor brushless A2212 e ESC 30A, tudo em uma LiPo 3S.',
    views: views('robo-basico'),
    info: {
      Controle: 'Bluetooth · HC-06 + app',
      Placa: 'Arduino Nano',
      Tração: 'L298N + 2 motores TT',
      Arma: 'A2212 2200KV + ESC 30A',
      Alimentação: 'LiPo 3S · 11,1 V',
      Lógica: '5 V (RXD do HC-06 em 3,3 V)',
      'Prancha original': '16/11/2023 · Lucas Rafael',
    },
    nets: NETS_BASICO,
    notes: [
      { level: 'atencao', text: 'Arme o ESC com o sinal em 1000 µs (arma parada) por 2–3 s antes de qualquer comando. Teste a arma sem lâmina e com proteção.' },
      { level: 'atencao', text: 'Motores TT amarelos são feitos para 3–6 V. Em 3S (cerca de 9–10 V depois da queda do L298N) giram bem mais rápido e esquentam; se preferir, use motores de 12 V com o mesmo encaixe.' },
      { level: 'atencao', text: 'A biblioteca Servo (pulso do ESC no D5) desliga o PWM dos pinos D9 e D10. Por isso IN1–IN4 funcionam como liga/desliga e a velocidade fica no máximo pelos jumpers ENA/ENB.' },
      { level: 'dica', text: 'Para gravar o Nano pelo USB, desligue a chave geral.' },
      { level: 'dica', text: 'O RXD do HC-06 é 3,3 V: o divisor 1 kΩ / 2 kΩ reduz os 5 V do D3 para cerca de 3,3 V. O TXD do HC-06 pode ir direto no D2.' },
      { level: 'dica', text: 'Para robôs com arma passiva, a prancha original indica bateria Li-ion de 12 V no lugar da LiPo.' },
    ],
    bom: [
      { item: 'Arduino Nano', qty: '1' },
      { item: 'Ponte H L298N', qty: '1' },
      { item: 'Motor TT amarelo com redução', qty: '2 ou 4', note: 'depende do tipo de robô' },
      { item: 'Bluetooth HC-06', qty: '1' },
      { item: 'Resistores 1 kΩ e 2 kΩ', qty: '1 + 1', note: 'divisor do RXD' },
      { item: 'LiPo 3S 2200 mAh', qty: '1', note: 'conector XT60' },
      { item: 'ESC 30A (HW30A)', qty: '1' },
      { item: 'Brushless A2212 2200KV', qty: '1' },
      { item: 'Chave geral ou link removível', qty: '1', note: 'acréscimo · 30 A ou mais' },
      { item: 'Fios 14–16 AWG e jumpers Dupont', qty: '—' },
    ],
    downloads: downloads('robo-basico', 'robô básico'),
  },
  {
    id: 'robo-avancado',
    name: 'Robô avançado',
    group: 'Robôs de batalha',
    description:
      'Três motores brushless A2212 (duas rodas e a arma), cada um com seu ESC 30A, comandados por rádio FlySky FS-i6 e receptor FS-iA6B. A bateria LiPo 3S alimenta os três ESCs em paralelo.',
    views: views('robo-avancado'),
    info: {
      Controle: 'Rádio FS-i6 + receptor FS-iA6B',
      Tração: '2× A2212 + ESC 30A bidirecional',
      Arma: 'A2212 2200KV + ESC 30A',
      Alimentação: 'LiPo 3S · 2200–4400 mAh',
      Mixagem: 'Elevon no rádio (CH1/CH2)',
      Receptor: 'BEC 5 V do ESC da roda D',
      'Prancha original': '16/11/2023 · Lucas Rafael',
    },
    nets: NETS_AVANCADO,
    notes: [
      { level: 'atencao', text: 'Os ESCs das rodas precisam ser bidirecionais (com ré). ESCs de avião como o HW30A giram para um lado só e não servem para tração.' },
      { level: 'atencao', text: 'Só um BEC pode alimentar o receptor: retire o pino vermelho do conector dos outros dois ESCs.' },
      { level: 'atencao', text: 'Configure o failsafe do CH3 no mínimo para a arma parar se o sinal cair, e teste desligando o rádio com o robô suspenso.' },
      { level: 'atencao', text: 'A2212 tem grande rotação e pouco torque: as rodas precisam de caixa de redução (observação da prancha original).' },
      { level: 'dica', text: 'Ligue o rádio antes do robô e desligue o robô antes do rádio.' },
      { level: 'dica', text: 'Se a frente virar ré, use Reverse no CH1 ou no CH2. Se um motor girar ao contrário, troque dois fios de fase.' },
    ],
    bom: [
      { item: 'ESC 30A bidirecional', qty: '2', note: 'rodas' },
      { item: 'ESC 30A', qty: '1', note: 'arma' },
      { item: 'Brushless A2212 2200KV', qty: '3' },
      { item: 'LiPo 3S 2200 ou 4400 mAh', qty: '1', note: 'conector XT60' },
      { item: 'Rádio FlySky FS-i6 + receptor FS-iA6B', qty: '1' },
      { item: 'Chicote paralelo XT60 1→3 ou PDB', qty: '1' },
      { item: 'Chave geral ou link removível', qty: '1', note: 'acréscimo · 60 A ou mais' },
      { item: 'Caixa de redução para as rodas', qty: '2' },
      { item: 'Fios 14–16 AWG', qty: '—' },
    ],
    downloads: downloads('robo-avancado', 'robô avançado'),
  },
  {
    id: 'robo-esp32',
    name: 'Robô ESP32',
    group: 'Robôs de batalha',
    description:
      'Versão com ESP32 DevKit (Bluetooth integrado, sem HC-06): dois drivers G2 18v17 para os motores DC e ESC brushless opcional, com fusível, link removível e regulador LM2596 em 5 V.',
    views: views('robo-esp32'),
    nets: NETS_ESP32,
    info: {
      Controle: 'Bluetooth BLE do ESP32',
      Placa: 'ESP32 DevKit (WROOM)',
      Tração: '2× driver G2 18v17 + motores DC',
      Arma: 'ESC brushless (sinal GPIO18)',
      Alimentação: 'LiPo 3S · fusível F1 + link',
      Lógica: 'LM2596 ajustado em 5,0 V',
    },
    notes: [
      { level: 'atencao', text: 'Meça 5,0 V na saída do LM2596 antes de ligar no 5V/VIN do ESP32.' },
      { level: 'atencao', text: 'O ESC precisa aceitar sinal RC de 3,3 V; se exigir 5 V, a ligação direta não funciona.' },
      { level: 'atencao', text: 'Não use AMS1117 ou L7805 direto em 3S: dissipação elevada.' },
      { level: 'dica', text: 'G2 esquerdo: PWM GPIO25, DIR GPIO26, FLT GPIO32 · G2 direito: PWM GPIO27, DIR GPIO14, FLT GPIO33. FLT com pull-up 10k para 3V3, PWM com pull-down 10k.' },
      { level: 'dica', text: 'Código correspondente na aba Códigos: “Robô de combate — ESP32”.' },
    ],
    bom: [
      { item: 'ESP32 DevKit (WROOM)', qty: '1' },
      { item: 'Driver Pololu G2 18v17', qty: '2' },
      { item: 'Motor DC', qty: '2', note: 'dimensionar pela corrente de bloqueio' },
      { item: 'Regulador LM2596 ajustável', qty: '1', note: 'ajustar em 5,0 V' },
      { item: 'ESC brushless + motor', qty: '1', note: 'opcional · sinal 3,3 V' },
      { item: 'LiPo 3S', qty: '1' },
      { item: 'Fusível F1 + link removível', qty: '1 + 1' },
      { item: 'Resistores 10k', qty: '5', note: '3 pull-down, 2 pull-up' },
      { item: 'Capacitor 100–470 µF / 10 V', qty: '1', note: 'C1 · 5 V' },
      { item: 'Capacitor 470–1000 µF / 25 V', qty: '2', note: 'C2, C3 · VIN dos drivers' },
    ],
    downloads: downloads('robo-esp32', 'robô ESP32'),
  },
];

export const DIAGRAM_VIEW_LABEL = {
  esquematico: 'Esquemático',
  ligacao: 'Ligação física',
  foto: 'Montagem real',
  'passo-a-passo': 'Passo a passo',
  blocos: 'Energia e sinal',
  tabela: 'Tabela de ligações',
  original: 'Prancha original',
} as const;
