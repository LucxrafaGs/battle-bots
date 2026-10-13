"""Armas (peças impressas) e envelopes de varredura para checagem de interferência."""
from lib import *
PX, PZ = PIVOT.X, PIVOT.Z

# ------------------------------------------------ giratório horizontal (A2212 vertical na baía)
SPIN_Y0 = 60.0        # 3,8 mm acima da tampa (56,2)

def _hub(y0, h=12):
    hub = cyl_y(14, y0, y0+h, PX, PZ)
    hub -= cyl_y(3.1, y0-5, y0+h+5, PX, PZ)                       # rosca M6 do adaptador do A2212
    nut = Pos(PX, y0+h-2.5, PZ) * Rot(90,0,0) * Cylinder(5.9, 5)  # (hexágono aproximado por cilindro)
    return hub - nut

def bar(L=150, w=20, t=8):
    y0=SPIN_Y0
    body = prism([(PX-L/2, PZ-w/2+3),(PX-L/2+12, PZ-w/2),(PX+L/2-12, PZ-w/2),(PX+L/2, PZ-w/2+3),
                  (PX+L/2, PZ+w/2-3),(PX+L/2-12, PZ+w/2),(PX-L/2+12, PZ+w/2),(PX-L/2, PZ+w/2-3)], y0, y0+t)
    s = body + _hub(y0)
    for sx in (-1,1):   # furos para parafusos M4 de impacto nas pontas
        s -= cyl_y(1.65, y0-1, y0+t+1, PX+sx*(L/2-8), PZ)
    return solid(s)

def disc(D=140, t=6):
    y0=SPIN_Y0
    s = cyl_y(D/2, y0, y0+t, PX, PZ)
    for k in range(2):  # dentes
        a=math.radians(90+180*k)
        cx, cz = PX+(D/2-6)*math.cos(a), PZ+(D/2-6)*math.sin(a)
        s += cyl_y(7, y0, y0+t+3, cx, cz)
        s -= cyl_y(1.65, y0-1, y0+t+5, cx, cz)
    for k in range(6):  # alívios simétricos
        a=math.radians(30+60*k)
        s -= cyl_y(9, y0-1, y0+t+1, PX+38*math.cos(a), PZ+38*math.sin(a))
    s += _hub(y0)
    return solid(s)

def spin_envelope(R=76):
    return cyl_y(R, SPIN_Y0-1, SPIN_Y0+12, PX, PZ)

# ------------------------------------------------ tambor (eixo X, motor dentro do tambor)
AX_Y, AX_Z = 38.0, -114.0
DX0, DX1 = -96.0, -53.0

def drum():
    s = cyl_x(22, DX0, DX1, AX_Y, AX_Z)
    s -= cyl_x(17, DX0-1, -64, AX_Y, AX_Z)          # alojamento do sino do A2212 (Ø27,7)
    s -= cyl_x(3.1, -66, DX1+1, AX_Y, AX_Z)         # rosca M6 do adaptador
    s -= cyl_x(7, -60, DX1+1, AX_Y, AX_Z)           # acesso à porca M6 (fechado pela tampa do tambor)
    for k in range(2):                               # dentes
        a=math.radians(90+180*k)
        y, z = AX_Y+22*math.sin(a), AX_Z+22*math.cos(a)
        tooth = Pos((DX0+DX1)/2, AX_Y+24*math.sin(a), AX_Z+24*math.cos(a)) * Rot(math.degrees(a),0,0) * Box(DX1-DX0-4, 6, 6)
        s += tooth
    for k in range(3):                               # furos M3 da tampa do tambor
        a=math.radians(120*k)
        s -= cyl_x(1.3, -62, DX1+1, AX_Y+12*math.sin(a), AX_Z+12*math.cos(a))
    return solid(s)

def drum_cap():
    """Tampa do tambor com o eixo M5 (parafuso) que gira no rolamento 625ZZ."""
    x0, x1 = DX1, DX1+2.5
    s = cyl_x(16, x0, x1, AX_Y, AX_Z)
    s -= cyl_x(2.6, x0-1, x1+1, AX_Y, AX_Z)          # parafuso M5
    s -= cyl_x(4.3, x0-0.1, x0+1.2, AX_Y, AX_Z)     # cabeça embutida
    for k in range(3):
        a=math.radians(120*k)
        s -= cyl_x(1.7, x0-1, x1+1, AX_Y+12*math.sin(a), AX_Z+12*math.cos(a))
    return solid(s)

def drum_envelope():
    return cyl_x(27, DX0, DX1, AX_Y, AX_Z)

# ------------------------------------------------ martelo (servo MG996R)
HX0, HX1 = -84.5, -64.5        # cubo do martelo entre as torres
HY, HZ = 84.0, -40.0           # eixo do martelo
ARM = 100.0

def hammer(rest_deg=10):
    """Braço + cabeça na posição de repouso (apontando para trás, levemente para cima)."""
    hub = cyl_x(10, HX0, HX1, 0, 0)
    hub -= cyl_x(1.7, HX0-1, HX1+1, 0, 0)                 # eixo M3 do lado oposto ao servo
    hub -= cyl_x(12.8, HX0-0.1, HX0+3, 0, 0)             # rebaixo do horn redondo (Ø25)
    arm = Pos((HX0+HX1)/2, 0, ARM/2) * Box(HX1-HX0, 10, ARM-8)
    head = Pos((HX0+HX1)/2, 0, ARM) * Box(HX1-HX0, 24, 18)
    head -= Pos((HX0+HX1)/2, 0, ARM+4) * Rot(90,0,0) * Cylinder(2.1, 30)   # inserto/parafuso M5 de impacto
    s = hub + arm + head
    s = Pos(0, HY, HZ) * Rot(-rest_deg, 0, 0) * s
    return solid(s)

def hammer_envelope():
    """Setor varrido entre o repouso (+10° para trás) e o golpe (−39° à frente)."""
    from build123d import Sketch
    pts=[(HZ, HY)]
    for a in np.linspace(math.radians(10), math.radians(180+39), 40):
        r=ARM+14
        pts.append((HZ + r*math.cos(a), HY + r*math.sin(a)))
    w = Wire.make_polygon([V(HX0-1, y, z) for z, y in pts], close=True)
    return extrude(Face(w), amount=(HX1-HX0)+2, dir=(1,0,0))
