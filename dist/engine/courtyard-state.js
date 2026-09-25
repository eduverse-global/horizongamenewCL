// Metres, Y up, Z south. Simulation has no dependency on Three.js or the DOM.
export const START={x:0,z:6.5,facing:'up'};
export const POINTS=[
 {id:'official',x:-3.5,z:2.1},
 {id:'merchant',x:-5.2,z:4.4},
 {id:'innkeeper',x:8.3,z:4.8},
 {id:'ledger',x:-2,z:-6.0},
 {id:'training',x:5.5,z:4.5},
 {id:'gate',x:-10,z:-3.0}
];
// Architectural solids; the pavilion doorway is the gap x=-1.4..1.4.
export const BLOCKS=[
 [-3.22,-4,3.55,.28],[3.22,-4,3.55,.28],[0,-10,10,.3],[-5,-7,.3,6],[5,-7,.3,6],
 [-2,-7.9,2.5,1.4],[2.95,-9.55,2.7,.8],[-3.5,2.1,.5,.5],[5.5,4.5,.6,.6],
 [-7,6,2,1.4],[-8,-7,3,2],[-5.2,4.4,.5,.5],[8.3,4.8,.5,.5]
];
export const inside=p=>p.z< -3.75&&p.z> -9.8&&Math.abs(p.x)<4.8;
export function walkable(x,z){return x>-11.6&&x<9.7&&z>-10.6&&z<10.8&&!BLOCKS.some(([bx,bz,w,d])=>Math.abs(x-bx)<w/2+.26&&Math.abs(z-bz)<d/2+.26);}
export function fresh(){return{...START,quest:'meet',choice:null,room:false};}
export function restore(value){const s=fresh();if(value&&['meet','ledger','return','complete'].includes(value.quest)){s.quest=value.quest;if(['share','keep'].includes(value.choice)&&s.quest==='complete')s.choice=value.choice;}return s;}
export function move(s,dx,dz,dt){
 if(!Number.isFinite(dt)||dt<=0)return false;
 // Cardinal priority is deliberately fixed when simultaneous keys are held.
 if(dz)dx=0;
 const amount=Math.min(dt,.05)*3.2;
 const x=s.x+Math.sign(dx)*amount,z=s.z+Math.sign(dz)*amount;
 if(dx||dz)s.facing=dz<0?'up':dz>0?'down':dx<0?'left':'right';
 if(!(dx||dz)||!walkable(x,z))return false;
 s.x=x;s.z=z;s.room=inside(s);return true;
}
export function nearest(s){return POINTS.map(p=>({...p,distance:Math.hypot(p.x-s.x,p.z-s.z)})).sort((a,b)=>a.distance-b.distance)[0];}
export function act(s,id,choice){
 const p=POINTS.find(p=>p.id===id);if(!p||Math.hypot(p.x-s.x,p.z-s.z)>1.85)return false;
 if(id==='official'&&s.quest==='meet'){s.quest='ledger';return true;}
 if(id==='ledger'&&s.quest==='ledger'){s.quest='return';return true;}
 if(id==='official'&&s.quest==='return'&&['share','keep'].includes(choice)){s.quest='complete';s.choice=choice;return true;}
 return false;
}
// Grid routing ensures pointer travel follows the same cardinal movement/collision rules.
export function route(start,end){
 const unit=.35,key=(x,z)=>`${x},${z}`,sx=Math.round(start.x/unit),sz=Math.round(start.z/unit),ex=Math.round(end.x/unit),ez=Math.round(end.z/unit);
 if(!walkable(ex*unit,ez*unit))return [];
 const q=[[sx,sz]],seen=new Map([[key(sx,sz),null]]);let found;
 for(let i=0;i<q.length&&i<5000;i++){
  const [x,z]=q[i];if(x===ex&&z===ez){found=[x,z];break;}
  for(const[dx,dz]of[[0,1],[1,0],[0,-1],[-1,0]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(!seen.has(k)&&walkable(nx*unit,nz*unit)){seen.set(k,[x,z]);q.push([nx,nz]);}}
 }
 if(!found)return [];const points=[];while(found){points.push({x:found[0]*unit,z:found[1]*unit});found=seen.get(key(...found));}return points.reverse();
}
