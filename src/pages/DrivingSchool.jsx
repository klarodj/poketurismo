import ClubStoryActivity from '../components/ClubStoryActivity';
import SectionTabs from '../components/SectionTabs';
import TrainingSchoolPanel from '../components/TrainingSchoolPanel';
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
  const money=usePlayerStore(s=>s.money);
  const development = useDevelopmentStore(state => state.development);
  const pending = useRequestStore(state => state.pending);
  const activeRace = useRaceStore(state => state.activeRace);
  const beginLesson = async technique => {
    try {
      const data = await startRace(userId, { mode: 'track', lesson: technique.lessonId });
      navigate(`/track-race?raceId=${data.race.id}`);
    } catch { /* The shared request banner reports errors. */ }
  };

  return <Win98Window guideId="school" title="Scuola guida — Autoscuola del club" imageUrl={tab==='allenamenti'?'/images/world/sections/school-training.png':'/images/world/sections/school-classroom.png'}>
    <div className="flex flex-col bg-win98-gray text-black">
      <SectionTabs label="Sezioni della scuola guida" value={tab} onChange={id=>setSearch(id==='tecniche'?{}:{sezione:id},{replace:true})} items={[{id:'tecniche',label:'Tecniche',icon:'book'},{id:'allenamenti',label:'Allenamenti',icon:'practice'}]}/>
      <div className="p-4"><ClubStoryActivity place="school"/>
        {tab==='allenamenti'?<TrainingSchoolPanel development={development} pending={pending} activeRace={activeRace} money={money} onStart={course=>beginLesson({lessonId:course.id})}/>:<div aria-label="Tecniche">
        <TechniqueSchoolPanel development={development} pending={pending} activeRace={activeRace} onRead={techniqueId => readTechniqueLesson(userId, techniqueId)} onStart={beginLesson} />
        <p className="mt-3 text-sm text-gray-700">Le tecniche apprese si equipaggiano nella scheda Pilota.</p>
        </div>}
      </div>
    </div>
  </Win98Window>;
}
