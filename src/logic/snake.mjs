export const SNAKE_WIDTH = 18;
export const SNAKE_HEIGHT = 14;
export const DIRECTIONS = Object.freeze({up:{x:0,y:-1},right:{x:1,y:0},down:{x:0,y:1},left:{x:-1,y:0}});
const same=(a,b)=>a.x===b.x&&a.y===b.y;
function placeFood(body,width,height,seed){
 const empty=[];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(!body.some(cell=>cell.x===x&&cell.y===y))empty.push({x,y});
 const nextSeed=(Math.imul(seed,1664525)+1013904223)>>>0;
 return {food:empty.length?empty[nextSeed%empty.length]:null,seed:nextSeed};
}
export function createSnake(seed=1){
 const body=[{x:7,y:7},{x:6,y:7},{x:5,y:7}];
 return {width:SNAKE_WIDTH,height:SNAKE_HEIGHT,body,direction:'right',queuedDirection:null,status:'ready',score:0,...placeFood(body,SNAKE_WIDTH,SNAKE_HEIGHT,seed>>>0)};
}
export function steerSnake(state,direction){
 if(!DIRECTIONS[direction]||!['ready','running','paused'].includes(state.status)||state.queuedDirection||direction===state.direction)return state;
 const old=DIRECTIONS[state.direction],next=DIRECTIONS[direction];
 if(old.x+next.x===0&&old.y+next.y===0)return state;
 return {...state,queuedDirection:direction};
}
export function advanceSnake(state){
 if(state.status!=='running')return state;
 const direction=state.queuedDirection||state.direction,delta=DIRECTIONS[direction];
 const head={x:state.body[0].x+delta.x,y:state.body[0].y+delta.y};
 const eating=state.food&&same(head,state.food),occupied=eating?state.body:state.body.slice(0,-1);
 if(head.x<0||head.x>=state.width||head.y<0||head.y>=state.height||occupied.some(cell=>same(cell,head)))return {...state,direction,queuedDirection:null,status:'over'};
 const body=[head,...state.body];if(!eating)body.pop();
 const food=eating?placeFood(body,state.width,state.height,state.seed):{food:state.food,seed:state.seed};
 return {...state,body,direction,queuedDirection:null,score:state.score+(eating?10:0),...food,status:food.food?'running':'won'};
}
export const snakeSpeed=score=>Math.max(85,220-Math.floor(score/50)*15);
export const snakeKey=key=>({ArrowUp:'up',ArrowRight:'right',ArrowDown:'down',ArrowLeft:'left',w:'up',d:'right',s:'down',a:'left','2':'up','6':'right','8':'down','4':'left'})[key]||null;
