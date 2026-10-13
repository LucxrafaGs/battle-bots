GRAF=[0.32,0.33,0.36,1]; LAT=[0.27,0.27,0.29,1]; TAMPA=[0.62,0.62,0.64,1]; ARMA=[0.94,0.21,0.21,1]; MOT=[0.85,0.65,0.25,1]; PNEU=[0.06,0.06,0.06,1]; SERVO=[0.1,0.1,0.12,1]
ROBOTS={
 'original':{'nome':'Robô 02 (original)','frame':'cand2/10.stl','l1':'cand2/9.stl','l2':'cand2/16.stl','tampa':'cand2/18.stl','extra':[]},
 'barra':{'nome':'Barra horizontal','frame':'out/frames/barra.stl','l1':'out/laterais/arco_dir.stl','l2':'out/laterais/arco_esq.stl','tampa':'out/tampas/ventilada.stl','extra':[('out/armas/barra.stl',ARMA),('out/visual/a2212_vertical.stl',MOT)]},
 'disco':{'nome':'Disco horizontal','frame':'out/frames/disco.stl','l1':'out/laterais/facetada_dir.stl','l2':'out/laterais/facetada_esq.stl','tampa':'out/tampas/nervurada.stl','extra':[('out/armas/disco.stl',ARMA),('out/visual/a2212_vertical.stl',MOT)]},
 'tambor':{'nome':'Tambor','frame':'out/frames/tambor.stl','l1':'out/laterais/cunha_dir.stl','l2':'out/laterais/cunha_esq.stl','tampa':'out/tampas/ventilada.stl','extra':[('out/armas/tambor.stl',ARMA),('out/armas/tambor_tampa.stl',ARMA),('out/visual/a2212_tambor.stl',MOT)]},
 'martelo':{'nome':'Martelo','frame':'out/frames/martelo.stl','l1':'out/laterais/nervurada_dir.stl','l2':'out/laterais/nervurada_esq.stl','tampa':'out/tampas/martelo.stl','extra':[('out/armas/martelo.stl',ARMA),('out/visual/servo.stl',SERVO)]},
}
def group(k, tampa=True):
    r=ROBOTS[k]
    g=[[r['frame'],GRAF],[r['l1'],LAT],[r['l2'],LAT],['out/visual/rodas.stl',PNEU]]
    if tampa: g.append([r['tampa'],TAMPA])
    g+= [[p,c] for p,c in r['extra']]
    return g
