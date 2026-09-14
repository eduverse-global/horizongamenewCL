import * as THREE from 'three';
import {townBuildings} from './places.js';
export function buildTown({scene,box,mesh,barrel,crate},city){
const warm=city==='alexandria',london=city==='london';const ground=warm?'#c4ac7e':london?'#787b75':'#acaa91',roof=warm?'#c7b78e':london?'#565d64':'#a75c3d';
box(0,-.32,0,42,.6,51,ground);box(0,.005,0,9,.05,48,warm?'#d7c5a1':'#b7b4a3');for(const z of[-19,-5,8,21])box(0,.02,z,40,.06,4,warm?'#d7c5a1':'#b7b4a3');
// Repeated stone paving is instanced to keep detailed streets inexpensive.
const stones=[];for(let z=-23.8;z<24;z+=.52)for(let x=-4.15;x<4.3;x+=.68)stones.push([x+(Math.round(z/.52)%2)*.16,z]);for(const zc of[-19,-5,8,21])for(let z=zc-1.8;z<zc+1.8;z+=.52)for(let x=-19.6;x<20;x+=.68)if(Math.abs(x)>4.5)stones.push([x,z]);
const pavement=new THREE.InstancedMesh(new THREE.BoxGeometry(.62,.035,.46),new THREE.MeshStandardMaterial({color:'#ffffff',roughness:1}),stones.length);const transform=new THREE.Object3D(),tint=new THREE.Color();stones.forEach(([x,z],i)=>{transform.position.set(x,.065,z);transform.updateMatrix();pavement.setMatrixAt(i,transform.matrix);tint.set(warm?'#d4bf99':london?'#969d95':'#bdbaa4').multiplyScalar(.92+(i*17%13)/100);pavement.setColorAt(i,tint);});pavement.userData.ownedMaterial=true;pavement.receiveShadow=true;scene.add(pavement);
for(let z=-23;z<24;z+=1.2){box(0,.04,z,8.8,.01,.025,'#918e7d');for(const x of[-4.5,4.5])box(x,.1,z,.18,.18,1.13,'#d4cbb0');}
for(const b of townBuildings(city)){
 const firstPart=scene.children.length;
 const h=b.kind==='chapel'?5:3.4+(b.kind==='guild'?1:0);const c=warm?'#d4bc93':london?'#a5927a':b.color;
 box(b.x,h/2,b.z,b.w,h,b.d,c);box(b.x,.3,b.z,b.w+.3,.6,b.d+.3,'#746b59');box(b.x,h+.12,b.z,b.w+.5,.22,b.d+.5,roof);
 if(!warm){const g=new THREE.BufferGeometry();const x=b.w/2+.35,z=b.d/2+.3;g.setAttribute('position',new THREE.Float32BufferAttribute([-x,0,-z,x,0,-z,0,1.6,-z,-x,0,z,0,1.6,z,x,0,z,-x,0,-z,0,1.6,-z,0,1.6,z,-x,0,-z,0,1.6,z,-x,0,z,x,0,-z,x,0,z,0,1.6,z,x,0,-z,0,1.6,z,0,1.6,-z],3));g.computeVertexNormals();mesh(g,roof,b.x,h+.2,b.z);}
 for(const x of[b.x-3,b.x+3]){box(x,2,b.z+b.d/2+.05,1.4,1.7,.12,'#564535');box(x,2.05,b.z+b.d/2+.13,1.15,1.4,.08,london?'#bbbd9c':'#728f8c');box(x,2.05,b.z+b.d/2+.2,.07,1.5,.06,'#e3d1a6');box(x,2.05,b.z+b.d/2+.21,1.15,.07,.06,'#e3d1a6');box(x,1.12,b.z+b.d/2+.25,1.7,.12,.5,'#938162');}
 box(b.x,1.05,b.z+b.d/2+.13,1.5,2.1,.18,'#4c3930');box(b.x,.08,b.z+b.d/2+.65,2.1,.15,1,'#d4c6a6');box(b.x,2.4,b.z+b.d/2+.4,2.6,.36,.18,'#554031');box(b.x+.48,1,b.z+b.d/2+.26,.08,.12,.07,'#dfb55c');
 if(b.kind==='tavern'||b.kind==='market'){const awning=box(b.x,2.8,b.z+4,5,.12,1.7,b.kind==='tavern'?'#7c3e32':'#697863');awning.rotation.x=.13;for(const x of[b.x-2.4,b.x+2.4])box(x,1.3,b.z+4.7,.1,2.6,.1,'#6f4e34');}
 if(b.kind==='shipyard'){barrel(b.x+3.1,b.z+4.6);crate(b.x-3,b.z+4.7);box(b.x+2,4,b.z+1,.4,2,.4,'#6f5b45');}
 if(b.kind==='chapel'){box(b.x-2.8,h+.9,b.z-1,2.2,2,2.2,c);box(b.x-2.8,h+2,b.z-1,2.5,.2,2.5,roof);}
 for(const part of scene.children.slice(firstPart)){part.userData.building={x:b.x,z:b.z,w:b.w,d:b.d,height:h+2.2};part.material=part.material.clone();part.material.transparent=true;part.userData.ownedMaterial=true;}
}
// Fountain, benches, planters, lamps and moored cargo give the streets landmarks.
mesh(new THREE.CylinderGeometry(1.9,2,.45,16),'#817f6a',0,.24,0);mesh(new THREE.CylinderGeometry(1.65,1.65,.1,24),'#6faaa5',0,.49,0);mesh(new THREE.CylinderGeometry(.4,.7,1.7,10),'#aaa58d',0,.9,0);mesh(new THREE.CylinderGeometry(.95,.35,.22,16),'#ccc1a2',0,1.8,0);
for(const x of[-17,17])for(const z of[-20,-6,8,21]){mesh(new THREE.CylinderGeometry(.15,.23,2.3,7),'#67583a',x,1.15,z);const crown=mesh(new THREE.IcosahedronGeometry(warm?1.1:1.6,1),warm?'#7e8b58':'#5b7758',x,3,z);crown.scale.y=warm?.5:1.2;box(x,.15,z,2.2,.3,2.2,'#9a947b');}
for(const z of[-19,-6,8,20])for(const x of[-4.8,4.8]){box(x,1.3,z,.1,2.6,.1,'#454638');box(x,2.65,z,.42,.5,.42,'#cdb179');box(x,2.98,z,.6,.12,.6,'#424438');}
for(const x of[-3,3]){box(x,.55,3,1.7,.15,.6,'#75593e');box(x,.9,3.3,1.7,.7,.1,'#75593e');for(const dx of[-.6,.6])box(x+dx,.25,3,.1,.5,.4,'#4b4c3d');}
box(0,-.1,27,52,.1,6,london?'#506f78':'#488a97');for(let x=-20;x<21;x+=2)box(x,.15,24.5,1.5,.25,.4,'#807663');for(const x of[-16,-14,14,16])crate(x,22);box(0,.05,24,4,.18,4,'#816b4b');
return townBuildings(city).map(b=>({id:'door-'+b.kind,name:b.name,x:b.x,z:b.z+b.d/2+1.15,action:{type:'door',target:b.target},door:true})).concat([{id:'harbor',name:'Return to ship',x:0,z:23,action:{type:'ship'},door:true}],city==='alexandria'?[{id:'caravan',name:'Caravan to the Holy Land',x:0,z:-21,action:{type:'caravan'},door:true}]:[]);
}
export function buildHolyLand({scene,box,mesh}){
box(0,-.25,0,39,.5,45,'#b9a078');box(0,.03,0,6,.1,40,'#dac9a6');box(0,.06,-9,25,.15,15,'#c9b592');for(const x of[-13,13])box(x,1.1,-9,.6,2.2,16,'#c7b18a');box(0,1.1,-17,26,2.2,.6,'#c7b18a');
for(const x of[-10,-5,5,10]){mesh(new THREE.CylinderGeometry(.38,.45,3.2,12),'#d8c5a0',x,1.6,-14);box(x,3.25,-14,1.1,.18,1.1,'#b6a17c');}box(0,3.4,-14,22,.4,1,'#c7b18a');box(0,.7,-11,3,1.4,2,'#b5a785');box(0,1.43,-11,2.7,.1,1.7,'#dfc99b');
for(const x of[-8,8])for(const z of[-3,5,13]){mesh(new THREE.CylinderGeometry(.23,.38,2,8),'#7c7251',x,1,z);const tree=mesh(new THREE.IcosahedronGeometry(2,1),'#7e8e62',x,3,z);tree.scale.y=.7;box(x,.1,z,4,.2,4,'#a6a581');}
for(let i=0;i<16;i++){const x=(i%2?1:-1)*(15+i%3),z=-19+i*2.5;const rock=mesh(new THREE.DodecahedronGeometry(.8+i%3*.4,0),'#b5a17f',x,.3,z);rock.scale.y=.5;}
box(0,1.1,18,4,2.2,.25,'#8f7960');box(0,1.1,17.8,2,2.2,.1,'#594d3c');
return[{id:'star-chart',name:'Study the weathered star chart',x:0,z:-9.2,action:{type:'star-chart'},door:true},{id:'caravan-return',name:'Caravan to Alexandria',x:0,z:17,action:{type:'door',target:'alexandria-town'},door:true}];
}
