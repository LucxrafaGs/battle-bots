# BATTLE BOTS

Portal de montagem modular, documentação e legado.
**Um projeto feito por Lucas.**

Aplicação React + TypeScript + Vite, com Three.js / React Three Fiber, Anime.js,
Zustand, React Router, Monaco Editor e JSZip. Funciona como site estático:
não precisa de banco de dados, conta ou servidor.

---

## Como rodar

Requer **Node.js 20.19+** (ou 22.12+).

```bash
npm install
npm run dev        # desenvolvimento em http://localhost:5173
npm run build      # gera a versão final em dist/
npm run preview    # testa a versão final localmente
```

A pasta `dist/` pode ser publicada em qualquer hospedagem estática
(GitHub Pages, Netlify, Vercel, servidor da escola…). As rotas usam `#`
(ex.: `/#/montar`), então não é preciso configurar redirecionamentos.

---

## Onde fica cada conteúdo

Nenhum componente React precisa ser editado para adicionar conteúdo.

| O quê | Dados | Arquivos |
| --- | --- | --- |
| Configuração geral (marca, menu) | `src/data/site.ts` | — |
| Peças do montador | `src/data/frames/catalog.ts` | `public/modelos/`, `public/stl/`, `public/miniaturas/` |
| Padrão de encaixe | `src/data/frames/standard.ts` | ver `docs/PADRAO-MODULAR.md` |
| Guia de montagem | `src/data/guides/index.ts` | `public/midia/montagem/` |
| Diagramas elétricos | `src/data/diagrams/index.ts` | `public/diagramas/` |
| Códigos | `src/data/codes/index.ts` | `public/codigos/` |
| Edições do Legado | `src/data/legacy/index.ts` | `public/midia/legado/<ano>/` |
| Página Sobre | `src/data/about/index.ts` | `public/midia/sobre/` |

Todos os tipos estão descritos em `src/types/content.ts`. Cada arquivo de
dados traz um exemplo comentado de item preenchido.

Caminhos de arquivos são sempre **relativos à pasta `public/`**
(ex.: `'stl/frame-central-02.stl'`).

---

## Montador modular

- Quatro categorias: **Lateral 1, Lateral 2, Frame Central, Tampa**.
- Quantidade de modelos ilimitada por categoria.
- Todas as peças seguem o padrão **BB-1**: qualquer combinação encaixa
  automaticamente, sem ajuste manual.
- Visualização: GLB/GLTF (recomendado) ou o próprio STL.
- Exportação: ZIP com os **STL originais** cadastrados + `configuracao.json`
  + `LEIA-ME.md`. Se faltar algum STL, a exportação é bloqueada e a
  interface diz qual arquivo falta.
- Combinações salvas ficam no navegador (localStorage). O
  `configuracao.json` de um ZIP pode ser importado em “Carregar combinação”.

### Peças cadastradas

O catálogo traz as peças do projeto Fusion **Robo 02** (módulos 01) e
14 variações feitas sobre elas: 4 blindagens laterais (×2 lados),
4 frames com arma e 3 tampas. São 5 robôs prontos — ver
`docs/ROBOS.md` (armas, lista de materiais, impressão).

A fonte CAD de tudo está em `cad/`:
- `cad/step/` — peças em STEP, nas coordenadas do Fusion (importe no
  Fusion e elas caem no lugar do conjunto).
- `cad/battle-bots-robos.blend` — os 5 robôs no Blender.
- `cad/scripts/` — scripts Python (build123d/OpenCascade + Blender)
  que geram STEP, STL, GLB e miniaturas a partir do `.f3d`.

### Adicionar uma peça

1. Exporte a peça seguindo o padrão BB-1 (`docs/PADRAO-MODULAR.md`).
2. Copie os arquivos:
   - `public/modelos/FC-06.glb` (opcional, visualização)
   - `public/stl/FC-06/frame-central.stl` (fabricação)
   - `public/miniaturas/FC-06.webp` (opcional; sem ela a miniatura é
     gerada automaticamente)
3. Acrescente em `MODULES` (`src/data/frames/catalog.ts`):

```ts
{
  id: 'FC-06',
  category: 'frame',
  name: 'Frame Central — Modelo 06',
  standard: STANDARD_ID,
  model: 'modelos/FC-06.glb',
  stl: 'stl/FC-06/frame-central.stl',
  extraStl: [{ label: 'Arma', file: 'stl/FC-06/arma.stl', filename: 'arma.stl' }],
  thumbnail: 'miniaturas/FC-06.webp',
  specs: { Material: 'PETG' },
},
```

Robôs prontos ficam em `src/data/frames/robots.ts` e avisos de
interferência em `src/data/frames/compat.ts`.

Se o arquivo não foi exportado na posição do padrão, corrija com
`offset: { position: { x, y, z }, rotation: { x, y, z } }` (mm e graus)
ou `unitScale` (quando o arquivo não está em milímetros).

---

## Conteúdo de exemplo incluído

(As peças do montador são reais; os exemplos abaixo são só da aba Construção.)

Somente para demonstrar o funcionamento — remova quando tiver o real:

- Nenhum: a aba Códigos traz os códigos reais (Arduino e ESP32).

A aba Elétrica já traz os dois circuitos reais (robô básico e avançado),
gerados a partir das pranchas originais de 16/11/2023. As pranchas SVG são
produzidas por `scripts/diagramas/gen.py` (veja a seção “Pranchas elétricas”).

Nenhum dado histórico, pessoal ou de competição foi inventado: Legado e
Sobre começam vazios, com espaços reservados indicando onde preencher.

---

## Pranchas elétricas

As vistas da aba Elétrica (ligação física, esquemático, energia e sinal,
tabela e passo a passo) são geradas por código para que todas usem as
mesmas ligações:

```bash
cd scripts/diagramas && python3 gen.py
```

- `basico.py` e `avancado.py`: peças, fios e cores de cada robô.
- `views.py`: esquemático, energia e sinal, tabela e passo a passo.
- Saída: `public/diagramas/robo-*/` e `src/data/diagrams/robos.generated.ts`.

Cada fio do SVG leva `data-net` e cada peça `data-part`, o que permite ao
site destacar uma ligação ao passar o mouse. Textos, avisos e lista de
material ficam em `src/data/diagrams/index.ts`.

---

## Estrutura

```
src/
  data/          conteúdo (catálogo, guias, diagramas, códigos, legado, sobre)
  types/         tipos do conteúdo
  pages/         Início, Montar Robô, Construção, Legado, Edição, Sobre
  components/    layout (loading, menu, transições, cursor) e interface
  three/         cena 3D e carregamento de modelos (GLB/STL)
  store/         estado (Zustand)
  lib/           exportação STL, carregamento inicial, Monaco, utilidades
public/          modelos, STL, miniaturas, diagramas, códigos e mídia
docs/            padrão modular
```

## Acessibilidade e movimento

- Respeita “reduzir movimento” do sistema (loading curto, sem animações
  de câmera, transições por esmaecimento).
- Navegação por teclado com foco visível; atalhos ← → no guia de montagem;
  zoom por teclado (+ − 0 e setas) no visualizador de diagramas.
- Cursor personalizado somente em dispositivos com mouse.
