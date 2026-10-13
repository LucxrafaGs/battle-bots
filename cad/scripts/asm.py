"""Leitor mínimo de ASM/SAB (Fusion .smb) -> topologia."""
from sabdump import load
from ezdxf.acis.sab import Tags
import numpy as np

class Rec:
    __slots__=('i','type','t')
    def __init__(s,i,r): s.i=i; s.type=r[0].value; s.t=r[1:]
    def ptrs(s): return [t.value for t in s.t if t.tag==Tags.POINTER]

class Model:
    def __init__(s,path):
        hdr,_,dbl,recs=load(path)
        s.unit_mm=10.0  # Fusion armazena em cm
        s.R=[Rec(i,r) for i,r in enumerate(recs)]
    def __getitem__(s,i): return s.R[i] if i>=0 else None
    # field access by layout (after attrib,id,pattern)
    def f(s,r):  # list of tokens after attrib,id,pattern
        return r.t[3:]
    def bodies(s): return [r for r in s.R if r.type=='body']
    def body_lumps(s,b):
        out=[]; p=s.f(b)[0].value
        while p>=0:
            l=s[p]; out.append(l); p=s.f(l)[0].value
        return out
    def lump_shells(s,l):
        out=[]; p=s.f(l)[1].value
        while p>=0:
            sh=s[p]; out.append(sh); p=s.f(sh)[0].value
        return out
    def shell_faces(s,sh):
        out=[]; p=s.f(sh)[2].value
        while p>=0:
            fc=s[p]; out.append(fc); p=s.f(fc)[0].value
        return out
    def body_faces(s,b):
        try: return s._body_faces(b)
        except Exception: return []
    def _body_faces(s,b):
        return [fc for l in s.body_lumps(b) for sh in s.lump_shells(l) for fc in s.shell_faces(sh)]
    def face_loops(s,fc):
        out=[]; p=s.f(fc)[1].value
        while p>=0:
            lp=s[p]; out.append(lp); p=s.f(lp)[0].value
        return out
    def loop_coedges(s,lp):
        first=s.f(lp)[1].value; out=[]; p=first
        while p>=0:
            ce=s[p]; out.append(ce); p=s.f(ce)[0].value
            if p==first or len(out)>100000: break
        return out
    def body_transform(s,b):
        p=s.f(b)[2].value
        if p<0: return np.eye(4)
        t=s[p].t
        vecs=[x.value for x in t if x.tag in (19,20)]
        dd=[x.value for x in t if x.tag==Tags.DOUBLE]; sc=dd[0] if dd else 1.0
        if len(vecs)<4: return np.eye(4)
        # ACIS row-vector convention: p' = p*R + t
        M2=np.eye(4); M2[:3,:3]=np.array(vecs[:3]).T*sc; M2[:3,3]=vecs[3]
        return M2
    def vertex_point(s,v):
        pp=[x.value for x in s.f(v) if x.tag==Tags.POINTER]
        pt=s[pp[-1]]
        return np.array([x.value for x in pt.t if x.tag==19][0])
    def body_points(s,b):
        pts=[]
        for fc in s.body_faces(b):
            for lp in s.face_loops(fc):
                for ce in s.loop_coedges(lp):
                    e=s[s.f(ce)[3].value]
                    if e is None: continue
                    v=s[s.f(e)[0].value]
                    if v is not None: pts.append(s.vertex_point(v))
        return np.array(pts)
