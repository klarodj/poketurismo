import {create} from 'zustand';
import {createSnake,advanceSnake,steerSnake} from '../logic/snake.mjs';
const initial={ownerId:null,game:null,best:0};
const recordKey=id=>`poketurismo-snake-v1:${id}`;
function readRecord(id){try{const value=Number(globalThis.localStorage?.getItem(recordKey(id)));return Number.isInteger(value)&&value>=0&&value<=2490?value:0;}catch{return 0;}}
function saveRecord(id,value){try{globalThis.localStorage?.setItem(recordKey(id),String(value));}catch{/* Snake remains playable when browser storage is unavailable. */}}
const seed=()=>Math.floor(Math.random()*4294967296);
const useSnakeStore=create((set,get)=>({...initial,
 reset:()=>set({...initial}),
 bindUser:id=>{if(get().ownerId===id)return;set({...initial,ownerId:id||null,game:id?createSnake(seed()):null,best:id?readRecord(id):0});},
 newGame:()=>{if(get().ownerId)set({game:createSnake(seed())});},
 start:()=>{const game=get().game;if(game&&['ready','paused'].includes(game.status))set({game:{...game,status:'running'}});},
 pause:()=>{const game=get().game;if(game?.status==='running')set({game:{...game,status:'paused'}});},
 steer:direction=>{const game=get().game;if(game)set({game:steerSnake(game,direction)});},
 tick:()=>{const {game,ownerId,best}=get();if(!game||game.status!=='running')return;const next=advanceSnake(game),record=Math.max(best,next.score);if(record>best)saveRecord(ownerId,record);set({game:next,best:record});}
}));
export default useSnakeStore;
