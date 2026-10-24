import {trackVisual} from '../../shared/trackVisuals.mjs';
import TrackIllustration from '../components/TrackIllustration';
import ChampionshipTable from '../components/ChampionshipTable';
import {championshipCarErrors} from '../../shared/championshipCatalog.mjs';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Win98Window from '../components/Win98Window';
import useGarageStore from '../store/garageStore';
import useGameStore from '../store/gameStore';
import usePlayerStore from '../store/playerStore';
import useDevelopmentStore from '../store/developmentStore';
import useInventoryStore from '../store/inventoryStore';
import {
  fetchChampionships,
  fetchChampionshipHistory,
  fetchTrainingSessions,
  completeTraining,
  fetchActiveChampionshipEntry,
  enterChampionship
} from '../services/api';

// ─── HELPERS ────────────────────────────────────────────────────────────────

const STAT_LABELS = {
  brave: '💪 Coraggio',
  clean: '🧼 Pulizia',
  reflex: '⚡ Riflessi',
  shift: '⚙️ Cambiata',
  brake: '🛑 Frenata',
};

// Check if player's car meets championship requirements
function checkCarRequirements(car, champ) {
  return championshipCarErrors(car,champ);
}

function checkPilotRequirements(stats, level, champ) {
  const errors = [];
  if (level < champ.minLevel) errors.push(`Livello pilota min: ${champ.minLevel} (sei: ${level})`);
  if (stats.brave < champ.minBrave) errors.push(`Coraggio min: ${champ.minBrave}`);
  if (stats.clean < champ.minClean) errors.push(`Pulizia min: ${champ.minClean}`);
  if (stats.reflex < champ.minReflex) errors.push(`Riflessi min: ${champ.minReflex}`);
  if (stats.shift < champ.minShift) errors.push(`Cambiata min: ${champ.minShift}`);
  return errors;
}

// ─── CHAMPIONSHIP CARD ───────────────────────────────────────────────────────

function ChampionshipCard({champ,equippedCar,playerStats,playerLevel,playerMoney,activeEntry,joining,onEnter}){
 const isActive=activeEntry?.championshipId===champ.id,errors=[...checkCarRequirements(equippedCar,champ),...checkPilotRequirements(playerStats,playerLevel,champ)];
 const canEnter=isActive||(!activeEntry&&!errors.length&&playerMoney>=champ.entryFee),visual=trackVisual(champ.rounds?.[0]?.track?.name);
 return <article className="championship-listing"><h2>{champ.name}</h2><div className="championship-listing-overview">{visual&&<img src={visual.image} alt={visual.name} loading="lazy" width="144" height="96"/>}<div><p><strong>{champ.rounds?.length||0} gare</strong> · livello {champ.minLevel}+</p><p>{champ.minCv}–{champ.maxCv} CV · {champ.category}</p><p>Iscrizione <strong>€{champ.entryFee.toLocaleString('it-IT')}</strong></p></div></div><p className="championship-prize">Titolo: €{champ.rewardMoney.toLocaleString('it-IT')} · {champ.rewardXp} XP</p>
 {!canEnter&&<p className="period-notice">{activeEntry?'Concludi prima il campionato in corso.':errors[0]||`Mancano €${(champ.entryFee-playerMoney).toLocaleString('it-IT')} per l’iscrizione.`}</p>}
 <button type="button" className="win98-btn" disabled={!canEnter||joining} onClick={()=>onEnter(champ)}>{joining?'Iscrizione…':isActive?`Continua · round ${activeEntry.currentRound}`:canEnter?'Iscriviti · €'+champ.entryFee.toLocaleString('it-IT'):'Iscrizione non disponibile'}</button>
 <details className="period-details"><summary>Calendario, rivali e regolamento</summary><p>{champ.description}</p><p>{champ.format==='grid'?'Otto piloti · punti 10–8–6–5–4–3–2–1. Premi finali: 100% / 60% / 35% sul podio, 15% agli altri classificati.':'Campionato storico a duelli.'}</p><p>Trazione: {champ.allowedDrive==='any'?'libera':champ.allowedDrive}{champ.rules?.engineTypes?' · solo aspirati':''}{champ.rules?.brands?' · marchi italiani':''}{champ.rules?.drives?` · ${champ.rules.drives.join(', ')}`:''}</p>{errors.length>0&&<ul>{errors.map(e=><li key={e}>{e}</li>)}</ul>}
 {champ.drivers&&<details><summary>I sette rivali</summary><ul>{champ.drivers.map(d=><li key={d.id}>{d.name} · {d.carName} · abilità {d.skill}</li>)}</ul></details>}
 <ol>{champ.rounds?.map(r=><li key={r.id}><strong>Gara {r.ord} · {r.track?.name||'—'}</strong><p>Rivale tattico: {r.opponentName} · {r.opponentCarName}</p><details className="track-art-details"><summary>Mappa e ambientazione</summary><TrackIllustration name={r.track?.name} compact/></details></li>)}</ol></details></article>;
}

