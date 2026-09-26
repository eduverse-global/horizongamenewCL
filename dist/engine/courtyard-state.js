// Metres, Y up, Z south. Simulation has no dependency on Three.js or the DOM.
export const START={x:0,z:6.5,facing:'up'};
export const POINTS=[
 {id:'official',x:-3.5,z:2.1},
 {id:'merchant',x:-5.4,z:-.4},
 {id:'innkeeper',x:6.6,z:.4},
 {id:'ledger',x:-2,z:-6.0},
 {id:'training',x:5.5,z:4.5},
 {id:'gate',x:-10,z:-3.0}
];
// Architectural solids; the pavilion doorway is the gap x=-1.4..1.4.
export const BLOCKS=[
 [-3.22,-4,3.55,.28],[3.22,-4,3.55,.28],[0,-10,10,.3],[-5,-7,.3,6],[5,-7,.3,6],
 [-2,-7.9,2.5,1.4],[2.95,-9.55,2.7,.8],[-3.5,2.1,.5,.5],[5.5,4.5,.6,.6],
 [-7,6,2,1.4],[-8,-7,3,2],[-5.4,-.4,.5,.5],[6.6,.4,.5,.5]
];
export const inside=p=>p.z< -3.75&&p.z> -9.8&&Math.abs(p.x)<4.8;
export function walkable(x,z){return x>-11.6&&x<9.7&&z>-10.6&&z<10.8&&!BLOCKS.some(([bx,bz,w,d])=>Math.abs(x-bx)<w/2+.26&&Math.abs(z-bz)<d/2+.26);}
export function fresh(){return{...START,quest:'meet',choice:null,room:false,v:0};}
export function restore(value){const s=fresh();if(value&&['meet','ledger','return','complete'].includes(value.quest)){s.quest=value.quest;if(['share','keep'].includes(value.choice)&&s.quest==='complete')s.choice=value.choice;}return s;}
// Free 8-way movement (as in HD-2D towns): diagonals are normalised, walls are slid along, and speed
// eases in over ~80 ms. Facing follows the dominant axis, keeping the current one on exact diagonals.
export const SPEED=3.4;
export function move(s,dx,dz,dt){
 if(!Number.isFinite(dt)||dt<=0)return false;
 dt=Math.min(dt,.05);const len=Math.hypot(dx,dz);
 if(!len){s.v=0;return false;}
 dx/=len;dz/=len;s.v=Math.min(1,(s.v||0)+dt/.08);
 const ax=Math.abs(dx),az=Math.abs(dz),vertical=s.facing==='up'||s.facing==='down';
 if(az>ax+.01||(Math.abs(ax-az)<=.01&&vertical))s.facing=dz<0?'up':'down';else s.facing=dx<0?'left':'right';
 const step=dt*SPEED*s.v;
 for(const[mx,mz]of[[dx,dz],[dx,0],[0,dz]]){if(!mx&&!mz)continue;const x=s.x+mx*step,z=s.z+mz*step;if(walkable(x,z)){s.x=x;s.z=z;s.room=inside(s);return true;}}
 return false;
}
export function nearest(s){return POINTS.map(p=>({...p,distance:Math.hypot(p.x-s.x,p.z-s.z)})).sort((a,b)=>a.distance-b.distance)[0];}
export function act(s,id,choice){
 const p=POINTS.find(p=>p.id===id);if(!p||Math.hypot(p.x-s.x,p.z-s.z)>1.85)return false;
 if(id==='official'&&s.quest==='meet'){s.quest='ledger';return true;}
 if(id==='ledger'&&s.quest==='ledger'){s.quest='return';return true;}
 if(id==='official'&&s.quest==='return'&&['share','keep'].includes(choice)){s.quest='complete';s.choice=choice;return true;}
 return false;
}
// Grid routing (8 neighbours, no cutting past corners) follows the same movement and collision rules.
export function route(start,end){
 const unit=.35,key=(x,z)=>`${x},${z}`,sx=Math.round(start.x/unit),sz=Math.round(start.z/unit),ex=Math.round(end.x/unit),ez=Math.round(end.z/unit);
 if(!walkable(ex*unit,ez*unit))return [];
 const q=[[sx,sz]],seen=new Map([[key(sx,sz),null]]);let found;
 for(let i=0;i<q.length&&i<5000;i++){
  const [x,z]=q[i];if(x===ex&&z===ez){found=[x,z];break;}
  for(const[dx,dz]of[[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(seen.has(k)||!walkable(nx*unit,nz*unit))continue;if(dx&&dz&&!(walkable((x+dx)*unit,z*unit)&&walkable(x*unit,(z+dz)*unit)))continue;seen.set(k,[x,z]);q.push([nx,nz]);}
 }
 if(!found)return [];const points=[];while(found){points.push({x:found[0]*unit,z:found[1]*unit});found=seen.get(key(...found));}return points.reverse();
}
