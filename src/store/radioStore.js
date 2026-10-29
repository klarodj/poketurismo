import {create} from 'zustand';
import {createRadioPlayer} from '../services/radioPlayer.js';
let storage;try{storage=window.localStorage;}catch{/* Storage is optional. */}
const player=createRadioPlayer({storage,AudioClass:globalThis.Audio,onState:state=>useRadioStore.setState(state)});
const useRadioStore=create(set=>({...player.getState(),isOpen:false,open:()=>set({isOpen:true}),close:()=>set({isOpen:false}),play:player.play,pause:player.pause,power:player.power,next:player.next,previous:player.previous,setVolume:player.setVolume,stop:player.stop}));
export default useRadioStore;
