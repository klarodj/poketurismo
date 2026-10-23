import React,{useState} from 'react';
import usePlayerStore from '../store/playerStore';
import useRequestStore from '../store/requestStore';
import {changePilotAvatar} from '../services/api';
import {DEFAULT_AVATAR,isAvatarId,avatarInfo} from '../../shared/avatarCatalog.mjs';
import AvatarPicker from './AvatarPicker';
export default function AvatarProfile(){
 const {id,avatar}=usePlayerStore(),pending=useRequestStore(state=>state.pending),[open,setOpen]=useState(false),[draft,setDraft]=useState(DEFAULT_AVATAR),[notice,setNotice]=useState('');
 const save=async()=>{try{await changePilotAvatar(id,draft);setOpen(false);setNotice('Avatar aggiornato.');}catch{/* The shared request banner handles errors and retries. */}};
 return <section className="avatar-profile" aria-label="Personalizza il tuo avatar"><div className="avatar-profile-heading"><span>{avatarInfo(avatar)?.name||'Scegli il volto del tuo pilota'}</span><button type="button" className="win98-btn" disabled={pending>0} onClick={()=>{setDraft(isAvatarId(avatar)?avatar:DEFAULT_AVATAR);setOpen(!open);setNotice('');}}>{open?'Chiudi scelta avatar':'Cambia avatar'}</button></div>{notice&&<p role="status">{notice}</p>}{open&&<><AvatarPicker value={draft} onChange={setDraft} disabled={pending>0}/><div className="avatar-profile-actions"><button type="button" className="win98-btn" disabled={pending>0||draft===avatar} onClick={save}>Salva avatar</button><button type="button" className="win98-btn" disabled={pending>0} onClick={()=>setOpen(false)}>Annulla</button><span>Gratis · solo aspetto</span></div></>}</section>;
}
