# Robôs prontos — Battle Bots

Cinco robôs completos, todos montados sobre o mesmo frame, as mesmas
laterais de encaixe e o mesmo motor DC amarelo com redução (TT) para tração.

| Robô | Frame | Laterais | Tampa | Arma |
| --- | --- | --- | --- | --- |
| Robo 02 — original | FC-01 | L-01 Original | TP-01 Original | baía preparada, sem arma |
| Barra horizontal | FC-02 | L-02 Arco | TP-02 Ventilada | barra 150 mm sobre a tampa |
| Disco horizontal | FC-03 | L-04 Facetada | TP-03 Nervurada | disco Ø140 × 6 mm |
| Tambor | FC-04 | L-03 Cunha | TP-02 Ventilada | tambor Ø44 × 43 mm |
| Martelo | FC-05 | L-05 Nervurada | TP-04 Martelo | martelo de 100 mm por servo |

Todos os módulos combinam entre si. As únicas combinações com aviso no
montador são conflitos físicos reais: a Tampa Martelo com qualquer arma
giratória ou tambor, e as armas horizontais com a tampa original (furo Ø8,5).

## Como cada arma funciona

**Barra e disco horizontais (FC-02, FC-03).** O A2212 fica de pé dentro da
baía da arma, sentado no assento Ø22 que o projeto original já tinha, preso
por 4 parafusos M3 no padrão 16/19 mm (furos escareados por baixo). O sino
gira dentro dos anéis Ø32 do frame e da tampa. O eixo sai pelo furo Ø14 da
tampa e a arma é presa no adaptador M6 do motor (porca M6 embutida no cubo).
A arma gira 3,8 mm acima da tampa e passa por cima das laterais.

**Tambor (FC-04).** Dois braços saem da frente da baía. O A2212 é parafusado
no braço esquerdo e fica *dentro* do tambor (cavidade Ø34); o tambor é
preso no adaptador M6 do motor. Do outro lado, a tampa do tambor leva um
parafuso M5 que gira em um rolamento 625ZZ no braço direito. O tambor fica
12 mm acima do chão.

**Martelo (FC-05 + TP-04).** Duas torres sobre a tampa seguram o servo
MG996R (abas no padrão 49,5 × 10 mm) e um eixo M3 do outro lado. O braço
gira do repouso (deitado para trás) até 39° abaixo da horizontal à frente,
onde a cabeça chega a ~2 mm do chão, logo à frente da cunha do FC-05.

## Lista de materiais por robô (além do conjunto de tração original)

| Item | Barra | Disco | Tambor | Martelo |
| --- | :-: | :-: | :-: | :-: |
| Motor brushless A2212 (1000–1400 KV) | 1 | 1 | 1 | — |
| ESC 30 A para brushless | 1 | 1 | 1 | — |
| Servo MG996R | — | — | — | 1 |
| Parafuso M3 × 8 (fixação do motor) | 4 | 4 | 4 | — |
| Parafuso M4 (impacto) | 2 | 2 | — | — |
| Rolamento 625ZZ (5 × 16 × 5) | — | — | 1 | — |
| Parafuso M5 × 20 + porca | — | — | 1 | 1 (cabeça) |
| Parafuso M3 × 6 (tampa do tambor) | — | — | 3 | — |
| Parafuso M3 × 25 (eixo do martelo) | — | — | — | 1 |
| Parafusos M3 × 8 (abas do servo) | — | — | — | 4 |
| Bateria LiPo 2S–3S | 1 | 1 | 1 | 1 (2S) |

Dados do A2212 usados no projeto: Ø27,7 × 27 mm, eixo 3,17 mm, 4 furos M3
no padrão 16/19 mm, ~52 g, 2S–3S.

## Impressão
- PLA ou PETG, 3–4 perímetros. Armas e laterais com 40–60 % de preenchimento;
  frame e tampa com 20–30 %.
- Laterais, frames e barra/disco imprimem como estão, sem suporte.
- Tampas 01–03: virar com a face superior na mesa (o STL já vem assim).
- Tampa Martelo: imprimir em pé, com suporte só sob a saia da tampa.
- Tambor e martelo: o STL já vem deitado na face plana.
- Tamanho da mesa: FC-02 e FC-03 cabem em 220 mm; **FC-04 (246 mm) e
  FC-05 (223 mm) pedem mesa de 250 mm** ou maior.

## Segurança
Armas com brushless armazenam muita energia. Teste sempre dentro de uma
arena fechada, com a arma presa ou removida durante ajustes, e use um
interruptor/plug de desarme acessível por fora do robô.

## Referências consultadas
- NHRL Wiki — tipos comuns de robôs e armas: https://wiki.nhrl.io/wiki/index.php/Common_Robot_Types
- GrabCAD — Types of Combat Bots: https://grabcad.com/tutorials/types-of-combat-bots
- Make: — Field guide to combat robot weight classes and weapons: https://makezine.com/article/technology/robotics/know-your-combat-robots-a-field-guide-to-competition-weight-classes-and-weapons/
- Hackster — antweight impresso em 3D com tambor brushless: https://www.hackster.io/news/this-3d-printed-bot-is-ready-for-battle-192e3644bde0
- Especificações do A2212 (Thingbits): https://thingbits.in/products/a2212-brushless-fpv-drone-motor
- Motor TT (SunFounder): https://docs.sunfounder.com/projects/sf-components/en/latest/component_tt_motor.html
