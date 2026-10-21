import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Win98Window from './Win98Window';
import TrackPreview from './TrackPreview';
import { DEMO_TRACK, buildTacticalTrack } from '../../shared/trackGeometry.mjs';
import { routeProfileFor } from '../../shared/raceContext.mjs';
import TacticalControls from './TacticalControls';
import DevelopmentSummary from './DevelopmentSummary';
import RaceDashboard from './RaceDashboard';
import './race-ui.css';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useGameStore from '../store/gameStore';
import useRaceStore from '../store/raceStore';
import useRequestStore from '../store/requestStore';
import { fetchTracks, fetchCustomTracks, fetchCustomOpponents, fetchActiveRace, fetchRace, startRace, playRaceTurn, abandonRace } from '../services/api';
import { applyGameState } from '../services/gameState';
import { CAR_STAT_LABELS, PILOT_STAT_LABELS, getSectionType } from '../logic/raceEngine';
const button = 'px-4 py-2 font-bold border-2 border-t-white border-l-white border-b-gray-700 border-r-gray-700 bg-gray-200 text-black disabled:opacity-40';
function canPlay(move, section, gap) {
  return move.trigger === 'always' || (move.trigger === 'Gap-Negative' && gap < 0) || move.trigger === getSectionType(section);
}
export default function RacePage({ mode }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const requestedId = params.get('raceId');
  const entryId = params.get('entryId');
  const initialTrack = params.get('id') || '';
  const { id: userId } = usePlayerStore();
  const { cars } = useGarageStore();
  const { equippedCarId } = useGameStore();
  const { race } = useRaceStore();
  const pending = useRequestStore(state => state.pending);
  const [tracks, setTracks] = useState([]);
  const [customTracks, setCustomTracks] = useState([]);
  const [opponents, setOpponents] = useState([]);
  const [trackChoice, setTrackChoice] = useState(initialTrack ? `db-${initialTrack}` : mode === 'track' && !entryId ? 'demo' : '');
  const [demoPreset, setDemoPreset] = useState('matched');
  const [opponentChoice, setOpponentChoice] = useState('similar');
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const car = cars.find(car => car.id === equippedCarId);
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    Promise.all([fetchTracks(), mode === 'street' ? fetchCustomTracks() : [], mode === 'street' ? fetchCustomOpponents() : [],
      requestedId ? fetchRace(requestedId, userId) : fetchActiveRace(userId).then(active => active ? fetchRace(active.id, userId) : null)
    ]).then(([allTracks, customs, rivals, data]) => {
      if (cancelled) return;
      setTracks(allTracks); setCustomTracks(customs); setOpponents(rivals);
      if (data) applyGameState(data); else useRaceStore.setState({ race: null });
      setLoaded(true); setError('');
    }).catch(error => { if (!cancelled) { setError(error.message); setLoaded(true); } });
    return () => { cancelled = true; };
  }, [userId, mode, requestedId]);
  const begin = async () => {
    try {
      const setup = { mode: entryId ? 'championship' : mode, ...(entryId ? { entryId: Number(entryId) } : {}) };
      if (trackChoice === 'demo' && !entryId) { setup.demo = true; setup.demoPreset = demoPreset; }
      if (trackChoice.startsWith('db-')) setup.trackId = Number(trackChoice.slice(3));
      if (trackChoice.startsWith('custom-')) setup.customTrackId = Number(trackChoice.slice(7));
      if (opponentChoice.startsWith('custom-')) setup.opponentId = Number(opponentChoice.slice(7));
      else setup.opponentKind = opponentChoice;
      const data = await startRace(userId, setup);
      setParams({ raceId: data.race.id }, { replace: true });
      setError('');
    } catch (error) { setError(error.message); }
  };
  const turn = async (moveId, decision) => {
    try { await playRaceTurn(race.id, userId, race.version, moveId, decision); setError(''); }
    catch (error) {
      setError(error.message);
      // Refresh checkpoints even when a response was lost after a successful save.
      try { applyGameState(await fetchRace(race.id, userId)); } catch { /* Keep retry available. */ }
    }
  };
  const abandon = async () => {
    try { await abandonRace(race.id, userId, race.version); setError(''); }
    catch (error) { setError(error.message); }
  };
  const newRace = () => { useRaceStore.setState({ race: null }); setParams({}, { replace: true }); };
  const section = race?.sections[race.index];
  const labels = { ...CAR_STAT_LABELS, ...PILOT_STAT_LABELS };
  const selectedTrack = trackChoice.startsWith('custom-') ? customTracks.find(track => track.id === Number(trackChoice.slice(7)))
    : trackChoice.startsWith('db-') ? tracks.find(track => track.id === Number(trackChoice.slice(3))) : mode === 'track' ? tracks[0] : null;
  const previewProfile = routeProfileFor(mode, selectedTrack?.name);
  const previewSource = selectedTrack?.builds || selectedTrack?.sections || [];
  const previewDistance = selectedTrack ? Math.max(1, Number(selectedTrack.lenght || previewSource.length) / (Number(selectedTrack.lenght) >= 100 ? 1000 : 1)) : 0;
  const previewSections = trackChoice === 'demo' ? DEMO_TRACK.sections : previewSource.length ? buildTacticalTrack(previewSource.map(item => item.section), previewDistance, previewProfile) : [];

  return <Win98Window title={race?.mode === 'street' || mode === 'street' ? 'Corse clandestine' : 'Autodromo'} imageUrl={!race ? (mode === 'street' ? '/images/street.png' : '/images/track.png') : undefined}>
    <div className={`${race ? 'p-1 sm:p-3' : 'p-4'} space-y-4 text-black`}>
      {error && <div role="alert" className="bg-red-100 border border-red-500 p-3">{error} <button className="underline" onClick={() => window.location.reload()}>Ricarica salvataggio</button></div>}
      {!loaded || !userId ? <p>Caricamento gara e salvataggio…</p> : !race ? <>
        <h1 className="font-bold text-2xl">{entryId ? 'Round del campionato' : mode === 'street' ? 'Prepara la sfida' : 'Gara singola'}</h1>
        {car ? <p>Auto: <strong>{car.brand} {car.name}</strong> · {car.currentFuel.toFixed(2)} L · motore {car.engineHealth.toFixed(1)}% · gomme {car.tireGrip.toFixed(1)}%</p> : <button className={button} onClick={() => navigate('/garage/auto')}>Equipaggia un’auto</button>}
        {!entryId && <label className="block font-bold">Tracciato<select className="block w-full p-2 bg-white border" value={trackChoice} onChange={event => setTrackChoice(event.target.value)}>
          {mode === 'track' && <option value="demo">Circuito Scuola · 8 decisioni · prova gratuita</option>}
          <option value="">{mode === 'street' ? 'Tracciato casuale' : 'Primo circuito disponibile'}</option>
          {tracks.map(track => <option key={track.id} value={`db-${track.id}`}>{track.name}</option>)}
          {customTracks.map(track => <option key={`custom-${track.id}`} value={`custom-${track.id}`}>{track.name} · allenamento senza premi</option>)}
        </select></label>}
        {trackChoice === 'demo' && !entryId && <div className="bg-blue-100 border border-blue-800 p-3 space-y-2">
          <p className="font-bold">Laboratorio tattico · 3,04 km</p><p className="text-sm">Otto decisioni fra rettilinei, tornanti e curve. Prova gratuita senza premi, con consumo e usura salvati sulla tua auto.</p>
          <label className="block font-bold">Confronto<select className="block w-full p-2 bg-white border" value={demoPreset} onChange={event => setDemoPreset(event.target.value)}><option value="matched">Auto equivalente · pilota intermedio</option><option value="rookie">Auto più potente · principiante</option><option value="trained">Auto più potente · pilota preparato</option><option value="superior">Auto nettamente superiore · pilota preparato</option></select></label>
          <p className="text-xs">Le vetture vengono scelte dal catalogo per rapporto potenza/peso. Il confronto dipende anche dalla tua auto e dalle abilità del tuo pilota.</p>
        </div>}
        {!entryId && <TrackPreview sections={previewSections} paths={trackChoice === 'demo' ? DEMO_TRACK.mapPaths : null} profile={previewProfile} />}
        {!entryId && mode === 'street' && !previewSections.length && <p className="text-sm">Scegli un percorso per vedere i settori prima della partenza. Con la scelta casuale li scoprirai all’avvio.</p>}
        {mode === 'street' && <label className="block font-bold">Avversario<select className="block w-full p-2 bg-white border" value={opponentChoice} onChange={event => setOpponentChoice(event.target.value)}>
          <option value="similar">Auto di categoria simile dal catalogo</option><option value="random">Auto casuale dal catalogo</option>
          {opponents.map(opponent => <option key={opponent.id} value={`custom-${opponent.id}`}>{opponent.name} · {opponent.car.name} · allenamento senza premi</option>)}
        </select></label>}
        <p className="text-sm">{trackChoice === 'demo' && !entryId ? 'Allenamento gratuito: nessun premio economico o XP. Per riparare o cambiare auto, termina o abbandona la sessione.' : mode === 'street' ? 'Sfida: quota €500 alla partenza. Vittoria: €1.500 restituiti (guadagno netto €1.000). Pareggio: quota restituita. Avversari e tracciati personalizzati: allenamento gratuito senza premi.' : entryId ? 'Il server registra il round e assegna i premi al termine del campionato.' : 'Vittoria: €500 e 100 XP. Usura e carburante vengono salvati dopo ogni settore.'}</p>
        <button className={button} disabled={!car || pending > 0} onClick={begin}>Inizia gara</button>
      </> : <RaceDashboard race={race} pending={pending} onAbandon={abandon}>
        {race.status === 'active' && section ? <>
          {race.rulesVersion === 3 ? <TacticalControls key={`${race.id}:${race.index}`} race={race} pending={pending} onTurn={turn} showAlerts={false} /> : <>
          <h2 className="font-bold text-xl">{section.name} · {getSectionType(section)}</h2>
          <p>Auto: {CAR_STAT_LABELS[section.carStat]} + {CAR_STAT_LABELS[section.carTech]} · Pilota: {PILOT_STAT_LABELS[section.driverStat]} + {PILOT_STAT_LABELS[section.driverTech]}</p>
          <div className="flex flex-wrap gap-2"><button disabled={pending > 0} className={button} onClick={() => turn(null)}>Guida normale</button>
            {race.moves.map(move => <button key={move.id} disabled={pending > 0 || !canPlay(move, section, race.gap)} className={button} onClick={() => turn(move.id)}>
              {move.name}<span className="block text-xs">{Object.entries(move.bonus).map(([key, value]) => `+${value} ${labels[key] || key}`).join(' · ')}</span>
              <span className="block text-xs">Usura extra: gomme {move.costGrip}% · motore {move.costHealth}% · consumo ×{move.aggressiveness}</span>
            </button>)}
          </div>
          <p className="text-sm">Le mosse migliorano soltanto le statistiche richieste dal settore. Peso e carburante influenzano le prestazioni; pioggia, neve e sterrato riducono l’aderenza. Le mosse aggressive aumentano consumo e rischio motore.</p>
          </>}
        </> : <div className="bg-yellow-100 border border-yellow-600 p-4 space-y-3">
          <h2 className="text-2xl font-bold">{race.lesson ? race.developmentSummary?.lesson?.passed ? 'Prova superata!' : 'Prova da ripetere' : race.outcome === 'win' ? 'Vittoria!' : race.outcome === 'draw' ? 'Pareggio' : 'Sconfitta'}</h2>
          {race.failure && <p>{race.failure === 'engine' ? 'Motore fuori uso.' : race.failure === 'fuel' ? 'Carburante insufficiente.' : 'Gara abbandonata.'}</p>}
          <p>Accreditati €{(race.reward?.money || 0).toFixed(2)} · +{race.reward?.xp || 0} XP. Risultato e condizioni della vettura salvati.</p>
          <DevelopmentSummary summary={race.developmentSummary} />
          {race.championship && <p>Campionato: {race.championship.playerPoints}–{race.championship.opponentPoints}. {race.championship.completed ? race.championship.champion ? 'Sei il campione!' : 'Campionato concluso.' : `Prossimo round: ${race.championship.nextRound}.`}</p>}
          <div className="flex flex-wrap gap-2"><button className={button} onClick={() => navigate(race.lesson ? '/garage/pilota' : '/racing')}>{race.lesson ? 'Profilo pilota e tecniche' : 'Centro Corse'}</button><button className={button} onClick={newRace}>Nuova gara</button><button className={button} onClick={() => navigate('/workshop')}>Officina</button></div>
        </div>}
      </RaceDashboard>}

    </div>
  </Win98Window>;
}
