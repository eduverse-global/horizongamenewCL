import * as THREE from 'three';
import {createRuntime} from './runtime.js';
import {createCourtyard} from './courtyard-scene.js';
import {createActors} from './actors.js';
import {fresh,restore,move,nearest,act,route,POINTS} from './courtyard-state.js';
const $=id=>document.getElementById(id),keys=new Set(),saveKey='narai-courtyard-v1';
let lang='en',s=fresh();try{lang=localStorage.getItem('narai-language')==='th'?'th':'en';s=restore(JSON.parse(localStorage.getItem(saveKey)));}catch{}
const words={title:['The merchant’s courtyard','ลานเรือนพ่อค้า'],sea:['Return to sea','กลับสู่ทะเล'],day:['Daylight','กลางวัน'],night:['Evening','ยามเย็น'],quality:['Cinematic','ภาพเต็ม'],basic:['Performance','ภาพประหยัด'],controls:['WASD / arrows · Click to walk · E interact · Space strike','WASD / ลูกศร · คลิกเพื่อเดิน · E สำรวจ · Space โจมตี'],interact:['Explore · E','สำรวจ · E'],attack:['Practice strike','ฝึกโจมตี'],stats:['Scene statistics','ข้อมูลฉาก'],mara:['Mara · Navigator','มารา · ต้นหน'],ledger:['Merchant’s ledger','สมุดบันทึกพ่อค้า'],training:['Practice target','หุ่นฝึก'],gate:['Pilgrim’s gate','ประตูเส้นทางแสวงบุญ'],meet:['Speak to Mara by the courtyard.','พูดคุยกับมาราที่ลานเรือน'],ledgerQuest:['Enter the pavilion and inspect the ledger.','เข้าเรือนพ่อค้าและสำรวจสมุดบันทึก'],return:['Return to Mara with the route.','กลับไปหามาราพร้อมเส้นทาง'],complete:['A new journey awaits beyond the river.','การเดินทางครั้งใหม่รออยู่อีกฝั่งแม่น้ำ'],close:['Continue','ดำเนินต่อ'],accept:['I’ll find the ledger.','ข้าจะไปหาสมุดบันทึก'],share:['Share the route with the boatmen.','แบ่งปันเส้นทางกับคนเรือ'],keep:['Keep the route for our expedition.','เก็บเส้นทางไว้สำหรับคณะของเรา'],far:['Approach a character or landmark to interact.','เดินเข้าใกล้ตัวละครหรือสถานที่เพื่อสำรวจ'],strikeFar:['Move closer to the practice target.','เดินเข้าใกล้หุ่นฝึกก่อน'],saved:['Your choice has been saved.','บันทึกการตัดสินใจแล้ว'],context:['Graphics interrupted. Reload to restore the scene.','การแสดงผลขัดข้อง โปรดโหลดฉากใหม่'],gated:['The pilgrim route is a destination for the next chapter. This courtyard is the current playable area.','เส้นทางแสวงบุญเป็นจุดหมายในบทถัดไป ขณะนี้สามารถสำรวจได้ภายในลานเรือน'],hello:['The river carries more than cargo. A boatman left an old itinerary in the merchant’s pavilion. Will you find it? It may lead us to a sanctuary beyond the northern waterways.','แม่น้ำพัดพามามากกว่าสินค้า คนเรือคนหนึ่งฝากบันทึกเส้นทางไว้ในเรือนพ่อค้า เจ้าช่วยไปหาหน่อยได้หรือไม่ มันอาจนำเราไปสู่สถานที่ศักดิ์สิทธิ์ทางสายน้ำเหนือ'],read:['Between the trade accounts is a faded route: river landings, a garden gate, and a sanctuary in the hills. Bring this discovery to Mara.','ระหว่างบัญชีการค้า มีเส้นทางเลือนรางระบุท่าเรือ ประตูสวน และสถานที่ศักดิ์สิทธิ์บนเนินเขา จงนำเรื่องนี้ไปบอกมารา'],waiting:['The ledger is inside the pavilion. Follow the stone path through the open doorway.','สมุดบันทึกอยู่ในเรือนพ่อค้า เดินตามทางหินผ่านประตูเข้าไปได้เลย'],choice:['You found it. The boatmen could help us read these river marks. Shall we share the route, or keep it for our own expedition?','เจ้าพบแล้ว คนเรืออาจช่วยเราอ่านเครื่องหมายเหล่านี้ได้ เราจะแบ่งปันเส้นทาง หรือเก็บไว้สำหรับคณะของเราเอง'],shared:['The boatmen will prepare a guide for us. Our next voyage begins with an ally.','คนเรือจะเตรียมผู้นำทางให้เรา การเดินทางครั้งหน้าจะเริ่มต้นพร้อมมิตรสหาย'],kept:['Then we will study the waterways ourselves. Keep the itinerary safe until we sail.','ถ้าเช่นนั้น เราจะศึกษาเส้นทางด้วยตนเอง เก็บบันทึกไว้ให้ดีจนกว่าจะออกเรือ'],inspect:['Copy the route','คัดลอกเส้นทาง']};
const t=k=>words[k]?.[lang==='th'?1:0]??k;
let runtime,world,actors,evening=false,path=[],pending=null,time=0,attackAge=99,frames=0,elapsed=0,fps=0,raf,activeDialogue=null;
const dialog=$('dialogue'),canvas=$('scene');const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const markerButtons=new Map();let noticeTimer;
function notice(text){$('notice').textContent=text;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').textContent='',4000);}
function save(){try{localStorage.setItem(saveKey,JSON.stringify({quest:s.quest,choice:s.choice}));}catch{notice(lang==='th'?'ไม่สามารถบันทึกในเบราว์เซอร์นี้ได้':'Browser storage is unavailable.');}}
function labels(){document.documentElement.lang=lang;$('title').textContent=t('title');$('voyage').textContent=t('sea');$('language').textContent=lang==='en'?'ไทย':'EN';$('time').textContent=t(evening?'night':'day');$('quality').textContent=t(runtime?.enhanced?'quality':'basic');$('controls').textContent=t('controls');$('attack').textContent=t('attack');$('stats-label').textContent=t('stats');$('objective').textContent=t(s.quest==='ledger'?'ledgerQuest':s.quest);for(const[id,b]of markerButtons)b.textContent=t(id);if(activeDialogue)showDialogue(activeDialogue);}
function close(){dialog.close();activeDialogue=null;keys.clear();canvas.focus({preventScroll:true});}
function showDialogue(id){activeDialogue=id;keys.clear();path=[];pending=null;const person=id==='mara';$('portrait').hidden=!person;$('role').textContent=person?(lang==='th'?'ต้นหน · เรื่องเล่าริมแม่น้ำ':'NAVIGATOR · RIVER STORIES'):'NARAI';$('speaker').textContent=t(id);
 let text=id==='gate'?'gated':id==='ledger'?'read':s.quest==='meet'?'hello':s.quest==='ledger'?'waiting':s.quest==='return'?'choice':s.choice==='share'?'shared':'kept';$('speech').textContent=t(text);$('choices').replaceChildren();
 const option=(key,fn)=>{const b=document.createElement('button');b.textContent=t(key);b.onclick=fn;$('choices').append(b);};
 const commit=(choice)=>{if(act(s,id,choice)){save();labels();}close();};
 if(id==='mara'&&s.quest==='meet')option('accept',()=>commit());
 if(id==='ledger'&&s.quest==='ledger')option('inspect',()=>commit());
 if(id==='mara'&&s.quest==='return'){option('share',()=>commit('share'));option('keep',()=>commit('keep'));}
 option('close',close);if(!dialog.open)dialog.showModal();}
dialog.addEventListener('cancel',()=>{activeDialogue=null;keys.clear();});
function interact(){const n=nearest(s);if(n.distance>1.85){notice(t('far'));return;}if(n.id==='training')strike();else showDialogue(n.id);}
let effect,flash,sparks;let audio;
function strike(){if(dialog.open||attackAge<.65)return;const p=POINTS.find(p=>p.id==='training');if(Math.hypot(s.x-p.x,s.z-p.z)>2.8){notice(t('strikeFar'));return;}attackAge=0;path=[];s.facing=s.x>p.x?'left':'right';
 // Audio begins only on user interaction and remains a short, quiet impact cue.
 try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.type='triangle';osc.frequency.setValueAtTime(220,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(65,audio.currentTime+.13);gain.gain.setValueAtTime(.08,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.16);osc.connect(gain).connect(audio.destination);osc.start();osc.stop(audio.currentTime+.17);}catch{}
}
function approach(p){if(dialog.open)return;keys.clear();path=route(s,{x:p.x,z:p.z+.95});pending=p.id;}
$('language').onclick=()=>{lang=lang==='en'?'th':'en';try{localStorage.setItem('narai-language',lang);}catch{}labels();};
$('time').onclick=()=>{evening=!evening;world?.setEvening(evening);labels();};$('quality').onclick=()=>{runtime?.setQuality(!runtime.enhanced);labels();};$('interact').onclick=interact;$('attack').onclick=strike;$('reload').onclick=()=>location.reload();
function blocked(){return dialog.open||!world;}
addEventListener('keydown',e=>{if(blocked()||e.target.closest('button,a,summary'))return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','e'].includes(k)){e.preventDefault();if(!e.repeat){if(k==='e')interact();else if(k===' ')strike();}keys.add(k);}});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>{keys.clear();path=[];});document.addEventListener('visibilitychange',()=>{keys.clear();path=[];});
for(const b of document.querySelectorAll('[data-key]')){b.onpointerdown=e=>{e.preventDefault();if(blocked())return;b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.key);}
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),floor=new THREE.Plane(new THREE.Vector3(0,1,0),0);
canvas.addEventListener('pointerdown',e=>{if(blocked())return;canvas.focus();const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,runtime.camera);const hit=new THREE.Vector3();if(ray.ray.intersectPlane(floor,hit)){path=route(s,hit);pending=null;}});
try{
 runtime=createRuntime(canvas,()=>{$('load-text').textContent=t('context');$('reload').hidden=false;$('loading').hidden=false;});
 [world,actors]=await Promise.all([createCourtyard(runtime.scene),createActors(runtime.scene)]);
 for(const p of POINTS){const b=document.createElement('button');b.className='marker';b.onclick=()=>approach(p);markerButtons.set(p.id,b);$('markers').append(b);}
 effect=new THREE.Mesh(new THREE.TorusGeometry(.7,.035,8,48,Math.PI*1.5),new THREE.MeshBasicMaterial({color:'#ffd590',transparent:true,opacity:0,depthWrite:false}));effect.position.set(5.5,1.4,4.7);runtime.scene.add(effect);
 flash=new THREE.PointLight('#ffbd63',0,7,2);flash.position.set(5.5,1.7,5);runtime.scene.add(flash);
 const particles=new Float32Array(32*3);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(particles,3));sparks=new THREE.Points(geo,new THREE.PointsMaterial({color:'#ffd790',size:.07,transparent:true,opacity:0,depthWrite:false}));runtime.scene.add(sparks);
 runtime.camera.position.set(0,16,23);runtime.camera.lookAt(0,0,0);$('loading').hidden=true;labels();canvas.focus();
 let previous=performance.now(),accumulator=0;const center=new THREE.Vector3(0,0,0),desired=new THREE.Vector3(),projected=new THREE.Vector3();
 function frame(now){raf=requestAnimationFrame(frame);const dt=Math.min((now-previous)/1000,.05);previous=now;if(document.hidden)return;time+=dt;attackAge+=dt;let moving=false;
 if(!blocked()){accumulator+=dt;while(accumulator>=1/60){accumulator-=1/60;let dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),dz=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
 if(dx||dz){path=[];pending=null;}else if(path.length){const p=path[0];const x=p.x-s.x,z=p.z-s.z;if(Math.abs(x)<.055&&Math.abs(z)<.055)path.shift();else if(Math.abs(z)>.055)dz=Math.sign(z);else dx=Math.sign(x);}
 moving=move(s,dx,dz,1/60)||moving;
 if(!path.length&&pending){const p=POINTS.find(p=>p.id===pending);pending=null;if(Math.hypot(p.x-s.x,p.z-s.z)<1.85){if(p.id==='training')strike();else showDialogue(p.id);}}
 }}else accumulator=0;
 desired.set(THREE.MathUtils.clamp(s.x*.45,-3.8,3.8),0,THREE.MathUtils.clamp(s.z*.42,-4.5,2.7));center.lerp(desired,reduced?1:1-Math.exp(-dt*3.5));const distance=s.room?18:23;
 runtime.camera.position.lerp(new THREE.Vector3(center.x,s.room?12:16,center.z+distance),reduced?1:1-Math.exp(-dt*3));runtime.camera.lookAt(center.x,.3,center.z);
 actors.update(s,moving,time,runtime.camera);world.update(dt,time,s.room);
 const power=attackAge<.65?Math.sin(attackAge/.65*Math.PI):0;effect.material.opacity=power;effect.rotation.z=-attackAge*9;effect.scale.setScalar(.7+Math.min(attackAge,1)*1.5);flash.intensity=power*45;sparks.material.opacity=power;
 const positions=sparks.geometry.attributes.position;for(let i=0;i<32;i++){const a=i*2.4,r=attackAge<1?attackAge*2.6:0;positions.setXYZ(i,5.5+Math.cos(a)*r,1.4+Math.sin(a)*r-attackAge*attackAge,4.7+Math.sin(i)*r*.4);}positions.needsUpdate=true;
 const n=nearest(s);$('interact').textContent=n.distance<1.85?`${t(n.id)} · E`:t('interact');
 for(const p of POINTS){const b=markerButtons.get(p.id);const visible=p.id==='ledger'?s.room:!s.room;b.hidden=!visible;if(visible){projected.set(p.x,p.id==='ledger'?1.4:2.05,p.z).project(runtime.camera);b.style.left=`${(projected.x*.5+.5)*innerWidth}px`;b.style.top=`${(-projected.y*.5+.5)*innerHeight}px`;b.hidden=projected.z>1||Math.abs(projected.x)>.95||Math.abs(projected.y)>.83;b.classList.toggle('active',n.id===p.id&&n.distance<1.85);}}
 runtime.renderer.info.autoReset=false;runtime.renderer.info.reset();runtime.render({x:s.x,y:1,z:s.z});frames++;elapsed+=dt;
 if(elapsed>=1){fps=Math.round(frames/elapsed);frames=elapsed=0;$('stats').textContent=`${fps} fps · ${runtime.renderer.info.render.calls} draws\n${Math.round(runtime.renderer.info.render.triangles/1000)}k triangles\n${runtime.renderer.info.memory.textures} textures`;}
 }
 raf=requestAnimationFrame(frame);
 // Read-only inspection for local QA, without teleporting or modifying simulation.
 window.naraiCourtyard={snapshot:()=>({ready:true,position:{x:s.x,z:s.z},quest:s.quest,choice:s.choice,inside:s.room,evening,enhanced:runtime.enhanced,fps,drawCalls:runtime.renderer.info.render.calls})};
 addEventListener('pagehide',()=>{cancelAnimationFrame(raf);world.dispose();runtime.dispose();audio?.close();},{once:true});
}catch(error){console.error(error);$('load-text').textContent=lang==='th'?'โหลดฉากไม่สำเร็จ โปรดลองอีกครั้ง':'The courtyard could not load. Please try again.';$('reload').hidden=false;}
