# CAD — Battle Bots

Fonte de todas as peças do montador, gerada a partir de `Robo_02.f3d`.

## Conteúdo
- `step/originais/` — as 4 peças do projeto Robo 02 (frame, laterais, tampa),
  extraídas do `.f3d` como sólidos B-rep exatos.
- `step/laterais|frames|tampas|armas/` — as variações.
  Todos os STEP estão nas **coordenadas do Fusion** (mm, Y para cima,
  frente em −Z): importe no projeto e eles caem no lugar do conjunto.
- `battle-bots-robos.blend` — os 5 robôs lado a lado no Blender
  (uma coleção por robô).
- `renders/` — imagens dos robôs.
- `scripts/` — o pipeline completo (Python):
  - `asm.py`, `sabdump.py`, `sab2occ.py` — leem o B-rep ASM/SAB de dentro
    do `.f3d` e reconstroem os sólidos no OpenCascade.
  - `lib.py`, `laterals.py`, `frames.py`, `tampas.py`, `weapons.py` —
    modelagem das variações (build123d).
  - `assemble.py` — checagem de interferência entre peças e armas.
  - `export_print.py` — STL de impressão orientados.
  - `blender_export.py`, `hero.py` — GLB do site, miniaturas, `.blend` e renders.

## Para regenerar
```bash
pip install build123d cadquery-ocp ezdxf bpy scipy
python laterals.py && python frames.py && python tampas.py
python export_print.py && python blender_export.py
```
(Os caminhos de entrada estão no topo de `lib.py`.)

## Observação
Rodas e motores aparecem nos modelos só como referência visual. A posição
da roda foi estimada a partir do compartimento da lateral, porque o
`.f3d` guarda os componentes sem a posição de montagem do motor e da roda.
