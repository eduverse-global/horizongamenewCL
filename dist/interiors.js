import * as THREE from 'three';
import {CAST} from './story.js';
// Room coordinates and collision are independent of visual meshes.
export const ROOM_BLOCKS={lisbon:[[-5,-.5,2,2], [4,1,2.3,2], [0,-3.6,11,1.7]],london:[[-4,-1,3,2],[4,0,2,3],[0,-4,11,1]],azores:[[-4,-2,3,2],[4,1,2,2]]};
export function walkable(x,z,blocks){return Math.abs(x)<6.35&&z> -4.1&&z<4.5&&!blocks.some(([bx,bz,w,d])=>Math.abs(x-bx)<w/2+.3&&Math.abs(z-bz)<d/2+.3);}
export function roomRoute(start,end,blocks){const unit=.4,key=(x,z)=>`${x},${z}`,snap=v=>Math.round(v/unit);const sx=snap(start.x),sz=snap(start.z),ex=snap(end.x),ez=snap(end.z);if(!walkable(ex*unit,ez*unit,blocks))return null;const queue=[[sx,sz]],seen=new Map([[key(sx,sz),null]]);let found;for(let i=0;i<queue.length&&i<5000;i++){const [x,z]=queue[i];if(x===ex&&z===ez){found=[x,z];break;}for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(!seen.has(k)&&walkable(nx*unit,nz*unit,blocks)){seen.set(k,[x,z]);queue.push([nx,nz]);}}}if(!found)return null;const path=[];while(found){path.push({x:found[0]*unit,z:found[1]*unit});found=seen.get(key(...found));}return path.reverse().slice(1);}
export function createInteriors(renderer,{talk,onNearby}){
let scene,camera,player,place=null,actors=[],route=[],pending=null,clock=0,blocks=[];const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),floor=new THREE.Plane(new THREE.Vector3(0,1,0),0);const materials=new Map();const sprites=new THREE.TextureLoader().load('/assets/story-sprites.png');sprites.colorSpace=THREE.SRGBColorSpace;sprites.magFilter=THREE.NearestFilter;sprites.minFilter=THREE.NearestFilter;
const mat=(color,glow=false)=>{const k=color+glow;if(!materials.has(k))materials.set(k,new THREE.MeshStandardMaterial({color,roughness:.85,...(glow?{emissive:color,emissiveIntensity:1.5}:{})}));return materials.get(k);};
function mesh(geo,color,x,y,z){const m=new THREE.Mesh(geo,mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
const box=(x,y,z,w,h,d,c)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z);
function barrel(x,z){mesh(new THREE.CylinderGeometry(.4,.36,.85,12),'#795135',x,.43,z);for(const y of[.15,.68])mesh(new THREE.CylinderGeometry(.411,.411,.065,12),'#303c3b',x,y,z);for(let i=-2;i<3;i++)box(x+i*.14,.87,z,.018,.02,.64,'#382e26');}
function candle(x,y,z){box(x,y,z,.08,.25,.08,'#f2dfaa');const flame=new THREE.Mesh(new THREE.SphereGeometry(.07,6,6),mat('#ffba57',true));flame.position.set(x,y+.18,z);scene.add(flame);}
function table(x,z,w=2,d=1.5){box(x,.95,z,w,.14,d,'#855736');for(const dx of[-w/2+.16,w/2-.16])for(const dz of[-d/2+.16,d/2-.16])box(x+dx,.43,z+dz,.14,.85,.14,'#433329');for(let i=0;i<4;i++)box(x-w/2+(i+.5)*w/4,1.026,z,.014,.015,d,'#342b26');candle(x,.99+.2,z);mesh(new THREE.CylinderGeometry(.16,.13,.22,10),'#c39e70',x+.5,1.15,z+.25);}
function crate(x,z){box(x,.45,z,.9,.9,.9,'#936744');for(const dx of[-.33,.33])box(x+dx,.46,z+.46,.08,.9,.04,'#433227');}
function actor(id,x,z){const index=id==='player'?0:CAST[id].sprite;const texture=sprites.clone();texture.repeat.set(300/1983,394/793);texture.offset.set([165,502,840,1178,1515][index]/1983,399/793);texture.needsUpdate=true;const m=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,alphaTest:.15,depthWrite:false}));m.center.set(.5,0);m.scale.set(1.35,1.85,1);m.position.set(x,.04,z);scene.add(m);const shadow=mesh(new THREE.CircleGeometry(.35,24),'#302720',x,.018,z);shadow.rotation.x=-Math.PI/2;const a={id,x,z,index,mesh:m,shadow};actors.push(a);return a;}
function build(id){place=id;route=[];pending=null;clock=0;blocks=ROOM_BLOCKS[id];scene=new THREE.Scene();scene.background=new THREE.Color(id==='azores'?'#153e4b':'#151922');scene.fog=new THREE.Fog(scene.background,28,65);camera=new THREE.OrthographicCamera();camera.position.set(0,14,17);camera.lookAt(0,.2,0);scene.add(new THREE.HemisphereLight('#f9e5c4','#343848',2));const sun=new THREE.DirectionalLight('#ffcb88',3);sun.position.set(-6,10,4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.1,far:40});sun.shadow.bias=-.001;scene.add(sun);if(id!=='azores'){const hearth=new THREE.PointLight('#ff9948',28,12,2);hearth.position.set(-4,2.1,-2);scene.add(hearth);const windowLight=new THREE.PointLight('#a3d7e4',15,10,2);windowLight.position.set(3,2,-3);scene.add(windowLight);}actors=[];
box(0,-.35,0,14,.65,11,id==='azores'?'#5a6f64':'#3a2c29');
if(id==='azores'){
 box(0,-.08,0,13,.16,10,'#b6a984');for(let i=0;i<24;i++){const x=-6+(i%8)*1.7,z=-4+Math.floor(i/8)*3.6;const rock=mesh(new THREE.DodecahedronGeometry(.4+(i%3)*.11,0),'#6e8174',x,.16,z);rock.scale.y=.6;}
 for(const [x,z]of[[-4,-2],[-3.2,-2],[4,1]])crate(x,z);barrel(4.6,1.5);const mast=box(-4,1,-2,.13,3.8,.13,'#54412f');mast.rotation.z=.6;box(-4,.2,-2,3,.4,.9,'#54412f');for(let i=0;i<5;i++){const rib=box(-5+i*.5,.6,-2,.12,.6,1.4,'#6a4b31');rib.rotation.z=(i-2)*.15;}
 const sea=box(0,-.3,7,40,.1,5,'#3d8291');sea.material=mat('#3d8291');for(let i=0;i<12;i++)box(-8+i*1.5,-.21,5.7+(i%2)*.4,1,.025,.06,'#bdd2c1');
 actor('tomas',-.8,-1.2);actor('mara',2,-2);
}else{
 for(let row=0;row<20;row++)for(let col=0;col<7;col++)box(-6+(col+.5)*1.85-(row%2)*.2,.008,-4.7+row*.49,1.81,.04,.46,['#805b40','#8d6648','#99714d','#755139'][(row*7+col*3)%4]);
 box(0,1.7,-5,14,3.5,.28,'#b6a080');box(-7,1.15,0,.25,2.3,10,'#958369');box(7,.55,0,.25,1.1,10,'#88755c');
 for(const x of[-6.8,-3.5,0,3.5,6.8])box(x,1.7,-4.8,.18,3.5,.2,'#44352d');for(const y of[.22,1,3.4])box(0,y,-4.78,14,.16,.22,'#44352d');
 // Open roof and cutaway front keep every actor readable.
 for(const x of[-3,3]){box(x,2.05,-4.8,1.5,1.85,.12,'#392f29');box(x,2.1,-4.69,1.25,1.55,.08,'#87c2c3');box(x,2.1,-4.6,.07,1.6,.1,'#e7bd73');box(x,2.1,-4.6,1.3,.06,.1,'#e7bd73');box(x,1.28,-4.5,1.7,.12,.4,'#62452f');for(const side of[-1,1])box(x+side*.86,2.1,-4.5,.3,1.95,.2,id==='lisbon'?'#803a32':'#364f5c');}
 if(id==='lisbon'){
 box(0,.65,-3.65,10.8,1.3,1.45,'#65432e');box(0,1.34,-3.65,11.2,.16,1.7,'#b1824b');for(let i=-5;i<6;i++)box(i,.64,-2.9,.04,1.12,.04,'#bd935d');
 for(const x of[-4,0,4]){candle(x,1.57,-3.4);mesh(new THREE.CylinderGeometry(.17,.17,.25,10),'#c4b496',x+.5,1.55,-3.4);}
 table(-5,-.5,1.9,1.6);table(4,1,2.2,1.8);barrel(5.9,-3.6);barrel(5.8,-2.6);barrel(-5.9,-3.7);
 box(-5.8,1,-4.5,1.6,2,.5,'#776e61');box(-5.8,.65,-4.1,1.2,1.1,.2,'#2e2826');for(let i=0;i<4;i++){const ember=mesh(new THREE.OctahedronGeometry(.2,0),'#e99735',-6.1+i*.2,.35,-3.98);ember.material=mat('#ed8d32',true);}
 actor('ines',-1.6,-1.75);
 }else{
 table(-4,-1,2.9,1.9);box(-4,1.04,-1,1.5,.035,1.2,'#dccb9e');for(let i=0;i<5;i++)box(-4.5+i*.22,1.065,-1,.014,.012,.9,'#9c8d69');
 for(const x of[-5,-1,3,5]){box(x,1.5,-4.5,1.5,2.8,.5,'#4e3930');for(let y=.4;y<2.8;y+=.7){box(x,y,-4.15,1.5,.07,.8,'#aa7d47');for(let i=0;i<6;i++)box(x-.6+i*.22,y+.27,-4.25,.15,.45,.35,['#803e35','#53605c','#c4a365'][i%3]);}}
 table(4,0,1.8,2.6);crate(5.8,-2);actor('elias',-2,-1);
 }
 // An inlaid runner leads from the harbor door into the room.
 box(0,.05,2,2.3,.025,4.7,id==='lisbon'?'#7d3930':'#344d59');for(const x of[-1.06,1.06])box(x,.067,2,.035,.01,4.5,'#c19754');box(0,.07,4.8,2,.08,.6,'#b79b6b');
}
player=actor('player',0,3.6);resize();}
function resize(){if(!camera)return;const aspect=innerWidth/innerHeight;const span=Math.max(8.8,8.2/aspect);camera.left=-span*aspect;camera.right=span*aspect;camera.top=span;camera.bottom=-span;camera.near=.1;camera.far=100;camera.updateProjectionMatrix();}
addEventListener('resize',resize);
function nearest(){return actors.filter(a=>a!==player).sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z))[0];}
function approach(id){const a=actors.find(a=>a.id===id);if(!a)return;pending=id;route=roomRoute(player,{x:a.x,z:a.z+.8},blocks)||[];}
function interact(){const a=nearest();if(a&&Math.hypot(a.x-player.x,a.z-player.z)<1.8){route=[];pending=null;talk(a.id);}else if(a)approach(a.id);}
function click(clientX,clientY){mouse.set(clientX/innerWidth*2-1,-clientY/innerHeight*2+1);ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(actors.filter(a=>a!==player).map(a=>a.mesh))[0];if(hit){approach(actors.find(a=>a.mesh===hit.object).id);return;}const v=new THREE.Vector3();if(ray.ray.intersectPlane(floor,v)){route=roomRoute(player,v,blocks)||[];pending=null;}}
function update(dt,keys,blocked){clock+=dt;if(!blocked){let dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),dz=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);if(dx||dz){route=[];pending=null;}else if(route.length){const p=route[0],d=Math.hypot(p.x-player.x,p.z-player.z);if(d<.1)route.shift();else{dx=(p.x-player.x)/d;dz=(p.z-player.z)/d;}}const length=Math.hypot(dx,dz),step=dt*3;const nx=player.x+(length?dx/length*step:0),nz=player.z+(length?dz/length*step:0);if(walkable(nx,player.z,blocks))player.x=nx;if(walkable(player.x,nz,blocks))player.z=nz;player.mesh.material.map.offset.y=length&&Math.floor(clock*7)%2?0:399/793;player.mesh.position.set(player.x,.04+(length?Math.sin(clock*14)*.04:0),player.z);player.shadow.position.set(player.x,.02,player.z);if(pending&&!route.length){const a=actors.find(a=>a.id===pending);pending=null;if(a&&Math.hypot(a.x-player.x,a.z-player.z)<1.8)talk(a.id);}}
const n=nearest();onNearby(n&&Math.hypot(n.x-player.x,n.z-player.z)<1.8?n.id:null);renderer.render(scene,camera);}
function dispose(){if(scene){scene.traverse(o=>{o.geometry?.dispose();if(o.isSprite){o.material.map.dispose();o.material.dispose();}});}place=null;actors=[];route=[];pending=null;}
return{enter(id){dispose();build(id);},exit:dispose,update,click,interact,approach,get place(){return place;},get active(){return !!place;},get people(){return actors.filter(a=>a.id!=='player').map(a=>a.id);}};
}
