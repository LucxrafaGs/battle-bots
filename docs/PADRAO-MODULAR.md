# Padrão modular BB-1 (base “Robo 02”)

Todas as peças do montador derivam do projeto Fusion **Robo 02** e seguem
este padrão. É ele que garante que qualquer Lateral 1 + Lateral 2 +
Frame Central + Tampa se encaixem sem ajuste manual.

## Interfaces que nunca mudam

| Peça | O que é preservado |
| --- | --- |
| Frame Central | Placa base (6 mm), paredes, encaixes em T das laterais, furos M3 laterais e a **baía da arma** na frente (assentos Ø22/Ø32 alinhados com a tampa, furo Ø8,5 no eixo X −74,51 / Z −67,5 do Fusion). |
| Laterais | Abas e T de encaixe no frame, furos M3, compartimento do motor DC amarelo (TT) e o vão da roda. As variações só **acrescentam** blindagem do lado de fora (X ≥ 20 mm no Fusion). |
| Tampa | Placa de 6 mm, saia e assento sobre a baía da arma. Variações gravam, furam ou acrescentam peças por cima. |

## Coordenadas

### No Fusion (arquivos STEP em `cad/step/`)
Mesmas coordenadas do projeto Robo 02: milímetros, Y para cima,
frente do robô em −Z. Os STEP podem ser importados no Fusion e caem
no lugar certo do conjunto.

### No site (GLB em `public/modelos/`)
Sistema do robô: origem no centro do frame, na face inferior; +Y para
cima; **+Z = frente** (baía da arma); Lateral 1 em −X, Lateral 2 em +X;
chão em Y = −4 (rodas Ø44 com eixo em Y = 18).

Conversão Fusion → site: `x' = −(x + 75,27)`, `y' = y − 14`, `z' = −(z − 14,39)`.

Como os GLB já estão posicionados, o ponto de encaixe de todas as
categorias no site é a origem (`src/data/frames/standard.ts`).

## STL de impressão (`public/stl/<ID>/`)
Já orientados para a mesa (Z para cima, apoiados em Z = 0), em mm,
gerados a partir do sólido exato (não convertidos de malha de visualização).

## Checagem de interferência
`cad/assemble.py` cruza todas as peças de categorias diferentes e os
volumes varridos pelas armas. Os conflitos reais encontrados estão em
`src/data/frames/compat.ts` e aparecem como aviso no montador.

Observação sobre o projeto original: a Lateral 1 original (L1-01)
sobrepõe o frame em cerca de 1 mm em dois pontos (≈ 0,4 cm³) e a tampa
em ≈ 0,03 cm³. As variações L1-02 a L1-05 já saem com essa folga
corrigida. A Lateral 1 original foi mantida como está.
