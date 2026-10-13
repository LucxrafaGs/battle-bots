"""Tampas: tampa original + variações (ventilada, nervurada, martelo)."""
from lib import *
from weapons import HX0, HX1, HY, HZ
PX, PZ = PIVOT.X, PIVOT.Z
T0, T1 = 50.21, 56.21

def big_hole():
    """Furo Ø14 para o adaptador M6 do A2212 passar acima da tampa."""
    return cyl_y(7, T0-6, T1+1, PX, PZ)

def vents():
    s=None
    for z in np.arange(25, 100, 12):
        for xc in (-125, -75, -25):
            sl = Pos(float(xc), (T0+T1)/2, float(z)) * Box(30, 10, 5)
            s = sl if s is None else s + sl
    return s

def chevrons():
    s=None
    for z in (30, 58, 86):
        for sgn in (-1, 1):
            p = Pos(-75 + sgn*24, T1-0.6, z+9) * Rot(0, sgn*25, 0) * Box(56, 2, 5)
            s = p if s is None else s + p
    return s

def towers():
    s=None
    for x0,x1 in [(-91.5,-85.5),(-63.5,-57.5)]:
        prof = Wire.make_polygon([V(x0,T1-0.5,-62),V(x0,T1-0.5,0),V(x0,HY,0),V(x0,HY+12,HZ+6),V(x0,HY+12,HZ-6),V(x0,HY,-62)], close=True)
        t = extrude(Face(prof), amount=x1-x0, dir=(1,0,0))
        t += cyl_x(12, x0, x1, HY, HZ)
        s = t if s is None else s + t
    # base de ligação entre as torres
    s += box(-91.5,-57.5, T1-0.5, T1+3, -62, 0)
    # furos: horn do servo (torre esquerda) e eixo M3 (torre direita)
    s -= cyl_x(4.2, -92, -85, HY, HZ)
    s -= cyl_x(1.7, -64, -57, HY, HZ)
    # furos das abas do MG996R (espaçamento 49,5 × 10)
    zc = HZ + (40.7/2 - 10.2)
    for dz in (-24.75, 24.75):
        for dy in (-5, 5):
            s -= cyl_x(1.4, -92, -85, HY+dy, zc+dz)
    return s

def build(kind):
    T = load('18')
    if kind=='original': return T
    if kind=='ventilada': s = T - vents() - big_hole()
    elif kind=='nervurada': s = T - chevrons() - big_hole()   # chevrons gravados 1,2 mm
    elif kind=='martelo': s = T + towers()
    return solid(s)

if __name__=='__main__':
    import sys, os
    os.makedirs('out/tampas', exist_ok=True)
    for k in (sys.argv[1:] or ['ventilada','nervurada','martelo']):
        s=build(k); print(k); check('tampa', s)
        export_step(s, f'out/tampas/{k}.step'); export_stl(s, f'out/tampas/{k}.stl', tolerance=0.03, angular_tolerance=0.15)
