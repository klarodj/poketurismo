import React,{useEffect} from 'react';
import useSnakeStore from '../store/snakeStore';
import {snakeSpeed,snakeKey} from '../logic/snake.mjs';
const SNAKE_LABELS={ready:'Premi Inizia',running:'In gioco',paused:'In pausa',over:'Partita finita',won:'Hai riempito il campo!'};
export function SnakeBoard({game}){return <svg className="phone-snake-board" viewBox={`0 0 ${game.width*10} ${game.height*10}`} role="img" aria-label={`Campo di Snake: ${game.score} punti, ${SNAKE_LABELS[game.status]}`} shapeRendering="crispEdges"><rect width="100%" height="100%" fill="#a5b77d"/>{game.food&&<rect x={game.food.x*10+2} y={game.food.y*10+2} width="6" height="6" fill="#14210e"/>}{game.body.map((cell,i)=><rect key={i} x={cell.x*10+1} y={cell.y*10+1} width="8" height="8" fill="#14210e"/>)}<rect x={game.body[0].x*10+3} y={game.body[0].y*10+3} width="2" height="2" fill="#a5b77d"/></svg>;}
export function SnakePad(){const steer=useSnakeStore(state=>state.steer);return <div className="phone-snake-pad" aria-label="Direzioni di Snake"><button type="button" className="snake-up" onClick={()=>steer('up')} aria-label="Snake su">2 ▲</button><button type="button" className="snake-left" onClick={()=>steer('left')} aria-label="Snake sinistra">4 ◀</button><button type="button" className="snake-down" onClick={()=>steer('down')} aria-label="Snake giù">8 ▼</button><button type="button" className="snake-right" onClick={()=>steer('right')} aria-label="Snake destra">6 ▶</button></div>;}
export default function PhoneSnake({ownerId}){
 const {game,best,bindUser,start,pause,newGame,steer,tick}=useSnakeStore();
 const status=game?.status,speed=snakeSpeed(game?.score||0);
 useEffect(()=>{bindUser(ownerId);const stop=()=>pause();const visibility=()=>{if(document.hidden)stop();};const keydown=event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||document.hidden||event.target?.closest?.('input,textarea,select'))return;
  const direction=snakeKey(event.key.length===1?event.key.toLowerCase():event.key);
  if(direction){event.preventDefault();steer(direction);}else if(event.key.toLowerCase()==='p'){event.preventDefault();if(useSnakeStore.getState().game?.status==='running')pause();else start();}
 };window.addEventListener('keydown',keydown);window.addEventListener('blur',stop);document.addEventListener('visibilitychange',visibility);
 return()=>{pause();window.removeEventListener('keydown',keydown);window.removeEventListener('blur',stop);document.removeEventListener('visibilitychange',visibility);};},[ownerId,bindUser,start,pause,steer]);
 useEffect(()=>{if(status!=='running')return;const timer=setInterval(()=>{if(document.hidden)pause();else tick();},speed);return()=>clearInterval(timer);},[status,speed,pause,tick]);
 if(!game)return <p>Caricamento di Snake…</p>;
 const labels=SNAKE_LABELS;
 return <section className="phone-snake"><h2>Snake</h2><div className="phone-snake-score"><span>Punti: <strong>{game.score}</strong></span><span>Record: <strong>{best}</strong></span></div>
 <SnakeBoard game={game}/>
 <p role="status">{labels[status]}</p><div className="phone-actions">{['ready','paused'].includes(status)&&<button type="button" onClick={start}>{status==='ready'?'Inizia':'Riprendi'}</button>}{status==='running'&&<button type="button" onClick={pause}>Pausa</button>}{['over','won','ready','paused'].includes(status)&&<button type="button" onClick={newGame}>Nuova partita</button>}</div>

 <details><summary>Come si gioca</summary><p>Mangia i quadratini, evita muri e corpo. Frecce, WASD o 2/4/6/8; P mette in pausa. La velocità aumenta ogni 50 punti.</p><p>Chiudendo il telefono la partita va in pausa. Il record è personale su questo browser.</p></details></section>;
}
