import test from 'node:test';
import assert from 'node:assert/strict';
import {TRAVEL,sailStep,advanceClock,voyageEstimate,playbackRate,restoreCourse} from '../dist/travel.js';
import {newGame,PORTS,saveGame,loadGame} from '../dist/state.js';
import {seaRoute,nauticalMiles} from '../dist/geography.js';
import {translateVoyage} from '../dist/voyage-locale.js';
test('Lisbon to London takes minutes and consistent sailing days at 1x',()=>{
 const route=seaRoute(PORTS[0].harbor,PORTS[1].harbor),e=voyageEstimate(PORTS[0].harbor,route);
 assert.ok(e.seconds>120&&e.seconds<360,JSON.stringify(e));assert.ok(e.days>5&&e.days<15);
 assert.equal(e.food,e.days);assert.equal(voyageEstimate(PORTS[0].harbor,route,{rate:4}).seconds,e.seconds/4);
});
test('equal nautical speeds work at different latitudes and cannot overshoot',()=>{
 for(const z of [-10,-60]){const from={x:-30,z},to={x:-29,z};const step=sailStep(from,to,6,.1);assert.ok(Math.abs(nauticalMiles(from,step)-.6)<.001);}
 assert.deepEqual(sailStep({x:-30,z:-10},{x:-29,z:-10},6,100),{x:-29,z:-10,arrived:true});
});
test('accelerated trips consume the same supplies and calendar time, and anchor freezes them',()=>{
 function trip(rate){let s={x:-30,z:-10,sail:1,supplies:30,time:0};const to={x:-29,z:-10};let seconds=0;while(s.x<to.x){const step=sailStep(s,to,6,.01);const hours=Math.min(.01,nauticalMiles(s,to)/6);advanceClock(s,hours,.8);s.x=step.x;s.z=step.z;seconds+=hours/rate;}return{...s,seconds};}
 const a=trip(1),b=trip(4);assert.equal(a.time,b.time);assert.equal(a.supplies,b.supplies);assert.equal(a.seconds,b.seconds*4);
 const s={sail:0,time:20,supplies:10};advanceClock(s,100);assert.deepEqual(s,{sail:0,time:20,supplies:10});
 const v={sail:1,time:0,supplies:10};advanceClock(v,24);assert.equal(v.time,1440);assert.equal(v.supplies,9);
});
test('4x drops to normal near arrivals, hostiles, while steering or without a course',()=>{
 const safe={sailing:true,hasCourse:true,remainingNm:800,hostileNm:1000};assert.equal(playbackRate(4,safe),4);
 for(const override of [{remainingNm:30},{hostileNm:420},{manual:true},{hasCourse:false},{sailing:false}])assert.equal(playbackRate(4,{...safe,...override}),1);
});
test('saved destination resumes at anchor without losing gold or story, corrupt courses are ignored',()=>{
 const s=newGame();s.course={...PORTS[1].harbor,label:'London'};s.sail=1;const data={};const storage={getItem:k=>data[k],setItem:(k,v)=>data[k]=v};saveGame(storage,s);const loaded=loadGame(storage);
 assert.equal(loaded.sail,0);assert.equal(loaded.gold,s.gold);assert.deepEqual(loaded.story,s.story);assert.deepEqual(restoreCourse(loaded.course),s.course);
 for(const c of [null,{x:999,z:0,label:'Bad'},{x:0,z:NaN,label:'Bad'},{x:-30,z:-10,label:'x'.repeat(101)}])assert.equal(restoreCourse(c),null);
});
test('route estimate and controls have Thai strings',()=>{
 for(const text of ['Hold course','Resume course','Cancel route','Anchored for London · 850 nm','About 5.9 days · 5.9 provisions · 3 min at this pace'])assert.notEqual(translateVoyage(text,'th'),text);
});
