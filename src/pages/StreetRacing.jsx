import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCars, fetchTracks, fetchCustomTracks, fetchCustomOpponents } from '../services/api';
import Win98Window from '../components/Win98Window';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useInventoryStore from '../store/inventoryStore';
import useGameStore from '../store/gameStore';
import { 
  calculateRaceStats, 
  resolveTurn,
  rollDungeonMaster,
  savingThrow,
  CAR_STAT_LABELS,
  PILOT_STAT_LABELS
} from '../logic/raceEngine';

// Hardcoded track sections aligned with DB structure (2 car + 2 pilot requirements)
const TRACK_POOL = [
  { 
    id: 1, name: 'Semaforo', 
    carStat: 'acceleration', carTech: 'traction', 
    driverStat: 'reflex', driverTech: 'shift',
    type: 'Rettilineo', desc: 'Partenza bruciante al semaforo!' 
  },
  { 
    id: 2, name: 'Rettilineo Industriale', 
    carStat: 'speed', carTech: 'traction', 
    driverStat: 'brave', driverTech: 'shift',
    type: 'Rettilineo', desc: 'Gas a martello sul lungo dritto.' 
  },
  { 
    id: 3, name: 'Rotonda Centro Comm.', 
    carStat: 'revving', carTech: 'turnSlow', 
    driverStat: 'clean', driverTech: 'turn',
    type: 'Tornante', desc: 'Gira stretto intorno alla rotonda.' 
  },
  { 
    id: 4, name: 'Svincolo Tangenziale', 
    carStat: 'speed', carTech: 'turnFast', 
    driverStat: 'clean', driverTech: 'turn',
    type: 'Chicane', desc: 'Curvone veloce in appoggio.' 
  },
  { 
    id: 5, name: 'Inversione a U', 
    carStat: 'revving', carTech: 'braking', 
    driverStat: 'acro', driverTech: 'brake',
    type: 'Tornante', desc: 'Freno a mano e via!' 
  },
];

const OPPONENT_NAMES = [
  "Marco il Pazzo", "Sere Speed", "Luca Nitro", "Giulia Drift", 
  "Andrea Turbo", "Elena Shift", "Matteo Redline", "Sofia Torque"
];

