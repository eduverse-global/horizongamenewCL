import * as THREE from 'three';
import {createRuntime} from './runtime.js';
import {createCourtyard} from './courtyard-scene.js';
import {createActors} from './actors.js';
import {fresh,restore,move,nearest,act,route,POINTS,approachRoute,faceToward,SOURCES} from './courtyard-state.js';
import {QUAY_CAST,OPENING,text as say} from '../data/narai-story.js';
// v2: the opening chapter replaced the ledger errand, so older saves start the new story from the beginning.
const $=id=>document.getElementById(id),keys=new Set(),saveKey='narai-courtyard-v2';
let lang='en',s=fresh();try{lang=localStorage.getItem('narai-language')==='th'?'th':'en';s=restore(JSON.parse(localStorage.getItem(saveKey)));}catch{}
const words={title:['The merchant’s courtyard','ลานเรือนพ่อค้า'],sea:['Return to sea','กลับสู่ทะเล'],day:['Daylight','กลางวัน'],night:['Evening','ยามเย็น'],quality:['Cinematic','ภาพเต็ม'],basic:['Performance','ภาพประหยัด'],controls:['WASD / arrows · Shift dash · Click to walk or talk · E interact · Wheel or +/− zoom · M marker','WASD / ลูกศร · Shift วิ่ง · คลิกเพื่อเดินหรือคุย · E สำรวจ · ล้อเมาส์หรือ +/− ซูม · M เครื่องหมาย'],interact:['Explore · E','สำรวจ · E'],attack:['Practice strike','ฝึกโจมตี'],stats:['Scene statistics','ข้อมูลฉาก'],official:['Khun Phithak Wari','ขุนพิทักษ์วารี'],merchant:['Tan Heng','ตันเฮง'],innkeeper:['Mae Im','แม่อิ่ม'],ledger:['Envoys’ manifest','บัญชีเรือราชทูต'],training:['Practice target','หุ่นฝึก'],gate:['Pilgrim’s gate','ประตูเส้นทางแสวงบุญ'],junk:['Your junk','สำเภาของท่าน'],captain:['The captain','นายสำเภา'],helmsman:['The helmsman','นายท้ายเรือ'],
 meet:['Report to Khun Phithak Wari in the trading court.','ไปรายงานตัวกับขุนพิทักษ์วารีที่ลานค้าขาย'],word:['Gather word of the envoys’ ship: Tan Heng, Mae Im and the manifest in the pavilion','สืบข่าวเรือราชทูต: ตันเฮง แม่อิ่ม และบัญชีเรือในเรือนพ่อค้า'],return:['Bring what you learned to Khun Phithak Wari.','นำข่าวที่ได้ไปบอกขุนพิทักษ์วารี'],complete:['Go aboard your junk at the end of the landing.','ขึ้นสำเภาของท่านที่ปลายท่าน้ำ'],
 close:['Continue','ดำเนินต่อ'],next:['Next ▸','ต่อไป ▸'],accept:['I’ll ask along the landing.','ข้าจะไปสืบถามตามท่าน้ำ'],board:['Go aboard (return to sea)','ขึ้นเรือ (กลับสู่ทะเล)'],stay:['Not yet','ยังก่อน'],skip:['Skip ▸▸','ข้าม ▸▸'],far:['Approach a character or landmark to interact.','เดินเข้าใกล้ตัวละครหรือสถานที่เพื่อสำรวจ'],strikeFar:['Move closer to the practice target.','เดินเข้าใกล้หุ่นฝึกก่อน'],context:['Graphics interrupted. Reload to restore the scene.','การแสดงผลขัดข้อง โปรดโหลดฉากใหม่'],gated:['The pilgrim route is a destination for the next chapter. This courtyard is the current playable area.','เส้นทางแสวงบุญเป็นจุดหมายในบทถัดไป ขณะนี้สามารถสำรวจได้ภายในลานเรือน'],
 waiting:['Tan Heng keeps his stall by the pavilion, Mae Im her lodge by the river, and the manifest lies inside the pavilion. Bring me whatever the river knows.','ตันเฮงอยู่ที่แผงค้าข้างเรือนพ่อค้า แม่อิ่มอยู่ที่เรือนพักริมน้ำ ส่วนบัญชีเรืออยู่ในเรือนพ่อค้า สายน้ำรู้อะไรก็นำมาบอกข้าเถิด'],manifest:['The envoys’ manifest, page after page of the King’s gifts. The last entry: “Transferred at Bantam to the French company’s ship, bound for the Cape of Good Hope.”','บัญชีเรือราชทูต เครื่องราชบรรณาการเรียงรายหลายหน้า รายการสุดท้าย: “ย้ายขึ้นเรือของบริษัทฝรั่งเศสที่เมืองบันตัม มุ่งหน้าไปแหลมกู๊ดโฮป”'],ledgers:['The Phra Khlang’s trade ledgers: sappanwood, deer hides and tin, weighed and counted.','สมุดบัญชีการค้าของพระคลัง ไม้ฝาง หนังกวาง และดีบุก ชั่งตวงนับไว้ครบถ้วน'],notReady:['The crew are still unloading. Khun Phithak Wari is waiting for you in the trading court.','ลูกเรือยังขนสินค้าลงไม่เสร็จ ขุนพิทักษ์วารีรอท่านอยู่ที่ลานค้าขาย'],notYet:['The crew are still at the markets. Finish your business ashore first.','ลูกเรือยังอยู่ที่ตลาด จัดการธุระบนฝั่งให้เสร็จก่อนเถิด']};
