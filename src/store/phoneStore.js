import{create}from'zustand';
import{fetchPhoneNotifications,fetchPhoneInbox,fetchMeetConversation,sendMeetMessage,readMeetMessages,blockMeetPilot,reportMeetPilot}from'../services/api.js';
import{notificationState,mergeSms}from'../logic/phone.mjs';
import{playSmsTone,unlockPhoneSound}from'../logic/phoneSound.js';
const initial={ownerId:null,isOpen:false,view:'inbox',peer:null,inbox:null,thread:null,messageId:null,messageSnapshot:null,draft:'',drafts:{},unread:0,notice:null,seen:[],initialized:false,watermark:null,sound:false,error:'',status:'',loading:false,sending:false,connected:true};
let epoch=0,poll=null;const reading=new Set();
const usePhoneStore=create((set,get)=>{
 const current=(id,generation)=>get().ownerId===id&&epoch===generation;
 return{...initial,
 reset:()=>{epoch++;poll=null;reading.clear();set({...initial});},
 bindUser:id=>{if(get().ownerId===id)return;epoch++;poll=null;reading.clear();set({...initial,ownerId:id||null});},
 close:()=>set({isOpen:false,error:''}),dismiss:()=>set({notice:null}),
 menu:view=>{set({isOpen:true,view:view||'inbox',error:'',status:''});if(['inbox','contacts'].includes(view||'inbox'))get().loadInbox();},
 openSms:(peer,compose=false)=>{const same=get().peer?.id===peer.id;set({isOpen:true,peer,view:compose?'compose':'conversation',messageId:null,messageSnapshot:null,thread:same?get().thread:null,draft:get().drafts[peer.id]||'',error:'',status:''});get().loadThread(peer.id);},
 setDraft:draft=>{const peer=get().peer;if(peer)set(state=>({draft,drafts:{...state.drafts,[peer.id]:draft}}));},
 toggleSound:async()=>{if(get().sound){set({sound:false});return;}const ok=await unlockPhoneSound();set({sound:ok,status:ok?'Suono SMS attivo.':'Audio non disponibile.'});},
 refresh:()=>{const id=get().ownerId,generation=epoch;if(!id)return Promise.resolve();if(poll?.id===id)return poll.promise;
  const promise=(async()=>{try{const data=await fetchPhoneNotifications(id);if(!current(id,generation))return;const next=notificationState(get(),data);if(next.beep&&get().sound)playSmsTone();const{beep:_beep,...state}=next;set({...state,connected:true});return data;}catch(error){if(current(id,generation))set({connected:false});throw error;}finally{if(poll?.promise===promise)poll=null;}})();poll={id,promise};return promise;},
 loadInbox:async()=>{const id=get().ownerId,generation=epoch;if(!id)return;set({loading:true});try{const data=await fetchPhoneInbox(id);if(current(id,generation))set({inbox:data,unread:data.unread,error:'',connected:true});}catch(error){if(current(id,generation))set({error:error.message});}finally{if(current(id,generation))set({loading:false});}},
 loadThread:async(peerId,older=false)=>{const id=get().ownerId,generation=epoch;if(!id)return;const before=older?get().thread?.nextBefore:undefined;if(older&&!before)return;
  try{const data=await fetchMeetConversation(id,peerId,before);if(!current(id,generation)||get().peer?.id!==Number(peerId))return;const old=get().thread;set({peer:{...get().peer,...data.peer},messageSnapshot:data.messages.find(m=>m.id===get().messageId)||get().messageSnapshot,thread:older?{...data,messages:mergeSms(data.messages,old?.messages||[]),olderLoaded:true}:old?.olderLoaded?{...data,messages:mergeSms(old.messages,data.messages),hasMore:old.hasMore,nextBefore:old.nextBefore,olderLoaded:true}:data,error:''});}catch(error){if(current(id,generation)&&get().peer?.id===Number(peerId))set({error:error.message});}},
 openMessage:messageId=>set({messageId,messageSnapshot:get().thread?.messages.find(m=>m.id===messageId)||null,view:'message',status:'',error:''}),
 read:async message=>{const id=get().ownerId,generation=epoch,key=`${generation}:${message.id}`;if(!id||message.recipientId!==id||message.readAt||reading.has(key))return;reading.add(key);
  try{await readMeetMessages(id,message.senderId,message.id);if(!current(id,generation))return;const at=new Date().toISOString();set(state=>({messageSnapshot:state.messageSnapshot?.id===message.id?{...state.messageSnapshot,readAt:at}:state.messageSnapshot,thread:state.thread?{...state.thread,messages:state.thread.messages.map(m=>m.recipientId===id&&m.senderId===message.senderId&&(new Date(m.createdAt)<new Date(message.createdAt)||+new Date(m.createdAt)===+new Date(message.createdAt)&&m.id<=message.id)?{...m,readAt:m.readAt||at}:m)}:state.thread}));await Promise.all([get().loadThread(message.senderId),get().loadInbox(),get().refresh()]);}catch(error){if(current(id,generation))set({error:error.message});}finally{reading.delete(key);}},
 send:async()=>{const{id:peerId}=get().peer||{},id=get().ownerId,generation=epoch,text=get().draft;if(!id||!peerId||!text.trim()||get().sending)return;set({sending:true,error:'',status:''});
  try{const result=await sendMeetMessage(id,peerId,text);if(!current(id,generation))return;set(state=>{const drafts={...state.drafts};if(drafts[peerId]===text)delete drafts[peerId];return{drafts,...(state.peer?.id===peerId?{draft:drafts[peerId]||'',view:'message',messageId:result.message.id,messageSnapshot:result.message,status:'SMS inviato.'}:{})};});await Promise.all([get().loadThread(peerId),get().loadInbox(),get().refresh()]);}catch(error){if(current(id,generation))set({error:error.message});}finally{if(current(id,generation))set({sending:false});}},
 block:async()=>{const id=get().ownerId,peer=get().peer,generation=epoch;if(!peer)return;const mine=get().inbox?.contacts.find(p=>p.id===peer.id)?.blockedByMe;try{await blockMeetPilot(id,peer.id,!mine);if(!current(id,generation))return;await Promise.all([get().loadThread(peer.id),get().loadInbox(),get().refresh()]);set({status:mine?'Pilota sbloccato.':'Pilota bloccato.'});}catch(error){if(current(id,generation))set({error:error.message});}},
 report:async(reason,messageId)=>{const id=get().ownerId,peer=get().peer,generation=epoch;try{await reportMeetPilot(id,peer.id,reason,messageId);if(current(id,generation))set({status:'Segnalazione inviata.',view:'conversation'});}catch(error){if(current(id,generation))set({error:error.message});}}
 };
});
export default usePhoneStore;
