import * as THREE from 'three';
import {POINTS} from './courtyard-state.js';
// PixelLab cast atlas (art/pixellab): 48px cells; captain facings in columns 0-3, then the three NPCs.
// SIZE follows HD-2D scale: characters large relative to buildings (door about 1.4x character height).
const CELLS=7,FACING={down:0,left:1,right:2,up:3},NPC={official:4,merchant:5,innkeeper:6},SIZE=2.1;
export async function createActors(scene){
 const atlas=await new THREE.TextureLoader().loadAsync('/assets/siam-cast.png');
 atlas.colorSpace=THREE.SRGBColorSpace;atlas.magFilter=THREE.NearestFilter;atlas.minFilter=THREE.NearestFilter;atlas.generateMipmaps=false;
 function actor(column,x,z){const texture=atlas.clone();texture.needsUpdate=true;texture.repeat.set(1/CELLS,1);texture.offset.set(column/CELLS,0);
 // Lit, cutout planes participate in scene depth and shadows. Feet sit 3px above the cell bottom.
 const geometry=new THREE.PlaneGeometry(1,1);geometry.translate(0,.5-3/48,0);
 // Lit by the scene, with a small self-lit floor (emissiveMap) so sprites never sink to black at night.
 const material=new THREE.MeshStandardMaterial({map:texture,emissiveMap:texture,emissive:'#ffffff',emissiveIntensity:.14,alphaTest:.3,side:THREE.DoubleSide,roughness:1,metalness:0});
 const mesh=new THREE.Mesh(geometry,material);mesh.scale.set(SIZE,SIZE,1);mesh.position.set(x,.025,z);mesh.castShadow=true;scene.add(mesh);
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.36,24),new THREE.MeshBasicMaterial({color:'#101812',transparent:true,opacity:.34,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.set(x,.022,z);scene.add(shadow);return{mesh,shadow,texture};}
 const player=actor(0,0,0);
 // A soft warm light carried with the player, as Octopath does, so the hero reads in dim areas.
 const glow=new THREE.PointLight('#ffd9a8',1.2,4.5,2);scene.add(glow);let stride=0;
 const npcs=POINTS.filter(p=>p.id in NPC).map(p=>actor(NPC[p.id],p.x,p.z));
 function update(s,moving,time,camera,dt=1/60){player.texture.offset.x=FACING[s.facing]/CELLS;
 // One drawn frame per facing: two small steps per stride, advanced by distance travelled so the bob matches the ground speed.
 stride=moving?stride+dt*(s.v??1)*3.4/1.1:0;const step=Math.abs(Math.sin(stride*Math.PI));
 const height=s.z< -3.0?.34:s.z< -2.5?.2:.025;player.mesh.position.set(s.x,height+step*.05,s.z);player.shadow.position.set(s.x,height+.005,s.z);player.shadow.scale.setScalar(1-step*.12);
 player.mesh.rotation.z=moving?Math.sin(stride*Math.PI)*.035:0;glow.position.set(s.x,height+1.6,s.z+.6);
 // Y-only billboarding keeps feet grounded; stretching height by 1/cos(pitch) undoes the vertical squash of a camera looking down.
 const yaw=Math.atan2(camera.position.x-s.x,camera.position.z-s.z),pitch=Math.atan2(camera.position.y,Math.hypot(camera.position.x-s.x,camera.position.z-s.z)),tall=SIZE/Math.max(.5,Math.cos(pitch));
 for(const a of[player,...npcs]){a.mesh.rotation.y=yaw;a.mesh.scale.y=tall;}
 }
 return{player,npcs,update};
}
