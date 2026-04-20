import React, { useState, useEffect } from 'react';
import { fetchCars, fetchTrackSections, createCustomOpponent, createCustomTrack } from '../services/api';
import Win98Window from '../components/Win98Window';
import usePlayerStore from '../store/playerStore';

export default function DevSandbox() {
  const { level: playerLevel } = usePlayerStore();
  const [activeTab, setActiveTab] = useState('opponent'); // 'opponent' | 'track'
  
  // Data for Opponent Sandbox
  const [allCars, setAllCars] = useState([]);
  const [opponentSetup, setOpponentSetup] = useState({
    name: 'Pilota Sconosciuto',
    carId: '',
    level: playerLevel || 1,
    shift: 20, reflex: 20, brave: 20, clean: 20, acro: 20, turn: 20, brake: 20, throttle: 20
  });

  // Data for Track Sandbox
  const [trackSections, setTrackSections] = useState([]);
  const [trackSetup, setTrackSetup] = useState({
    name: 'Nuovo Tracciato',
    sectionsCount: 3,
    sections: [] // Array of sectionIds
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCars().then(data => {
      setAllCars(data);
      if (data.length > 0) {
        setOpponentSetup(prev => ({ ...prev, carId: data[0].id }));
      }
    }).catch(err => console.error(err));

    fetchTrackSections().then(data => {
      setTrackSections(data);
      if (data.length > 0) {
        setTrackSetup(prev => ({
          ...prev,
          sections: Array(prev.sectionsCount).fill(data[0].id)
        }));
      }
    }).catch(err => console.error(err));
  }, []);

  const handleSectionsCountChange = (e) => {
    const count = parseInt(e.target.value);
    setTrackSetup(prev => {
      const newSections = [...prev.sections];
      if (count > newSections.length) {
        // Add more default sections
        const defaultId = trackSections.length > 0 ? trackSections[0].id : '';
        for (let i = newSections.length; i < count; i++) {
          newSections.push(defaultId);
        }
      } else {
        // Truncate
        newSections.length = count;
      }
      return { ...prev, sectionsCount: count, sections: newSections };
    });
  };

  const handleSectionChange = (index, value) => {
    setTrackSetup(prev => {
      const newSections = [...prev.sections];
      newSections[index] = parseInt(value);
      return { ...prev, sections: newSections };
    });
  };

  const saveOpponent = async () => {
    try {
      setMessage('Salvataggio avversario in corso...');
      await createCustomOpponent(opponentSetup);
      setMessage('Avversario salvato nel DB con successo!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Errore nel salvataggio avversario.');
    }
  };

  const saveTrack = async () => {
    try {
      setMessage('Salvataggio tracciato in corso...');
      await createCustomTrack({ name: trackSetup.name, sections: trackSetup.sections });
      setMessage('Tracciato salvato nel DB con successo!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Errore nel salvataggio tracciato.');
    }
  };

  return (
    <Win98Window title="Dev Sandbox" imageUrl="/images/computer.png">
      <div className="flex flex-col items-center justify-start p-2 bg-win98-gray border-4 border-gray-800 text-black shadow-[inset_0_10px_50px_rgba(0,0,0,0.2)] min-h-[400px]">
        
        {/* Tabs */}
        <div className="flex w-full gap-2 mb-4 border-b-2 border-gray-400 pb-2">
          <button 
            onClick={() => setActiveTab('opponent')}
            className={`px-4 py-2 font-bold text-sm border-2 ${activeTab === 'opponent' ? 'bg-white border-t-gray-400 border-l-gray-400 border-b-white border-r-white' : 'bg-win98-gray border-t-white border-l-white border-b-gray-600 border-r-gray-600 hover:bg-gray-200'}`}
          >
            Crea Avversario
          </button>
          <button 
            onClick={() => setActiveTab('track')}
            className={`px-4 py-2 font-bold text-sm border-2 ${activeTab === 'track' ? 'bg-white border-t-gray-400 border-l-gray-400 border-b-white border-r-white' : 'bg-win98-gray border-t-white border-l-white border-b-gray-600 border-r-gray-600 hover:bg-gray-200'}`}
          >
            Crea Tracciato
          </button>
        </div>

        {message && (
          <div className="w-full bg-blue-800 text-white p-2 font-bold text-xs mb-4 text-center border-2 border-blue-400">
            {message}
          </div>
        )}

        {/* OPPONENT TAB */}
        {activeTab === 'opponent' && (
          <div className="w-full max-w-md flex flex-col gap-2 font-mono text-sm">
            <div className="bg-gray-200 p-2 border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white shadow-inner">
              <label className="flex flex-col mb-2">Nome Avversario:
                <input type="text" value={opponentSetup.name} onChange={e => setOpponentSetup({...opponentSetup, name: e.target.value})} className="border border-gray-400 p-1 bg-white"/>
              </label>
              
              <label className="flex flex-col mb-2">Auto:
                <select value={opponentSetup.carId} onChange={e => setOpponentSetup({...opponentSetup, carId: e.target.value})} className="border border-gray-400 p-1 bg-white">
                  {allCars.map(c => <option key={c.id} value={c.id}>{typeof c.brand === 'object' ? c.brand?.name : c.brand} {c.name}</option>)}
                </select>
              </label>

              <label className="flex flex-col mb-2">Livello (1-99):
                <input type="number" min="1" max="99" value={opponentSetup.level} onChange={e => setOpponentSetup({...opponentSetup, level: e.target.value})} className="border border-gray-400 p-1 bg-white"/>
              </label>
              
              <div className="bg-white p-2 border border-gray-400 mt-4">
                <p className="font-bold border-b border-gray-300 pb-1 mb-2">Statistiche Pilota (1-100)</p>
                <div className="grid grid-cols-2 gap-2">
                  {['shift', 'reflex', 'brave', 'clean', 'acro', 'turn', 'brake', 'throttle'].map(stat => (
                    <label key={stat} className="flex justify-between items-center text-xs">
                      <span className="capitalize">{stat}:</span>
                      <input type="number" min="1" max="100" value={opponentSetup[stat]} onChange={e => setOpponentSetup({...opponentSetup, [stat]: e.target.value})} className="w-16 border border-gray-400 p-1 text-right bg-white" />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={saveOpponent} className="bg-green-600 text-white font-bold py-2 border-2 border-t-green-400 border-l-green-400 border-b-green-900 border-r-green-900 hover:bg-green-500 mt-2">
              SALVA AVVERSARIO IN DB
            </button>
          </div>
        )}

        {/* TRACK TAB */}
        {activeTab === 'track' && (
          <div className="w-full max-w-md flex flex-col gap-2 font-mono text-sm">
             <div className="bg-gray-200 p-2 border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white shadow-inner">
              <label className="flex flex-col mb-2">Nome Tracciato:
                <input type="text" value={trackSetup.name} onChange={e => setTrackSetup({...trackSetup, name: e.target.value})} className="border border-gray-400 p-1 bg-white"/>
              </label>
              
              <label className="flex flex-col mb-4">Numero Sezioni (Lunghezza):
                <input type="number" min="1" max="20" value={trackSetup.sectionsCount} onChange={handleSectionsCountChange} className="border border-gray-400 p-1 bg-white"/>
              </label>

              <div className="bg-white p-2 border border-gray-400 max-h-[250px] overflow-y-auto custom-scroll">
                <p className="font-bold border-b border-gray-300 pb-1 mb-2">Composizione Tracciato</p>
                {trackSetup.sections.map((sectionId, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <span className="text-xs w-6">{idx + 1}.</span>
                    <select 
                      value={sectionId} 
                      onChange={(e) => handleSectionChange(idx, e.target.value)} 
                      className="border border-gray-400 p-1 bg-white flex-1 text-xs"
                    >
                      {trackSections.map(ts => (
                        <option key={ts.id} value={ts.id}>{ts.name} (Auto: {ts.carStat}/{ts.carTech} - Pilota: {ts.driverStat}/{ts.driverTech})</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={saveTrack} className="bg-blue-800 text-white font-bold py-2 border-2 border-t-blue-400 border-l-blue-400 border-b-blue-900 border-r-blue-900 hover:bg-blue-700 mt-2">
              SALVA TRACCIATO IN DB
            </button>
          </div>
        )}

      </div>
    </Win98Window>
  );
}