export default function StreetRacing() {
  const navigate = useNavigate();
  
  // Stores
  const { money, stats: pilotStats, addMoney, removeMoney, level: playerLevel } = usePlayerStore();
  const { cars, updateCarFuel, applyWear } = useGarageStore();
  const { moves, equippedMoves } = useInventoryStore();
  const { equippedCarId, triggerEvent } = useGameStore();

  // Game State
  const [gameState, setGameState] = useState('idle'); // idle, setup, racing, result
  const [opponent, setOpponent] = useState(null);
  const [track, setTrack] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [gap, setGap] = useState(0);
  const [battleLog, setBattleLog] = useState([]);
  const [totalFuelCost, setTotalFuelCost] = useState(0);
  const [totalTireWear, setTotalTireWear] = useState(0);
  const [totalEngineWear, setTotalEngineWear] = useState(0);

  // --- NEW STATES FOR DB TRACKS & OPPONENTS ---
  const [allCars, setAllCars] = useState([]);
  const [dbTracks, setDbTracks] = useState([]);
  const [customTracks, setCustomTracks] = useState([]);
  const [customOpponents, setCustomOpponents] = useState([]);

  // Selection states
  const [selectedTrackId, setSelectedTrackId] = useState('random');
  const [selectedOpponentId, setSelectedOpponentId] = useState('');

  const [showDebugLog, setShowDebugLog] = useState(false);
  const [debugLogArray, setDebugLogArray] = useState([]);

  useEffect(() => {
    fetchCars().then(setAllCars).catch(console.error);
    fetchTracks().then(setDbTracks).catch(console.error);
    fetchCustomTracks().then(setCustomTracks).catch(console.error);
    fetchCustomOpponents().then(data => {
      setCustomOpponents(data);
      if (data.length > 0) setSelectedOpponentId(data[0].id.toString());
    }).catch(console.error);
  }, []);

  // Get current car data
  const playerCar = useMemo(() => cars.find(c => c.id === equippedCarId), [cars, equippedCarId]);
  const playerCarStats = useMemo(() => playerCar ? calculateRaceStats(playerCar) : null, [playerCar]);

  // Moves helper
  const availableMoves = useMemo(() => {
    return moves.filter(m => equippedMoves.includes(m.id));
  }, [moves, equippedMoves]);

  const addLog = (msg) => setBattleLog(prev => [msg, ...prev].slice(0, 15));

  // --- 1. SEARCH OPPONENT ---
  const findOpponent = (mode) => {
    if (!playerCar) return;
    if (mode === 'specific' && !selectedOpponentId) return;

    setGameState('matching');
    setTotalFuelCost(0);
    setTotalTireWear(0);
    setTotalEngineWear(0);
    setDebugLogArray([]);
    
    setTimeout(() => {
      // TRACK SELECTION
      let raceTrack = [];
      if (selectedTrackId === 'random') {
        const shuffled = [...TRACK_POOL].sort(() => 0.5 - Math.random());
        raceTrack = shuffled.slice(0, 3 + Math.floor(Math.random() * 2));
      } else if (selectedTrackId.startsWith('db_')) {
        const id = parseInt(selectedTrackId.replace('db_', ''));
        const dbTrack = dbTracks.find(t => t.id === id);
        raceTrack = dbTrack ? dbTrack.builds.map(b => b.section) : TRACK_POOL.slice(0, 3);
      } else if (selectedTrackId.startsWith('custom_')) {
        const id = parseInt(selectedTrackId.replace('custom_', ''));
        const cTrack = customTracks.find(t => t.id === id);
        raceTrack = cTrack ? cTrack.sections.map(s => s.section) : TRACK_POOL.slice(0, 3);
      }
      setTrack(raceTrack);

      // OPPONENT SELECTION
      let oppCarStats = {};
      let oppPilot = {};
      let oppLevel = 1;
      let oppName = "";
      let oppPilotName = OPPONENT_NAMES[Math.floor(Math.random() * OPPONENT_NAMES.length)];
      let oppImage = "";

      if (mode === 'similar') {
        const isZarra = Math.random() > 0.5;
        const suffix = isZarra ? " Zarra" : " Tuned";
        const brandName = typeof playerCar.brand === 'object' ? playerCar.brand?.name : playerCar.brand;
        oppName = (brandName || "") + " " + (playerCar.name || "") + suffix;
        oppImage = playerCar.image;
        oppLevel = Math.max(1, playerLevel + (Math.floor(Math.random() * 3) - 1));

        Object.keys(playerCarStats).forEach(key => {
          if (typeof playerCarStats[key] === 'number') {
            oppCarStats[key] = Math.round(playerCarStats[key] * (0.88 + Math.random() * 0.24));
          }
        });

        oppPilot = {
          shift:    Math.round(pilotStats.shift    * (0.82 + Math.random() * 0.36)),
          reflex:   Math.round(pilotStats.reflex   * (0.82 + Math.random() * 0.36)),
          brave:    Math.round(pilotStats.brave    * (0.82 + Math.random() * 0.36)),
          clean:    Math.round(pilotStats.clean    * (0.82 + Math.random() * 0.36)),
          acro:     Math.round(pilotStats.acro     * (0.82 + Math.random() * 0.36)),
          turn:     Math.round(pilotStats.turn     * (0.82 + Math.random() * 0.36)),
          brake:    Math.round(pilotStats.brake    * (0.82 + Math.random() * 0.36)),
          throttle: Math.round(pilotStats.throttle * (0.82 + Math.random() * 0.36)),
        };
      } 
      else if (mode === 'random') {
        const randomCar = allCars[Math.floor(Math.random() * allCars.length)] || playerCar;
        const brandName = typeof randomCar.brand === 'object' ? randomCar.brand?.name : randomCar.brand;
        oppName = (brandName || "") + " " + (randomCar.name || "") + " (Random)";
        oppImage = randomCar.image;
        oppLevel = Math.max(1, Math.floor(Math.random() * 50) + 1);

        const baseStats = calculateRaceStats(randomCar);
        Object.keys(baseStats).forEach(key => {
          if (typeof baseStats[key] === 'number') {
            oppCarStats[key] = Math.round(baseStats[key] * (0.8 + Math.random() * 0.4));
          }
        });

        const statBase = 10 + (oppLevel * 2);
        const randStat = () => Math.max(1, Math.round(statBase * (0.5 + Math.random())));
        oppPilot = {
          shift: randStat(), reflex: randStat(), brave: randStat(), clean: randStat(),
          acro: randStat(), turn: randStat(), brake: randStat(), throttle: randStat()
        };
      }
      else if (mode === 'specific') {
        const specOpp = customOpponents.find(o => o.id === parseInt(selectedOpponentId));
        if (specOpp && specOpp.car) {
          const brandName = typeof specOpp.car.brand === 'object' ? specOpp.car.brand?.name : specOpp.car.brand;
          oppName = (brandName || "") + " " + (specOpp.car.name || "");
          oppImage = specOpp.car.image;
          oppLevel = specOpp.level;
          oppPilotName = specOpp.name;
          oppCarStats = calculateRaceStats(specOpp.car);
          oppPilot = {
            shift: specOpp.shift, reflex: specOpp.reflex, brave: specOpp.brave, clean: specOpp.clean,
            acro: specOpp.acro, turn: specOpp.turn, brake: specOpp.brake, throttle: specOpp.throttle
          };
        }
      }

      setOpponent({
        name: oppName,
        pilotName: oppPilotName,
        level: oppLevel,
        stats: oppCarStats,
        pilot: oppPilot,
        raceStats: { ...oppCarStats, pilot: oppPilot },
        image: oppImage
      });

      setGameState('setup');
    }, 1000);
  };

  // --- 2. START RACE ---
  const startRace = () => {
    if (money < 500) {
      triggerEvent({ type: 'error', title: 'Povertà', message: 'Non hai nemmeno 500€ per scommettere!' });
      return;
    }
    setGap(0);
    setCurrentStep(0);
    setBattleLog(["🏁 Gara iniziata! Le gomme stridono sull'asfalto freddo!"]);
    setGameState('racing');
  };

  // --- 3. TURN LOGIC ---
  const handleMove = (moveId) => {
    const move = moves.find(m => m.id === moveId) || { name: 'Guida Normale', bonus: {}, aggressiveness: 1, costGrip: 1, costHealth: 0.5 };
    const section = track[currentStep];
    
    // DM RNG events (10% chance per section)
    let logMsg = "";
    const event = Math.random() < 0.10 ? rollDungeonMaster() : null;
    let saved = false;
    if (event) {
      saved = savingThrow(pilotStats, event);
      if (saved) {
        logMsg = `⚠️ ${event.type}! Riflessi pronti, schivato!`;
      } else {
        logMsg = `❌ ${event.type}! Subisci il malus.`;
      }
    }

    // Accumulate costs
    setTotalFuelCost(prev => prev + (move.aggressiveness || 1) * 2); 
    setTotalTireWear(prev => prev + (move.costGrip || 1));
    setTotalEngineWear(prev => prev + (move.costHealth || 0.5));

    // Use centralized resolveTurn
    const opponentRaceStats = opponent?.raceStats || {};
    const { delta, debugLog } = resolveTurn(section, playerCarStats, pilotStats, move, opponentRaceStats, event, saved);
    const newGap = gap + delta;

    setDebugLogArray(prev => [...prev, debugLog]);

    const gapIcon = delta > 0 ? '▲' : delta < 0 ? '▼' : '=';
    addLog(`${gapIcon} ${section.name} [${move.name}]: ${delta > 0 ? '+' : ''}${delta}m — Req: ${CAR_STAT_LABELS[section.carStat]} + ${PILOT_STAT_LABELS[section.driverStat]}. ${logMsg}`);
    setGap(newGap);

    if (currentStep < track.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishRace(newGap, 
        totalFuelCost + (move.aggressiveness || 1) * 2, 
        totalTireWear + (move.costGrip || 1), 
        totalEngineWear + (move.costHealth || 0.5)
      );
    }
  };

  const finishRace = (finalGap, fCost, tWear, eWear) => {
    setGameState('result');
    const win = finalGap > 0;
    
    if (win) {
      addMoney(1000);
      addLog("🏁 TRAGUARDO! HAI VINTO! Hai incassato 1000€.");
    } else {
      removeMoney(500);
      addLog("🏁 TRAGUARDO... Sconfitta. L'avversario si prende i tuoi 500€.");
    }

    applyWear(equippedCarId, tWear, eWear); 
    updateCarFuel(equippedCarId, -fCost); 
  };

  const fastRematch = () => {
    if (money < 500) {
      triggerEvent({ type: 'error', title: 'Povertà', message: 'Non hai nemmeno 500€ per scommettere!' });
      return;
    }
    setGap(0);
    setCurrentStep(0);
    setBattleLog(["🏁 Gara iniziata! Le gomme stridono sull'asfalto freddo!"]);
    setTotalFuelCost(0);
    setTotalTireWear(0);
    setTotalEngineWear(0);
    setDebugLogArray([]);
    setGameState('racing');
  };

  const isMoveDisabled = (move) => {
    if (move.trigger === 'always') return false;
    if (move.trigger === track[currentStep]?.type) return false;
    if (move.trigger === 'Gap-Negative' && gap < 0) return false;
    return true;
  };

  const getMoveBonusText = (move) => {
    if (!move.bonus) return "";
    return Object.entries(move.bonus)
      .map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${CAR_STAT_LABELS[k] || PILOT_STAT_LABELS[k] || k}`)
      .join(", ");
  };

  return (
    <Win98Window title="Street Racing - Clandestino" imageUrl="/images/street.png">
      <div className="flex flex-col items-center justify-start p-2 bg-black border-4 border-gray-800 text-white font-pixel shadow-[inset_0_10px_50px_rgba(0,0,0,0.8)] min-h-[400px]">
        
        {/* IDLE / MATCHING */}
        {(gameState === 'idle' || gameState === 'matching') && (
          <div className="flex flex-col items-center gap-6 mt-10 w-full px-2">
            <div className="w-full max-w-[320px] aspect-video border-4 border-red-900 bg-gray-900 overflow-hidden relative shadow-lg mb-4">
              <img src="/images/street.png" className="w-full h-full object-cover opacity-60" alt="street" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                {gameState === 'matching' ? (
                  <>
                    <div className="animate-spin w-8 h-8 border-4 border-t-yellow-500 border-gray-600 rounded-full mb-2" />
                    <span className="text-yellow-400 text-lg">SCANNERIZZAZIONE FREQUENZE...</span>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl md:text-2xl font-black italic text-red-500 mb-2">UNDERGROUND HUB</h2>
                    <p className="text-[10px] text-gray-300">Scegli il tracciato e l'avversario. Rischia 500€.</p>
                  </>
                )}
              </div>
            </div>
            
            {gameState === 'idle' && (
              <div className="flex flex-col w-full max-w-[320px] bg-win98-gray p-2 border-4 border-t-white border-l-white border-b-gray-600 border-r-gray-600 text-black shadow-lg">
                <div className="bg-blue-800 text-white px-2 py-1 font-bold text-xs mb-3 shadow-inner">
                  1. SELEZIONA TRACCIATO
                </div>
                <select 
                  value={selectedTrackId} 
                  onChange={(e) => setSelectedTrackId(e.target.value)}
                  className="w-full border-2 border-gray-400 p-2 mb-4 bg-white text-xs font-bold font-mono"
                >
                  <option value="random">Tracciato Casuale (Città)</option>
                  {(dbTracks.length > 0 || customTracks.length > 0) && (
                    <optgroup label="Tracciati Disponibili">
                      {dbTracks.map(t => <option key={`db_${t.id}`} value={`db_${t.id}`}>{t.name}</option>)}
                      {customTracks.map(t => <option key={`custom_${t.id}`} value={`custom_${t.id}`}>{t.name}</option>)}
                    </optgroup>
                  )}
                </select>

                <div className="bg-blue-800 text-white px-2 py-1 font-bold text-xs mb-3 shadow-inner">
                  2. SELEZIONA AVVERSARIO
                </div>
                <div className="flex flex-col gap-2 font-mono">
                  <button onClick={() => findOpponent('similar')} className="bg-gray-300 text-black py-2 border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 font-bold hover:bg-gray-200 active:translate-y-px text-xs">
                    Avversario Simile
                  </button>
                  <button onClick={() => findOpponent('random')} className="bg-gray-300 text-black py-2 border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 font-bold hover:bg-gray-200 active:translate-y-px text-xs">
                    Avversario Casuale
                  </button>
                  
                  {customOpponents.length > 0 && (
                    <div className="flex border-2 border-gray-500 mt-2 bg-white p-1 gap-1">
                      <select 
                        value={selectedOpponentId} 
                        onChange={(e) => setSelectedOpponentId(e.target.value)}
                        className="flex-1 bg-transparent text-[10px] outline-none"
                      >
                        {customOpponents.map(opp => (
                          <option key={opp.id} value={opp.id}>{opp.name} ({typeof opp.car.brand === 'object' ? opp.car.brand?.name : opp.car.brand} {opp.car.name})</option>
                        ))}
                      </select>
                      <button onClick={() => findOpponent('specific')} className="bg-win98-gray px-2 py-1 border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 font-bold text-[10px] hover:bg-gray-200 active:translate-y-px">
                        SFIDA
                      </button>
                    </div>
                  )}
                </div>

                <button onClick={() => navigate('/map')} className="bg-gray-800 text-white py-2 border-2 border-gray-500 font-bold hover:bg-gray-700 text-sm mt-4">
                  Torna alla Mappa
                </button>
              </div>
            )}
          </div>
        )}

        {/* SETUP PHASE (COMPARISON) */}
        {gameState === 'setup' && opponent && (
          <div className="w-full flex flex-col h-full animate-in fade-in duration-500 overflow-y-auto custom-scroll p-1">
            <div className="bg-red-900/80 border-2 border-red-600 p-2 mb-2 text-center font-bold text-sm tracking-widest">
              SFIDA ACCETTATA - SCOMMESSA 500€
            </div>

            {/* HEAD TO HEAD IMAGES */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="flex flex-col items-center">
                <div className="w-full h-24 bg-gradient-to-b from-blue-900 to-black border-2 border-blue-500 p-1">
                  <img src={`/images/car/${playerCar?.image}`} className="w-full h-full object-contain" alt="mycar" />
                </div>
                <p className="text-[10px] mt-1 text-blue-400 font-bold uppercase leading-tight">{playerCar?.name}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase underline">TU (Lv. {playerLevel})</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-full h-24 bg-gradient-to-b from-red-900 to-black border-2 border-red-500 p-1">
                  <img src={`/images/car/${opponent.image}`} className="w-full h-full object-contain brightness-90 sepia-[.3]" alt="oppcar" />
                </div>
                <p className="text-[10px] mt-1 text-red-500 font-bold uppercase leading-tight">{opponent.name}</p>
                <p className="text-[9px] text-yellow-500 font-bold uppercase underline">{opponent.pilotName} (Lv. {opponent.level})</p>
              </div>
            </div>

            {/* STATS COMPARISON TABLE */}
            <div className="bg-gray-900 border border-gray-700 overflow-hidden text-[9px] mb-4">
              <div className="grid grid-cols-3 bg-gray-800 p-1 border-b border-gray-600 font-bold text-gray-400 text-center">
                <span>TU</span>
                <span className="text-white uppercase tracking-tighter">Parametro</span>
                <span>LUI</span>
              </div>
              {[
                { label: CAR_STAT_LABELS.speed, key: 'speed' },
                { label: CAR_STAT_LABELS.acceleration, key: 'acceleration' },
                { label: CAR_STAT_LABELS.revving, key: 'revving' },
                { label: CAR_STAT_LABELS.transmission, key: 'transmission' },
                { label: CAR_STAT_LABELS.brake, key: 'brake' },
                { label: CAR_STAT_LABELS.traction, key: 'traction' },
                { label: CAR_STAT_LABELS.turnSlow, key: 'turnSlow' },
                { label: CAR_STAT_LABELS.turnFast, key: 'turnFast' },
                { label: PILOT_STAT_LABELS.brave, key: 'brave', pilot: true },
                { label: PILOT_STAT_LABELS.clean, key: 'clean', pilot: true },
                { label: PILOT_STAT_LABELS.reflex, key: 'reflex', pilot: true },
                { label: PILOT_STAT_LABELS.acro, key: 'acro', pilot: true },
                { label: PILOT_STAT_LABELS.turn, key: 'turn', pilot: true },
                { label: PILOT_STAT_LABELS.brake, key: 'brake', pilot: true },
                { label: PILOT_STAT_LABELS.throttle, key: 'throttle', pilot: true },
                { label: PILOT_STAT_LABELS.shift, key: 'shift', pilot: true }
              ].map((s, i) => {
                const myVal = s.pilot ? pilotStats[s.key] : playerCarStats[s.key];
                const oppVal = s.pilot ? opponent.pilot[s.key] : opponent.stats[s.key];
                return (
                  <div key={i} className={`grid grid-cols-3 p-1 font-mono text-center ${i % 2 === 0 ? 'bg-black/30' : ''}`}>
                    <span className={myVal >= oppVal ? 'text-green-400' : 'text-gray-500'}>{myVal}</span>
                    <span className="text-gray-400">{s.label}</span>
                    <span className={oppVal > myVal ? 'text-red-400' : 'text-gray-500'}>{oppVal}</span>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={startRace}
              className="mt-auto bg-green-600 text-white py-3 border-4 border-t-green-400 border-l-green-400 border-b-green-900 border-r-green-900 font-bold text-lg hover:bg-green-500 shadow-lg"
            >
              ACCELERA (PAGA 500€)
            </button>
          </div>
        )}

        {/* RACING PHASE */}
        {gameState === 'racing' && (
          <div className="w-full flex flex-col h-full relative">
            {/* HUD */}
            <div className="grid grid-cols-3 gap-2 mb-2 p-2 bg-gray-900 border-b-2 border-red-600 relative overflow-hidden">
               <div className="bg-black/60 p-1 border border-blue-500/30">
                 <p className="text-[8px] text-gray-500">DISTANZA</p>
                 <p className={`text-xl font-bold ${gap >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                   {gap > 0 ? '+' : ''}{gap}m
                 </p>
               </div>
               <div className="flex flex-col items-center justify-center border-l border-r border-gray-700 px-2 min-w-[120px]">
                  <p className="text-[7px] text-yellow-500 font-bold">REQUISITI</p>
                  <p className="text-[9px] text-blue-400 uppercase text-center leading-none mb-1">
                    {CAR_STAT_LABELS[track[currentStep]?.carStat]} + {CAR_STAT_LABELS[track[currentStep]?.carTech]}
                  </p>
                  <p className="text-[9px] text-yellow-500 uppercase text-center leading-none">
                    {PILOT_STAT_LABELS[track[currentStep]?.driverStat]} + {PILOT_STAT_LABELS[track[currentStep]?.driverTech]}
                  </p>
               </div>
               <div className="text-right bg-black/60 p-1 border border-red-500/30">
                 <p className="text-[8px] text-gray-500">SETTORE {currentStep + 1}/{track.length}</p>
                 <p className="text-xs font-bold text-red-500 truncate uppercase">{track[currentStep]?.name}</p>
               </div>
            </div>

            {/* BATTLE LOG (SCANNER STYLE) */}
            <div className="flex-1 bg-black border border-gray-800 p-2 mb-2 overflow-y-auto font-mono text-[9px] leading-[1.1] shadow-inner text-gray-400">
               {battleLog.map((log, i) => (
                 <div key={i} className={`mb-1 ${i === 0 ? 'text-green-400 border-l-2 border-green-500 pl-1 py-1 bg-green-500/10' : ''}`}>
                   {`> ${log}`}
                 </div>
               ))}
               <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
            </div>

            {/* ACTION CENTER */}
            <div className="flex justify-between items-center bg-gray-900 border-t border-gray-700 p-1 mb-1">
              <button 
                onClick={() => setShowDebugLog(!showDebugLog)} 
                className="text-[9px] text-gray-400 underline hover:text-white"
              >
                {showDebugLog ? "Nascondi Log DM" : "Mostra Log DM"}
              </button>
            </div>
            
            {showDebugLog && (
              <div className="absolute top-12 left-0 w-full h-[80%] bg-black/95 border-2 border-red-500 z-50 flex flex-col p-2 overflow-y-auto custom-scroll shadow-2xl">
                <div className="flex justify-between items-center mb-2 border-b border-red-500 pb-1">
                  <span className="text-red-500 font-bold text-xs tracking-widest">DM DEBUG LOGGING</span>
                  <button onClick={() => setShowDebugLog(false)} className="text-white bg-red-900 px-2 border border-red-500 text-xs font-bold hover:bg-red-700">X</button>
                </div>
                {debugLogArray.length === 0 && <span className="text-gray-500 text-[10px]">Ancora nessun log...</span>}
                {debugLogArray.map((log, i) => (
                  <pre key={i} className="text-[9px] text-green-400 font-mono mb-3 whitespace-pre-wrap bg-green-900/20 p-1 border border-green-800/30">
                    {log}
                  </pre>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-1 pb-1">
               <button 
                 onClick={() => handleMove(null)}
                 className="bg-gray-300 text-black py-2 px-1 border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 text-[10px] font-bold hover:bg-gray-200"
               >
                 Guida Normale (Base Stats)
               </button>
               {availableMoves.map(move => {
                 const disabled = isMoveDisabled(move);
                 return (
                   <button 
                     key={move.id}
                     disabled={disabled}
                     onClick={() => handleMove(move.id)}
                     className={`py-2 px-1 border-2 text-[10px] font-bold flex flex-col items-center ${
                       disabled 
                       ? 'bg-gray-800 text-gray-600 border-gray-900 opacity-50' 
                       : 'bg-blue-800 text-white border-t-blue-400 border-l-blue-400 border-b-blue-900 border-r-blue-900 hover:bg-blue-700'
                     }`}
                   >
                     <span>{move.name}</span>
                     {!disabled && <span className="text-[8px] text-yellow-400">{getMoveBonusText(move)}</span>}
                   </button>
                 );
               })}
            </div>
          </div>
        )}

        {/* RESULT PHASE */}
        {gameState === 'result' && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-4 w-full">
            <h2 className={`text-3xl sm:text-5xl font-black italic drop-shadow-[4px_4px_0_rgba(0,0,0,1)] ${gap > 0 ? 'text-green-500' : 'text-red-600'}`}>
              {gap > 0 ? 'DOMINIO' : 'KO TECNICO'}
            </h2>
            
            <div className="bg-gray-900 border-4 border-double border-white/20 p-4 w-full max-w-[288px] shadow-2xl">
              <p className="text-[10px] text-gray-500 mb-2 font-bold tracking-widest uppercase">Rapporto di Gara</p>
              <div className="flex justify-between border-b border-white/10 py-2 text-sm">
                <span className="text-gray-400">Distacco:</span>
                <span className={gap > 0 ? 'text-green-400' : 'text-red-400'}>{gap} metri</span>
              </div>
              <div className="flex justify-between border-b border-white/10 py-2 text-sm">
                <span className="text-gray-400">Vincita:</span>
                <span className="text-yellow-400 font-bold">{gap > 0 ? '+1000€' : '-500€'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-[9px] text-gray-500 uppercase">
                <div className="text-left">Usura Gomme: <span className="text-red-400">{totalTireWear.toFixed(1)}%</span></div>
                <div className="text-right">Usura Motore: <span className="text-red-400">{totalEngineWear.toFixed(1)}%</span></div>
                <div className="text-left underline">Benzina: <span className="text-white">-{totalFuelCost}L</span></div>
              </div>
            </div>

              <button 
                onClick={fastRematch}
                className="w-full max-w-[288px] mb-2 bg-blue-800 text-white py-3 border-4 border-t-blue-400 border-l-blue-400 border-b-blue-900 border-r-blue-900 font-bold text-lg hover:bg-blue-700 shadow-xl active:translate-y-1"
              >
                RIVINCITA ISTANTANEA (PAGA 500€)
              </button>
              <button 
                onClick={() => {
                  setGameState('idle');
                }}
                className="w-full max-w-[288px] bg-win98-gray text-black py-3 border-4 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray font-bold text-lg hover:bg-gray-200 shadow-xl active:translate-y-1"
              >
                RITORNA AL HUB
              </button>
          </div>
        )}

      </div>
    </Win98Window>
  );
}
