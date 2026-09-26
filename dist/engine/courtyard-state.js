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
 [-2,-7.9,2.5,1.4],[2.95,-9.55,2.7,.8],[-3.5,2.1,1,.6],[5.5,4.5,.6,.6],
 [-7,6,2,1.4],[-8,-7,3,2],[-5.4,-.4,1,.6],[6.6,.4,1,.6]
];
export const inside=p=>p.z< -3.75&&p.z> -9.8&&Math.abs(p.x)<4.8;
// The river landing (planks from x=9.4 to 14.1) extends the walkable ground over the water.
export const onLanding=(x,z)=>x>9.3&&x<13.9&&z>-.3&&z<2.3;
export function walkable(x,z){return(onLanding(x,z)||(x>-11.6&&x<9.7&&z>-10.6&&z<10.8))&&!BLOCKS.some(([bx,bz,w,d])=>Math.abs(x-bx)<w/2+.26&&Math.abs(z-bz)<d/2+.26);}
export function fresh(){return{...START,quest:'meet',choice:null,room:false,v:0};}
export function restore(value){const s=fresh();if(value&&['meet','ledger','return','complete'].includes(value.quest)){s.quest=value.quest;if(['share','keep'].includes(value.choice)&&s.quest==='complete')s.choice=value.choice;
 if(Number.isFinite(value.x)&&Number.isFinite(value.z)&&walkable(value.x,value.z)){s.x=value.x;s.z=value.z;s.room=inside(s);if(DIRS.includes(value.facing))s.facing=value.facing;}}return s;}
// Free 8-way movement (as in HD-2D towns): diagonals are normalised, walls are slid along, and speed
// eases in over ~80 ms. Facing follows the dominant axis, keeping the current one on exact diagonals.
export const SPEED=3.4;
// Where the captain stands to talk: beside a character (nearer side first, as in HD-2D towns, so the sprites
// never overlap on screen), or in front of objects. Returns the first reachable spot, or [] if none.
export const APPROACH=1.25,SIDE=1.3;
export function approachRoute(s,p,isPerson){
 const sides=isPerson?(s.x<p.x?[-SIDE,SIDE]:[SIDE,-SIDE]).map(dx=>({x:p.x+dx,z:p.z+.15})):[];
 for(const spot of[...sides,{x:p.x,z:p.z+APPROACH}]){const r=route(s,spot);if(r.length)return r;}
 return [];
}
export function faceToward(s,p){s.facing=DIRS[sector(p.x-s.x,p.z-s.z)];}
// Eight facings, clockwise from up (away from the camera), as Dragon Quest I & II HD-2D added diagonals.
export const DIRS=['up','up-right','right','down-right','down','down-left','left','up-left'];
const sector=(dx,dz)=>(Math.round(Math.atan2(dx,-dz)/(Math.PI/4))+8)%8;
// dash (hold Shift, as added in Dragon Quest I & II HD-2D) moves 1.8x faster.
export const DASH=1.8;
export function move(s,dx,dz,dt,dash=false){
 if(!Number.isFinite(dt)||dt<=0)return false;
 dt=Math.min(dt,.05);const len=Math.hypot(dx,dz);
 if(!len){s.v=0;return false;}
 dx/=len;dz/=len;s.v=Math.min(1,(s.v||0)+dt/.08);
 // Keep the current facing until the heading leaves its 45° sector by more than ~8°, so near-boundary walks do not flicker.
 const heading=Math.atan2(dx,-dz),current=DIRS.indexOf(s.facing),off=current<0?9:Math.abs(Math.atan2(Math.sin(heading-current*Math.PI/4),Math.cos(heading-current*Math.PI/4)));
 if(off>Math.PI/8+.14)s.facing=DIRS[sector(dx,dz)];
 s.dash=dash;const step=dt*SPEED*s.v*(dash?DASH:1);
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
 if(!found)return [];const points=[];while(found){points.push({x:found[0]*unit,z:found[1]*unit});found=seen.get(key(...found));}points.reverse();
 return smooth(points);
}
// A straight segment is clear when samples every 5 cm along it are walkable.
function clear(a,b){const n=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.05);for(let i=1;i<=n;i++){const t=i/n;if(!walkable(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t))return false;}return true;}
function smooth(points){if(points.length<3)return points;const out=[points[0]];let i=0;
 while(i<points.length-1){let j=points.length-1;while(j>i+1&&!clear(points[i],points[j]))j--;out.push(points[j]);i=j;}
 return out;}
