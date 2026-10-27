import React from 'react';
import { useNavigate } from 'react-router-dom';
import Win98Window from '../components/Win98Window';
import TechniqueSchoolPanel from '../components/TechniqueSchoolPanel';
import usePlayerStore from '../store/playerStore';
import useDevelopmentStore from '../store/developmentStore';
import useRequestStore from '../store/requestStore';
import useRaceStore from '../store/raceStore';
import { readTechniqueLesson, startRace } from '../services/api';

export default function DrivingSchool() {
  const navigate = useNavigate();
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
        <TechniqueSchoolPanel development={development} pending={pending} activeRace={activeRace} onRead={techniqueId => readTechniqueLesson(userId, techniqueId)} onStart={beginLesson} />
        <p className="mt-3 text-sm text-gray-700">Le tecniche apprese si equipaggiano nella scheda Pilota.</p>
      </div>
    </div>
  </Win98Window>;
}
