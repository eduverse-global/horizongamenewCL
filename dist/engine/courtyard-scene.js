import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
export async function createCourtyard(scene){
 let seed=1685;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.9,...extra});
 // Static props are merged into one draw per material at flush(); `solo` meshes stay separate (animated or special materials).
 const statics=[];
 function mesh(g,m,x,y,z,solo=false){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;if(solo)scene.add(o);else statics.push(o);return o;}
 const wood=mat('#67452a'),dark=mat('#3b3025'),stone=mat('#a79d79'),brass=mat('#aa8041',{metalness:.45,roughness:.42});
 const box=(x,y,z,w,h,d,m)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const batches=new Map();const dummy=new THREE.Object3D();
 function instance(key,g,m,x,y,z,sx=1,sy=1,sz=1,ry=0,color=null,rx=0){if(!batches.has(key))batches.set(key,{g,m,items:[]});batches.get(key).items.push({x,y,z,sx,sy,sz,ry,rx,color});}
 function flush(){for(const{g,m,items}of batches.values()){const o=new THREE.InstancedMesh(g,m,items.length);items.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.rx,p.ry,0);dummy.scale.set(p.sx,p.sy,p.sz);dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix);if(p.color)o.setColorAt(i,new THREE.Color(p.color));});o.castShadow=true;o.receiveShadow=true;o.computeBoundingSphere();scene.add(o);}batches.clear();
 const byMaterial=new Map();for(const o of statics){o.updateMatrix();const g=o.geometry.index?o.geometry.clone():o.geometry.clone().setIndex([...Array(o.geometry.attributes.position.count).keys()]);g.applyMatrix4(o.matrix);if(!byMaterial.has(o.material))byMaterial.set(o.material,[]);byMaterial.get(o.material).push(g);}
 for(const[m,list]of byMaterial){const merged=new THREE.Mesh(mergeGeometries(list,false),m);merged.castShadow=merged.receiveShadow=true;scene.add(merged);list.forEach(g=>g.dispose());}statics.length=0;}
 function texture(kind){const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle=kind==='grass'?'#708449':'#aa9d79';ctx.fillRect(0,0,512,512);
 for(let i=0;i<22000;i++){const n=Math.floor(rand()*65);ctx.fillStyle=kind==='grass'?`rgba(${50+n},${67+n},${29+n*.55},.22)`:`rgba(${70+n},${61+n},${40+n},.15)`;ctx.fillRect(rand()*512,rand()*512,1+rand()*6,1+rand()*3);}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='grass'?12:2,kind==='grass'?12:2);t.anisotropy=4;return t;}
 const grassTex=texture('grass'),sandTex=texture('sand');
 const floor=mesh(new THREE.PlaneGeometry(57,70),mat('#d4d2a5',{map:grassTex}),-18.5,-.08,-4);floor.rotation.x=-Math.PI/2;floor.material.map.repeat.set(12*57/70,12);
 const pathMat=mat('#c5b891',{map:sandTex});
 const path=box(0,-.035,3.5,4,.09,15,pathMat);path.receiveShadow=true;
 box(-3.6,-.04,2.1,11,.08,3.7,pathMat);box(5,-.04,4.6,7,.08,4,pathMat);
 const paver=new THREE.CylinderGeometry(.46,.49,.09,6),paverMat=mat('#ddd0a8',{map:sandTex});
 for(let row=0;row<21;row++)for(let col=0;col<4;col++){const x=-1.47+col*.97+(row%2)*.12,z=-2.9+row*.66;instance('path',paver,paverMat,x,.025+rand()*.013,z,.92+rand()*.15,1,.71+rand()*.11,rand()*.2,['#c6ba94','#adad92','#dad0ae'][Math.floor(rand()*3)]);}
 for(let i=0;i<64;i++){const x=-7+rand()*15,z=.6+rand()*5.8;if(Math.abs(x)>2)instance('path',paver,paverMat,x,.02,z,.6+rand()*.5,1,.65+rand()*.35,rand()*6,'#b4ae90');}
 // A circular trading court, inset rings and individual sandstone segments.
 for(let r=1;r<=4;r++)for(let i=0;i<r*12;i++){const a=i/(r*12)*Math.PI*2;instance('court',paver,paverMat,-3.8+Math.cos(a)*r*.45,.023,1.9+Math.sin(a)*r*.45,.6,1,.6,a,'#cbc2a0');}
 const glow=new THREE.MeshStandardMaterial({color:'#ffe6ad',emissive:'#ffb54d',emissiveIntensity:.6,roughness:.5});const lamps=[];
 // Soft additive halo so lanterns read at a distance; brightened at dusk.
 const haloCanvas=document.createElement('canvas');haloCanvas.width=haloCanvas.height=64;{const g=haloCanvas.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,214,150,1)');r.addColorStop(.25,'rgba(255,170,80,.45)');r.addColorStop(1,'rgba(255,140,50,0)');g.fillStyle=r;g.fillRect(0,0,64,64);}
 const haloTex=new THREE.CanvasTexture(haloCanvas);haloTex.colorSpace=THREE.SRGBColorSpace;const haloMat=new THREE.SpriteMaterial({map:haloTex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:0,fog:false});
 const clay=mat('#8a4b2c'),cloth=mat('#a8322a',{side:THREE.DoubleSide});
 // Teak post on a stone footing, carved bracket, and a hanging lantern with clay rims under a small red cap.
 function lantern(x,z,y=2.2,side=1){box(x,y/2,z,.12,y,.12,wood);box(x,.06,z,.3,.12,.3,stone);box(x+side*.26,y-.02,z,.62,.08,.09,wood);
 const bx=x+side*.46;box(bx,y-.2,z,.012,.34,.012,dark);
 mesh(new THREE.CylinderGeometry(.22,.18,.44,10),glow,bx,y-.58,z);
 for(const dy of[-.24,.24])mesh(new THREE.CylinderGeometry(.235,.235,.04,10),clay,bx,y-.58+dy,z);
 const cap=mesh(new THREE.ConeGeometry(.3,.18,4),cloth,bx,y-.26,z);cap.rotation.y=Math.PI/4;
 box(bx,y-.9,z,.02,.14,.02,cloth);
 const halo=new THREE.Sprite(haloMat);halo.position.set(bx,y-.58,z);halo.scale.setScalar(2.2);scene.add(halo);
 const light=new THREE.PointLight('#ffc17a',0,8,2);light.position.set(bx,y-.55,z);scene.add(light);lamps.push(light);}
 for(const [x,z,side]of[[-2.3,-2.3,-1],[2.3,-2.3,1],[7.8,2.1,-1],[-6.3,1.8,1],[-2.8,7.8,1]])lantern(x,z,2.2,side);
 const indoor=new THREE.PointLight('#ffbf73',14,10,2);indoor.position.set(0,2.5,-6.8);scene.add(indoor);
 function barrel(x,z,s=1){mesh(new THREE.CylinderGeometry(.38*s,.32*s,.83*s,14),wood,x,.42*s,z);for(const y of[.13,.66])mesh(new THREE.CylinderGeometry(.385*s,.385*s,.045*s,14),dark,x,y*s,z);for(let i=0;i<5;i++)box(x+(i-2)*.13*s,.85*s,z,.018,.018,.58*s,dark);}
 for(const[x,z,s]of[[-5.7,-2,1],[-6.4,-2.2,.9],[-5.8,-3.1,.7],[6.4,-3,.8],[7.2,-3.3,1]])barrel(x,z,s);
 // Cloth-covered tea stall, baskets and produce on the west edge.
 box(-7,.83,6,2.1,.13,1.2,wood);for(const x of[-7.9,-6.1])for(const z of[5.5,6.5])box(x,.4,z,.09,.8,.09,dark);
 const fabric=mat('#326b70',{side:THREE.DoubleSide});box(-7,.91,6,1.65,.02,1.1,fabric);
 const fruit=new THREE.SphereGeometry(.1,7,5);for(let i=0;i<28;i++)instance('fruit',fruit,mat('#c69a3f'),-7.7+rand()*1.4,1+rand()*.08,5.6+rand()*.7,1,1,1,0,['#cca957','#c6713c','#85a05e'][i%3]);
 // Timber practice target, with woven rings catching the attack flash.
 box(5.5,.78,4.5,.16,1.55,.16,wood);box(5.5,1.15,4.5,1.35,.12,.12,wood);
 const target=mesh(new THREE.CylinderGeometry(.38,.38,.23,20),mat('#b79559'),5.5,1.38,4.5,true);target.rotation.x=Math.PI/2;
 for(const r of[.12,.23,.34]){const ring=mesh(new THREE.TorusGeometry(r,.018,4,24),dark,5.5,1.38,4.63);}
 // River and irregular stone embankment. The walkable edge matches the collision bounds.
 const water=new THREE.ShaderMaterial({uniforms:{time:{value:0},night:{value:0}},vertexShader:`varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform float time,night;varying vec3 p;void main(){float w=sin(p.x*6.+p.y*2.+time*.9)*sin(p.y*8.-time*.6);float fine=pow(max(0.,sin(p.x*31.+sin(p.y*7.)+time)*sin(p.y*27.-time)),12.);vec3 c=mix(vec3(.14,.39,.40),vec3(.28,.59,.57),w*.5+.5);c+=fine*.40;c*=mix(1.,.33,night);gl_FragColor=vec4(c,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const river=mesh(new THREE.PlaneGeometry(20,80,1,1),water,20,-.28,-10,true);river.rotation.x=-Math.PI/2;river.castShadow=false;
 // Reflective river (Cinematic mode): a mirrored render of the scene, rippled and tinted with the water colour.
 // Performance mode shows the plain animated water above instead.
 const mirrorShader={name:'RiverReflection',uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null},time:{value:0},night:{value:0}},
 vertexShader:`uniform mat4 textureMatrix;varying vec4 vUv;varying vec3 p;void main(){p=position;vUv=textureMatrix*vec4(position,1.);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform sampler2D tDiffuse;uniform float time,night;varying vec4 vUv;varying vec3 p;void main(){float w=sin(p.x*6.+p.y*2.+time*.9)*sin(p.y*8.-time*.6);
 vec4 uv=vUv;uv.xy+=vec2(sin(p.y*3.1+time*1.3),cos(p.x*2.7+time*1.1))*.012*uv.w;vec3 refl=texture2DProj(tDiffuse,uv).rgb;
 vec3 base=mix(vec3(.018,.055,.045),vec3(.04,.095,.08),w*.5+.5)*mix(1.,.35,night);
 float fine=pow(max(0.,sin((p.x+p.y)*9.+time*1.4+sin(p.y*1.7))*sin((p.x-p.y*1.3)*7.-time)),18.);
 gl_FragColor=vec4(base+refl*vec3(.12,.16,.15)+fine*.05*mix(1.,.4,night),1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`};
 const mirror=new Reflector(new THREE.PlaneGeometry(20,80),{textureWidth:1024,textureHeight:1024,clipBias:.003,multisample:0,shader:mirrorShader});
 mirror.position.set(20,-.279,-10);mirror.rotation.x=-Math.PI/2;scene.add(mirror);river.visible=false;
 const rock=new THREE.DodecahedronGeometry(1,0),rockMat=mat('#a4a184');
 for(let z=-20;z<25;z+=.52){instance('bank',rock,rockMat,10.2+rand()*.15,-.12,z,.45+rand()*.3,.4+rand()*.2,.4,rand()*6,['#797f6b','#a5a88d','#bec0a1'][Math.floor(rand()*3)]);}
 // Mooring platform and rope bollards.
 for(let i=0;i<16;i++)box(10.7+i*.22,.03,1,.21,.14,3.2,wood);
 for(const x of[10.8,13.8])for(const z of[-.5,2.5]){mesh(new THREE.CylinderGeometry(.1,.13,1,8),dark,x,.18,z);}
 // Lush canopy texture is original canvas artwork, instanced as crossed leaf clusters.
 const leafCanvas=document.createElement('canvas');leafCanvas.width=leafCanvas.height=128;const ctx=leafCanvas.getContext('2d');
 for(let i=0;i<75;i++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*48,x=64+Math.cos(a)*r,y=64+Math.sin(a)*r;ctx.fillStyle=['#416944','#618249','#7b9552','#95aa66'][i%4];ctx.beginPath();ctx.ellipse(x,y,4+rand()*7,2+rand()*4,a,0,7);ctx.fill();}
 const leafTex=new THREE.CanvasTexture(leafCanvas);leafTex.colorSpace=THREE.SRGBColorSpace;const leafMat=mat('#ffffff',{map:leafTex,alphaTest:.4,side:THREE.DoubleSide});
 const leafGeo=new THREE.PlaneGeometry(1,1);const branchGeo=new THREE.CylinderGeometry(.085,.13,1,7);
 function tree(x,z,size=1){mesh(new THREE.CylinderGeometry(.13*size,.26*size,3.1*size,9),wood,x,1.5*size,z);
 for(let i=0;i<6;i++){const a=i*1.047;const b=mesh(branchGeo,wood,x+Math.cos(a)*.38*size,2.25*size,z+Math.sin(a)*.38*size);b.scale.set(size,1.2*size,size);b.rotation.z=Math.cos(a)*.5;b.rotation.x=Math.sin(a)*.5;}
 for(let i=0;i<65;i++){const a=rand()*7,r=Math.sqrt(rand())*1.6*size,y=(2.6+rand()*1.8)*size;instance('leaves',leafGeo,leafMat,x+Math.cos(a)*r,y,z+Math.sin(a)*r,1.35*size,1.35*size,1,rand()*7,null,rand()*2-.7);}}
 for(const[x,z,s]of[[-9,1,1.15],[-8,-8,1.3],[7,-7,1.1],[8,-1,1],[-6,9,1.15],[7,10,1.25],[-13,-5,1.5],[-12,7,1.3],[-3,-13,1.1],[5,-13,1.2],[-12,-13,1.4],[0,-17,1.6],[10,-15,1.4]])tree(x,z,s);
 // Ground plants stay off the circulation paths.
 const bladeGeo=new THREE.BufferGeometry();bladeGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.05,0,0,.05,0,0,.04,.35,.06,.05,0,0,-.05,0,0,.04,.35,.06],3));bladeGeo.setAttribute('normal',new THREE.Float32BufferAttribute([0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0],3));const bladeMat=mat('#688a46');
 // Grass sways with a gentle wind: blade tips move, roots stay put, and each blade's phase comes from its position.
 const wind={value:0};bladeMat.onBeforeCompile=sh=>{sh.uniforms.windTime=wind;sh.vertexShader='uniform float windTime;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\nvec3 root=instanceMatrix[3].xyz;\n#else\nvec3 root=vec3(0.);\n#endif\nfloat bend=position.y/.35;transformed.x+=sin(windTime*1.7+root.x*.8+root.z*.6)*.07*bend;transformed.z+=cos(windTime*1.3+root.z*.9)*.04*bend;');};
 for(let i=0;i<1800;i++){const x=-12+rand()*22,z=-11+rand()*23;if((Math.abs(x)<2.2&&z>-3.4)||(Math.abs(x)<5.4&&z< -2.4)||(z>.1&&z<7&&x>-8&&x<8))continue;instance('grass',bladeGeo,bladeMat,x,0,z,.7+rand(),.4+rand()*.7,1,rand()*7,['#769b50','#8a9c52','#577942'][i%3]);if(i%6===0)instance('flowers',new THREE.SphereGeometry(.045,5,4),mat('#e9d999'),x,.2,z,1,1,1);}
 for(let i=0;i<70;i++){const x=-11+rand()*20,z=-11+rand()*22;if(Math.abs(x)<5.5&&z<0||Math.abs(x)<8&&z<7&&z>0)continue;instance('stones',rock,rockMat,x,.03,z,.12+rand()*.24,.12,.12+rand()*.2,rand()*6);}
 // Garden gate: a destination hint, not an unimplemented walk-through exit.
 for(const x of[-11,-9]){box(x,1.0,-3,.42,2,.5,stone);box(x,2.03,-3,.62,.14,.7,stone);}
 for(let i=0;i<9;i++)box(-10.8+i*.2,.68,-3,.075,1.3,.08,wood);box(-10,.5,-3,1.9,.10,.10,wood);box(-10,1.1,-3,1.9,.10,.10,wood);
 flush();
 const gltf=await new GLTFLoader().loadAsync('/assets/merchant-pavilion.glb');const pavilion=gltf.scene;pavilion.position.set(0,0,-7);const roof=[],shell=[];
 pavilion.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.userData.visibilityRole==='Roof'||o.name.startsWith('Roof'))roof.push(o);if(o.userData.visibilityRole==='Shell'||o.name.startsWith('Shell'))shell.push(o);}});scene.add(pavilion);
 const hemi=new THREE.HemisphereLight('#cee5dd','#566047',1.6);scene.add(hemi);
 const sun=new THREE.DirectionalLight('#ffe1a3',3.2);sun.position.set(-12,19,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-19,right:19,top:19,bottom:-19,near:.5,far:70});sun.shadow.bias=-.00025;sun.shadow.normalBias=.035;scene.add(sun);
 scene.background=new THREE.Color('#9cbaa4');scene.fog=new THREE.Fog('#9cbaa4',50,100);
 const dustGeo=new THREE.BufferGeometry();const dust=new Float32Array(180*3);for(let i=0;i<180;i++){dust[i*3]=-10+rand()*20;dust[i*3+1]=.3+rand()*4;dust[i*3+2]=-10+rand()*21;}dustGeo.setAttribute('position',new THREE.BufferAttribute(dust,3));const dustMat=new THREE.PointsMaterial({color:'#ffe6ae',size:.04,transparent:true,opacity:.55,depthWrite:false});const motes=new THREE.Points(dustGeo,dustMat);scene.add(motes);
 let night=0,goal=0;return{target,roof,lamps,setReflections(on){mirror.visible=on;river.visible=!on;},setEvening(v){goal=v?1:0;},update(dt,time,inRoom){night=THREE.MathUtils.damp(night,goal,2,dt);water.uniforms.time.value=time;water.uniforms.night.value=night;hemi.intensity=THREE.MathUtils.lerp(1.6,.5,night);sun.intensity=THREE.MathUtils.lerp(3.2,.48,night);sun.color.set('#ffe1a3').lerp(new THREE.Color('#96adcf'),night);scene.background.set('#9cbaa4').lerp(new THREE.Color('#253f50'),night);scene.fog.color.copy(scene.background);wind.value=time;mirror.material.uniforms.time.value=time;mirror.material.uniforms.night.value=night;lamps.forEach((l,i)=>l.intensity=THREE.MathUtils.lerp(2,25,night)*(.93+.05*Math.sin(time*8.3+i*2.1)+.03*Math.sin(time*21.7+i*5.3)));glow.emissiveIntensity=THREE.MathUtils.lerp(1.2,5.5,night);haloMat.opacity=THREE.MathUtils.lerp(.2,1,night);dustMat.opacity=.35+night*.55;dustMat.size=.04+night*.05;motes.position.x=Math.sin(time*.12)*.25;motes.position.y=Math.sin(time*.4)*.12;
 for(const o of roof)o.visible=!inRoom;for(const o of shell)o.visible=!inRoom;},dispose(){mirror.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of(Array.isArray(o.material)?o.material:[o.material])){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();}});}};
}