const t=k=>words[k]?.[lang==='th'?1:0]??k,W=k=>({en:words[k][0],th:words[k][1]});
const LENS=Math.tan(THREE.MathUtils.degToRad(20))/Math.tan(THREE.MathUtils.degToRad(14));let view=0,marker,showMarker=true,savedAt=0,runtime,world,actors,evening=false,path=[],pending=null,time=0,attackAge=99,frames=0,elapsed=0,fps=0,raf,conversation=null,cutscene=null,greeting=false,shot=null,snap=false,waits=[],walkDone=null;
const dialog=$('dialogue'),canvas=$('scene');const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const markerButtons=new Map();let noticeTimer;
function notice(text){$('notice').textContent=text;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('notice').textContent='',4000);}
function save(){try{localStorage.setItem(saveKey,JSON.stringify({quest:s.quest,word:s.word,choice:s.choice,opened:s.opened,x:s.x,z:s.z,facing:s.facing}));}catch{notice(lang==='th'?'ไม่สามารถบันทึกในเบราว์เซอร์นี้ได้':'Browser storage is unavailable.');}}
function labels(){document.documentElement.lang=lang;$('title').textContent=t('title');$('voyage').textContent=t('sea');$('language').textContent=lang==='en'?'ไทย':'EN';$('time').textContent=t(evening?'night':'day');$('quality').textContent=t(runtime?.enhanced?'quality':'basic');$('controls').textContent=t('controls');$('attack').textContent=t('attack');$('stats-label').textContent=t('stats');$('objective').textContent=t(s.quest)+(s.quest==='word'?` (${s.word.length}/${SOURCES.length}).`:'');$('skip').textContent=t('skip');for(const[id,b]of markerButtons)b.textContent=t(id);if(conversation)render();}
// Speakers map to the Horinzonnext quay cast and to their cell in the Gemini portrait atlas (captain is cell 0).
const CAST={official:['harbour_official',1,'KROM THA · ROYAL LANDING','กรมท่า · ท่าเรือหลวง'],merchant:['junk_merchant',2,'JUNK MERCHANT','พ่อค้าสำเภา'],innkeeper:['innkeeper',3,'RIVER LODGE','เรือนพักริมน้ำ']};
const visits={};
// Layered portraits: a cut-out character (day or dusk grade) over a backdrop for the current location and time of day;
// speakers without one fall back to their cell in the painted portrait atlas.
const LAYERED={official:'official',merchant:'merchant',innkeeper:'innkeeper',captain:'captain'},LOCATION='courtyard';
function portrait(cell,id){const el=$('portrait');
 if(LAYERED[id]){Object.assign(el.style,{backgroundImage:`url('/assets/portraits/${LAYERED[id]}${evening?'-evening':''}.png'),url('/assets/portraits/bg-${LOCATION}-${evening?'evening':'day'}.jpg')`,backgroundSize:'cover, cover',backgroundPosition:'50% 0, 50% 50%',imageRendering:'pixelated'});return;}
 Object.assign(el.style,{backgroundImage:'',imageRendering:''});
const w=el.clientWidth||210,h=el.clientHeight||250,size=Math.max(w,h);el.style.backgroundSize=`${4*size}px ${size}px`;el.style.backgroundPosition=`${-(cell*size+(size-w)/2)}px 0px`;}
// A conversation is a list of pages ({en, th}) from one speaker, ending in choices ({key, label}) or Continue.
// talk() resolves with the chosen key, or null when closed; the speaker turns to the captain while it lasts.
function talk(who,pages,choices=[]){if(conversation)finish(null);return new Promise(done=>{conversation={who,pages,choices,page:0,done};keys.clear();path=[];pending=null;render();if(!dialog.open)dialog.showModal();if(CAST[who])actors?.faceCaptain(who,s);});}
function render(){const c=conversation,cast=CAST[c.who];$('portrait').hidden=!cast&&c.who!=='captain';$('role').textContent=cast?cast[lang==='th'?3:2]:c.who==='captain'?(lang==='th'?'กองสำเภาหลวง':'ROYAL TRADE FLEET'):'NARAI';
 $('speaker').textContent=cast?say(QUAY_CAST[cast[0]].name,lang):t(c.who);$('speech').textContent=say(c.pages[c.page],lang);$('choices').replaceChildren();
 const option=(label,fn)=>{const b=document.createElement('button');b.textContent=say(label,lang);b.onclick=fn;$('choices').append(b);};
 if(c.page<c.pages.length-1)option(W('next'),()=>{c.page++;render();});else if(c.choices.length)for(const choice of c.choices)option(choice.label,()=>finish(choice.key));else option(W('close'),()=>finish(null));
 if(cast)portrait(cast[1],c.who);else if(c.who==='captain')portrait(0,'captain');$('choices').firstChild?.focus();}
