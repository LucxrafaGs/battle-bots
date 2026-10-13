"""Blender: GLB por módulo (coordenadas do robô), miniaturas e arquivo .blend com os robôs."""
import bpy, os, json, math, sys
from mathutils import Matrix, Vector
sys.path.insert(0,'/home/claude/cad')
from modules_def import M, ROBOTS, CX, CZ, Y0

OUT='site_assets'
os.makedirs(f'{OUT}/modelos',exist_ok=True); os.makedirs(f'{OUT}/miniaturas',exist_ok=True)
# Fusion (mm, Y up, frente -Z)  ->  Blender (Z up) tal que o glTF saia em RCS (Y up, frente +Z)
FUS2BL = Matrix(((-1,0,0,CX),(0,0,1,-CZ),(0,1,0,-Y0),(0,0,0,1)))

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)

mats={}
def material(rgba):
    key=tuple(round(c,3) for c in rgba)
    if key in mats: return mats[key]
    m=bpy.data.materials.new(f'mat_{len(mats)}'); m.use_nodes=True
    lin=tuple(c**2.2 for c in rgba[:3])+(1,)
    b=m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value=lin
    metal = 0.85 if rgba[0]>0.8 and rgba[1]>0.6 and rgba[2]<0.4 else (0.55 if rgba[0]<0.4 else 0.1)
    b.inputs['Metallic'].default_value=metal; b.inputs['Roughness'].default_value=0.45 if metal>0.5 else 0.6
    m.diffuse_color=rgba
    mats[key]=m; return m

def import_part(path, rgba, name):
    bpy.ops.wm.stl_import(filepath=path)
    o=bpy.context.selected_objects[0]; o.name=name
    o.data.transform(FUS2BL); o.data.update()
    o.data.materials.clear(); o.data.materials.append(material(rgba)); o.color=rgba
    # sombreamento suave apenas por ângulo
    for p in o.data.polygons: p.use_smooth=False
    return o

def module_objects(mid):
    cat,nome,files,specs=M[mid]
    objs=[]
    for i,(stl,rgba,printable,orient,fname) in enumerate(files):
        objs.append(import_part(stl, rgba, f'{mid}_{i}'))
    return objs

def setup_render(res=512, transparent=True):
    sc=bpy.context.scene
    sc.render.engine='BLENDER_WORKBENCH'
    sc.display.shading.light='STUDIO'; sc.display.shading.color_type='OBJECT'
    sc.display.shading.show_cavity=True; sc.display.shading.cavity_type='BOTH'
    sc.display.shading.show_object_outline=False
    sc.render.resolution_x=res; sc.render.resolution_y=res; sc.render.film_transparent=transparent
    sc.view_settings.view_transform='Standard'
    if not sc.camera:
        cam=bpy.data.cameras.new('cam'); cam.type='ORTHO'
        co=bpy.data.objects.new('cam',cam); sc.collection.objects.link(co); sc.camera=co
    return sc

def frame_camera(objs, view=(1.0,1.15,0.85), margin=1.08):
    sc=bpy.context.scene; co=sc.camera; cam=co.data
    pts=[o.matrix_world@Vector(c) for o in objs for c in o.bound_box]
    mn=Vector((min(p.x for p in pts),min(p.y for p in pts),min(p.z for p in pts)))
    mx=Vector((max(p.x for p in pts),max(p.y for p in pts),max(p.z for p in pts)))
    ctr=(mn+mx)/2; size=(mx-mn).length
    d=Vector(view).normalized()
    co.location=ctr+d*size*3; co.rotation_euler=(-d).to_track_quat('-Z','Y').to_euler()
    cam.ortho_scale=size*0.92*margin; cam.clip_end=size*10


from mathutils import Vector
def hero(robot, path):
    reset(); mats.clear()
    objs=[]
    for cat,mid in robot['modulos'].items(): objs+=module_objects(mid)
    sc=bpy.context.scene
    sc.render.engine='CYCLES'; sc.cycles.samples=48; sc.cycles.use_denoising=True
    try: sc.cycles.denoiser='OPENIMAGEDENOISE'
    except Exception: pass
    sc.render.resolution_x=1400; sc.render.resolution_y=900
    sc.view_settings.view_transform='AgX' if 'AgX' in [i.identifier for i in sc.view_settings.bl_rna.properties['view_transform'].enum_items] else 'Filmic'
    w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True
    w.node_tree.nodes['Background'].inputs[0].default_value=(0.004,0.004,0.004,1); w.node_tree.nodes['Background'].inputs[1].default_value=1
    # chão
    bpy.ops.mesh.primitive_plane_add(size=4000, location=(0,0,-4))
    fl=bpy.context.object; m=bpy.data.materials.new('floor'); m.use_nodes=True
    b=m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value=(0.012,0.012,0.012,1); b.inputs['Roughness'].default_value=0.35
    fl.data.materials.append(m)
    def area(loc, energy, size, color=(1,1,1)):
        d=bpy.data.lights.new('a','AREA'); d.energy=energy; d.size=size; d.color=color
        o=bpy.data.objects.new('a',d); sc.collection.objects.link(o); o.location=loc
        o.rotation_euler=(Vector((0,0,40))-Vector(loc)).to_track_quat('-Z','Y').to_euler()
    area((-350,-450,500), 2.4e6, 400)
    area((450,-150,250), 0.8e6, 300)
    area((120,520,160), 0.7e6, 300, (1,0.45,0.22))
    cam=bpy.data.cameras.new('c'); cam.lens=55
    co=bpy.data.objects.new('c',cam); sc.collection.objects.link(co); sc.camera=co
    target=Vector((0,20,25)); d=Vector((-0.8,-1.15,0.6)).normalized()
    co.location=target+d*700; co.rotation_euler=(target-co.location).to_track_quat('-Z','Y').to_euler()
    cam.clip_end=10000
    sc.render.filepath=path
    bpy.ops.render.render(write_still=True)
    print('render', path, flush=True)

import sys as _s
for r in ROBOTS:
    if len(_s.argv)>1 and r['id'] not in _s.argv[1:]: continue
    hero(r, f'/home/claude/cad/out/renders/{r["id"]}.png')
