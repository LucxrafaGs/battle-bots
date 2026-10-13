"""Monta os robôs, checa interferências e gera a matriz de compatibilidade."""
import json, itertools
from build123d import import_step
from lib import *
import weapons as W

def S(p): return import_step(p)

LAT = {  # id -> (dir=Fusion9 / esq=Fusion16)
 '01': ('cand2/9.step','cand2/16.step'),
 '02': ('out/laterais/arco_dir.step','out/laterais/arco_esq.step'),
 '03': ('out/laterais/cunha_dir.step','out/laterais/cunha_esq.step'),
 '04': ('out/laterais/facetada_dir.step','out/laterais/facetada_esq.step'),
 '05': ('out/laterais/nervurada_dir.step','out/laterais/nervurada_esq.step'),
}
FRAMES = {'01':'cand2/10.step','02':'out/frames/barra.step','03':'out/frames/disco.step','04':'out/frames/tambor.step','05':'out/frames/martelo.step'}
TAMPAS = {'01':'cand2/18.step','02':'out/tampas/ventilada.step','03':'out/tampas/nervurada.step','04':'out/tampas/martelo.step'}
WEAPON_OF_FRAME = {'02':'spin','03':'spin','04':'drum'}
WEAPON_OF_TAMPA = {'04':'hammer'}

def inter(a,b):
    try:
        r = a & b
        return 0.0 if r is None else r.volume
    except Exception as e:
        return -1

if __name__=='__main__':
    parts={}
    for k,(r,l) in LAT.items(): parts[f'L1-{k}']=S(r); parts[f'L2-{k}']=S(l)
    for k,p in FRAMES.items(): parts[f'FC-{k}']=S(p)
    for k,p in TAMPAS.items(): parts[f'TP-{k}']=S(p)
    env={'spin':W.spin_envelope(),'drum':W.drum_envelope(),'hammer':W.hammer_envelope()}
    weapons_static={'FC-02':W.bar(),'FC-03':W.disc(),'FC-04':W.drum(),'TP-04':W.hammer()}
    cat=lambda i:i.split('-')[0]
    res=[]
    ids=list(parts)
    for a,b in itertools.combinations(ids,2):
        if cat(a)==cat(b): continue
        if {cat(a),cat(b)}=={'L1','L2'}: 
            v=inter(parts[a],parts[b]); 
            if v>1: res.append((a,b,'estrutura',round(v,1)))
            continue
        v=inter(parts[a],parts[b])
        if v>1: res.append((a,b,'estrutura',round(v,1)))
    # envelopes de arma vs peças de outras categorias
    for src,kind in [(f'FC-{k}',v) for k,v in WEAPON_OF_FRAME.items()]+[(f'TP-{k}',v) for k,v in WEAPON_OF_TAMPA.items()]:
        for b in ids:
            if cat(b)==cat(src): continue
            v=inter(env[kind],parts[b])
            if v>1: res.append((src,b,f'arma:{kind}',round(v,1)))
    # arma x arma
    v=inter(env['hammer'],env['spin']); res.append(('TP-04','FC-02/03','arma x arma',round(v,1)))
    v=inter(env['hammer'],env['drum']); res.append(('TP-04','FC-04','arma x arma',round(v,1)))
    for r in res: print(r)
    json.dump(res,open('out/interferencias.json','w'),indent=1)
