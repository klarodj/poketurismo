import {test} from 'node:test';
import assert from 'node:assert/strict';
import {clubVisitors,clubConversation,CLUB_VISIT_INTERVAL} from '../shared/clubVisitors.mjs';
import {STORY_CHARACTERS} from '../shared/storyCatalog.mjs';
test('club attendance stays fixed within a window, rotates and sometimes leaves an empty lot',()=>{
 const seen=new Set(),counts=new Set();for(let n=0;n<100;n++){const at=n*CLUB_VISIT_INTERVAL,ids=clubVisitors(at);assert.deepEqual(clubVisitors(at+CLUB_VISIT_INTERVAL-1),ids);assert.equal(new Set(ids).size,ids.length);assert(ids.every(id=>STORY_CHARACTERS.some(c=>c.id===id)));counts.add(ids.length);ids.forEach(id=>seen.add(id));}assert.equal(seen.size,4);assert(counts.has(0)&&counts.has(1)&&counts.has(2));
});
test('Lele follows actual mission states while other characters tell their own anecdotes',()=>{
 const texts=new Set(['available','accepted','in-progress','paused','completed'].map(s=>clubConversation('lele-riva',s,0).text));assert.equal(texts.size,5);assert(clubConversation('lele-riva','accepted').mission);for(const c of STORY_CHARACTERS.filter(c=>c.id!=='lele-riva')){assert(!clubConversation(c.id,'accepted',0).mission);assert.notEqual(clubConversation(c.id,null,0).text,clubConversation(c.id,null,CLUB_VISIT_INTERVAL).text);}
});
