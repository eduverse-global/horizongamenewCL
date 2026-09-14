// Authored town topology and navigation bounds, shared by renderer and path tests.
export const CITY_NAMES={lisbon:'Lisbon',london:'London',alexandria:'Alexandria'};
export const BUILDINGS=[
 {kind:'tavern',name:'Tavern',x:-10,z:-12,w:9,d:7,color:'#b59170'},
 {kind:'guild',name:'Merchant Guild',x:10,z:-12,w:9,d:7,color:'#cfb894'},
 {kind:'market',name:'Covered Market',x:-10,z:1,w:9,d:7,color:'#b4a27e'},
 {kind:'shipyard',name:'Shipwright’s Workshop',x:10,z:1,w:9,d:7,color:'#9a8067'},
 {kind:'chapel',name:'Quiet Chapel',x:-10,z:14,w:9,d:7,color:'#d6c7a7'},
 {kind:'archive',name:'Cartographer’s Archive',x:10,z:14,w:9,d:7,color:'#b7ad90'}
];
export function townBuildings(city){return BUILDINGS.map(b=>({...b,name:b.kind==='tavern'&&city==='lisbon'?'The Lantern & Tide':b.name,target:b.kind==='tavern'&&city==='lisbon'?'lisbon':b.kind==='guild'&&city==='london'?'london':`${city}-${b.kind}`}));}
export function describePlace(id){if(id==='azores')return{id,city:'azores',kind:'wreck',title:'The Morning Star wreck camp',bounds:{x:6.35,minZ:-4.1,maxZ:4.5},spawn:{x:0,z:3.6},parent:null};if(id==='holyland')return{id,city:'jerusalem',kind:'special',title:'The Pilgrim’s Courtyard',bounds:{x:18,minZ:-20,maxZ:20},spawn:{x:0,z:17},parent:'alexandria-town'};const [city,suffix]=id.split('-');const kind=suffix||(city==='lisbon'?'tavern':'guild');return{id,city,kind,title:kind==='town'?`${CITY_NAMES[city]} · Harbor Quarter`:kind==='tavern'&&city==='lisbon'?'The Lantern & Tide':BUILDINGS.find(b=>b.kind===kind)?.name||'Merchant Guild',bounds:kind==='town'?{x:20,minZ:-24,maxZ:24}:{x:6.35,minZ:-4.1,maxZ:4.5},spawn:kind==='town'?{x:0,z:21}:{x:0,z:3.6},parent:kind==='town'?null:`${city}-town`};}
export const townBlocks=()=>BUILDINGS.map(b=>[b.x,b.z,b.w,b.d]).concat([[0,0,3.5,3.5]]);
export function cardinalInput(keys){for(const key of[...keys].reverse()){const vector={w:[0,-1],arrowup:[0,-1],s:[0,1],arrowdown:[0,1],a:[-1,0],arrowleft:[-1,0],d:[1,0],arrowright:[1,0]}[key];if(vector)return{x:vector[0],z:vector[1]};}return{x:0,z:0};}
export function cardinalStep(from,to,speed){const dx=to.x-from.x,dz=to.z-from.z;if(Math.abs(dx)>.015)return{x:from.x+Math.sign(dx)*Math.min(Math.abs(dx),speed),z:from.z,facing:dx<0?'left':'right'};return{x:from.x,z:from.z+Math.sign(dz)*Math.min(Math.abs(dz),speed),facing:dz<0?'up':'down'};}