function finish(key){const c=conversation;if(!c)return;conversation=null;if(CAST[c.who])actors?.release(c.who);if(dialog.open)dialog.close();keys.clear();canvas.focus({preventScroll:true});c.done(key);}
// Escape closes a conversation; during the cutscene it skips the rest of the scene.
dialog.addEventListener('cancel',e=>{e.preventDefault();if(cutscene)skip();else finish(null);});
const commit=(id,choice)=>{if(act(s,id,choice)){save();labels();return true;}return false;};
// The opening chapter's conversations. Tan Heng and Mae Im otherwise greet, then cycle their quay lines.
async function converse(id){
 if(id==='gate')return talk('gate',[W('gated')]);
 if(id==='junk'){if(s.quest!=='complete')return talk('helmsman',[W(s.quest==='meet'?'notReady':'notYet')]);
  if(await talk('helmsman',[QUAY_CAST.captain.board],[{key:'board',label:W('board')},{key:null,label:W('stay')}])==='board'){save();location.href=$('voyage').href;}return;}
 if(id==='ledger'){if(s.quest==='word'&&!s.word.includes('ledger')&&commit('ledger'))return talk('ledger',[OPENING.word.ledger]);return talk('ledger',[W(s.quest==='meet'?'ledgers':'manifest')]);}
 if(id==='official'){
  if(s.quest==='meet'){if(greeting)return;greeting=true;keys.clear();path=[];actors.faceCaptain('official',s);await actors.play('official','wai');greeting=false;if(await talk('official',OPENING.brief,[{key:'accept',label:W('accept')}])==='accept')commit('official');return;}
  if(s.quest==='word')return talk('official',[W('waiting')]);
  if(s.quest==='return'){const choice=await talk('official',OPENING.report,Object.entries(OPENING.choices).map(([key,c])=>({key,label:c.label})));
   if(choice&&commit('official',choice))await talk('official',[OPENING.choices[choice].reply,OPENING.sail]);return;}
  // After the chapter he talks shop: his quay lines in turn.
  visits.done=(visits.done??-1)+1;const lines=QUAY_CAST.harbour_official.lines;return talk('official',[lines[visits.done%lines.length]]);}
 if(CAST[id]){if(s.quest==='word'&&SOURCES.includes(id)&&!s.word.includes(id)&&commit(id))return talk(id,[OPENING.word[id]]);
  visits[id]=(visits[id]??-1)+1;const who=QUAY_CAST[CAST[id][0]];return talk(id,[visits[id]===0?who.greet:who.lines[(visits[id]-1)%who.lines.length]]);}
}
function interact(){if(cutscene)return;const n=nearest(s);if(n.distance>1.85){notice(t('far'));return;}if(n.id==='training')strike();else converse(n.id);}
// Cutscenes: small awaitable steps (pause, walk, talk) driven by the frame loop. Skipping resolves every step at once;
// the scene then applies its end state.
const pause=sec=>cutscene?.skipping?Promise.resolve():new Promise(r=>waits.push({end:time+sec,r}));
function walkTo(points){if(cutscene?.skipping){Object.assign(s,points.at(-1));return Promise.resolve();}path=points.map(p=>({...p}));pending=null;return new Promise(r=>walkDone=r);}
const line=entry=>cutscene?.skipping?Promise.resolve():talk(entry.who,[entry]);
function skip(){if(!cutscene||cutscene.skipping)return;cutscene.skipping=true;actors.stop();finish(null);path=[];for(const w of waits.splice(0))w.r();walkDone?.();walkDone=null;}
async function opening(){
 cutscene={skipping:false};document.body.classList.add('cutscene');$('skip').hidden=false;
 Object.assign(s,{x:13.3,z:.9,facing:'left',room:false,v:0});shot={x:10.6,z:.2,zoom:1};snap=true;
 // Title card: place, date and the first line over the landing.
 const card=$('card');card.querySelector('h2').textContent=say(OPENING.card.place,lang);card.querySelector('p').textContent=say(OPENING.card.date,lang);card.querySelector('em').textContent=say(OPENING.card.line,lang);
 card.classList.add('show');await pause(3.4);card.classList.remove('show');await pause(.8);
 await walkTo([{x:9.2,z:.9}]);s.facing='left';await pause(.35);
 const [maeIm,captain,official]=OPENING.arrival;
 actors.faceCaptain('innkeeper',s);faceToward(s,POINTS.find(p=>p.id==='innkeeper'));await pause(.3);if(!cutscene.skipping)await actors.play('innkeeper','garland');await line(maeIm);await line(captain);actors.release('innkeeper');
 shot={x:3.2,z:1.2,zoom:.45};actors.faceCaptain('official',s);await pause(1.1);faceToward(s,POINTS.find(p=>p.id==='official'));await line(official);actors.release('official');
 card.classList.remove('show');if(cutscene.skipping)Object.assign(s,{x:9.2,z:.9,facing:'left'});
 shot=null;cutscene=null;document.body.classList.remove('cutscene');$('skip').hidden=true;s.opened=true;save();labels();canvas.focus({preventScroll:true});}
