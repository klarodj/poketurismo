import React from 'react';
import { useNavigate } from 'react-router-dom';
import Win98Window from '../components/Win98Window';
import GarageTabs from '../components/GarageTabs';
import DriverDevelopmentPanel from '../components/DriverDevelopmentPanel';
import usePlayerStore from '../store/playerStore';
import useDevelopmentStore from '../store/developmentStore';
import useRequestStore from '../store/requestStore';
import useRaceStore from '../store/raceStore';
import { readDrivingLesson, startRace } from '../services/api';

export default function GarageScuolaGuida() {
  const navigate = useNavigate();
  const userId = usePlayerStore(state => state.id);
  const development = useDevelopmentStore(state => state.development);
  const pending = useRequestStore(state => state.pending);
  const activeRace = useRaceStore(state => state.activeRace);
  const beginLesson = async () => {
    try {
      const data = await startRace(userId, { mode: 'track', lesson: 'braking-basics' });
      navigate(`/track-race?raceId=${data.race.id}`);
    } catch { /* The shared request banner reports errors. */ }
  };

  return <Win98Window title="Garage — Scuola guida" imageUrl="/images/garage.png">
    <div className="flex flex-col bg-win98-gray text-black">
      <GarageTabs />
      <div className="p-4">
        <DriverDevelopmentPanel development={development} pending={pending} activeRace={activeRace} onRead={() => readDrivingLesson(userId)} onStart={beginLesson} />
        <p className="mt-3 text-sm text-gray-700">Le tecniche apprese si equipaggiano nella scheda Pilota.</p>
      </div>
    </div>
  </Win98Window>;
}
