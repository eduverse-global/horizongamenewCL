import * as THREE from 'three';
import {POINTS} from './courtyard-state.js';
// PixelLab cast atlas (art/pixellab): 48px cells; captain facings in columns 0-3, then the three NPCs.
const CELLS=7,FACING={down:0,left:1,right:2,up:3},NPC={official:4,merchant:5,innkeeper:6},SIZE=1.8;
export async function createActors(scene){
 const atlas=await new THREE.TextureLoader().loadAsync('/assets/siam-cast.png');
 atlas.colorSpace=THREE.SRGBColorSpace;atlas.magFilter=THREE.NearestFilter;atlas.minFilter=THREE.NearestFilter;atlas.generateMipmaps=false;
 function actor(column,x,z){const texture=atlas.clone();texture.needsUpdate=true;texture.repeat.set(1/CELLS,1);texture.offset.set(column/CELLS,0);
 // Lit, cutout planes participate in scene depth and shadows. Feet sit 3px above the cell bottom.
 const geometry=new THREE.PlaneGeometry(1,1);geometry.translate(0,.5-3/48,0);
 const material=new THREE.MeshStandardMaterial({map:texture,alphaTest:.3,side:THREE.DoubleSide,roughness:1,metalness:0});
 const mesh=new THREE.Mesh(geometry,material);mesh.scale.set(SIZE,SIZE,1);mesh.position.set(x,.025,z);mesh.castShadow=true;scene.add(mesh);
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.32,24),new THREE.MeshBasicMaterial({color:'#17221c',transparent:true,opacity:.20,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.set(x,.022,z);scene.add(shadow);return{mesh,shadow,texture};}
 const player=actor(0,0,0);
 const npcs=POINTS.filter(p=>p.id in NPC).map(p=>actor(NPC[p.id],p.x,p.z));
 function update(s,moving,time,camera){player.texture.offset.x=FACING[s.facing]/CELLS;
 // One drawn frame per facing, so walking reads as a short step bob until walk cycles are exported.
 const bob=moving?Math.abs(Math.sin(time*11))*.07:0;
 const height=s.z< -3.0?.34:s.z< -2.5?.2:.025;player.mesh.position.set(s.x,height+bob,s.z);player.shadow.position.set(s.x,height+.005,s.z);
 // Y-only billboarding preserves grounded feet and a consistent vertical scale.
 const yaw=Math.atan2(camera.position.x-s.x,camera.position.z-s.z);player.mesh.rotation.y=yaw;for(const n of npcs)n.mesh.rotation.y=yaw;
 }
 return{player,npcs,update};
}
