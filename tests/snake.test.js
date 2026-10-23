import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {createSnake,steerSnake,advanceSnake,snakeSpeed,snakeKey} from '../src/logic/snake.mjs';
import snake from '../src/store/snakeStore.js';
function mockStorage(t,value){const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');Object.defineProperty(globalThis,'localStorage',{configurable:true,value});t.after(()=>{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;});}
const running=()=>({...createSnake(10),status:'running'});
beforeEach(()=>snake.getState().reset());
test('Snake creates deterministic food outside its body and moves without mutating the input',()=>{
 const a=createSnake(42),b=createSnake(42);assert.deepEqual(a,b);assert.ok(!a.body.some(p=>p.x===a.food.x&&p.y===a.food.y));const old=running(),copy=structuredClone(old),next=advanceSnake(old);assert.deepEqual(old,copy);assert.equal(next.body[0].x,old.body[0].x+1);assert.equal(next.body.length,3);
});
test('Snake grows, scores ten points and spawns food only in free cells',()=>{
 const state=running();state.food={x:8,y:7};const next=advanceSnake(state);assert.equal(next.body.length,4);assert.equal(next.score,10);assert.ok(!next.body.some(p=>p.x===next.food.x&&p.y===next.food.y));
});
test('Snake rejects reversals and takes at most one corner input between ticks',()=>{
 const state=running();assert.equal(steerSnake(state,'left'),state);assert.equal(steerSnake(state,'invalid'),state);const queued=steerSnake(state,'up');assert.equal(steerSnake(queued,'left'),queued);const next=advanceSnake(queued);assert.equal(next.direction,'up');assert.equal(next.queuedDirection,null);assert.equal(next.body[0].y,6);
});
test('Snake detects walls and body collisions but allows entering a tail cell that is leaving',()=>{
 const state=running();state.body=[{x:17,y:4},{x:16,y:4},{x:15,y:4}];assert.equal(advanceSnake(state).status,'over');
 const loop={...running(),body:[{x:2,y:2},{x:2,y:3},{x:1,y:3},{x:1,y:2}],direction:'up',queuedDirection:'left',food:{x:8,y:8}};assert.equal(advanceSnake(loop).status,'running');
 const hit={...loop,body:[{x:2,y:2},{x:2,y:3},{x:1,y:3},{x:1,y:2},{x:1,y:1}]};assert.equal(advanceSnake(hit).status,'over');
});
test('Snake wins when the field fills, without looping while trying to place food',()=>{
 const full={...running(),width:3,height:2,body:[{x:1,y:0},{x:0,y:0},{x:0,y:1},{x:1,y:1},{x:2,y:1}],direction:'right',food:{x:2,y:0},score:20};const next=advanceSnake(full);assert.equal(next.status,'won');assert.equal(next.food,null);assert.equal(next.body.length,6);assert.equal(next.score,30);
});
test('Snake does not advance in ready, paused or finished states and has a bounded speed',()=>{
 for(const status of['ready','paused','over','won']){const state={...running(),status};assert.equal(advanceSnake(state),state);}assert.ok(snakeSpeed(50)<snakeSpeed(0));assert.equal(snakeSpeed(10000),85);assert.equal(snakeKey('2'),'up');assert.equal(snakeKey('8'),'down');assert.equal(snakeKey('ArrowLeft'),'left');
});
test('Snake record is local to the current pilot and storage failure does not stop play',t=>{
 const values=new Map();mockStorage(t,{getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)});
 snake.getState().bindUser(1);const state=running();state.food={x:8,y:7};snake.setState({game:state});snake.getState().tick();assert.equal(snake.getState().best,10);snake.getState().pause();const before=structuredClone(snake.getState().game);snake.getState().tick();assert.deepEqual(snake.getState().game,before);
 snake.getState().bindUser(2);assert.equal(snake.getState().best,0);snake.getState().bindUser(1);assert.equal(snake.getState().best,10);snake.getState().reset();assert.equal(snake.getState().ownerId,null);
 values.set('poketurismo-snake-v1:3','not-a-number');snake.getState().bindUser(3);assert.equal(snake.getState().best,0);
});
test('Snake tolerates blocked local storage when saving a record',t=>{
 mockStorage(t,{getItem:()=>{throw Error('blocked');},setItem:()=>{throw Error('blocked');}});snake.getState().bindUser(1);const game=running();game.food={x:8,y:7};snake.setState({game});assert.doesNotThrow(()=>snake.getState().tick());assert.equal(snake.getState().best,10);
});
