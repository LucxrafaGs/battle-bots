"""Peças só de visualização (não imprimíveis): motores A2212, rodas, servo."""
from lib import *
from weapons import AX_Y, AX_Z, HY, HZ
import os
os.makedirs('out/visual', exist_ok=True)
PX, PZ = PIVOT.X, PIVOT.Z

def a2212_vertical():
    return Pos(PX, 20, PZ) * a2212()

def a2212_drum():
    m = a2212()  # eixo +Y; girar para +X, base na face interna do braço esquerdo (x=-98)
    return Pos(-98, AX_Y, AX_Z) * Rot(0, 0, -90) * m

def wheel(x, z):
    w = cyl_x(22, x-5, x+5, 32, z) - cyl_x(14, x-5.5, x+5.5, 32, z) + cyl_x(14.5, x-2, x+2, 32, z) - cyl_x(3, x-6, x+6, 32, z)
    return w

def wheels():
    return wheel(35, 28) + wheel(2*MID_X-35, 28)

def servo():
    zc = HZ + (40.7/2 - 10.2)
    body = box(-91.5-38, -91.5, HY-9.85, HY+9.85, zc-20.35, zc+20.35)
    tabs = box(-91.5-8, -91.5-5.5, HY-9.85, HY+9.85, zc-27.05, zc+27.05)
    return body + tabs

if __name__=='__main__':
    for n,f in [('a2212_vertical',a2212_vertical),('a2212_tambor',a2212_drum),('rodas',wheels),('servo',servo)]:
        s=f(); export_stl(s,f'out/visual/{n}.stl',tolerance=0.05,angular_tolerance=0.2); print(n, round(s.volume))
