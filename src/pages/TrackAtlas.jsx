import React,{useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Win98Window from '../components/Win98Window';
import TrackPreview from '../components/TrackPreview';
import {fetchTracks} from '../services/api';
import {DEMO_TRACK,buildTacticalTrack} from '../../shared/trackGeometry.mjs';
import {trackVisual} from '../../shared/trackVisuals.mjs';
import {routeProfileFor} from '../../shared/raceContext.mjs';
function Roadbook({track}){
 const visual=trackVisual(track.name),demo=track.id==='demo',profile=routeProfileFor(visual?.format==='point-to-point'?'street':'track',track.name);
 const distance=demo?DEMO_TRACK.distanceKm:track.lenght>=100?track.lenght/1000:track.lenght;
 const sections=demo?DEMO_TRACK.sections:buildTacticalTrack(track.builds.map(build=>build.section),distance,profile);
 return <TrackPreview trackName={track.name} sections={sections} paths={demo?DEMO_TRACK.mapPaths:null} profile={profile}/>;
}
export default function TrackAtlas(){
 const navigate=useNavigate(),[tracks,setTracks]=useState([]),[filter,setFilter]=useState('all'),[selected,setSelected]=useState(null),[error,setError]=useState('');
 useEffect(()=>{let current=true;fetchTracks().then(data=>{if(current){setTracks([...data,{...DEMO_TRACK,catalog:{location:'Pistino del club, Lombardia',format:'circuit'}}]);setSelected(current=>current===null?(data.find(t=>t.name==='Pistino di San Rocco · Pavese')?.id||data[0]?.id||'demo'):current);}}).catch(e=>{if(current)setError(e.message);});return()=>{current=false;};},[]);
 const visible=tracks.filter(track=>filter==='all'||trackVisual(track.name)?.format===filter);
 return <Win98Window title="Club Motori del Nord — Atlante dei percorsi" imageUrl="/images/track.png"><div className="period-page"><div className="period-menu"><span>Roadbook del club</span><span>Nord Italia · 2002</span></div><h1>Piste e strade del club</h1><p>Le cartoline dei posti dove si corre e gli schemi da tenere nel portaoggetti. Apri un percorso per vedere ambientazione, minimappa e settori.</p><label>Mostra <select className="border-2 border-gray-600 bg-white p-1" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Tutti i percorsi</option><option value="circuit">Circuiti</option><option value="point-to-point">Strade punto a punto</option></select></label>{error&&<p role="alert">{error}</p>}<div className="track-atlas-list">{visible.map(track=><details key={track.id} open={String(selected)===String(track.id)} onToggle={event=>{if(event.currentTarget.open)setSelected(track.id);else setSelected(current=>String(current)===String(track.id)?'':current);}}><summary><strong>{track.name}</strong><span>{track.catalog?.location} · {trackVisual(track.name)?.format==='point-to-point'?'Punto a punto':'Circuito'}</span></summary>{String(selected)===String(track.id)&&<Roadbook track={track}/>}</details>)}</div><div className="flex flex-wrap gap-2"><button className="win98-btn" onClick={()=>navigate('/autodrome')}>Segreteria autodromo</button><button className="win98-btn" onClick={()=>navigate('/street-racing')}>I ritrovi su strada</button></div></div></Win98Window>;
}