let effect,flash,sparks;let audio;
function strike(){if(dialog.open||attackAge<.65)return;const p=POINTS.find(p=>p.id==='training');if(Math.hypot(s.x-p.x,s.z-p.z)>2.8){notice(t('strikeFar'));return;}attackAge=0;path=[];s.facing=s.x>p.x?'left':'right';
 // Audio begins only on user interaction and remains a short, quiet impact cue.
 try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.type='triangle';osc.frequency.setValueAtTime(220,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(65,audio.currentTime+.13);gain.gain.setValueAtTime(.08,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.16);osc.connect(gain).connect(audio.destination);osc.start();osc.stop(audio.currentTime+.17);}catch{}
}
function approach(p){if(blocked())return;keys.clear();path=approachRoute(s,p,!!CAST[p.id]);pending=p.id;}
$('language').onclick=()=>{lang=lang==='en'?'th':'en';try{localStorage.setItem('narai-language',lang);}catch{}labels();};
$('time').onclick=()=>{evening=!evening;world?.setEvening(evening);labels();};$('quality').onclick=()=>{runtime?.setQuality(!runtime.enhanced);world?.setReflections(runtime.enhanced);labels();};$('interact').onclick=interact;$('attack').onclick=strike;$('reload').onclick=()=>location.reload();$('skip').onclick=skip;
function blocked(){return dialog.open||!world||!!cutscene||greeting;}
addEventListener('keydown',e=>{if(cutscene&&e.key==='Escape'){skip();return;}if(blocked()||e.target.closest('button,a,summary'))return;const k=e.key.toLowerCase();if(k==='='||k==='+'||k==='-'){view=Math.min(1,Math.max(0,view+(k==='-'?-.25:.25)));return;}if(k==='shift'){keys.add(k);return;}if(k==='m'){showMarker=!showMarker;return;}if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','e'].includes(k)){e.preventDefault();if(!e.repeat){if(k==='e')interact();else if(k===' ')strike();}keys.add(k);}});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>{keys.clear();path=[];});document.addEventListener('visibilitychange',()=>{keys.clear();path=[];});
for(const b of document.querySelectorAll('[data-key]')){b.onpointerdown=e=>{e.preventDefault();if(blocked())return;b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.key);}
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),floor=new THREE.Plane(new THREE.Vector3(0,1,0),0);
canvas.addEventListener('wheel',e=>{e.preventDefault();view=Math.min(1,Math.max(0,view-e.deltaY*.0015));},{passive:false});
canvas.addEventListener('pointerdown',e=>{if(blocked())return;canvas.focus();const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,runtime.camera);const person=ray.intersectObjects(actors.npcs.map(n=>n.mesh),false)[0];if(person){approach(POINTS.find(p=>p.id===actors.npcs.find(n=>n.mesh===person.object).id));return;}const hit=new THREE.Vector3();if(ray.ray.intersectPlane(floor,hit)){path=route(s,hit);pending=null;}});
try{
 runtime=createRuntime(canvas,()=>{$('load-text').textContent=t('context');$('reload').hidden=false;$('loading').hidden=false;});
 [world,actors]=await Promise.all([createCourtyard(runtime.scene),createActors(runtime.scene)]);
 for(const p of POINTS){const b=document.createElement('button');b.className='marker';b.onclick=()=>approach(p);markerButtons.set(p.id,b);$('markers').append(b);}
 effect=new THREE.Mesh(new THREE.TorusGeometry(.7,.035,8,48,Math.PI*1.5),new THREE.MeshBasicMaterial({color:'#ffd590',transparent:true,opacity:0,depthWrite:false}));effect.position.set(5.5,1.4,4.7);runtime.scene.add(effect);
 flash=new THREE.PointLight('#ffbd63',0,7,2);flash.position.set(5.5,1.7,5);runtime.scene.add(flash);
 const particles=new Float32Array(32*3);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(particles,3));sparks=new THREE.Points(geo,new THREE.PointsMaterial({color:'#ffd790',size:.07,transparent:true,opacity:0,depthWrite:false}));runtime.scene.add(sparks);
 marker=new THREE.Mesh(new THREE.OctahedronGeometry(.26,0),new THREE.MeshBasicMaterial({color:new THREE.Color(1.5,.95,.18),toneMapped:false,transparent:true,opacity:.95,depthWrite:false}));marker.scale.y=1.5;runtime.scene.add(marker);
 runtime.camera.position.set(0,16*LENS,23*LENS);runtime.camera.lookAt(0,0,0);$('loading').hidden=true;labels();canvas.focus();
 let previous=performance.now(),accumulator=0;const center=new THREE.Vector3(0,0,0),desired=new THREE.Vector3(),projected=new THREE.Vector3();
 function frame(now){raf=requestAnimationFrame(frame);const dt=Math.min((now-previous)/1000,.05);previous=now;if(document.hidden)return;time+=dt;attackAge+=dt;let moving=false;
 if(!dialog.open&&!greeting){const steps=Math.max(1,Math.ceil(dt*60)),h=dt/steps;for(let i=0;i<steps;i++){let dx=cutscene?0:(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),dz=cutscene?0:(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
 // Reached waypoints are dropped in the same step, so the captain never pauses (or re-accelerates) between them.
 if(dx||dz){path=[];pending=null;}else{while(path.length&&Math.hypot(path[0].x-s.x,path[0].z-s.z)<.06)path.shift();if(path.length){dx=path[0].x-s.x;dz=path[0].z-s.z;}}
 moving=move(s,dx,dz,h,!cutscene&&keys.has('shift'))||moving;
 if(!path.length&&walkDone){const r=walkDone;walkDone=null;r();}
 if(!path.length&&pending){const p=POINTS.find(p=>p.id===pending);pending=null;if(Math.hypot(p.x-s.x,p.z-s.z)<1.85){if(p.id==='training')strike();else{if(CAST[p.id])faceToward(s,p);converse(p.id);}}}
 }}
 for(let i=waits.length-1;i>=0;i--)if(time>=waits[i].end)waits.splice(i,1)[0].r();
 // Wide diorama view by default (the whole courtyard, as in the original); wheel or +/- zooms toward a close follow view.
 const lerp=THREE.MathUtils.lerp,clamp=THREE.MathUtils.clamp;
 // A cutscene shot overrides the follow view with its own centre and zoom, and may cut to it (snap).
 const zoom=shot?shot.zoom:view;if(shot)desired.set(shot.x,0,shot.z);else desired.set(lerp(clamp(s.x*.45,-3.8,3.8),clamp(s.x*.85,-6.5,6.5),zoom),0,lerp(clamp(s.z*.42,-4.5,2.7),clamp(s.z*.5-1.5,-7.2,3),zoom));center.lerp(desired,reduced||snap?1:1-Math.exp(-dt*(shot?1.6:3.5)));const distance=lerp(s.room?18:23,s.room?9.5:12.5,zoom)*LENS;
 runtime.camera.position.lerp(new THREE.Vector3(center.x,lerp(s.room?12:16,s.room?7.2:8.6,zoom)*LENS,center.z+distance),reduced||snap?1:1-Math.exp(-dt*(shot?1.6:3)));snap=false;runtime.camera.lookAt(center.x,lerp(.3,.6,zoom),center.z);
 // Marker: the official, then the nearest source not yet heard (the manifest while inside), then the junk.
 const left=SOURCES.filter(id=>!s.word.includes(id)),goalId=s.quest==='word'?(s.room&&left.includes('ledger')?'ledger':left.filter(id=>id!=='ledger').sort((a,b)=>{const A=POINTS.find(p=>p.id===a),B=POINTS.find(p=>p.id===b);return Math.hypot(A.x-s.x,A.z-s.z)-Math.hypot(B.x-s.x,B.z-s.z);})[0]??'ledger'):({meet:'official',return:'official',complete:'junk'})[s.quest];
 const goal=POINTS.find(p=>p.id===goalId);
 marker.visible=!!goal&&showMarker&&!dialog.open&&!cutscene&&Math.hypot(goal.x-s.x,goal.z-s.z)>1.85&&(goal.id==='ledger')===s.room;
 if(goal)marker.position.set(goal.x,(goal.id==='ledger'?1.9:goal.id==='junk'?2.4:3.2)+Math.sin(time*2.4)*.12,goal.z);marker.rotation.y=time*1.5;
 // Autosave where the captain stands every couple of seconds while he moves.
 if(moving&&!cutscene&&time-savedAt>2){savedAt=time;save();}
 actors.update(s,moving,time,runtime.camera,dt);world.update(dt,time,s.room);
 const power=attackAge<.65?Math.sin(attackAge/.65*Math.PI):0;effect.material.opacity=power;effect.rotation.z=-attackAge*9;effect.scale.setScalar(.7+Math.min(attackAge,1)*1.5);flash.intensity=power*45;sparks.material.opacity=power;
 const positions=sparks.geometry.attributes.position;for(let i=0;i<32;i++){const a=i*2.4,r=attackAge<1?attackAge*2.6:0;positions.setXYZ(i,5.5+Math.cos(a)*r,1.4+Math.sin(a)*r-attackAge*attackAge,4.7+Math.sin(i)*r*.4);}positions.needsUpdate=true;
 const n=nearest(s);$('interact').textContent=n.distance<1.85?`${t(n.id)} · E`:t('interact');
 for(const p of POINTS){const b=markerButtons.get(p.id);const visible=p.id==='ledger'?s.room:!s.room;b.hidden=!visible;if(visible){projected.set(p.x,p.id==='ledger'?1.4:CAST[p.id]?2.95:p.id==='junk'?1.6:2.05,p.z).project(runtime.camera);b.style.left=`${(projected.x*.5+.5)*innerWidth}px`;b.style.top=`${(-projected.y*.5+.5)*innerHeight}px`;const near=n.id===p.id&&n.distance<1.85,far=Math.hypot(p.x-s.x,p.z-s.z)>4.5;b.hidden=far||projected.z>1||Math.abs(projected.x)>.95||projected.y>.68||projected.y<-.83||(near&&!!CAST[p.id]);b.classList.toggle('active',near);}}
 runtime.renderer.info.autoReset=false;runtime.renderer.info.reset();runtime.render({x:s.x,y:1,z:s.z});frames++;elapsed+=dt;
 if(elapsed>=1){fps=Math.round(frames/elapsed);frames=elapsed=0;$('stats').textContent=`${fps} fps · ${runtime.renderer.info.render.calls} draws\n${Math.round(runtime.renderer.info.render.triangles/1000)}k triangles\n${runtime.renderer.info.memory.textures} textures`;}
 }
 raf=requestAnimationFrame(frame);
 // ?opening restarts the chapter from the arrival (then leaves the address, so a reload carries on from there).
 if(new URLSearchParams(location.search).has('opening')){s=fresh();history.replaceState(null,'',location.pathname);}
 if(!s.opened)opening();
 // Read-only inspection for local QA, without teleporting or modifying simulation.
 window.naraiCourtyard={snapshot:()=>({ready:true,position:{x:s.x,z:s.z},quest:s.quest,word:[...s.word],choice:s.choice,opened:s.opened,cutscene:!!cutscene,inside:s.room,evening,enhanced:runtime.enhanced,fps,drawCalls:runtime.renderer.info.render.calls})};
 addEventListener('pagehide',()=>{save();cancelAnimationFrame(raf);world.dispose();runtime.dispose();audio?.close();},{once:true});
}catch(error){console.error(error);$('load-text').textContent=lang==='th'?'โหลดฉากไม่สำเร็จ โปรดลองอีกครั้ง':'The courtyard could not load. Please try again.';$('reload').hidden=false;}
