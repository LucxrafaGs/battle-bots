"""Gera as pranchas elétricas do site.

    cd scripts/diagramas && python3 gen.py

Saída: public/diagramas/robo-basico/*.svg, public/diagramas/robo-avancado/*.svg
e src/data/diagrams/robos.generated.ts (cores e descrições das ligações).
"""
import json
import os
import sys
import basico
import avancado
import esp32
import views
from kit import svg

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'public', 'diagramas')


def write(folder, name, w, h, body, title):
    os.makedirs(folder, exist_ok=True)
    with open(os.path.join(folder, name), 'w', encoding='utf-8') as f:
        f.write(svg(w, h, body, title))


def main():
    ts = ['/* Arquivo gerado por scripts/diagramas/gen.py — não editar à mão. */',
          "import type { DiagramNet } from '@/types/content';", '']
    for m, slug, sch, blk in ((basico, 'robo-basico', views.schematic_basico, views.blocks_basico),
                             (avancado, 'robo-avancado', views.schematic_avancado, views.blocks_avancado),
                             (esp32, 'robo-esp32', views.schematic_esp32, views.blocks_esp32)):
        d = os.path.join(OUT, slug)
        write(d, 'ligacao.svg', m.W, m.H, m.build(), f'{m.TITLE} — ligação física')
        w, h, b = sch(m)
        write(d, 'esquematico.svg', w, h, b, f'{m.TITLE} — esquemático')
        w, h, b = blk(m)
        write(d, 'energia-sinal.svg', w, h, b, f'{m.TITLE} — energia e sinal')
        w, h, b = views.table(m)
        write(d, 'tabela.svg', w, h, b, f'{m.TITLE} — tabela de ligações')
        w, h, b = views.steps(m)
        write(d, 'passo-a-passo.svg', w, h, b, f'{m.TITLE} — passo a passo')
        nets = [{'id': n[0], 'label': n[1], 'color': n[2], 'detail': n[4]} for n in m.NETS]
        const = 'NETS_' + m.ID.upper()
        ts.append(f'export const {const}: DiagramNet[] = {json.dumps(nets, ensure_ascii=False, indent=2)};')
        ts.append('')
    with open(os.path.join(ROOT, 'src', 'data', 'diagrams', 'robos.generated.ts'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(ts))
    print('ok')


if __name__ == '__main__':
    main()
