"""Original stylized merchant pavilion; game axes X/right Y/up Z/south, metres.
Rebuild: node scripts/blender.mjs art/blender/courtyard/author.py
No external assets. Source geometry grouped by visibility role and material.
"""
import bpy, math, random, os
from mathutils import Vector
random.seed(1685)
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
roles={}
def material(name,color,rough=.8,metal=0):
 m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
 return m
wood=material('Teak | warm heartwood',(.27,.105,.042)); dark=material('Teak | shadowed joinery',(.10,.047,.028)); gold=material('Aged brass',(.58,.35,.105),.43,.45)
stone=material('Sandstone plinth',(.48,.43,.30)); plaster=material('Lime plaster',(.66,.62,.43)); red=[material('Clay tile '+str(i),(.29+i*.019,.075+i*.012,.031+i*.009)) for i in range(5)]
# A repeatable authored grain map keeps the same material appearance in Blender/glTF.
import numpy as np
size=256; rng=np.random.default_rng(1685); image=bpy.data.images.new('Teak grain',width=size,height=size)
a=np.ones((size,size,4),dtype=np.float32)
for y in range(size):
 for x in range(size):
  g=.80+.10*math.sin(x*.51+math.sin(y*.025)*2)+float(rng.random())*.12
  a[y,x,:3]=[.40*g,.205*g,.098*g]
