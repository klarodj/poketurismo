import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useInventoryStore from '../store/inventoryStore';
import useGameStore from '../store/gameStore';
import Win98Window from '../components/Win98Window';
import {
  calculateRaceStats,
  resolveTurn,
  consumeSectionFuel,
  rollDungeonMaster,
  savingThrow,
  rollEngineFailure,
  getSectionType,
  CAR_STAT_LABELS,
  PILOT_STAT_LABELS
} from '../logic/raceEngine';
import { fetchTracks, saveCarStats } from '../services/api';

const formatStat = (labels, stat) => labels[stat] || stat || '—';
const formatMoveBonus = (move) => Object.entries(move?.bonus || {})
  .map(([stat, value]) => `${value > 0 ? '+' : ''}${value} ${CAR_STAT_LABELS[stat] || PILOT_STAT_LABELS[stat] || stat}`)
  .join(' · ');

function isMovePlayable(move, section, gap) {
  if (move.trigger === 'always') return true;
  if (move.trigger === 'Gap-Negative' && gap < 0) return true;
  return move.trigger?.toLowerCase() === getSectionType(section).toLowerCase();
}

function moveCosts(move, car) {
  return {
    fuel: consumeSectionFuel(car, move),
    tires: move?.costGrip || 0,
    engine: move?.costHealth || 0
  };
}

