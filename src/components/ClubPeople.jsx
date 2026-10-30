import React, {useEffect,useState} from 'react';
import {fetchStory} from '../services/api';
import usePhoneStore from '../store/phoneStore';
import {carArtwork} from '../../shared/carArtwork.mjs';
import {paintName} from '../../shared/carPaint.mjs';
import RaceDetailDialog from './RaceDetailDialog';
export default function ClubPeople({userId,revision}) {
 const phoneOpen=usePhoneStore(state=>state.isOpen);
 const [data,setData]=useState(null),[selectedId,setSelectedId]=useState(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{let current=true;if(phoneOpen)return;fetchStory(userId).then(result=>{if(current){setData(result);setError('');}}).catch(e=>{if(current)setError(e.message);});return()=>{current=false;};},[userId,revision,retry,phoneOpen]);
 const selected=data?.characters.find(c=>c.id===selectedId);
 const openPhone=(view,id)=>{setSelectedId(null);usePhoneStore.getState().openStory(view,id);};
 return <section className="club-people" aria-labelledby="club-people-title">
  <header className="meet-section-heading"><div><h2 id="club-people-title">Gente del club</h2><p>Le facce e le macchine del nostro giro. Apri una scheda per conoscerle.</p></div><button type="button" className="win98-btn" onClick={()=>openPhone('story')}>Incarichi sul cellulare</button></header>
  {error&&<p role="alert" className="meet-error">{error} <button type="button" className="win98-btn" onClick={()=>setRetry(n=>n+1)}>Riprova</button></p>}
  {!data&&!error&&<p role="status">Caricamento della bacheca del club…</p>}
  {data&&<ul className="club-people-list">{data.characters.map(person=><li key={person.id}><button type="button" className="club-person-row" aria-label={`Conosci ${person.shortName}`} onClick={()=>setSelectedId(person.id)}><img className="club-person-avatar" src={person.avatar} width="64" height="64" alt=""/><span className="club-person-info"><strong>{person.shortName} <small>{person.nickname}</small></strong><span>{person.role}</span><span>{person.car.brand} {person.car.name} · {paintName(person.car.paintColour)}</span><small>{person.known?'Contatto conosciuto':'Da incontrare'} · Apri la scheda</small></span><img className="club-person-car" src={carArtwork(person.car)} width="320" height="128" alt={`${person.car.brand} ${person.car.name}`}/></button></li>)}</ul>}
  {selected&&<RaceDetailDialog title={`${selected.shortName} · Gente del club`} onClose={()=>setSelectedId(null)} closeLabel="Torna alla gente del club"><article className="club-person-details"><header><img className="club-person-avatar" src={selected.avatar} width="96" height="96" alt={`Ritratto di ${selected.shortName}`}/><div><h3>{selected.name}</h3><p>{selected.nickname} · {selected.age} anni</p><strong>{selected.role}</strong><p>{selected.location}</p></div></header><figure><img src={carArtwork(selected.car)} width="320" height="128" alt={`${selected.car.brand} ${selected.car.name}, ${paintName(selected.car.paintColour)}`}/><figcaption>{selected.car.brand} {selected.car.name} · {paintName(selected.car.paintColour)}</figcaption></figure><p>{selected.description}</p><details className="period-details"><summary>Motivazione e carattere</summary><p>{selected.motivation}</p><blockquote>«{selected.quote}»</blockquote></details><div className="meet-display-actions">{data.missions.some(m=>m.senderId===selected.id)&&<button type="button" className="win98-btn" onClick={()=>openPhone('story-inbox')}>Leggi gli SMS di {selected.shortName}</button>}<button type="button" className="win98-btn" onClick={()=>openPhone('story')}>Apri gli incarichi del club</button></div>{!selected.known&&<p className="meet-small">Una conoscenza delle prossime storie del club. Consultare la scheda non avvia un incontro o una sfida.</p>}</article></RaceDetailDialog>}
 </section>;
}
