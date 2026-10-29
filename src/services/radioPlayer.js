import {RADIO_TRACKS} from '../../shared/radioTracks.mjs';
export function createRadioPlayer({tracks=RADIO_TRACKS,storage,AudioClass,onState=()=>{}}={}) {
 let saved={};try{saved=JSON.parse(storage?.getItem('poketurismo-radio-v1')||'{}')||{};}catch{/* Private browsing is supported. */}
 let state={on:saved.on===true,playing:false,volume:Number.isFinite(saved.volume)?Math.max(0,Math.min(100,saved.volume)):35,trackIndex:Number.isInteger(saved.trackIndex)&&saved.trackIndex>=0&&saved.trackIndex<tracks.length?saved.trackIndex:0,error:''};
 let audio=null,wanted=false,generation=0;
 const publish=patch=>{state={...state,...patch};try{storage?.setItem('poketurismo-radio-v1',JSON.stringify({on:state.on,volume:state.volume,trackIndex:state.trackIndex}));}catch{/* Memory state remains usable. */}onState(state);};
 const ensure=()=>{if(audio)return audio;audio=new AudioClass();audio.preload='none';audio.volume=state.volume/100;audio.addEventListener('ended',()=>{if(wanted)select(1);});audio.addEventListener('error',()=>{if(wanted){wanted=false;publish({playing:false,error:'Traccia non disponibile. Prova la successiva.'});}});return audio;};
 const play=async()=>{const token=++generation;wanted=true;publish({on:true,error:''});try{const a=ensure();if(a.getAttribute('src')!==tracks[state.trackIndex].src)a.src=tracks[state.trackIndex].src;await a.play();if(token===generation&&wanted)publish({playing:true});}catch(e){if(token===generation&&e.name!=='AbortError'){wanted=false;publish({playing:false,error:'Riproduzione non riuscita. Premi Play per riprovare.'});}}};
 const pause=()=>{generation++;wanted=false;audio?.pause();publish({playing:false});};
 const power=()=>{if(state.on){pause();if(audio)audio.currentTime=0;publish({on:false,error:''});}else publish({on:true,error:''});};
 const select=delta=>{const resume=wanted;generation++;audio?.pause();publish({trackIndex:(state.trackIndex+delta+tracks.length)%tracks.length,error:'',playing:false});if(audio){audio.src=tracks[state.trackIndex].src;audio.load();}if(resume)void play();};
 return {getState:()=>({...state}),play,pause,power,next:()=>select(1),previous:()=>select(-1),setVolume:value=>{const n=Number(value);if(!Number.isFinite(n))return;const volume=Math.max(0,Math.min(100,n));if(audio)audio.volume=volume/100;publish({volume});},stop:()=>{pause();if(audio){audio.removeAttribute('src');audio.load();audio=null;}}};
}
