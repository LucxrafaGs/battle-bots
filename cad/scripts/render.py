"""Renderiza STLs em grade isométrica com Blender (Workbench)."""
import bpy, sys, math, json, os
from mathutils import Vector
args=json.loads(sys.argv[-1])
files=args['files']; out=args['out']; cols=args.get('cols',4); res=args.get('res',600)
labels=args.get('labels',files)
yup=args.get('yup',True)
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
reset()
sc=bpy.context.scene
sc.render.engine='BLENDER_WORKBENCH'
sc.display.shading.light='STUDIO'; sc.display.shading.color_type='OBJECT'
sc.display.shading.show_cavity=True; sc.display.shading.show_object_outline=True
sc.display.shading.show_shadows=False
sc.render.resolution_x=res; sc.render.resolution_y=res
sc.render.film_transparent=args.get('transparent',False)
sc.display.shading.background_type='VIEWPORT'
w=bpy.data.worlds.new('w'); w.color=(1,1,1); sc.world=w
sc.view_settings.view_transform='Standard'
import bmesh
cam=bpy.data.cameras.new('c'); cam.type='ORTHO'
co=bpy.data.objects.new('c',cam); sc.collection.objects.link(co); sc.camera=co
from PIL import Image, ImageDraw
tiles=[]
palette=[(0.85,0.3,0.25,1),(0.9,0.9,0.92,1),(0.35,0.36,0.4,1),(1,0.45,0.2,1),(0.5,0.7,0.9,1)]
for idx,f in enumerate(files):
    for o in list(sc.objects):
        if o.type=='MESH': bpy.data.objects.remove(o)
    group=f if isinstance(f,list) else [f]
    objs=[]
    for gi,g in enumerate(group):
        path,color=(g if isinstance(g,list) else (g,None))
        bpy.ops.wm.stl_import(filepath=path)
        o=bpy.context.selected_objects[0]
        if yup: o.rotation_euler=(math.radians(90),0,0)
        o.color=color or palette[gi%len(palette)]
        objs.append(o)
    bpy.context.view_layer.update()
    pts=[o.matrix_world@Vector(c) for o in objs for c in o.bound_box]
    mn=Vector((min(p.x for p in pts),min(p.y for p in pts),min(p.z for p in pts)))
    mx=Vector((max(p.x for p in pts),max(p.y for p in pts),max(p.z for p in pts)))
    ctr=(mn+mx)/2; size=(mx-mn).length
    view=args.get('view',(1,-1.2,0.9))
    d=Vector(view).normalized()
    co.location=ctr+d*size*3
    co.rotation_euler=(-d).to_track_quat('-Z','Y').to_euler()
    cam.ortho_scale=size*1.05; cam.clip_end=size*10
    p=f'/tmp/claude-0/tile_{idx}.png'; sc.render.filepath=p
    bpy.ops.render.render(write_still=True)
    im=Image.open(p).convert('RGB'); d2=ImageDraw.Draw(im); d2.text((8,8),str(labels[idx])[-40:],fill=(0,0,0)); tiles.append(im)
rows=math.ceil(len(tiles)/cols)
W=Image.new('RGB',(cols*res,rows*res),'white')
for i,t in enumerate(tiles): W.paste(t,((i%cols)*res,(i//cols)*res))
W.save(out)
