import{useEffect}from'react';
import usePlayerStore from'../store/playerStore';
import usePhoneStore from'../store/phoneStore';
export default function PhoneBridge(){const userId=usePlayerStore(state=>state.id);useEffect(()=>{usePhoneStore.getState().bindUser(userId);if(!userId)return;let timer,stopped=false,running=false;
 const refresh=async()=>{if(stopped||document.hidden||running)return;clearTimeout(timer);running=true;let delay=10000;try{await usePhoneStore.getState().refresh();if(stopped)return;const phone=usePhoneStore.getState();if(phone.isOpen){if(['inbox','contacts'].includes(phone.view))await phone.loadInbox();if(phone.peer&&['conversation','message','compose'].includes(phone.view))await phone.loadThread(phone.peer.id);}}catch{delay=30000;}finally{running=false;if(!stopped)timer=setTimeout(refresh,delay);}};
 const wake=()=>{if(!document.hidden)refresh();};refresh();window.addEventListener('focus',wake);document.addEventListener('visibilitychange',wake);return()=>{stopped=true;clearTimeout(timer);window.removeEventListener('focus',wake);document.removeEventListener('visibilitychange',wake);};},[userId]);return null;}
