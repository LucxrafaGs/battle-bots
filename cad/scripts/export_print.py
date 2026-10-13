"""Gera os STL de impressão (Z para cima, apoiados na mesa) a partir dos STEP."""
import os, json
from build123d import import_step, export_stl, Rot, Pos
from modules_def import M
OUT='site_assets/stl'
os.makedirs(OUT, exist_ok=True)
report={}
for mid,(cat,nome,files,specs) in M.items():
    os.makedirs(f'{OUT}/{mid}', exist_ok=True)
    report[mid]=[]
    for stl,cor,printable,orient,fname in files:
        if not printable: continue
        s=import_step(stl.replace('.stl','.step'))
        if orient=='up': s=Rot(90,0,0)*s
        elif orient=='down': s=Rot(-90,0,0)*s
        elif orient=='x': s=Rot(0,-90,0)*s
        bb=s.bounding_box()
        s=Pos(-(bb.min.X+bb.max.X)/2, -(bb.min.Y+bb.max.Y)/2, -bb.min.Z)*s
        export_stl(s, f'{OUT}/{mid}/{fname}', tolerance=0.02, angular_tolerance=0.1)
        bb=s.bounding_box()
        report[mid].append({'arquivo':fname,'mm':[round(bb.size.X,1),round(bb.size.Y,1),round(bb.size.Z,1)],'cm3':round(s.volume/1000,1)})
        print(mid, fname, report[mid][-1], flush=True)
json.dump(report, open('site_assets/print_report.json','w'), indent=1, ensure_ascii=False)
