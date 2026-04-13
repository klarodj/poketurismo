import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Win98Window from '../components/Win98Window';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useInventoryStore from '../store/inventoryStore';
import useGameStore from '../store/gameStore';
import { 
  calculateRaceStats, 
  resolveTurn,
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

  // Get current car data
  const playerCar = useMemo(() => cars.find(c => c.id === equippedCarId), [cars, equippedCarId]);
  const playerCarStats = useMemo(() => playerCar ? calculateRaceStats(playerCar) : null, [playerCar]);

  // Moves helper
  const availableMoves = useMemo(() => {
    return moves.filter(m => equippedMoves.includes(m.id));
  }, [moves, equippedMoves]);

  const addLog = (msg) => setBattleLog(prev => [msg, ...prev].slice(0, 15));

  // --- 1. SEARCH OPPONENT ---
  const findOpponent = () => {
    if (!playerCar) return;

    setGameState('matching');
    setTotalFuelCost(0);
    setTotalTireWear(0);
    setTotalEngineWear(0);
    
    setTimeout(() => {
      const isZarra = Math.random() > 0.5;
      const suffix = isZarra ? " Zarra" : " Tuned";
      
      const oppStats = {};
      Object.keys(playerCarStats).forEach(key => {
        if (typeof playerCarStats[key] === 'number') {
          oppStats[key] = Math.round(playerCarStats[key] * (0.9 + Math.random() * 0.25));
        }
      });

      const oppPilot = {
        shift: Math.round(pilotStats.shift * (0.8 + Math.random() * 0.4)),
        reflex: Math.round(pilotStats.reflex * (0.8 + Math.random() * 0.4)),
        brave: Math.round(pilotStats.brave * (0.8 + Math.random() * 0.4)),
        clean: Math.round(pilotStats.clean * (0.8 + Math.random() * 0.4)),
        acro: Math.round(pilotStats.acro * (0.8 + Math.random() * 0.4)),
        turn: Math.round(pilotStats.turn * (0.8 + Math.random() * 0.4)),
        brake: Math.round(pilotStats.brake * (0.8 + Math.random() * 0.4)),
        throttle: Math.round(pilotStats.throttle * (0.8 + Math.random() * 0.4)),
      };

      const oppLevel = Math.max(1, playerLevel + (Math.floor(Math.random() * 3) - 1));
      const pilotName = OPPONENT_NAMES[Math.floor(Math.random() * OPPONENT_NAMES.length)];

      setOpponent({
        name: (playerCar.brand || "") + " " + (playerCar.name || "") + suffix,
        pilotName,
        level: oppLevel,
        stats: oppStats,
        pilot: oppPilot,
        image: playerCar.image
      });

      const shuffled = [...TRACK_POOL].sort(() => 0.5 - Math.random());
      const raceTrack = shuffled.slice(0, 3 + Math.floor(Math.random() * 2));
      setTrack(raceTrack);

      setGameState('setup');
    }, 1500);
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
    const reqStat = section.reqStat;
    
    // Player Score
    let myScore = playerCarStats[reqStat] + (move.bonus[reqStat] || 0) + (pilotStats.shift * 2);
    
    // DM RNG
    let logMsg = "";
    if (Math.random() < 0.10) {
      const dice = Math.random() * 20 + pilotStats.reflex;
      if (dice > 15) {
        logMsg = "⚠️ Pericolo evitato! Riflessi pronti!";
      } else {
        myScore -= 20;
        logMsg = "❌ Errore sotto pressione! Perdi terreno.";
      }
    }

    // Accumulate costs
    setTotalFuelCost(prev => prev + (move.aggressiveness || 1) * 2); 
    setTotalTireWear(prev => prev + (move.costGrip || 1));
    setTotalEngineWear(prev => prev + (move.costHealth || 0.5));

    // Use centralized resolveTurn
    const delta = resolveTurn(section, playerCarStats, pilotStats, move, opponent, null, false);
    const newGap = gap + delta;

    setGap(newGap);
    addLog(`${section.name}: ${move.name}. ${delta > 0 ? 'Guadagnati' : 'Persi'} ${Math.abs(delta)}m. Requisiti: ${CAR_STAT_LABELS[section.carStat]} + ${PILOT_STAT_LABELS[section.driverStat]}. ${logMsg}`);

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
    <Win98Window title="Street Racing - Viale Industriale" imageUrl="/images/street.png">
      <div className="flex flex-col items-center justify-start p-2 bg-black border-4 border-gray-800 text-white font-pixel shadow-[inset_0_10px_50px_rgba(0,0,0,0.8)] min-h-[400px]">
        
        {/* IDLE / MATCHING */}
        {(gameState === 'idle' || gameState === 'matching') && (
          <div className="flex flex-col items-center gap-6 mt-10">
            <div className="w-80 h-40 border-4 border-red-900 bg-gray-900 overflow-hidden relative shadow-lg">
              <img src="/images/street.png" className="w-full h-full object-cover opacity-60" alt="street" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                {gameState === 'matching' ? (
                  <>
                    <div className="animate-spin w-8 h-8 border-4 border-t-yellow-500 border-gray-600 rounded-full mb-2" />
                    <span className="text-yellow-400 text-lg">SCANNERIZZAZIONE FREQUENZE...</span>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-black italic text-red-500 mb-2">UNDERGROUND HUB</h2>
                    <p className="text-[10px] text-gray-300">Trova una sfida. Rischia tutto. Diventa leggenda.</p>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={findOpponent}
                disabled={gameState === 'matching'}
                className="bg-win98-gray text-black px-8 py-3 border-4 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray font-bold hover:bg-gray-200 active:translate-y-1"
              >
                Cerca Avversario
              </button>
              <button 
                onClick={() => navigate('/map')}
                className="bg-gray-800 text-white px-8 py-3 border-2 border-gray-500 font-bold hover:bg-gray-700"
              >
                Vai Via
              </button>
            </div>
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
          <div className="w-full flex flex-col h-full">
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
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-4">
            <h2 className={`text-5xl font-black italic drop-shadow-[4px_4px_0_rgba(0,0,0,1)] ${gap > 0 ? 'text-green-500' : 'text-red-600'}`}>
              {gap > 0 ? 'DOMINIO' : 'KO TECNICO'}
            </h2>
            
            <div className="bg-gray-900 border-4 border-double border-white/20 p-4 w-72 shadow-2xl">
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
              onClick={() => setGameState('idle')}
              className="bg-win98-gray text-black px-16 py-4 border-4 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray font-bold text-lg hover:bg-gray-200 shadow-xl active:translate-y-1"
            >
              RITORNA AL HUB
            </button>
          </div>
        )}

      </div>
    </Win98Window>
  );
}
