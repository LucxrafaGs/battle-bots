"""Frames: frame original + suportes da arma e detalhes estéticos externos.
A base (placa, paredes, encaixes das laterais, baía da arma) não é alterada."""
from lib import *

PX, PZ = PIVOT.X, PIVOT.Z
FRONT = [(-134.6,-55.0),(-104.6,-85.0),(-44.4,-85.0),(-14.4,-55.0)]  # contorno frontal da baía

def motor_holes_vertical():
    """4 furos M3 (padrão 16/19 mm do A2212) + escareado por baixo, no assento da baía."""
    s=None
    for dx,dz in [(8,0),(-8,0),(0,9.5),(0,-9.5)]:
        h = cyl_y(1.7, Y0-1, 21, PX+dx, PZ+dz) + cyl_y(3.0, Y0-1, Y0+2.5, PX+dx, PZ+dz)
        s = h if s is None else s + h
    return s

def front_lip(depth=12, top=26, zmax=-50):
    """Cunha baixa colada à frente da baía (perfil inclinado, imprimível sem suporte)."""
    base=[(-134.6,zmax),(-134.6,-55.0),(-104.6,-85.0),(-44.4,-85.0),(-14.4,-55.0),(-14.4,zmax)]
    fb=plan_face(base, Y0)
    big=offset(fb, amount=depth, kind=Kind.INTERSECTION)
    topf=offset(plan_face(base, top), amount=0.01, kind=Kind.INTERSECTION)
    s=loft([big, topf])
    s = s - prism(base, Y0-1, 60)                 # não invade a baía
    return s & box(-200, 60, 0, 80, -200, zmax)   # só a frente

def fangs(length=22):
    """Duas presas em cunha à frente dos cantos da baía (topo inclinado)."""
    out=None
    for xc in (-98.0, -51.0):
        bottom=plan_face([(xc-8,-84),(xc+8,-84),(xc+3,-85-length),(xc-3,-85-length)], Y0)
        topf=plan_face([(xc-8,-84),(xc+8,-84),(xc+6,-87),(xc-6,-87)], 32)
        p=loft([bottom, topf])
        out = p if out is None else out + p
    return out

def drum_arms():
    """Braços frontais do tambor: motor A2212 no braço esquerdo, rolamento 625ZZ no direito."""
    AX_Y, AX_Z = 38.0, -114.0
    arms=None
    for x0,x1 in [(-106,-98),(-51,-43)]:
        prof=[(x0,-80),(x1,-80),(x1,-128),(x0,-128)]
        a = prism(prof, Y0, 56)
        # arredonda a ponta: remove cantos superiores/inferiores dianteiros
        a = a - (Pos((x0+x1)/2, 56, -128) * Rot(0,90,0) * Box(30, 30, 9) ) + cyl_x(18, x0, x1, AX_Y, AX_Z)
        a = a & box(x0, x1, Y0, 56, -140, -80)
        arms = a if arms is None else arms + a
    arms -= box(-120, -30, 45.0, 70, -86, -70)   # folga para a tampa original (cobre a baía até z=-85,4)
    # nervura de reforço por baixo entre os braços (fora do diâmetro do tambor)
    arms += box(-106,-43, Y0, Y0+4, -92, -84)
    # furação do motor (braço esquerdo, face interna x=-98)
    for dy,dz in [(8,0),(-8,0),(0,9.5),(0,-9.5)]:
        arms -= cyl_x(1.7, -110, -96, AX_Y+dy, AX_Z+dz)
    arms -= cyl_x(5.0, -110, -96, AX_Y, AX_Z)         # passagem do eixo traseiro / anel
    # rolamento 625ZZ no braço direito
    arms -= cyl_x(8.05, -51.5, -46, AX_Y, AX_Z)
    arms -= cyl_x(2.8, -60, -40, AX_Y, AX_Z)
    return arms

def build(kind):
    F = load('10')
    if kind=='original':
        return F
    if kind=='barra':
        s = F + front_lip(12, 24) - motor_holes_vertical()
    elif kind=='disco':
        s = F + fangs(20) - motor_holes_vertical()
    elif kind=='tambor':
        s = F + drum_arms()
    elif kind=='martelo':
        s = F + front_lip(24, 24)
    return solid(s)

if __name__=='__main__':
    import sys, os
    os.makedirs('out/frames', exist_ok=True)
    for k in (sys.argv[1:] or ['barra','disco','tambor','martelo']):
        s=build(k); print(k); check('frame', s)
        export_step(s, f'out/frames/{k}.step'); export_stl(s, f'out/frames/{k}.stl', tolerance=0.03, angular_tolerance=0.15)