export default function TrackRace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trackId = searchParams.get('id');
  const { addMoney, addXp, stats: pilotStats } = usePlayerStore();
  const { cars, isLoading: garageLoading, updateCarFuel, applyWear } = useGarageStore();
  const { moves, equippedMoves } = useInventoryStore();
  const { equippedCarId, triggerEvent } = useGameStore();
  const car = cars.find((item) => item.id === equippedCarId);
  const carId = car?.id;

  const [track, setTrack] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [readyRaceKey, setReadyRaceKey] = useState('');
  const [phase, setPhase] = useState('loadout');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [gap, setGap] = useState(0);
  const [logs, setLogs] = useState([]);
  const [totalTireWear, setTotalTireWear] = useState(0);
  const [totalEngineWear, setTotalEngineWear] = useState(0);
  const [engineFailed, setEngineFailed] = useState(false);
  const loadedRaceKeyRef = useRef('');
  const raceStartCondition = useRef(null);
  const playerMoves = moves.filter((move) => equippedMoves.includes(move.id));
  const currentSection = track?.sections[currentSectionIndex];
  const gapPosition = Math.max(8, Math.min(92, 50 + gap / 2));
  const raceKey = trackId && carId ? `${trackId}:${carId}` : '';
  const loading = Boolean(car && raceKey && readyRaceKey !== raceKey);

  useEffect(() => {
    if (!trackId) {
      navigate('/racing');
      return;
    }
    if (!carId) return;

    const raceKey = `${trackId}:${carId}`;
    if (loadedRaceKeyRef.current === raceKey) return;
    loadedRaceKeyRef.current = raceKey;

    let cancelled = false;
    const playerCar = useGarageStore.getState().cars.find((item) => item.id === carId);
    const playerStats = usePlayerStore.getState().stats;
    fetchTracks().then((allTracks) => {
      if (cancelled) return;
      setLoadError('');
      const found = allTracks.find((item) => item.id === Number(trackId));
      if (!found) {
        setLoadError('Questo tracciato non è disponibile. Torna al Centro Corse e scegline un altro.');
        return;
      }

      const sections = found.builds
        .slice()
        .sort((a, b) => a.ord - b.ord)
        .map(({ section }) => ({
          ...section,
          type: getSectionType(section)
        }));

      const playerCarStats = calculateRaceStats(playerCar);
      const opponentCarStats = {};
      Object.keys(playerCarStats).forEach((key) => {
        if (typeof playerCarStats[key] === 'number') {
          opponentCarStats[key] = Math.round(playerCarStats[key] * (0.85 + Math.random() * 0.25));
        }
      });
      const opponentPilot = {};
      Object.keys(playerStats).forEach((key) => {
        opponentPilot[key] = Math.round(playerStats[key] * (0.8 + Math.random() * 0.4));
      });

      setTrack({
        ...found,
        sections,
        weather: found.meteo.name,
        reward: 500,
        xp: 100,
        opponent: {
          name: 'Rival tuned',
          carName: 'Sere Speedster',
          stats: { ...opponentCarStats, pilot: opponentPilot }
        }
      });
    }).catch((error) => {
      if (cancelled) return;
      console.error('Failed to load race track:', error);
      setLoadError('Impossibile caricare il tracciato. Riprova dal Centro Corse.');
    }).finally(() => {
      if (!cancelled) setReadyRaceKey(raceKey);
    });

    return () => {
      cancelled = true;
    };
  }, [trackId, navigate, carId]);

  const addLog = (message) => setLogs((previous) => [...previous, message]);

  const handleStartRace = () => {
    if (car.engineHealth <= 0) {
      triggerEvent({ type: 'error', title: 'Motore Fuso', message: 'Il motore è distrutto! Vai dal meccanico per rifarlo.' });
      return;
    }
    if (!track.sections.length) {
      triggerEvent({ type: 'error', title: 'Tracciato non valido', message: 'Questo circuito non ha settori utilizzabili.' });
      return;
    }
    raceStartCondition.current = {
      engineHealth: car.engineHealth,
      tireGrip: car.tireGrip
    };
    setCurrentSectionIndex(0);
    setGap(0);
    setTotalTireWear(0);
    setTotalEngineWear(0);
    setEngineFailed(false);
    setLogs([`🚩 Partenza dal ${track.name}! Meteo: ${track.weather}.`]);
    setPhase('racing');
  };

  const handleFinishRace = (finalGap, engineBroken, tireWear, engineWear) => {
    setPhase('result');
    setGap(finalGap);
    setEngineFailed(engineBroken);
    const won = finalGap > 0 && !engineBroken;
    if (won) {
      addLog(`🏆 VITTORIA CONTRO ${track.opponent.name}!`);
      addMoney(track.reward);
      addXp(track.xp);
      triggerEvent({
        type: 'info',
        title: 'Gara Conclusa',
        message: `Hai vinto! Gap finale: +${finalGap}m. Premio: €${track.reward} e ${track.xp} XP.`
      });
    } else {
      addLog(`❌ SCONFITTA. ${track.opponent.name} ti ha battuto.`);
      triggerEvent({
        type: 'info',
        title: 'Gara Conclusa',
        message: `Hai perso. Gap finale: ${finalGap}m. L'avversario era troppo veloce.`
      });
    }

    const initialCondition = raceStartCondition.current || car;
    saveCarStats(car.id, {
      km: track.sections.length * 10,
      engineHealth: engineBroken ? 0 : Math.max(0, initialCondition.engineHealth - engineWear),
      tireGrip: Math.max(0, initialCondition.tireGrip - tireWear)
    }).catch((error) => {
      console.error('Failed to persist race stats:', error);
      triggerEvent({
        type: 'error',
        title: 'Salvataggio gara non riuscito',
        message: 'La gara è terminata, ma i dati di usura non sono stati salvati sul server.'
      });
    });
  };

  const handlePlayTurn = (move) => {
    const section = track.sections[currentSectionIndex];
    const currentStats = calculateRaceStats(car);
    const costs = moveCosts(move, car);
    const nextTireWear = totalTireWear + costs.tires;
    const nextEngineWear = totalEngineWear + costs.engine;
    addLog(`— ${section.name} · ${getSectionType(section)} —`);
    addLog(move ? `Strategia: ${move.name}.` : 'Strategia: guida normale.');

    const event = rollDungeonMaster();
    let saved = false;
    if (event) {
      saved = savingThrow(pilotStats, event);
      addLog(saved
        ? `⚠️ ${event.type}: riflessi pronti, pericolo schivato!`
        : `💥 ${event.type}: perdi velocità nel settore.`);
      triggerEvent({
        type: 'info',
        title: saved ? 'Pericolo schivato!' : 'Imprevisto in pista',
        message: saved
          ? `${event.type}: i tuoi riflessi ti hanno salvato.`
          : `${event.type}: subisci una penalità in questo settore.`
      });
    }

    const { delta } = resolveTurn(section, currentStats, pilotStats, move, track.opponent.stats, event, saved);
    const newGap = gap + delta;
    const riskMultiplier = move?.costHealth > 1 ? 1.5 : 1;
    const engineBroken = rollEngineFailure(car, riskMultiplier);

    updateCarFuel(car.id, -costs.fuel);
    if (costs.tires || costs.engine || engineBroken) {
      applyWear(car.id, costs.tires, engineBroken ? 100 : costs.engine);
    }
    setTotalTireWear(nextTireWear);
    setTotalEngineWear(engineBroken ? 100 : nextEngineWear);
    setGap(newGap);
    addLog(`${delta > 0 ? '▲' : delta < 0 ? '▼' : '＝'} ${delta > 0 ? '+' : ''}${delta}m. Gap totale: ${newGap > 0 ? '+' : ''}${newGap}m.`);
    addLog(`Consumi: -${costs.fuel.toFixed(2)}L · gomme -${costs.tires}% · motore -${engineBroken ? 100 : costs.engine}%.`);

    if (engineBroken) {
      addLog('🔥 FUMO DAL COFANO! Il motore si è fermato.');
      handleFinishRace(newGap, true, nextTireWear, 100);
      return;
    }

    if (currentSectionIndex + 1 < track.sections.length) {
      setCurrentSectionIndex((index) => index + 1);
    } else {
      handleFinishRace(newGap, false, nextTireWear, nextEngineWear);
    }
  };

  if (garageLoading || loading) {
    return <Win98Window title="Gara"><div className="p-4 italic">Caricamento tracciato e griglia di partenza...</div></Win98Window>;
  }
  if (!car) {
    return (
      <Win98Window title="Gara">
        <div className="p-6 text-center text-black">
          <p className="mb-4">Non hai un'auto equipaggiata per la gara.</p>
          <button onClick={() => navigate('/garage/auto')} className="bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray px-5 py-2 font-bold">
            Vai al Garage
          </button>
        </div>
      </Win98Window>
    );
  }

  if (loadError) {
    return (
      <Win98Window title="Gara">
        <div className="p-6 text-center text-black">
          <p className="mb-4">{loadError}</p>
          <button onClick={() => navigate('/racing')} className="bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray px-5 py-2 font-bold">
            Torna al Centro Corse
          </button>
        </div>
      </Win98Window>
    );
  }
  if (!car || !track) return null;

  return (
    <Win98Window title={`Track: ${track.name}`} imageUrl="/images/track.png">
      <div className="flex flex-col bg-win98-bg text-white p-2">
        {phase === 'loadout' && (
          <div className="bg-win98-gray text-black p-4 border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray">
            <h2 className="text-xl font-bold bg-win98-blue text-white p-1 mb-4">GRIGLIA DI PARTENZA</h2>
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div className="bg-white border border-gray-400 p-3">
                <p><strong>Circuito:</strong> {track.name}</p>
                <p><strong>Meteo:</strong> {track.weather}</p>
                <p><strong>Settori:</strong> {track.sections.length}</p>
                <p><strong>Auto:</strong> {car.name}</p>
                <p><strong>Carburante:</strong> {car.currentFuel.toFixed(1)}L</p>
              </div>
              <div className="bg-[#101820] text-green-300 border-2 border-gray-600 p-3 font-pixel">
                <p className="text-white">AVVERSARIO IN GRIGLIA</p>
                <p className="text-lg">{track.opponent.name}</p>
                <p>{track.opponent.carName}</p>
                <p className="text-yellow-300">Premio: €{track.reward} · {track.xp} XP</p>
              </div>
            </div>

            <h3 className="font-bold border-b border-gray-400 mb-2">IL TUO PIANO GARA</h3>
            {playerMoves.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {playerMoves.map((move) => (
                  <div key={move.id} className="bg-white border border-gray-400 p-2 text-xs">
                    <div className="font-bold text-[#008080]">{move.name}</div>
                    <div>{move.description}</div>
                    {formatMoveBonus(move) && <div className="mt-1 font-bold text-green-800">Bonus: {formatMoveBonus(move)}</div>}
                    <div className="mt-1 text-gray-600">
                      Attivazione: {move.trigger === 'always' ? 'sempre' : move.trigger}
                      {' · '}Gomme -{move.costGrip || 0}%
                      {' · '}Motore -{move.costHealth || 0}%
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-4 text-sm">Nessuna mossa equipaggiata: potrai comunque scegliere la guida normale.</p>
            )}

            <h3 className="font-bold border-b border-gray-400 mb-2">ORDINE DEI SETTORI</h3>
            <div className="flex flex-wrap gap-2 mb-5">
              {track.sections.map((section, index) => (
                <div key={section.id} className="bg-blue-50 border border-blue-300 px-3 py-2 text-xs">
                  <strong>{index + 1}. {section.name}</strong>
                  <div>{getSectionType(section)} · {formatStat(CAR_STAT_LABELS, section.carStat)}</div>
                </div>
              ))}
            </div>

            <button onClick={handleStartRace} className="w-full bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray font-bold py-2 active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white">
              🚦 SCENDI IN PISTA
            </button>
          </div>
        )}

        {phase === 'racing' && currentSection && (
          <div className="flex flex-col gap-2">
            <div className="bg-black text-green-400 font-pixel p-3 border-2 border-gray-600">
              <div className="flex justify-between gap-2 border-b border-green-900 pb-2">
                <div>GAP <span className={gap >= 0 ? 'text-blue-300' : 'text-red-400'}>{gap > 0 ? '+' : ''}{gap}m</span></div>
                <div>Benzina {car.currentFuel.toFixed(1)}L</div>
                <div>Settore {currentSectionIndex + 1}/{track.sections.length}</div>
              </div>
              <div className="relative h-8 mt-3 bg-gray-800 border border-gray-500 overflow-hidden" role="img" aria-label={`Posizione relativa: ${gap > 0 ? 'in vantaggio' : gap < 0 ? 'in svantaggio' : 'alla pari'}, ${Math.abs(gap)} metri`}>
                <div className="absolute top-0 bottom-0 left-1/2 border-l border-dashed border-white/50" />
                <div className="absolute top-1 left-1 h-2/3 w-3 bg-cyan-300 transition-all duration-500" style={{ left: `${gapPosition}%` }} />
                <div className="absolute top-1 left-1 h-2/3 w-3 bg-red-400" style={{ left: `${100 - gapPosition}%` }} />
                <span className="absolute bottom-0 left-2 text-[9px] text-cyan-200">TU</span>
                <span className="absolute bottom-0 right-2 text-[9px] text-red-200">RIVALE</span>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-2" aria-label="Progresso gara">
                {track.sections.map((section, index) => (
                  <div key={section.id} className={`h-1 ${index < currentSectionIndex ? 'bg-green-400' : index === currentSectionIndex ? 'bg-yellow-300 animate-pulse' : 'bg-gray-700'}`} />
                ))}
              </div>
              <div className="flex justify-between gap-2 text-[10px] italic pt-2">
                <div className="text-blue-200">Auto: {formatStat(CAR_STAT_LABELS, currentSection.carStat)} + {formatStat(CAR_STAT_LABELS, currentSection.carTech)}</div>
                <div className="text-yellow-200 text-right">Pilota: {formatStat(PILOT_STAT_LABELS, currentSection.driverStat)} + {formatStat(PILOT_STAT_LABELS, currentSection.driverTech)}</div>
              </div>
            </div>

            <div className="bg-black border-2 border-gray-600 p-3 font-pixel text-xs max-h-48 overflow-y-auto" aria-live="polite">
              {logs.slice(-6).map((log, index) => (
                <div key={`${logs.length}-${index}`} className={`mb-1 ${index === logs.slice(-6).length - 1 ? 'text-white' : 'text-gray-400'}`}>{`> ${log}`}</div>
              ))}
              <div className="text-yellow-200 mt-2 animate-pulse">PROSSIMA MOSSA: {currentSection.name} ({getSectionType(currentSection)})</div>
            </div>

            <div className="bg-win98-gray text-black p-2 border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray">
              <p className="font-bold text-sm mb-2">Scegli la strategia per questo settore</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button onClick={() => handlePlayTurn(null)} className="bg-white hover:bg-green-50 border-2 border-gray-500 p-2 text-left">
                  <span className="block font-bold">Guida normale</span>
                  <span className="block text-xs">Nessun costo extra · {moveCosts(null, car).fuel.toFixed(2)}L carburante</span>
                </button>
                {playerMoves.map((move) => {
                  const playable = isMovePlayable(move, currentSection, gap);
                  const costs = moveCosts(move, car);
                  return (
                    <button key={move.id} onClick={() => handlePlayTurn(move)} disabled={!playable} className={`border-2 p-2 text-left ${playable ? 'bg-blue-50 hover:bg-blue-100 border-blue-700' : 'bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed'}`}>
                      <span className="block font-bold">{move.name}{playable ? '' : ' · non disponibile'}</span>
                      <span className="block text-xs">{move.description}</span>
                      {formatMoveBonus(move) && <span className="block text-xs font-bold text-green-800">Bonus: {formatMoveBonus(move)}</span>}
                      <span className="block text-[11px] mt-1">
                        Trigger: {move.trigger === 'always' ? 'sempre' : move.trigger}
                        {' · '}Carburante -{costs.fuel.toFixed(2)}L
                        {' · '}Gomme -{costs.tires}% · Motore -{costs.engine}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="bg-win98-gray text-black p-6 border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray flex flex-col items-center text-center">
            <div className="text-4xl mb-3 font-bold">{engineFailed ? '💥 RITIRO!' : gap > 0 ? '🏆 VITTORIA!' : '🏁 SCONFITTA'}</div>
            <div className="text-lg mb-1">Gap al ritiro: {gap > 0 ? '+' : ''}{gap}m</div>
            <div className="mb-5">{!engineFailed && gap > 0 ? `Premio: €${track.reward} e ${track.xp} XP` : 'Rimettiti in sesto e torna a sfidare il rivale.'}</div>
            <div className="w-full max-w-sm bg-white border border-gray-400 p-3 text-left text-sm mb-5">
              <div>Gomme consumate: {totalTireWear}%</div>
              <div>Usura motore: {totalEngineWear}%</div>
              <div>Settori completati: {Math.min(currentSectionIndex + (engineFailed ? 0 : 1), track.sections.length)}/{track.sections.length}</div>
            </div>
            <button onClick={() => navigate('/racing')} className="bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray px-8 py-2 font-bold hover:bg-gray-200">
              Torna al Centro Corse
            </button>
          </div>
        )}
      </div>
    </Win98Window>
  );
}
