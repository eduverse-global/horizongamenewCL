import * as THREE from 'three';
import {POINTS,SPEED,DASH,onLanding,faceToward} from './courtyard-state.js';
// PixelLab cast atlas (art/pixellab): row 0 holds idle cells (the captain's eight facings, then the NPCs),
// the other rows the captain's walk cycles; siam-cast.json names each idle column and gives each walk row's frame count.
// SIZE follows HD-2D scale: characters large relative to buildings (door about 1.4x character height).
const FACING={down:'south',left:'west',right:'east',up:'north','down-right':'south-east','up-right':'north-east','up-left':'north-west','down-left':'south-west'},NPC=['official','merchant','innkeeper'],SIZE=2.1;
// One full walk cycle (both steps) per 2 m walked: about 10 frames a second at walking speed, and the feet do not slide.
const CYCLE=2;
export async function createActors(scene){
 const [atlas,layout]=await Promise.all([new THREE.TextureLoader().loadAsync('/assets/siam-cast.png'),fetch('/assets/siam-cast.json').then(r=>r.json())]);
 atlas.colorSpace=THREE.SRGBColorSpace;atlas.magFilter=THREE.NearestFilter;atlas.minFilter=THREE.NearestFilter;atlas.generateMipmaps=false;
 const {columns,rows}=layout,column=name=>layout.idle.indexOf(name);
 const cell=(texture,col,row)=>texture.offset.set(col/columns,1-(row+1)/rows);
 function actor(column,x,z){const texture=atlas.clone();texture.needsUpdate=true;texture.repeat.set(1/columns,1/rows);cell(texture,column,0);
 // Lit, cutout planes participate in scene depth and shadows. Feet sit 3px above the cell bottom.
 const geometry=new THREE.PlaneGeometry(1,1);geometry.translate(0,.5-3/48,0);
 // Lit by the scene, with a small self-lit floor (emissiveMap) so sprites never sink to black at night.
 const material=new THREE.MeshStandardMaterial({map:texture,emissiveMap:texture,emissive:'#ffffff',emissiveIntensity:.14,alphaTest:.3,side:THREE.DoubleSide,roughness:1,metalness:0});
 const mesh=new THREE.Mesh(geometry,material);mesh.scale.set(SIZE,SIZE,1);mesh.position.set(x,.025,z);mesh.castShadow=true;scene.add(mesh);
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.36,24),new THREE.MeshBasicMaterial({color:'#101812',transparent:true,opacity:.34,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.set(x,.022,z);scene.add(shadow);return{mesh,shadow,texture};}
 const player=actor(column('captain-south'),0,0);
 // A soft warm light carried with the player, as Octopath does, so the hero reads in dim areas.
 const glow=new THREE.PointLight('#ffd9a8',1.2,4.5,2);scene.add(glow);let walked=0;const forward=new THREE.Vector3();
 // NPCs rest facing the camera and breathe (PixelLab breathing-idle), each loop out of step; while talking they turn
 // to face the captain, and turn back a moment after the conversation ends.
 const npcs=POINTS.filter(p=>NPC.includes(p.id)).map((p,i)=>({...actor(column(p.id+'-south'),p.x,p.z),id:p.id,x:p.x,z:p.z,facing:'down',until:0,phase:i*.37}));
 let clock=0;
 function faceCaptain(id,s){const n=npcs.find(n=>n.id===id);if(!n)return;const probe={x:n.x,z:n.z,facing:n.facing};faceToward(probe,s);n.facing=probe.facing;n.until=Infinity;}
 function release(id){const n=npcs.find(n=>n.id===id);if(n&&n.until===Infinity)n.until=clock+1.2;}
 function update(s,moving,time,camera,dt=1/60){clock=time;
 for(const n of npcs){if(n.facing!=='down'&&time>n.until)n.facing='down';const breathe=layout.anim?.[n.id+'-breathe'];
  if(n.facing==='down'&&breathe?.frames)cell(n.texture,Math.floor((time/.3+n.phase*breathe.frames))%breathe.frames,breathe.row);else cell(n.texture,column(n.id+'-'+FACING[n.facing]),0);}
 const walk=layout.walk[FACING[s.facing]];
 if(moving&&walk?.frames){walked+=dt*SPEED*(s.v??1)*(s.dash?DASH:1);cell(player.texture,Math.floor(walked/CYCLE*walk.frames)%walk.frames,walk.row);}
 else{walked=0;cell(player.texture,column('captain-'+FACING[s.facing]),0);}
 const height=s.z< -3.0?.34:s.z< -2.5?.2:onLanding(s.x,s.z)&&s.x>9.6?.1:.025;player.mesh.position.set(s.x,height,s.z);player.shadow.position.set(s.x,height+.005,s.z);glow.position.set(s.x,height+1.6,s.z+.6);
 // Screen-aligned billboards (as in HD-2D): every sprite turns to the camera's heading, not toward the camera position,
 // so a character looks the same wherever it stands on screen. Rotating around Y only keeps feet grounded, and
 // stretching height by 1/cos(camera pitch) undoes the vertical squash of a camera looking down.
 camera.getWorldDirection(forward);const yaw=Math.atan2(-forward.x,-forward.z),tall=SIZE/Math.max(.5,Math.cos(Math.asin(-forward.y)));
 for(const a of[player,...npcs]){a.mesh.rotation.y=yaw;a.mesh.scale.y=tall;}
 }
 return{player,npcs,update,faceCaptain,release};
}
