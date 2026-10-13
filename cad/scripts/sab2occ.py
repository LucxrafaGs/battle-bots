"""Converte corpos ASM/SAB (planos, cilindros, linhas, círculos) em sólidos OpenCascade."""
import math, numpy as np
from asm import Model
from ezdxf.acis.sab import Tags
from OCP.gp import gp_Pnt, gp_Dir, gp_Ax2, gp_Ax3, gp_Circ, gp_Elips, gp_Pln, gp_Cylinder, gp_Cone, gp_Torus, gp_Vec
from OCP.Geom import Geom_Plane, Geom_CylindricalSurface, Geom_ConicalSurface, Geom_ToroidalSurface
from OCP.BRepBuilderAPI import BRepBuilderAPI_MakeEdge, BRepBuilderAPI_MakeWire, BRepBuilderAPI_MakeFace, BRepBuilderAPI_Sewing, BRepBuilderAPI_MakeSolid, BRepBuilderAPI_Transform
from OCP.ShapeFix import ShapeFix_Face, ShapeFix_Shape, ShapeFix_Solid, ShapeFix_Wire
from OCP.TopoDS import TopoDS
from OCP.TopAbs import TopAbs_SHELL, TopAbs_SOLID, TopAbs_FACE
from OCP.TopExp import TopExp_Explorer
from OCP.gp import gp_Trsf

S=10.0  # cm -> mm

def P(v): return gp_Pnt(v[0]*S, v[1]*S, v[2]*S)
def D(v):
    n=np.linalg.norm(v); return gp_Dir(v[0]/n, v[1]/n, v[2]/n)

class Conv:
    def __init__(s, path):
        s.m=Model(path); s.ecache={}
        s.warn=[]
    def toks(s, r, tag): return [t.value for t in r.t if t.tag==tag]
    def point_of_vertex(s, vi):
        return np.array(s.m.vertex_point(s.m[vi]))
    def edge_shape(s, ei):
        if ei in s.ecache: return s.ecache[ei]
        m=s.m; e=m[ei]; f=m.f(e)
        sv,sp,ev,ep,_,ci,sense=f[0].value,f[1].value,f[2].value,f[3].value,f[4].value,f[5].value,f[6].value
        p1=s.point_of_vertex(sv); p2=s.point_of_vertex(ev)
        c=m[ci]; ct=c.type
        if ct=='straight-curve':
            sh=BRepBuilderAPI_MakeEdge(P(p1),P(p2)).Edge()
        elif ct=='ellipse-curve':
            loc=s.toks(c,19)[0]; vec=s.toks(c,20); nrm=np.array(vec[0]); maj=np.array(vec[1])
            ratio=s.toks(c,Tags.DOUBLE)[0]
            R=np.linalg.norm(maj)*S
            ax=gp_Ax2(P(loc), D(nrm), D(maj))
            # parâmetros do edge (no parâmetro da curva; se reversed, negativos)
            a,b=(sp,ep) if not sense else (-ep,-sp)
            if abs(ratio-1)<1e-9: geo=gp_Circ(ax,R)
            else: geo=gp_Elips(ax,R,R*ratio)
            full = sv==ev and abs((b-a)-2*math.pi)<1e-6
            mk=BRepBuilderAPI_MakeEdge(geo) if full else BRepBuilderAPI_MakeEdge(geo,a,b)
            sh=mk.Edge()
            if sense: sh=TopoDS.Edge(sh.Reversed())
        else:
            s.warn.append(ct)
            sh=BRepBuilderAPI_MakeEdge(P(p1),P(p2)).Edge() if np.linalg.norm(p1-p2)>1e-9 else None
        s.ecache[ei]=sh
        return sh
    def surface(s, si):
        r=s.m[si]; loc=s.toks(r,19)[0]; vec=s.toks(r,20); dbl=s.toks(r,Tags.DOUBLE)
        if r.type=='plane-surface':
            return Geom_Plane(gp_Ax3(P(loc), D(vec[0]), D(vec[1])))
        if r.type=='cone-surface':
            nrm=np.array(vec[0]); maj=np.array(vec[1]); sine,cosine=dbl[1],dbl[2]
            R=np.linalg.norm(maj)*S
            ax=gp_Ax3(P(loc), D(nrm), D(maj))
            if abs(sine)<1e-12: return Geom_CylindricalSurface(ax,R)
            ang=math.atan2(abs(sine),abs(cosine))
            return Geom_ConicalSurface(ax,ang,R)
        if r.type=='torus-surface':
            return Geom_ToroidalSurface(gp_Ax3(P(loc),D(vec[0])), dbl[0]*S, abs(dbl[1])*S)
        raise ValueError(r.type)
    def face_shape(s, fc):
        m=s.m; f=m.f(fc); surf=s.surface(f[4].value)
        reversed_=f[5].value
        wires=[]
        for lp in m.face_loops(fc):
            mw=BRepBuilderAPI_MakeWire()
            for co in m.loop_coedges(lp):
                cf=m.f(co); e=s.edge_shape(cf[3].value)
                if e is None: continue
                if cf[4].value: e=TopoDS.Edge(e.Reversed())
                mw.Add(e)
            if not mw.IsDone():
                # tenta corrigir ordem
                sfw=ShapeFix_Wire(); 
                return None
            wires.append(mw.Wire())
        mf=BRepBuilderAPI_MakeFace(surf, wires[0], True)
        for w in wires[1:]: mf.Add(w)
        face=mf.Face()
        fix=ShapeFix_Face(face); fix.Perform(); face=fix.Face()
        if reversed_: face=TopoDS.Face(face.Reversed())
        return face
    def body_solid(s, bi):
        m=s.m; b=m[bi]
        sew=BRepBuilderAPI_Sewing(1e-3)
        n=0
        for fc in m.body_faces(b):
            try:
                fs=s.face_shape(fc)
                if fs is not None: sew.Add(fs); n+=1
            except Exception as ex:
                s.warn.append(f'face {fc.i}: {ex}')
        sew.Perform(); sh=sew.SewedShape()
        exp=TopExp_Explorer(sh, TopAbs_SHELL)
        if exp.More():
            ms=BRepBuilderAPI_MakeSolid(TopoDS.Shell(exp.Current()))
            solid=ms.Solid()
            fx=ShapeFix_Solid(solid); fx.Perform(); solid=fx.Solid()
        else: solid=sh
        T=m.body_transform(b)
        if not np.allclose(T,np.eye(4)):
            tr=gp_Trsf(); tr.SetValues(*T[0,:3],T[0,3]*S,*T[1,:3],T[1,3]*S,*T[2,:3],T[2,3]*S)
            solid=BRepBuilderAPI_Transform(solid,tr,True).Shape()
        return solid
