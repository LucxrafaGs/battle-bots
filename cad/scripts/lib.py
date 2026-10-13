"""Biblioteca CAD do Battle Bots (build123d / OpenCascade).

Coordenadas: as do projeto Fusion "Robo_02" (mm, Y para cima).
  • Frente do robô (baía da arma) = −Z.  • Chão = Y 10 (rodas Ø44 com eixo em Y 32).
  • Eixo vertical da arma (sede Ø22 do frame) = (X −74.51, Z −67.5).
Ao exportar para o site tudo é convertido para o sistema do robô (RCS):
  origem no centro do frame, base em Y=0, frente = +Z.
"""
import math
import numpy as np
from build123d import (Box, Cylinder, Face, Wire, Vector, Pos, Rot, Location, Solid, Shape,
                       extrude, loft, import_step, export_step, export_stl, Plane, Compound, Axis,
                       offset, Kind, revolve, Edge, mirror, fillet, chamfer)

ORIG = '/home/claude/cad/cand2'
Y0, Y1 = 14.0, 50.0           # base e topo do corpo
GROUND = 10.0
PIVOT = Vector(-74.51, 0, -67.5)  # eixo vertical da baía da arma
MID_X = -75.27                  # plano de simetria entre as laterais
FRONT_Z = -85.0                 # ponta da baía


def load(name):
    return import_step(f'{ORIG}/{name}.step')


def V(x, y, z):
    return Vector(x, y, z)


def plan_face(pts, y):
    """Face horizontal (plano XZ) na altura y a partir de pontos (x, z)."""
    w = Wire.make_polygon([V(x, y, z) for x, z in pts], close=True)
    return Face(w)


def prism(pts, y0, y1):
    """Prisma vertical com contorno (x, z) entre y0 e y1."""
    f = plan_face(pts, y0)
    return extrude(f, amount=y1 - y0, dir=(0, 1, 0))


def arc_pts(c, r, a0, a1, n=24):
    """Pontos de arco no plano XZ (ângulos em graus, 0 = +X, 90 = +Z)."""
    return [(c[0] + r * math.cos(math.radians(a)), c[1] + r * math.sin(math.radians(a)))
            for a in np.linspace(a0, a1, n)]


def cyl_y(r, y0, y1, x, z):
    """Cilindro de eixo vertical."""
    return Pos(x, (y0 + y1) / 2, z) * Rot(90, 0, 0) * Cylinder(r, y1 - y0)


def cyl_x(r, x0, x1, y, z):
    """Cilindro de eixo X."""
    return Pos((x0 + x1) / 2, y, z) * Rot(0, 90, 0) * Cylinder(r, abs(x1 - x0))


def cyl_z(r, z0, z1, x, y):
    return Pos(x, y, (z0 + z1) / 2) * Cylinder(r, abs(z1 - z0))


def box(x0, x1, y0, y1, z0, z1):
    return Pos((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2) * Box(abs(x1 - x0), abs(y1 - y0), abs(z1 - z0))


def mirror_x(shape, x=MID_X):
    """Espelha no plano X = x (lateral direita -> esquerda)."""
    return mirror(shape, about=Plane(origin=(x, 0, 0), z_dir=(1, 0, 0)))


def solid(s):
    """Garante um único sólido (funde compostos)."""
    if isinstance(s, Compound):
        sols = s.solids()
        if len(sols) == 1:
            return sols[0]
        out = sols[0]
        for t in sols[1:]:
            out = out + t
        return out
    return s


def check(name, s):
    s = solid(s) if not isinstance(s, Solid) else s
    n = len(s.solids()) if hasattr(s, 'solids') else 1
    print(f'  {name}: válido={s.is_valid} sólidos={n} volume={s.volume/1000:.1f} cm³')
    return s


# ------------------------------------------------------------ componentes reais
def a2212(up=(0, 1, 0)):
    """Motor A2212 (Ø27.7 × 27 mm, eixo 3.17 mm) – só para visualização.
    Base em Y=0, eixo para +Y."""
    stator = Cylinder(11.5, 3, align=None)  # base de fixação
    m = Pos(0, 1.5, 0) * Rot(90, 0, 0) * Cylinder(12.5, 3)
    bell = Pos(0, 3 + 12, 0) * Rot(90, 0, 0) * Cylinder(13.85, 24)
    shaft = Pos(0, 27 + 6, 0) * Rot(90, 0, 0) * Cylinder(1.585, 12)
    return m + bell + shaft


def bearing_625():
    """Rolamento 625ZZ (5 × 16 × 5)."""
    return Rot(0, 90, 0) * (Cylinder(8, 5) - Cylinder(2.5, 5))
