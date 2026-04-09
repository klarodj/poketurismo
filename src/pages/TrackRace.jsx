import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useInventoryStore from '../store/inventoryStore';
import useGameStore from '../store/gameStore';
import Win98Window from '../components/Win98Window';
import { calculateRaceStats, resolveTurn, consumeSectionFuel, rollDungeonMaster, savingThrow } from '../logic/raceEngine';
import { fetchTracks } from '../services/api';

export default function TrackRace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trackId = searchParams.get('id');
  
  const { money, addMoney, addXp, stats: pilotStats } = usePlayerStore();
  const { cars, updateCarFuel, applyWear } = useGarageStore();
  const { moves, equippedMoves } = useInventoryStore();
  const { equippedCarId, triggerEvent } = useGameStore();

  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const car = cars.find(c => c.id === equippedCarId);
  const playerMoves = moves.filter(m => equippedMoves.includes(m.id));

  useEffect(() => {
    if (!trackId) {
       navigate('/racing');
       return;
    }
    fetchTracks().then(allTracks => {
      const found = allTracks.find(t => t.id === parseInt(trackId));
      if (found) {
        // Map Prisma structure to local Race structure
        const mappedSections = found.builds.map(b => ({
          id: b.section.id,
          name: b.section.name,
          type: b.section.carStat, // Map 'carStat' to 'type' for trigger logic
          image: b.section.image,
          opponentScore: 40 + (Math.random() * 20), // Placeholder opponent logic
        }));
        
        setTrack({
          ...found,
          sections: mappedSections,
          weather: found.meteo.name,
          reward: 500, // Placeholder
          xp: 100, // Placeholder
          opponent: { name: 'Rival', carName: 'Auto Di Sere' }
        });
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [trackId, navigate]);

  // Check valid car
  useEffect(() => {
    if (!car && !loading) {
      navigate('/dealership');
    }
  }, [car, navigate, loading]);

  if (loading) return <Win98Window title="Gara"><div className="p-4 italic">Caricamento tracciato e griglia partanza...</div></Win98Window>;
  if (!car || !track) return null;

  // Game States: 'loadout' | 'racing' | 'result'
  const [phase, setPhase] = useState('loadout');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [gap, setGap] = useState(0); // Cumulative gap vs opponent
  const [logs, setLogs] = useState([]);

  // Check valid car
  useEffect(() => {
    if (!car) {
      navigate('/dealership');
    }
  }, [car, navigate]);

  if (!car) return null;

  const handleStartRace = () => {
    setPhase('racing');
    addLog(`🚩 Partenza dal ${track.name}! Il meteo è ${track.weather}.`);
  };

  const addLog = (msg) => {
    setLogs(prev => [...prev, msg]);
  };

  const handlePlayTurn = (move) => {
    const section = track.sections[currentSectionIndex];
    
    // 1. Dynamic Weight impact calculated fresh
    const currentStats = calculateRaceStats(car);
    addLog(`--- Sezione: ${section.name} (${section.type}) ---`);
    if (move) addLog(`Hai usato Mossa: [${move.name}]`);
    else addLog(`Hai mantenuto una Guida Pulita.`);

    // 2. Dungeon Master RNG Roll & Saving Throw
    const event = rollDungeonMaster();
    let saved = false;
    if (event) {
      // Show Event Modal
      triggerEvent({
        type: 'info',
        title: 'Imprevisto in Pista',
        message: `Il Dungeon Master ha evocato: ${event.type}!`
      });
      saved = savingThrow(pilotStats, event);
      if (saved) {
        addLog(`🎲 Imprevisto: ${event.type}! Ma i tuoi Riflessi (${pilotStats.reflex}) ti salvano! 😎`);
      } else {
        addLog(`🎲 Imprevisto: ${event.type}! Subisci il malus. 💥`);
      }
    }

    // 3. Resolve Gap
    const delta = resolveTurn(section, currentStats, pilotStats, move, track.opponent.stats, event, saved);
    setGap(prev => prev + delta);
    addLog(`Divario turno: ${delta > 0 ? '+' : ''}${delta}. Gap totale: ${gap + delta}.`);

    // 4. Consume Fuel & Apply Wear (Push your luck)
    const fuelBurn = consumeSectionFuel(car, move);
    updateCarFuel(car.id, -fuelBurn);
    if (move && (move.costHealth > 0 || move.costGrip > 0)) {
       applyWear(car.id, move.costGrip, move.costHealth);
       addLog(`Usura applicata: -${move.costGrip}% Gomme, -${move.costHealth}% Motore.`);
    }

    // 5. Next section or Finish
    if (currentSectionIndex + 1 < track.sections.length) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      handleFinishRace(gap + delta);
    }
  };

  const handleFinishRace = (finalGap) => {
    setPhase('result');
    if (finalGap > 0) {
      addLog(`🏆 VITTORIA CONTRO ${track.opponent.name}!`);
      addMoney(track.reward);
      addXp(track.xp);
      triggerEvent({
        type: 'info',
        title: 'Gara Conclusa',
        message: `Hai Vittorioso! Gap Finale: +${finalGap}. Hai vinto €${track.reward} e ${track.xp} XP!`
      });
    } else {
      addLog(`❌ SCONFITTA. ${track.opponent.name} ti ha battuto.`);
      triggerEvent({
        type: 'info',
        title: 'Gara Conclusa',
        message: `Hai Perso. Gap Finale: ${finalGap}. L'avversario era troppo veloce.`
      });
    }
  };

  return (
    <Win98Window title={`Track: ${track.name}`} imageUrl="/images/track.png">
      <div className="flex flex-col h-full bg-win98-bg text-white p-2">
      
        {phase === 'loadout' && (
          <div className="bg-win98-gray text-black p-4 border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray shadow-[inset_1px_1px_0_rgba(0,0,0,0.1)]">
            <h2 className="text-xl font-bold bg-win98-blue text-white p-1 mb-4">FASE 1: Deck-Building & Loadout</h2>
            <div className="mb-4">
              <p><strong>Circuito:</strong> {track.name}</p>
              <p><strong>Meteo:</strong> {track.weather}</p>
              <p><strong>Avversario:</strong> {track.opponent.name} ({track.opponent.carName})</p>
              <p><strong>Tua Auto:</strong> {car.name} ({car.currentFuel.toFixed(1)}L Benzina a bordo)</p>
            </div>
            
            <h3 className="font-bold border-b border-gray-400 mb-2">Trimestre (Mosse Equipaggiate):</h3>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {playerMoves.map(m => (
                 <div key={m.id} className="bg-white border border-gray-400 p-2 text-xs">
                   <div className="font-bold text-[#008080]">{m.name}</div>
                   <div>Attivazione: {m.trigger}</div>
                 </div>
              ))}
            </div>

            <button 
              onClick={handleStartRace}
              className="w-full bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray font-bold py-2 active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white"
            >
              SCENDI IN PISTA
            </button>
          </div>
        )}

        {phase === 'racing' && (
          <div className="flex flex-col h-full">
             {/* Race HUD */}
             <div className="bg-black text-green-500 font-pixel p-2 mb-2 border-2 border-gray-600 flex justify-between">
               <div>GAP: <span className={gap > 0 ? 'text-blue-400' : 'text-red-400'}>{gap > 0 ? '+' : ''}{gap}</span></div>
               <div>Benzina: {car.currentFuel.toFixed(1)}L</div>
               <div>Sezione {currentSectionIndex + 1}/{track.sections.length}</div>
             </div>
             
             {/* Log Terminal */}
             <div className="flex-1 bg-black border-2 border-gray-600 p-2 font-pixel text-xs overflow-y-auto mb-2 flex flex-col justify-end">
               {logs.map((log, i) => (
                 <div key={i} className="mb-1 text-gray-300 capitalize">{log}</div>
               ))}
               <div className="text-white mt-2 animate-pulse">&gt; In attesa di input per: {track.sections[currentSectionIndex].name} ({track.sections[currentSectionIndex].type})...</div>
             </div>
             
             {/* Action Bar (Cards) */}
             <div className="bg-win98-gray p-2 border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray flex gap-2">
                {playerMoves.map(move => {
                   // Check if move trigger matches section type or if it's always available
                   const currentSectionType = track.sections[currentSectionIndex].type;
                   const isPlayable = move.trigger === 'always' || 
                                     move.trigger.toLowerCase() === currentSectionType.toLowerCase() || 
                                     (move.trigger === 'Gap-Negative' && gap < 0);
                   
                   return (
                     <button
                       key={move.id}
                       onClick={() => handlePlayTurn(move)}
                       disabled={!isPlayable}
                       className={`flex-1 p-2 text-xs border-2 text-black ${
                         isPlayable 
                          ? 'bg-blue-100 hover:bg-blue-200 border-t-white border-l-white border-b-blue-800 border-r-blue-800 focus:outline focus:outline-1 focus:outline-black focus:outline-offset-1 font-bold' 
                          : 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed opacity-50'
                       }`}
                     >
                       <div className="text-center">{move.name}</div>
                     </button>
                   );
                })}
             </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="bg-win98-gray text-black p-4 border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray h-full flex flex-col items-center justify-center">
             <div className="text-4xl mb-4 font-bold">{gap > 0 ? '🎖️ VITTORIA!' : '💥 SCONFITTA'}</div>
             <div className="text-lg mb-8">Gap finale contro l'avversario: {gap} punti.</div>
             <button 
                onClick={() => navigate('/racing')}
                className="bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray px-8 py-2 font-bold hover:bg-gray-200 active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white"
             >
                Torna al Centro Corse
             </button>
          </div>
        )}

      </div>
    </Win98Window>
  );
}
