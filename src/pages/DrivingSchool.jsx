import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Win98Window from '../components/Win98Window';
import TechniqueSchoolPanel from '../components/TechniqueSchoolPanel';
import usePlayerStore from '../store/playerStore';
import useDevelopmentStore from '../store/developmentStore';
import useRequestStore from '../store/requestStore';
import useRaceStore from '../store/raceStore';
import { readTechniqueLesson, startRace } from '../services/api';

export default function DrivingSchool() {
  const navigate = useNavigate();
  const [search,setSearch]=useSearchParams();
  const tab=search.get('sezione')==='allenamenti'?'allenamenti':'tecniche';
  const userId = usePlayerStore(state => state.id);
  const development = useDevelopmentStore(state => state.development);
  const pending = useRequestStore(state => state.pending);
  const activeRace = useRaceStore(state => state.activeRace);
  const beginLesson = async technique => {
    try {
      const data = await startRace(userId, { mode: 'track', lesson: technique.lessonId });
      navigate(`/track-race?raceId=${data.race.id}`);
    } catch { /* The shared request banner reports errors. */ }
  };

  return <Win98Window guideId="school" title="Scuola guida — Il piazzale dell’istruttore" imageUrl="/images/world/places/scuola-guida.png">
    <div className="flex flex-col bg-win98-gray text-black">
      <div className="p-4">
        <nav className="flex gap-2 mb-3" aria-label="Sezioni della scuola guida">{[['tecniche','Tecniche'],['allenamenti','Allenamenti']].map(([id,label])=><button key={id} className="win98-btn" aria-pressed={tab===id} onClick={()=>setSearch(id==='tecniche'?{}:{sezione:id},{replace:true})}>{tab===id?'▣ ':''}{label}</button>)}</nav>
        {tab==='allenamenti'?<div aria-label="Allenamenti">
        <section className="mb-4 border-2 border-gray-500 bg-win98-gray p-3"><h2 className="bg-win98-blue text-white font-bold px-2">Allenamenti mirati</h2><p>Auto della scuola, quattro esercizi: con almeno 3 corretti superi il corso. Ogni 100 punti pratica ottieni +1 all’abilità, fino a 100. Nessun consumo della tua auto e nessun premio in denaro o XP. Ripetere lo stesso corso riduce il rendimento; i corsi superiori richiedono una promozione e il livello indicato.</p><div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">{(development?.targetedTraining||[]).map(c=><article key={c.id} className="border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 p-2"><h3 className="font-bold">{c.name} · {['Base','Intermedio','Avanzato'][c.tier-1]}</h3><p>Livello {c.minLevel} · €{c.price.toLocaleString('it-IT')}</p><p>{c.remaining?`${c.remaining} sessioni utili rimaste`:'Corso assimilato'}{!c.unlocked?' · Requisiti non soddisfatti':''}</p><button className="win98-btn" disabled={pending>0||!!activeRace||!c.unlocked||!c.remaining} onClick={()=>beginLesson({lessonId:c.id})}>Inizia · €{c.price.toLocaleString('it-IT')}</button></article>)}</div></section></div>:<div aria-label="Tecniche">
        <TechniqueSchoolPanel development={development} pending={pending} activeRace={activeRace} onRead={techniqueId => readTechniqueLesson(userId, techniqueId)} onStart={beginLesson} />
        <p className="mt-3 text-sm text-gray-700">Le tecniche apprese si equipaggiano nella scheda Pilota.</p>
        </div>}
      </div>
    </div>
  </Win98Window>;
}