image.pixels.foreach_set(a.ravel()); image.filepath_raw=os.path.join(ROOT,'art/blender/courtyard/teak.png');image.file_format='PNG'; image.save();image.pack()
tex=wood.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image;wood.node_tree.links.new(tex.outputs['Color'],wood.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
def record(obj,role,mat):
 obj.data.materials.append(mat);roles.setdefault(role,[]).append(obj);return obj
def box(name,x,y,z,w,h,d,mat=wood,role='Shell',bevel=.035):
 bpy.ops.mesh.primitive_cube_add(size=1,location=(x,-z,y));o=bpy.context.object;o.name=name;o.dimensions=(w,d,h);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  mod=o.modifiers.new('Soft hand-worked edges','BEVEL');mod.width=bevel;mod.segments=2;bpy.ops.object.modifier_apply(modifier=mod.name)
 return record(o,role,mat)
def beam(name,a,b,r,mat=gold,role='Roof'):
 start=Vector((a[0],-a[2],a[1]));end=Vector((b[0],-b[2],b[1]));v=end-start
 bpy.ops.mesh.primitive_cylinder_add(vertices=8,radius=r,depth=v.length,location=(start+end)*.5);o=bpy.context.object;o.name=name;o.rotation_euler=v.to_track_quat('Z','Y').to_euler();return record(o,role,mat)
box('Raised stone footing',0,.08,0,10.6,.3,6.6,stone,'Floor')
for i in range(30):box('Teak floor board',-4.86+i*.335,.27,0,.318,.12,6.05,wood,'Floor',.012)
# Front has a real 2.8m aperture; side windows also have open depth.
for x in [-3.22,3.22]:box('Front wall',x,1.65,3,3.55,2.7,.2,wood)
box('Door lintel',0,2.98,3,3.05,.3,.3,dark)
box('Back wall',0,1.65,-3,10,2.7,.24,wood)
for x in [-5,5]:
 box('Window sill wall',x,.7,0,.22,.8,6,wood);box('Window head wall',x,2.85,0,.22,.4,6,wood)
 for z in [-2.5,0,2.5]:box('Window pier',x,1.8,z,.24,1.4,1.0,wood)
 for z in [-1.25,1.25]:
  box('Window sill',x,1.14,z,.45,.12,1.6,gold)
  for dz in [-.48,0,.48]:box('Window lattice',x,1.9,z+dz,.1,1.5,.045,dark)
for x in [-4.95,-1.45,1.45,4.95]:
 for z in [-3,3]:
  box('Structural post',x,1.75,z,.22,3,.24,dark)
  box('Post brass foot',x,.46,z,.25,.21,.27,gold)
for y in [.43,2.8,3.12]:box('Front carved rail',0,y,3.13,10.35,.09,.08,gold)
# Four forward terrace posts with a canopy.
for x in [-4.65,4.65]:box('Veranda post',x,1.7,4.0,.21,3.05,.21,dark)
box('Veranda',0,.21,3.7,10.6,.22,1.5,wood,'Floor')
for i in range(3):box('Entrance step',0,.055+i*.068,4.6-i*.25,3.1,.11,.55,stone,'Floor')
# Curved roof slopes. Ridge runs east/west; gold finials at the gables.
def roofY(t):return 5.45-2.50*t+.54*t*t
for side in [-1,1]:
 for row in range(14):
  t=(row+.5)/14;z=side*t*4.08;y=roofY(t)
  for col in range(34):
   x=-5.48+(col+.5)*.324
   tile=box('Overlapping clay tile',x,y,z,.323,.08,.34,red[(row+col*3)%5],'Roof',.012)
   tile.rotation_euler.x=side*math.atan((2.5-1.08*t)/4.08)
 for x in [-5.6,5.6]:
  for i in range(18):
   t=i/18;u=(i+1)/18;beam('Gable bargeboard',(x,roofY(t)+.04,side*t*4.12),(x,roofY(u)+.04,side*u*4.12),.065)
  beam('Swept eave',(x,roofY(1),side*4.12),(x,roofY(1)+.5,side*4.55),.075)
beam('Ridge cap',(-5.8,5.52,0),(5.8,5.52,0),.095)
for x in [-5.6,5.6]:
 beam('Curved ridge finial',(x,5.48,0),(x,6.1,-.25),.09)
 # Open gable timber lattice.
 for i in range(13):
  z=-2.5+i*.42;top=roofY(abs(z)/4.08)-.1
  box('Gable slat',x,(3.18+top)/2,z,.09,top-3.18,.09,dark,'Roof')
# Interior furniture (collision manifest maintained in courtyard-state.js).
box('Archive table',-2,1,-.9,2.5,.13,1.4,wood,'Furniture')
for x in [-3,-1]:
 for z in [-1.4,-.4]:box('Table leg',x,.65,z,.12,.7,.12,dark,'Furniture')
box('Indigo runner',-2,1.077,-.9,1.1,.012,1.32,material('Indigo cotton',(.065,.16,.20)),'Furniture',.003)
for i in range(5):box('Bound ledger',-2.65+i*.27,1.14,-1.05,.22,.1,.47,plaster,'Furniture',.008)
for x in [2.3,3.6]:
 for y in [.52,1.17,1.82]:box('Archive shelf',x,y,-2.58,1.25,.1,.64,wood,'Furniture')
 for dx in [-.6,.6]:box('Shelf upright',x+dx,1.12,-2.58,.075,1.9,.66,dark,'Furniture')
 for i in range(7):box('Ledger spine',x-.46+i*.14,1.46,-2.53,.10,.45,.37,red[i%5],'Furniture',.008)
# Join within role/material to reduce draw calls while keeping roof visibility independent.
for role,objects in roles.items():
 groups={}
 for o in objects:groups.setdefault(o.data.materials[0].name,[]).append(o)
 for name,items in groups.items():
  bpy.ops.object.select_all(action='DESELECT')
  for o in items:o.select_set(True)
  bpy.context.view_layer.objects.active=items[0];bpy.ops.object.join();o=bpy.context.object;o.name=role+'__'+name.split(' |')[0];o['visibilityRole']=role
  bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'art/blender/courtyard/merchant-pavilion.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'dist/assets/merchant-pavilion.raw.glb'),export_format='GLB',export_extras=True,export_cameras=False,export_lights=False)
print('Pavilion exported with',len(bpy.context.scene.objects),'batches')
