"""Definição dos módulos publicados no site."""
from robots_def import GRAF, LAT, TAMPA, ARMA, MOT, PNEU, SERVO
CX, CZ, Y0 = -75.27, 14.39, 14.0
WHEEL_R='out/visual/roda_dir.stl'; WHEEL_L='out/visual/roda_esq.stl'

# id: (categoria, nome, [(stl_fusion, cor, imprimir?, orientação, nome_arquivo)], specs)
M = {}
def lat(idx, nome, dir_stl, esq_stl, specs):
    M[f'L1-{idx}'] = ('lateral1', f'Lateral 1 — {nome}', [(dir_stl, LAT, True, 'up', 'lateral-1.stl'), (WHEEL_R, PNEU, False, None, None)], specs)
    M[f'L2-{idx}'] = ('lateral2', f'Lateral 2 — {nome}', [(esq_stl, LAT, True, 'up', 'lateral-2.stl'), (WHEEL_L, PNEU, False, None, None)], specs)

lat('01','Original', 'cand2/9.stl','cand2/16.stl', {'Origem':'Projeto Robo 02 (Fusion)','Motor':'Motor DC amarelo com redução (TT)'})
lat('02','Arco', 'out/laterais/arco_dir.stl','out/laterais/arco_esq.stl', {'Blindagem':'Face externa em arco + cantos curvos','Motor':'Motor DC amarelo com redução (TT)'})
lat('03','Cunha', 'out/laterais/cunha_dir.stl','out/laterais/cunha_esq.stl', {'Blindagem':'Parede inclinada, 11 mm mais larga na base','Motor':'Motor DC amarelo com redução (TT)'})
lat('04','Facetada', 'out/laterais/facetada_dir.stl','out/laterais/facetada_esq.stl', {'Blindagem':'Facetas angulares + chanfro superior 45°','Motor':'Motor DC amarelo com redução (TT)'})
lat('05','Nervurada', 'out/laterais/nervurada_dir.stl','out/laterais/nervurada_esq.stl', {'Blindagem':'7 nervuras verticais + cinta central','Motor':'Motor DC amarelo com redução (TT)'})

M['FC-01']=('frame','Frame Central — Original',[('cand2/10.stl',GRAF,True,'up','frame-central.stl')],{'Origem':'Projeto Robo 02 (Fusion)','Arma':'Baía com assento Ø22 para A2212 vertical'})
M['FC-02']=('frame','Frame Central — Barra horizontal',[('out/frames/barra.stl',GRAF,True,'up','frame-central.stl'),('out/armas/barra.stl',ARMA,True,'up','arma-barra.stl'),('out/visual/a2212_vertical.stl',MOT,False,None,None)],
  {'Arma':'Barra giratória 150 mm sobre a tampa','Motor da arma':'A2212 (1000–1400 KV) vertical na baía','Fixação':'4× M3 (padrão 16/19 mm) + adaptador M6 do motor','Impacto':'2× parafusos M4 nas pontas','Tampa':'Usar tampa com furo Ø14 (Ventilada ou Nervurada)'})
M['FC-03']=('frame','Frame Central — Disco horizontal',[('out/frames/disco.stl',GRAF,True,'up','frame-central.stl'),('out/armas/disco.stl',ARMA,True,'up','arma-disco.stl'),('out/visual/a2212_vertical.stl',MOT,False,None,None)],
  {'Arma':'Disco Ø140 × 6 mm com 2 dentes','Motor da arma':'A2212 (1000–1400 KV) vertical na baía','Fixação':'4× M3 (padrão 16/19 mm) + adaptador M6 do motor','Impacto':'2× parafusos M4 nos dentes','Tampa':'Usar tampa com furo Ø14 (Ventilada ou Nervurada)'})
M['FC-04']=('frame','Frame Central — Tambor',[('out/frames/tambor.stl',GRAF,True,'up','frame-central.stl'),('out/armas/tambor.stl',ARMA,True,'x','arma-tambor.stl'),('out/armas/tambor_tampa.stl',ARMA,True,'x','arma-tambor-tampa.stl'),('out/visual/a2212_tambor.stl',MOT,False,None,None)],
  {'Arma':'Tambor Ø44 × 43 mm, motor dentro do tambor','Motor da arma':'A2212 (1000–1400 KV) no braço esquerdo','Rolamento':'625ZZ (5×16×5) no braço direito','Eixo':'Parafuso M5 na tampa do tambor','Fixação':'4× M3 (padrão 16/19 mm) + adaptador M6'})
M['FC-05']=('frame','Frame Central — Martelo',[('out/frames/martelo.stl',GRAF,True,'up','frame-central.stl')],
  {'Arma':'Cunha frontal de 24 mm para segurar o oponente sob o martelo','Uso':'Combinar com a Tampa — Martelo'})

M['TP-01']=('tampa','Tampa — Original',[('cand2/18.stl',TAMPA,True,'down','tampa.stl')],{'Origem':'Projeto Robo 02 (Fusion)','Furo da arma':'Ø8,5'})
M['TP-02']=('tampa','Tampa — Ventilada',[('out/tampas/ventilada.stl',TAMPA,True,'down','tampa.stl')],{'Detalhe':'21 rasgos de ventilação','Furo da arma':'Ø14 (passa o adaptador M6 do A2212)'})
M['TP-03']=('tampa','Tampa — Nervurada',[('out/tampas/nervurada.stl',TAMPA,True,'down','tampa.stl')],{'Detalhe':'Chevrons gravados 1,2 mm','Furo da arma':'Ø14 (passa o adaptador M6 do A2212)'})
M['TP-04']=('tampa','Tampa — Martelo',[('out/tampas/martelo.stl',TAMPA,True,'up','tampa.stl'),('out/armas/martelo.stl',ARMA,True,'x','arma-martelo.stl'),('out/visual/servo.stl',SERVO,False,None,None)],
  {'Arma':'Martelo de 100 mm acionado por servo','Servo':'MG996R (metal, ~10 kg·cm)','Eixo':'Horn redondo do servo + parafuso M3 no lado oposto','Impacto':'Parafuso M5 na cabeça','Impressão':'Imprimir em pé com suporte sob a tampa'})

ROBOTS = [
 {'id':'original','nome':'Robo 02 — original','modulos':{'lateral1':'L1-01','lateral2':'L2-01','frame':'FC-01','tampa':'TP-01'}},
 {'id':'barra','nome':'Barra horizontal','modulos':{'lateral1':'L1-02','lateral2':'L2-02','frame':'FC-02','tampa':'TP-02'}},
 {'id':'disco','nome':'Disco horizontal','modulos':{'lateral1':'L1-04','lateral2':'L2-04','frame':'FC-03','tampa':'TP-03'}},
 {'id':'tambor','nome':'Tambor','modulos':{'lateral1':'L1-03','lateral2':'L2-03','frame':'FC-04','tampa':'TP-02'}},
 {'id':'martelo','nome':'Martelo','modulos':{'lateral1':'L1-05','lateral2':'L2-05','frame':'FC-05','tampa':'TP-04'}},
]
