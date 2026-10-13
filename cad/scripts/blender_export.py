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

# ---------------------------------------------------------------- GLB + miniaturas
for mid in M:
    reset(); mats.clear()
    objs=module_objects(mid)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=f'{OUT}/modelos/{mid}.glb', export_format='GLB', use_selection=True,
                              export_apply=True, export_yup=True, export_draco_mesh_compression_enable=False)
    setup_render(512)
    # vista: frente do robô (+Z no glTF = +Y no Blender), de cima e de lado
    frame_camera(objs, view=(-0.95, 1.2, 0.85))
    bpy.context.scene.render.filepath=f'{OUT}/miniaturas/{mid}.png'
    bpy.ops.render.render(write_still=True)
    print('ok', mid, flush=True)

# ---------------------------------------------------------------- .blend com os robôs
reset(); mats.clear()
root=bpy.context.scene.collection
for i,r in enumerate(ROBOTS):
    col=bpy.data.collections.new(r['nome']); root.children.link(col)
    for cat,mid in r['modulos'].items():
        for o in module_objects(mid):
            for c in o.users_collection: c.objects.unlink(o)
            col.objects.link(o)
            o.location.x += (i-2)*320
bpy.ops.wm.save_as_mainfile(filepath='/home/claude/cad/out/battle-bots-robos.blend')
print('blend ok')