// ─── TRAINING CARD ──────────────────────────────────────────────────────────

function TrainingCard({ session, playerLevel, playerMoney, alreadyHasMove, onComplete, uses = 0 }) {
  const canAfford = playerMoney >= session.cost;
  const levelOk = playerLevel >= session.minLevel;
  const moveAlreadyUnlocked = session.category === 'move' && alreadyHasMove(session.targetMove);
  const assimilated = session.category === 'stat' && uses >= 3;
  const factor = session.category === 'stat' ? [1, 0.5, 0.25, 0][Math.min(3, uses)] : 1;
  const statGain = assimilated || session.statGain <= 0 ? 0 : Math.max(1, Math.floor(session.statGain * factor));
  const canDo = canAfford && levelOk && !moveAlreadyUnlocked && !assimilated;

  return (
    <div className="bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray shadow-win98-outset">
      <div className={`px-3 py-2 flex justify-between items-center ${session.category === 'move' ? 'bg-win98-blue' : 'bg-win98-blue'} text-white`}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-base">{session.name}</span>
          <span className="text-xs bg-white/20 border border-white/30 px-2 py-0.5">
            {session.category === 'move' ? '🎴 MOSSA' : '📊 STAT'}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-yellow-300 font-bold">+{Math.floor(session.xpReward * factor)} XP</span>
        </div>
      </div>

      <div className="p-3">
        <p className="text-sm text-gray-700 italic mb-3">{session.description}</p>

        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
          <div className="bg-white border border-gray-300 p-2 text-center">
            <div className="text-gray-500">Costo</div>
            <div className="font-bold text-red-700">€{session.cost.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-gray-300 p-2 text-center">
            <div className="text-gray-500">Livello min.</div>
            <div className="font-bold">{session.minLevel}</div>
          </div>
          <div className="bg-white border border-gray-300 p-2 text-center">
            <div className="text-gray-500">Ricompensa</div>
            <div className="font-bold text-green-700">
              {session.category === 'stat'
                ? `+${statGain} ${STAT_LABELS[session.targetStat] || session.targetStat}`
                : `🎴 ${session.targetMove}`}
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-2">
          📍 Tracciato: <span className="font-bold">{session.track?.name || '—'}</span>
        </div>

        {session.category === 'stat' && <p className="text-xs mb-2">{assimilated ? 'Corso assimilato: prova un altro allenamento.' : `Sessioni svolte: ${uses}/3. I benefici diminuiscono ripetendo lo stesso corso.`}</p>}
        {moveAlreadyUnlocked && (
          <div className="bg-green-50 border border-green-300 p-2 mb-2 text-xs text-green-700">
            ✅ Mossa già nel tuo Grimorio!
          </div>
        )}
        {!levelOk && (
          <div className="bg-red-50 border border-red-300 p-2 mb-2 text-xs text-red-700">
            ⛔ Livello insufficiente (min: {session.minLevel})
          </div>
        )}
        {!canAfford && levelOk && (
          <div className="bg-yellow-50 border border-yellow-300 p-2 mb-2 text-xs text-yellow-700">
            💰 Fondi insufficienti
          </div>
        )}

        <button
          onClick={() => canDo && onComplete(session)}
          disabled={!canDo}
          className={`w-full py-2 font-bold border-2 text-sm ${
            canDo
              ? 'bg-win98-gray border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray hover:bg-teal-50 active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white'
              : 'bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed'
          }`}
        >
          {assimilated ? 'Corso assimilato' : moveAlreadyUnlocked ? '✅ Già sbloccata' : canDo ? '🎓 Inizia Allenamento' : '🔒 Non disponibile'}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────

export default function Racing() {
  const navigate = useNavigate();
  const { cars } = useGarageStore();
  const { equippedCarId, triggerEvent } = useGameStore();
  const { id: userId, money, level, stats } = usePlayerStore();
  const { moves } = useInventoryStore();
  const development = useDevelopmentStore(state => state.development);

  const [activeTab, setActiveTab] = useState('competitions');
  const [championships, setChampionships] = useState([]);
  const [history,setHistory]=useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [loadError,setLoadError]=useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const equippedCar = cars.find(c => c.id === equippedCarId);

  useEffect(() => {
    if (!userId) return undefined;
    Promise.all([fetchChampionships(), fetchTrainingSessions(), fetchActiveChampionshipEntry(userId), fetchChampionshipHistory(userId)])
      .then(([champData, trainData, entry, previous]) => {
        setChampionships(champData);
        setTrainingSessions(trainData);
        setActiveEntry(entry);
        setHistory(previous);
        setLoading(false);
      })
      .catch(err => {
        setLoadError(err.message);
        setLoading(false);
      });
    return undefined;
  }, [userId]);

  const alreadyHasMove = (moveName) => moves.some(m => m.name === moveName);

  const handleEnterChampionship = async (champ) => {
    if (joining) return;
    if (!equippedCar) {
      triggerEvent({ type: 'error', title: 'Nessuna Auto', message: 'Equipaggia prima un\'auto nel garage!' });
      return;
    }
    if (equippedCar.currentFuel <= 0) {
      triggerEvent({ type: 'error', title: 'Carburante', message: 'Hai poco carburante. Fai il pieno prima di gareggiare.' });
      return;
    }
    if (activeEntry) {
      if (activeEntry.championshipId !== champ.id) {
        triggerEvent({ type: 'error', title: 'Campionato in corso', message: `Completa prima ${activeEntry.championship.name}.` });
        return;
      }
      const nextRound = activeEntry.championship.rounds.find((round) => round.ord === activeEntry.currentRound);
      if (nextRound) navigate(`/track-race?id=${nextRound.trackId}&entryId=${activeEntry.id}&round=${nextRound.ord}`);
      return;
    }
    if (!champ.rounds?.length) {
      triggerEvent({ type: 'error', title: 'Calendario non disponibile', message: 'Questo campionato non ha round configurati.' });
      return;
    }

    setJoining(true);
    try {
      const { entry } = await enterChampionship(champ.id, userId);
      setActiveEntry(entry);
      const firstRound = entry.championship.rounds.find((round) => round.ord === entry.currentRound);
      if (!firstRound) throw new Error('Il primo appuntamento del campionato non è disponibile.');
      navigate(`/track-race?id=${firstRound.trackId}&entryId=${entry.id}&round=${firstRound.ord}`);
    } catch (error) {
      console.error('Championship entry failed:', error);
      triggerEvent({ type: 'error', title: 'Iscrizione non riuscita', message: error.message });
    } finally {
      setJoining(false);
    }
  };

  const handleCompleteTraining = async (session) => {
    if (money < session.cost) {
      triggerEvent({ type: 'error', title: 'Fondi Insufficienti', message: `Ti mancano €${(session.cost - money).toLocaleString()}.` });
      return;
    }
    try {
      const data = await completeTraining(session.id, userId);
      triggerEvent({ type: 'success', title: 'Allenamento completato', message: session.category === 'move'
        ? `Hai imparato ${session.targetMove}. Gestisci le mosse dal profilo pilota.`
        : `${STAT_LABELS[session.targetStat] || session.targetStat}: +${data.training.statGain}. Esperienza e saldo salvati.` });
    } catch (error) {
      triggerEvent({ type: 'error', title: 'Allenamento non riuscito', message: error.message });
    }
  };

  const categories = ['all', ...new Set(championships.map(c => c.category))];
  const filteredChamps = filterCategory === 'all'
    ? championships
    : championships.filter(c => c.category === filterCategory);

  return (
    <Win98Window title="Autodromo — Centro Corse" imageUrl="/images/track.png">
      <div className="racing-page flex flex-col bg-win98-gray text-black">

        <button className="win98-btn m-2" onClick={()=>navigate('/autodrome')}>Torna all’Autodromo</button>
        {/* Top Tab Navigation */}
        <div className="flex bg-win98-gray p-1 gap-1 border-b-2 border-win98-darkerGray">
          <button
            onClick={() => setActiveTab('competitions')}
            className={`flex-1 py-3 font-bold text-base border-2 transition-all ${activeTab === 'competitions' ? 'bg-white border-win98-darkerGray shadow-win98-inset' : 'border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray hover:bg-gray-100'}`}
          >
            Campionati
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`flex-1 py-3 font-bold text-base border-2 transition-all ${activeTab === 'training' ? 'bg-white border-win98-darkerGray shadow-win98-inset' : 'border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray hover:bg-gray-100'}`}
          >
            Allenamento
          </button>
        </div>

        {loadError&&<p role="alert" className="period-notice">{loadError} <button className="win98-btn" onClick={()=>window.location.reload()}>Riprova</button></p>}
        {loading ? (
          <div className="flex-1 flex items-center justify-center italic text-gray-500 text-lg">
            Caricamento del calendario…
          </div>
        ) : (
          <div className="p-4">

            {/* ── COMPETITIONS TAB ── */}
            {activeTab === 'competitions' && (
              <div>
                {activeEntry && (
                  <div className="championship-active border-2 border-white p-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <div className="font-bold text-yellow-300 uppercase">🏁 Campionato in corso</div>
                      <div className="text-lg">{activeEntry.championship.name} · Round {activeEntry.currentRound}/{activeEntry.championship.rounds.length}</div>
                      <div className="text-sm text-black">
                        {activeEntry.format === 'grid' ? `Punti: ${activeEntry.playerPoints} · otto partecipanti` : `Classifica: ${activeEntry.playerPoints} — ${activeEntry.opponentPoints} punti`}
                      </div>
                      <div className="h-2 bg-gray-700 mt-2">
                        <div className="h-full bg-green-400" style={{ width: `${(activeEntry.results.length / activeEntry.championship.rounds.length) * 100}%` }} />
                      </div>
                    </div>
                    <button
                      onClick={() => handleEnterChampionship(activeEntry.championship)}
                      disabled={joining}
                      className="bg-green-700 text-white px-4 py-2 border-2 border-t-green-400 border-l-green-400 border-b-green-950 border-r-green-950 font-bold disabled:opacity-50"
                    >
                      Continua il campionato
                    </button>
                  </div>
                )}
                {activeEntry?.format === 'grid' && <details className="period-details mb-3"><summary>Classifica generale · {activeEntry.playerPoints} punti</summary><ChampionshipTable rows={activeEntry.standings}/></details>}
                {history.length > 0 && <details className="border border-gray-500 bg-white p-3 my-3"><summary className="cursor-pointer font-bold">Campionati conclusi ({history.length})</summary>{history.map(entry=><details key={entry.id} className="border-t border-gray-300 mt-3 pt-2"><summary className="cursor-pointer">{entry.championship.name} · {entry.playerPoints} punti</summary>{entry.format==='grid'?<ChampionshipTable rows={entry.standings}/>:<p className="text-sm">Classifica storica: {entry.playerPoints} — {entry.opponentPoints}</p>}</details>)}</details>}
                {/* Category Filter */}
                <div className="flex gap-1 mb-4 flex-wrap">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-4 py-1.5 font-bold text-sm border-2 ${filterCategory === cat ? 'bg-win98-blue text-white border-win98-darkerGray shadow-win98-inset' : 'bg-win98-gray border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray hover:bg-gray-200'}`}
                    >
                      {cat === 'all' ? '🏁 Tutti' : cat}
                    </button>
                  ))}
                </div>

                {filteredChamps.length === 0 ? (
                  <div className="text-center italic text-gray-500 p-12">Nessun campionato in questa categoria.</div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredChamps.map(champ => (
                      <ChampionshipCard
                        key={champ.id}
                        champ={champ}
                        equippedCar={equippedCar}
                        playerStats={stats}
                        playerLevel={level}
                        playerMoney={money}
                        activeEntry={activeEntry}
                        joining={joining}
                        onEnter={handleEnterChampionship}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TRAINING TAB ── */}
            {activeTab === 'training' && (
              <div>
                <div className="mb-4 bg-[#FFFFE1] border-2 border-win98-darkerGray p-3 text-sm">
                  <strong>ℹ️ Come funziona il Track Day:</strong> Ogni sessione ha un costo in €. Le sessioni <span className="font-bold text-teal-700">STAT</span> aumentano permanentemente una statistica del pilota.
                  Le tecniche si apprendono nella Scuola guida sulla mappa, con lezioni e prove pratiche.
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {trainingSessions.map(session => (
                    <TrainingCard
                      key={session.id}
                      session={session}
                      playerLevel={level}
                      playerMoney={money}
                      alreadyHasMove={alreadyHasMove}
                      onComplete={handleCompleteTraining}
                      uses={development?.trainingCourses[session.id] || 0}
                    />
                  ))}
                  {trainingSessions.length === 0 && (
                    <div className="col-span-2 text-center italic text-gray-500 p-12">Nessuna sessione disponibile.</div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </Win98Window>
  );
}
