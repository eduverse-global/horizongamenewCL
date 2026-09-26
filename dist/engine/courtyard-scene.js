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
 // Stylised water shared by both modes: turquoise shallows deepening to blue away from the bank, animated caustic
 // cells, a foam line at the shore and twinkling glints. Local plane coords: the bank is at p.x=-10, world z=-10-p.y.
 const waterCore=`uniform float time,night;varying vec3 p;
 vec2 h2(vec2 q){q=vec2(dot(q,vec2(127.1,311.7)),dot(q,vec2(269.5,183.3)));return fract(sin(q)*43758.5453);}
 float cells(vec2 x,float t){vec2 n=floor(x),f=fract(x);float a=8.,b=8.;for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(float(i),float(j));vec2 o=.5+.5*sin(t+6.2831*h2(n+g));vec2 r=g+o-f;float d=dot(r,r);if(d<a){b=a;a=d;}else if(d<b)b=d;}return sqrt(b)-sqrt(a);}
 vec3 waterColor(out float depth){float shore=p.x+10.+sin(p.y*.9+time*.3)*.25;depth=smoothstep(.1,3.2,shore);
  vec3 c=mix(vec3(.035,.30,.32),vec3(.008,.06,.19),depth);
  float k=1.-smoothstep(0.,.16,cells(p.xy*vec2(.85,.6),time*.55)),k2=1.-smoothstep(0.,.12,cells(p.xy*1.7+3.1,time*.8+1.));
  c+=(k*.35+k2*.18)*mix(.28,.035,depth)*vec3(.55,1.,.9);
  // Broad wind streaks darken and lighten the deep water.
  c*=.86+.28*smoothstep(-.6,1.,sin(p.x*1.1+sin(p.y*.35+time*.2)*2.+p.y*.45+time*.6))*depth;
  float foam=smoothstep(.7,.05,shore+sin(p.y*4.+time*1.3)*.1+(h2(floor(p.xy*6.)).x-.5)*.25);c=mix(c,vec3(.85,.97,.95),foam*.75);
  vec2 cell=floor(p.xy*4.5);vec2 hp=h2(cell);vec2 fp=fract(p.xy*4.5)-hp;float band=.4+.6*smoothstep(.3,1.,sin(p.x*.35-p.y*.22+time*.15)*.5+.5);
  float tw=step(.6,hp.y)*pow(max(0.,sin(time*2.6+hp.x*60.)),16.)*smoothstep(.09,0.,length(fp))*band*smoothstep(.5,3.,shore);
  c*=mix(1.,.32,night);return c+tw*vec3(2.2,2.3,2.1)*mix(1.,.5,night);}`;
 const water=new THREE.ShaderMaterial({uniforms:{time:{value:0},night:{value:0}},vertexShader:`varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:waterCore+`void main(){float depth;gl_FragColor=vec4(waterColor(depth),1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const river=mesh(new THREE.PlaneGeometry(20,80,1,1),water,20,-.28,-10,true);river.rotation.x=-Math.PI/2;river.castShadow=false;
 // Reflective river (Cinematic mode): the same water plus a rippled mirrored render of the scene, stronger in deep water.
 const mirrorShader={name:'RiverReflection',uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null},time:{value:0},night:{value:0}},
 vertexShader:`uniform mat4 textureMatrix;varying vec4 vUv;varying vec3 p;void main(){p=position;vUv=textureMatrix*vec4(position,1.);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform sampler2D tDiffuse;varying vec4 vUv;`+waterCore+`void main(){float depth;vec3 c=waterColor(depth);
 vec4 uv=vUv;uv.xy+=vec2(sin(p.y*3.1+time*1.3),cos(p.x*2.7+time*1.1))*.01*uv.w;vec3 refl=texture2DProj(tDiffuse,uv).rgb;
 gl_FragColor=vec4(c+refl*vec3(.16,.2,.24)*mix(.55,1.,depth),1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`};
 const mirror=new Reflector(new THREE.PlaneGeometry(20,80),{textureWidth:1024,textureHeight:1024,clipBias:.003,multisample:0,shader:mirrorShader});
 mirror.position.set(20,-.279,-10);mirror.rotation.x=-Math.PI/2;scene.add(mirror);river.visible=false;
 // Lily pads (notched discs, a few with pink blossoms) in the shallows, and reed clumps with cattail heads along the bank,
 // kept clear of the landing.
 const padGeo=new THREE.CircleGeometry(.32,14,.35,5.7);padGeo.rotateX(-Math.PI/2);const padMat=mat('#4f8f3a',{side:THREE.DoubleSide});
 const bloom=new THREE.SphereGeometry(.08,7,5),bloomMat=mat('#f3a6c0',{emissive:'#6a2a3a',emissiveIntensity:.3});
 for(let i=0;i<46;i++){const z=-12+rand()*24;if(z>-1.2&&z<3.2)continue;const x=10.7+Math.pow(rand(),1.6)*2.6,sc=.6+rand()*.7;
  instance('lily',padGeo,padMat,x,-.265,z,sc,1,sc,rand()*7,['#4f8f3a','#5f9d44','#3f7c33'][i%3]);if(i%6===0)instance('bloom',bloom,bloomMat,x+.05,-.2,z,1,.7,1);}
 const reedGeo=new THREE.CylinderGeometry(.018,.026,1,4);reedGeo.translate(0,.5,0);const reedMat=mat('#6f8f3e'),headGeo=new THREE.CylinderGeometry(.045,.045,.22,6),headMat=mat('#6a4020');
 for(let c=0;c<9;c++){const z0=[-9,-6.8,-4.6,-2.4,3.8,5.6,7.4,9.2,-11][c],x0=10.35+rand()*.5;for(let r=0;r<7;r++){const x=x0+(rand()-.5)*.5,z=z0+(rand()-.5)*.7,h=.9+rand()*.8,lean=(rand()-.5)*.25;
  instance('reed',reedGeo,reedMat,x,-.28,z,1,h,1,rand()*7,['#6f8f3e','#7d9c45','#5c7a33'][r%3],lean);if(r%2===0)instance('cattail',headGeo,headMat,x+Math.sin(lean)*-h*.0,-.28+h*.92,z,1,1,1);}}
 const rock=new THREE.DodecahedronGeometry(1,0),rockMat=mat('#a4a184');
 for(let z=-20;z<25;z+=.52){if(z>-.8&&z<2.8)continue;instance('bank',rock,rockMat,10.2+rand()*.15,-.12,z,.45+rand()*.3,.4+rand()*.2,.4,rand()*6,['#797f6b','#a5a88d','#bec0a1'][Math.floor(rand()*3)]);}
 // Mooring platform and rope bollards.
 for(let i=0;i<22;i++)box(9.4+i*.22,.03,1,.21,.14,3.2,wood);for(const z of[-.45,2.45])box(11.75,-.12,z,4.8,.16,.16,dark);
 for(const x of[10.8,13.8])for(const z of[-.5,2.5]){mesh(new THREE.CylinderGeometry(.1,.13,1,8),dark,x,.18,z);}
 // The captain's junk, moored along the north side of the landing, after Siamese and Chinese trading junks of the 1680s:
 // a flat-transom hull with sheer and a painted bow eye, rails, a planked deck, a stern castle with an arched roof over
 // the transom and rudder, a thatched deck shelter, cargo jars, a windlass and wooden anchor, and unstayed masts with
 // cambered, battened lug sails of matting whose sheets fan down to the stern. Mae Im's jasmine hangs at the bow.
 {const L=10,B=2.8,H=1.3,X=15.8,Z=-2.4,Y=-.23,sheer=u=>1.05*(1-u)**3+.5*u*u,deck=u=>Y+H/2+sheer(u),at=u=>X-L/2+u*L;
  const beam=u=>.6+.4*Math.sin(Math.PI*Math.min(1,Math.max(0,u*1.04-.02)))**.5,half=u=>B/2*beam(u);
  const hullGeo=new THREE.BoxGeometry(L,H,B,30,4,8),pos=hullGeo.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),u=x/L+.5,t=y/H+.5;
   pos.setXYZ(i,x,y+t*sheer(u)+(1-t)*.3*(2*u-1)**2,z*beam(u)*(.5+.5*t));}
  hullGeo.computeVertexNormals();
  const paint=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;};
  // Sides: tarred planking with butt joints, two wales, red and cream bands under the rail, the bow eye, and a dark,
  // weedy wet band at the waterline. The far side is mirrored so the eye is at the bow on both.
  const sideTex=paint(1024,128,(c,w,h)=>{c.fillStyle='#3a2a1c';c.fillRect(0,0,w,h);let r=1685;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
   for(let y=24;y<h;y+=9){c.fillStyle='#2a1d13';c.fillRect(0,y,w,1);for(let x=rnd()*120;x<w;x+=90+rnd()*140)c.fillRect(x,y-8,1,8);c.fillStyle=`rgba(${80+rnd()*30},${58+rnd()*20},${36},.18)`;c.fillRect(0,y+1,w,7);}
   c.fillStyle='#231810';c.fillRect(0,34,w,5);c.fillRect(0,52,w,4);
   c.fillStyle='#8f2a1c';c.fillRect(0,0,w,15);c.fillStyle='#e2d4b0';c.fillRect(0,15,w,4);c.fillStyle='#8f2a1c';c.fillRect(0,19,w,3);
   for(let x=20;x<w;x+=46){c.fillStyle='#d9b56b';c.fillRect(x,5,10,5);}
   c.fillStyle='#1e2418';c.fillRect(0,62,w,7);c.fillStyle='#2f3b25';for(let x=0;x<w;x+=3)c.fillRect(x,58+rnd()*6,2,4);
   c.fillStyle='#efe6cc';c.beginPath();c.ellipse(952,38,24,13,0,0,7);c.fill();c.fillStyle='#16110c';c.beginPath();c.arc(958,38,8,0,7);c.fill();c.fillStyle='#8f2a1c';c.lineWidth=3;c.strokeStyle='#8f2a1c';c.beginPath();c.ellipse(952,38,26,15,0,0,7);c.stroke();});
  const farTex=sideTex.clone();farTex.wrapS=THREE.RepeatWrapping;farTex.repeat.x=-1;farTex.needsUpdate=true;
  // Deck: planks running fore and aft, worn in the middle.
  const deckTex=paint(512,128,(c,w,h)=>{c.fillStyle='#8a6a45';c.fillRect(0,0,w,h);let r=7;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
   for(let y=0;y<h;y+=8){c.fillStyle=`rgba(${120+rnd()*40},${90+rnd()*30},${55+rnd()*20},.5)`;c.fillRect(0,y,w,7);c.fillStyle='#4d3822';c.fillRect(0,y+7,w,1);for(let x=rnd()*80;x<w;x+=60+rnd()*90)c.fillRect(x,y,1,7);}
   const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(40,28,16,.35)');g.addColorStop(.5,'rgba(255,240,210,.08)');g.addColorStop(1,'rgba(40,28,16,.35)');c.fillStyle=g;c.fillRect(0,0,w,h);});
  const red=mat('#8f2a1c'),white=mat('#ffffff',{map:sideTex}),transom=paint(64,64,(c)=>{c.fillStyle='#7d2418';c.fillRect(0,0,64,64);c.fillStyle='#d9b56b';c.fillRect(0,8,64,4);c.fillRect(0,50,64,3);c.strokeStyle='#d9b56b';c.lineWidth=2;c.beginPath();c.arc(32,31,11,0,7);c.stroke();c.beginPath();c.arc(32,31,5,0,7);c.stroke();});
  const hull=mesh(hullGeo,[mat('#ffffff',{map:transom}),red,mat('#ffffff',{map:deckTex}),dark,white,mat('#ffffff',{map:farTex})],X,Y,Z,true);hull.receiveShadow=true;
  const tube=(pts,r,m,seg=24)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))),seg,r,5),m,0,0,0);
  const up=new THREE.Vector3(0,1,0);
  function line(a,b,r,m){const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),g=new THREE.CylinderGeometry(r,r,A.distanceTo(Bv),5);g.rotateX(Math.PI/2);g.applyMatrix4(new THREE.Matrix4().lookAt(A,Bv,up));const m2=A.clone().add(Bv).multiplyScalar(.5);return mesh(g,m,m2.x,m2.y,m2.z);}
  // Rails along both sides, on turned posts.
  const railMat=mat('#5a3a22');
  for(const side of[-1,1]){const pts=[];for(let k=0;k<=16;k++){const u=.03+k*.94/16;pts.push([at(u),deck(u)+.28,Z+side*(half(u)-.05)]);}tube(pts,.035,railMat,40);
   for(let k=0;k<=16;k+=2){const u=.03+k*.94/16;mesh(new THREE.BoxGeometry(.06,.3,.06),railMat,at(u),deck(u)+.14,Z+side*(half(u)-.05));}}
  // Stern castle: panelled walls with lattice windows under an arched roof, a railed gallery, the rudder and its tiller.
  const castleU=.1,cx=at(castleU),cy=deck(castleU),walls=paint(128,64,(c)=>{c.fillStyle='#7d2a1c';c.fillRect(0,0,128,64);c.fillStyle='#d9b56b';c.fillRect(0,0,128,4);c.fillRect(0,60,128,4);
   for(const x of[14,52,90]){c.fillStyle='#1c130c';c.fillRect(x,18,24,26);c.strokeStyle='#d9b56b';c.lineWidth=2;c.strokeRect(x,18,24,26);c.beginPath();c.moveTo(x+12,18);c.lineTo(x+12,44);c.moveTo(x,31);c.lineTo(x+24,31);c.stroke();}});
  mesh(new THREE.BoxGeometry(1.7,1,2.1),mat('#ffffff',{map:walls}),cx,cy+.5,Z);
  const roofTex=paint(64,64,(c)=>{c.fillStyle='#3b2a1a';c.fillRect(0,0,64,64);for(let x=0;x<64;x+=4){c.fillStyle=x%8?'#4a3522':'#2e2014';c.fillRect(x,0,3,64);}});roofTex.wrapS=roofTex.wrapT=THREE.RepeatWrapping;roofTex.repeat.set(4,2);
  const roof=new THREE.CylinderGeometry(1.25,1.25,2.1,14,1,true,0,Math.PI);roof.rotateZ(Math.PI/2);roof.scale(1,.45,1);mesh(roof,mat('#ffffff',{map:roofTex,side:THREE.DoubleSide}),cx-.05,cy+1,Z);
  mesh(new THREE.BoxGeometry(2.1,.08,2.5),dark,cx-.05,cy+1.02,Z);
  const stern=at(0);mesh(new THREE.BoxGeometry(.08,.34,2.1),railMat,stern-.25,deck(0)+.2,Z);
  const rudder=new THREE.Shape([new THREE.Vector2(0,0),new THREE.Vector2(-1.1,-.2),new THREE.Vector2(-1.2,-1.4),new THREE.Vector2(-.2,-1.5),new THREE.Vector2(0,-1.2)]);
  const blade=new THREE.ExtrudeGeometry(rudder,{depth:.1,bevelEnabled:false});blade.translate(0,0,-.05);mesh(blade,dark,stern+.35,deck(0)-.1,Z);
  mesh(new THREE.CylinderGeometry(.08,.08,2.2,6),dark,stern+.2,deck(0)-.2,Z);line([stern+.2,deck(0)+.8,Z],[cx+1.2,cy+.75,Z],.04,dark);
  // Thatched shelter amidships over the hatch, on four posts.
  const thatch=paint(64,64,(c)=>{c.fillStyle='#8c6b3a';c.fillRect(0,0,64,64);let r=3;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;for(let i=0;i<260;i++){c.fillStyle=['#a5824a','#6e5230','#b8935a'][i%3];c.fillRect(rnd()*64,rnd()*64,1,4+rnd()*6);}for(let y=0;y<64;y+=10){c.fillStyle='#5c4428';c.fillRect(0,y,64,1);}});thatch.wrapS=thatch.wrapT=THREE.RepeatWrapping;thatch.repeat.set(3,2);
  const su=.36,sx=at(su),sy=deck(su);const shelter=new THREE.CylinderGeometry(1.05,1.05,2,14,1,true,0,Math.PI);shelter.rotateZ(Math.PI/2);shelter.scale(1,.55,1);mesh(shelter,mat('#ffffff',{map:thatch,side:THREE.DoubleSide}),sx,sy+.95,Z);
  for(const dx of[-.9,.9])for(const dz of[-.9,.9])mesh(new THREE.CylinderGeometry(.045,.05,1,6),railMat,sx+dx,sy+.5,Z+dz);
  mesh(new THREE.BoxGeometry(1.5,.18,1.2),mat('#5d4128'),sx,sy+.09,Z);
  // Cargo: glazed storage jars, lashed crates and a coil of rope.
  const jarGeo=new THREE.LatheGeometry([[0,0],[.16,0],[.24,.12],[.27,.3],[.22,.48],[.12,.56],[.13,.62],[0,.62]].map(([x,y])=>new THREE.Vector2(x,y)),12),jarMat=mat('#4a3020',{roughness:.35,metalness:.1});
  for(const[u,dz]of[[.5,-.7],[.53,-.25],[.5,.55],[.68,.7],[.71,.25]])mesh(jarGeo,jarMat,at(u),deck(u),Z+dz);
  for(const[u,dz,s2]of[[.62,-.75,.5],[.645,-.72,.4],[.74,-.5,.45]])mesh(new THREE.BoxGeometry(s2,s2*.8,s2),mat('#8a6a40'),at(u),deck(u)+s2*.4,Z+dz);
  const coil=new THREE.TorusGeometry(.22,.07,6,16);coil.rotateX(Math.PI/2);mesh(coil,mat('#8d7650'),at(.8),deck(.8)+.07,Z+.4);
  // Windlass and wooden anchor at the bow.
  const wx=at(.93),wy=deck(.93);const drum=new THREE.CylinderGeometry(.14,.14,1.6,10);drum.rotateX(Math.PI/2);mesh(drum,railMat,wx,wy+.35,Z);for(const dz of[-.85,.85])mesh(new THREE.BoxGeometry(.12,.5,.12),railMat,wx,wy+.25,Z+dz);
  const bow=at(1);mesh(new THREE.BoxGeometry(.1,1.4,.1),dark,bow+.18,deck(1)-.55,Z+1.05);mesh(new THREE.BoxGeometry(.5,.08,.08),dark,bow+.18,deck(1)-1.2,Z+1.05);line([wx,wy+.35,Z+.7],[bow+.18,deck(1)+.15,Z+1.05],.02,mat('#8d7650'));
  // Unstayed masts (the foremast raked forward).
  const mainU=.56,foreU=.86;mesh(new THREE.CylinderGeometry(.08,.13,9,8),dark,at(mainU),deck(mainU)+4.5,Z);
  const fore=new THREE.CylinderGeometry(.07,.11,6,8);fore.rotateZ(-.12);mesh(fore,dark,at(foreU)+.35,deck(foreU)+3,Z);
  // Lug sails: a curved sheet of matting between a boom and a yard that peaks aft, the leech bellied outward, and
  // bamboo battens across it; each second batten's sheet runs down to a block on the stern deck.
  const weave=paint(64,256,(c,w,h)=>{c.fillStyle='#b98a55';c.fillRect(0,0,w,h);let r=11;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;
   for(let x=0;x<w;x+=4){c.fillStyle=x%8?'#a8784a':'#c79a62';c.fillRect(x,0,2,h);}for(let y=0;y<h;y+=3){c.fillStyle='rgba(90,60,30,.18)';c.fillRect(0,y,w,1);}
   for(let k=0;k<7;k++){const y0=h*k/7,g=c.createLinearGradient(0,y0,0,y0+h/7);g.addColorStop(0,'rgba(255,235,190,.16)');g.addColorStop(1,'rgba(50,30,15,.3)');c.fillStyle=g;c.fillRect(0,y0,w,h/7);}
   for(let i=0;i<14;i++){c.fillStyle=`rgba(70,45,25,${.08+rnd()*.12})`;c.fillRect(rnd()*w,rnd()*h,6+rnd()*14,8+rnd()*20);}});
  const sailMat=mat('#ffffff',{map:weave,side:THREE.DoubleSide}),spar=mat('#6b5a3a'),sheetMat=mat('#8d7650');
  function lug(mx,foot,w,h,panels,belly){const F=[w*.28,0],A=[-w*.72,h*.06],Hd=[w*.2,h*.84],P=[-w*.8,h];
   const point=(u,v)=>{const rx=F[0]+(Hd[0]-F[0])*v,ry=F[1]+(Hd[1]-F[1])*v,lx=A[0]+(P[0]-A[0])*v-w*.12*Math.sin(Math.PI*v),ly=A[1]+(P[1]-A[1])*v;
    return[mx+rx+(lx-rx)*u,foot+ry+(ly-ry)*u,Z+.16+belly*Math.sin(Math.PI*u)*(.55+.45*Math.sin(Math.PI*v))];};
   const N=12,M=14,g=new THREE.BufferGeometry(),p=[],uv=[],idx=[];for(let j=0;j<=M;j++)for(let i=0;i<=N;i++){p.push(...point(i/N,j/M));uv.push(i/N,j/M);}
   for(let j=0;j<M;j++)for(let i=0;i<N;i++){const a2=j*(N+1)+i,b2=a2+1,c2=a2+N+1,d2=c2+1;idx.push(a2,b2,d2,a2,d2,c2);}
   g.setIndex(idx);g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();mesh(g,sailMat,0,0,0);
   for(let k=0;k<=panels;k++){const v=k/panels,pts=[];for(let i=0;i<=6;i++){const q=point(i/6,v);pts.push([q[0],q[1],q[2]+.03]);}tube(pts,k===0||k===panels?.06:.028,k===0||k===panels?spar:dark,12);
    if(k%2===0&&k<panels){const end=point(1,v);line(end,[at(.2),deck(.2)+.35,Z+.3],.012,sheetMat);}}
   const head=point(0,1);line([mx,head[1]+.5,Z+.02],[head[0],head[1],head[2]],.02,sheetMat);}
  lug(at(mainU),deck(mainU)+1.6,4.6,4.2,7,.35);lug(at(foreU)+.45,deck(foreU)+1.3,3,2.9,5,.25);
  const pennant=new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0,0),new THREE.Vector2(-1.3,-.2),new THREE.Vector2(0,-.45)]));mesh(pennant,mat('#b3261c',{side:THREE.DoubleSide}),at(mainU),deck(mainU)+9,Z);
  // Mooring lines to the landing's bollards, and the gangway down to the planks.
  const ropeMat=mat('#8d7650');for(const[u,bx]of[[.12,10.8],[.4,13.8]])line([at(u),deck(u)+.25,Z+half(u)],[bx,.66,-.5],.022,ropeMat);
  const gu=(13-at(0))/L,gy=deck(gu),gz=Z+half(gu),len=Math.hypot(gz- -.35,gy-.12),plank=new THREE.BoxGeometry(.62,.06,len);plank.rotateX(Math.atan2(gy-.12,gz- -.35));mesh(plank,wood,13,(gy+.12)/2,(gz-.35)/2);
  // Jasmine for Mae Ya Nang, the boat spirit, tied at the bow.
  const garland=new THREE.TorusGeometry(.2,.05,6,14);garland.rotateY(Math.PI/2);mesh(garland,mat('#f4f0e2',{emissive:'#403c30'}),bow-.05,deck(1)+.2,Z);
  // Foam where the hull meets the water.
  const foam=paint(256,64,(c,w,h)=>{c.clearRect(0,0,w,h);c.filter='blur(3px)';c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=5;c.beginPath();c.roundRect(14,12,w-28,h-24,20);c.stroke();});
  const ring=new THREE.Mesh(new THREE.PlaneGeometry(L+.5,B+.5),new THREE.MeshBasicMaterial({map:foam,transparent:true,opacity:.22,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.set(X,-.272,Z);scene.add(ring);
 }
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
