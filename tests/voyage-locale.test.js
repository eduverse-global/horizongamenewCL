import test from 'node:test';
import assert from 'node:assert/strict';
import {translateVoyage,localizedValue,readLanguage,writeLanguage} from '../dist/voyage-locale.js';
import {conversation,conversationBranch,objective,advanceStory} from '../dist/story.js';
import {expeditionObjective} from '../dist/expedition.js';
import {newGame,PORTS,trade} from '../dist/state.js';
const th=s=>translateVoyage(s,'th');
test('UI localization preserves numbers, whitespace, symbols and city identity',()=>{
 assert.equal(th(' Day 12 · 08:45 '),' วันที่ 12 · 08:45 ');
 assert.equal(th('◈ 1,234 gold'),'◈ 1,234 ทอง');
 assert.equal(th('Sailing to Bangkok · 120 nm'),'กำลังไปบางกอก · 120 ไมล์ทะเล');
 assert.equal(th('⚓ PORTUGAL'),'⚓ โปรตุเกส');
 assert.equal(th('Lisbon · Harbor Quarter'),'ย่านท่าเรือลิสบอน');
 assert.equal(th(''), '');assert.equal(th('  '),'  ');
 for(const p of PORTS){assert.notEqual(th(p.name),p.name);assert.notEqual(th(p.description),p.description);}
});
test('switching languages restores source and respects fresh simulation values',()=>{
 const first=localizedValue('70% hull',null,'th');
 const second=localizedValue(first.output,first,'th');assert.deepEqual(first,second);
 assert.equal(localizedValue(second.output,second,'en').output,'70% hull');
 assert.equal(localizedValue('62% hull',second,'th').output,'ตัวเรือ 62%');
 const s=newGame(),before=JSON.stringify(s);th(objective(s));assert.equal(JSON.stringify(s),before);
});
test('all captain dialogue branches and choices have Thai translations',()=>{
 function check(node){assert.notEqual(th(node.text),node.text,node.text);for(const c of node.choices){assert.notEqual(th(c.label),c.label,c.label);if(c.after)assert.notEqual(th(c.after),c.after,c.after);}}
 for(const phase of ['rumor','compass','charted','return','complete'])for(const choice of ['crew','cargo']){
  const s=newGame();s.story={phase,choice,companion:choice==='crew'?'mara':'tomas'};
  assert.notEqual(th(objective(s)),objective(s));
  for(const id of ['ines','elias','tomas','mara'])check(conversation(s,id));
  for(const branch of ['brother','crew','cargo'])check(conversationBranch(s,'tomas',branch));
  for(const p of ['locked','alexandria','courtyard','recorded','complete']){s.expedition.phase=p;assert.notEqual(th(expeditionObjective(s)),expeditionObjective(s));}
 }
});
test('trade and story rewards retain their original economy and localize feedback',()=>{
 const s=newGame();const result=trade(s,PORTS[0],'saffron','buy');assert.equal(s.gold,1120);assert.equal(th(result.message),'ซื้อหญ้าฝรั่น 80 ทอง');
 for(const [action,place] of [['accept','lisbon'],['chart','london'],['crew','azores'],['finish','lisbon']]){const r=advanceStory(s,action,place);assert.ok(r.ok);assert.notEqual(th(r.message),r.message);}
 assert.equal(s.gold,1470);
});
test('language persistence shares combat preference and tolerates denied storage',()=>{
 const data={};const storage={getItem:k=>data[k],setItem:(k,v)=>data[k]=v};
 assert.equal(readLanguage(storage),'en');assert.ok(writeLanguage(storage,'th'));assert.equal(readLanguage(storage),'th');assert.deepEqual(data,{'narai-language':'th'});
 const denied={getItem(){throw Error();},setItem(){throw Error();}};assert.equal(readLanguage(denied),'en');assert.equal(writeLanguage(denied,'th'),false);
});
