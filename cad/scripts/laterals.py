"""Variações de blindagem lateral. Cada variação = lateral original ∪ (blindagem − casco).
Interior (encaixe no frame, compartimento do motor, roda, furos) fica idêntico ao original."""
import numpy as np
from scipy.spatial import ConvexHull
from lib import *

H9 = [(-24.8,113.8),(-15,-20.4),(28.4,-20.4),(64.7,-3.2),(75.7,8.9),(75.7,115.8),(70.7,120.8),(-24.8,121.6)]
XMIN = 20.0   # blindagem só do lado de fora (x >= 20) – longe do encaixe no frame
YA, YB = 14.0, 49.99

def convex(pts):
    P = np.array(pts); h = ConvexHull(P); return [tuple(p) for p in P[h.vertices]]

def outer_hull_pts():
    pts=[p for p in H9 if p[0]>=XMIN] + [(XMIN,-20.4),(XMIN,121.6)]
    return pts

def clip_x(s):
    return s & box(XMIN, 200, -10, 80, -100, 200)

def shell9():
    return prism(convex(H9), YA-1, YB+1)

def shrink_hull():
    f = plan_face(convex(H9), YA-1)
    f2 = offset(f, amount=-0.4, kind=Kind.INTERSECTION)
    return extrude(f2, amount=(YB-YA)+2, dir=(0,1,0))

# ------------------------------------------------------------ blindagens (lado direito)
def armor_arco():
    def bez(p0,c,p1,n=20):
        p0,c,p1=map(np.array,(p0,c,p1)); return [tuple((1-t)**2*p0+2*(1-t)*t*c+t**2*p1) for t in np.linspace(0,1,n)]
    pts = outer_hull_pts()
    pts += bez((XMIN,-25),(70,-24),(83,8))           # canto dianteiro em curva
    pts += [(83 + 3.5*np.sin(np.pi*t), 8 + 108*t) for t in np.linspace(0,1,25)]  # lateral em arco
    pts += bez((83,116),(82,124),(66,125))            # canto traseiro
    pts += [(XMIN,125)]
    return clip_x(prism(convex(pts), YA, YB))

def armor_cunha():
    base = convex(outer_hull_pts() + [(XMIN,-20.4)])
    fb = plan_face(base, YA)
    big = offset(fb, amount=11, kind=Kind.INTERSECTION)
    top = offset(plan_face(base, YB), amount=0.01, kind=Kind.INTERSECTION)
    s = loft([big, top])
    return clip_x(s)

def armor_facetada():
    poly = convex(outer_hull_pts() + [(XMIN,-27),(42,-27),(82,-2),(87,28),(87,92),(82,119),(70,126),(XMIN,126)])
    low = prism(poly, YA, 40)
    f1 = plan_face(poly, 40)
    f2 = offset(plan_face(poly, YB), amount=-6, kind=Kind.INTERSECTION)
    cap = loft([f1, f2])
    return clip_x(low + cap)

def armor_nervurada():
    out = None
    def rib(p, q, t, w=5.0, h=6.0):
        # nervura perpendicular ao segmento p->q na posição t (0..1), saliência h
        p=np.array(p); q=np.array(q); d=(q-p)/np.linalg.norm(q-p); n=np.array([d[1],-d[0]])
        if n[0] < 0: n=-n
        c=p+(q-p)*t
        a=c-d*w/2; b=c+d*w/2
        pts=[tuple(a-n*1.0),tuple(b-n*1.0),tuple(b+n*h),tuple(a+n*h)]
        return prism(pts, YA, YB)
    ribs=[]
    side=((75.7,8.9),(75.7,115.8))
    for t in np.linspace(0.06,0.94,7): ribs.append(rib(*side,t))
    # cinta horizontal unindo as nervuras a meia altura
    band = prism(convex([(74.0,8.9),(78.5,8.9),(78.5,115.8),(74.0,115.8)]), 29, 35)
    s = band
    for r in ribs: s = s + r
    return clip_x(s)

ARMORS = {'arco':armor_arco,'cunha':armor_cunha,'facetada':armor_facetada,'nervurada':armor_nervurada}

def build(kind):
    L9 = load('9'); L16 = load('16')
    arm = solid(ARMORS[kind]())
    hull_in = shrink_hull()
    add_r = arm - hull_in
    # corrige a interferência de ~1 mm do original (lateral 9 x frame/tampa)
    right = solid(L9 + add_r - load('10') - load('18'))
    arm_l = mirror_x(arm)
    hull_l = mirror_x(hull_in)
    left = solid(L16 + (arm_l - hull_l))
    return right, left

if __name__=='__main__':
    import sys, os
    os.makedirs('out/laterais', exist_ok=True)
    for k in (sys.argv[1:] or ARMORS):
        r,l = build(k)
        print(k); check('direita', r); check('esquerda', l)
        export_step(r, f'out/laterais/{k}_dir.step'); export_step(l, f'out/laterais/{k}_esq.step')
        export_stl(r, f'out/laterais/{k}_dir.stl', tolerance=0.03, angular_tolerance=0.15)
        export_stl(l, f'out/laterais/{k}_esq.stl', tolerance=0.03, angular_tolerance=0.15)
