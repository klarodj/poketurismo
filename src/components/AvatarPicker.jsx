import React,{useId,useState} from 'react';
import {AVATARS,avatarInfo} from '../../shared/avatarCatalog.mjs';
import PilotAvatar from './PilotAvatar';
import './avatars.css';
export default function AvatarPicker({value,onChange,disabled=false,allowedIds}){
 const group=useId(),[filter,setFilter]=useState('all'),selected=avatarInfo(value),available=AVATARS.filter(a=>!allowedIds||allowedIds.includes(a.id));
 return <fieldset className="avatar-picker" disabled={disabled}><legend>Scegli il tuo avatar</legend><p>Volti del club, dell’officina e dei raduni. La scelta cambia solo il tuo aspetto e puoi modificarla anche dopo.</p><div className="avatar-filters" aria-label="Filtra gli avatar">{[['all','Tutti'],['uomo','Uomini'],['donna','Donne']].map(([id,label])=><button key={id} type="button" className="win98-btn" aria-pressed={filter===id} onClick={()=>setFilter(id)}>{label}</button>)}</div><div className="avatar-picker-grid">{available.filter(a=>filter==='all'||a.gender===filter).map(a=><label key={a.id} className={`avatar-option${value===a.id?' avatar-option-selected':''}`} title={a.description}><input type="radio" name={group} value={a.id} checked={value===a.id} onChange={()=>onChange(a.id)} aria-label={a.name}/><PilotAvatar avatar={a.id} decorative/><span>{a.name}</span></label>)}</div><div className="avatar-selected" aria-live="polite"><PilotAvatar avatar={value} size={64} decorative/><div><strong>{selected?.name||'Scegli un volto'}</strong><p>{selected?.description||'Seleziona il personaggio che preferisci.'}</p></div></div></fieldset>;
}
