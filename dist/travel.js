import {nauticalMiles,inBounds,isLand} from './geography.js';

// One real second at 1× advances one sailing hour. Distances are nautical miles.
export const TRAVEL={knots:6,minutesPerSecond:60,arrivalSlowNm:30,dangerSlowNm:420};
export function routeDistance(position,route){return route.reduce((sum,p,i)=>sum+nauticalMiles(i?route[i-1]:position,p),0);}
export function voyageEstimate(position,route,{sail=1,supplies=1,provisionRate=1,rate=1}={}){
 const nm=routeDistance(position,route),knots=TRAVEL.knots*sail*(supplies>0?1:.4);
 const hours=knots>0?nm/knots:Infinity;
 return{nm,hours,days:hours/24,food:hours/24*provisionRate,seconds:hours*60/TRAVEL.minutesPerSecond/rate};
}
export function advanceClock(state,seconds,provisionRate=1){
 if(state.sail<=0)return;
 const minutes=seconds*TRAVEL.minutesPerSecond;
 state.time+=minutes;state.supplies=Math.max(0,state.supplies-minutes/1440*provisionRate);
}
// Convert the speed budget to a coordinate step using the actual segment's latitude.
export function sailStep(from,to,knots,seconds){
 const nm=nauticalMiles(from,to),budget=Math.max(0,knots)*Math.max(0,seconds)*TRAVEL.minutesPerSecond/60;
 const fraction=nm>0?Math.min(1,budget/nm):1;
 return{x:from.x+(to.x-from.x)*fraction,z:from.z+(to.z-from.z)*fraction,arrived:fraction===1};
}
export function playbackRate(requested,{sailing=false,hasCourse=false,remainingNm=Infinity,hostileNm=Infinity,manual=false}={}){
 return requested===4&&sailing&&hasCourse&&!manual&&remainingNm>TRAVEL.arrivalSlowNm&&hostileNm>TRAVEL.dangerSlowNm?4:1;
}
export function restoreCourse(value){
 if(!value||!Number.isFinite(value.x)||!Number.isFinite(value.z)||!inBounds(value.x,value.z)||isLand(value.x,value.z)||typeof value.label!=='string'||!value.label.trim()||value.label.length>100)return null;
 // No saved route geometry or markup is trusted. Recompute the route on load.
 return{x:value.x,z:value.z,label:value.label.replace(/[<>]/g,'')};
}
