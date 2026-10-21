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
  fetchTrainingSessions,
  completeTraining,
  fetchActiveChampionshipEntry,
  enterChampionship
} from '../services/api';

// ─── HELPERS ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  'N/A':       'bg-gray-700',
  'Aspirato':  'bg-green-800',
  'GT':        'bg-blue-800',
  'Turbo':     'bg-red-800',
  'Leggenda':  'bg-yellow-700',
  'Open':      'bg-purple-800',
};

const STAT_LABELS = {
  brave: '💪 Coraggio',
  clean: '🧼 Pulizia',
  reflex: '⚡ Riflessi',
  shift: '⚙️ Cambiata',
  brake: '🛑 Frenata',
};

// Check if player's car meets championship requirements
function checkCarRequirements(car, champ) {
  const errors = [];
  if (!car) return ['Nessuna auto equipaggiata'];
  if (car.cv < champ.minCv) errors.push(`CV min: ${champ.minCv} (hai: ${car.cv})`);
  if (car.cv > champ.maxCv) errors.push(`CV max: ${champ.maxCv} (hai: ${car.cv})`);
  const perfIndex = ['speed', 'acceleration', 'revving', 'transmission', 'turnSlow', 'turnFast', 'brake', 'traction'].reduce((sum, key) => sum + car[key], 0) / 8;
  if (perfIndex < champ.minPerfIndex) errors.push(`Indice prestazioni min: ${champ.minPerfIndex}`);
  if (champ.allowedDrive !== 'any' && car.driveType !== champ.allowedDrive)
    errors.push(`Trazione richiesta: ${champ.allowedDrive} (hai: ${car.driveType})`);
  return errors;
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

function ChampionshipCard({ champ, equippedCar, playerStats, playerLevel, playerMoney, activeEntry, joining, onEnter }) {
  const [expanded, setExpanded] = useState(false);
  const isActive = activeEntry?.championshipId === champ.id;
  const carErrors = checkCarRequirements(equippedCar, champ);
  const pilotErrors = checkPilotRequirements(playerStats, playerLevel, champ);
  const allErrors = [...carErrors, ...pilotErrors];
  const canEnter = isActive || (!activeEntry && allErrors.length === 0 && playerMoney >= champ.entryFee);
  const catColor = CATEGORY_COLORS[champ.category] || 'bg-gray-700';

  return (
    <div className={`bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray shadow-md`}>
      {/* Header */}
      <div className={`${catColor} text-white px-3 py-2 flex justify-between items-center cursor-pointer`} onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-base uppercase tracking-wide">{champ.name}</span>
          <span className="text-xs bg-white/20 border border-white/30 px-2 py-0.5 rounded-sm">{champ.category}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-bold text-yellow-300">€{champ.rewardMoney.toLocaleString()}</span>
          <span className="text-white/70">+{champ.rewardXp} XP</span>
          <span>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="text-sm text-gray-700 italic mb-3">{champ.description}</p>

        {/* Requirements row */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="bg-white border border-gray-300 p-2">
            <div className="font-bold text-gray-600 uppercase mb-1">🚗 Req. Auto</div>
            <div>CV: {champ.minCv === 0 && champ.maxCv === 9999 ? 'Libero' : `${champ.minCv}–${champ.maxCv}`}</div>
            <div>Trazione: <span className="font-bold">{champ.allowedDrive === 'any' ? 'Libera' : champ.allowedDrive}</span></div>
          </div>
          <div className="bg-white border border-gray-300 p-2">
            <div className="font-bold text-gray-600 uppercase mb-1">👤 Req. Pilota</div>
            <div>Livello min: <span className="font-bold">{champ.minLevel}</span></div>
            {champ.minBrave > 0 && <div>Coraggio: {champ.minBrave}+</div>}
            {champ.minReflex > 0 && <div>Riflessi: {champ.minReflex}+</div>}
          </div>
        </div>

        {/* Rounds (expandable) */}
        {expanded && (
          <div className="mb-3 border-t-2 border-win98-darkerGray pt-2">
            <div className="font-bold text-sm mb-2 uppercase text-gray-700">📋 Round del Campionato:</div>
            <div className="space-y-1">
              {champ.rounds?.map(r => (
                <div key={r.id} className="flex justify-between items-center gap-2 bg-white border border-gray-300 px-3 py-1.5 text-sm">
                  <span className="font-bold text-blue-900">Round {r.ord}: {r.track?.name || '—'}</span>
                  <span className="text-gray-500">vs <span className="font-bold text-red-700">{r.opponentName}</span> ({r.opponentCarName})</span>
                  <span className={`text-xs font-bold px-2 py-0.5 ${r.opponentDifficulty >= 1.3 ? 'bg-red-200 text-red-800' : r.opponentDifficulty >= 1.0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {r.opponentDifficulty >= 1.3 ? '🔥 HARD' : r.opponentDifficulty >= 1.0 ? '⚡ MED' : '✅ EASY'}
                  </span>
                </div>
              ))}
            </div>
            {isActive && (
              <div className="mt-3 bg-blue-50 border border-blue-300 p-2 text-xs">
                <strong>Classifica in corso: {activeEntry.playerPoints} — {activeEntry.opponentPoints}</strong>
                {activeEntry.results.map((result) => (
                  <div key={result.round} className="flex justify-between gap-2 mt-1">
                    <span>Round {result.round} · {result.trackName} vs {result.opponentName}</span>
                    <span className="font-bold uppercase">{result.outcome} ({result.playerPoints}-{result.opponentPoints})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Errors */}
        {allErrors.length > 0 && (
          <div className="bg-red-50 border border-red-300 p-2 mb-2 text-xs space-y-0.5">
            {allErrors.map((e, i) => <div key={i} className="text-red-700">⛔ {e}</div>)}
          </div>
        )}
        {!canEnter && activeEntry && !isActive && (
          <div className="bg-yellow-50 border border-yellow-300 p-2 mb-2 text-xs text-yellow-700">
            🏁 Completa prima il campionato {activeEntry.championship.name}.
          </div>
        )}
        {!canEnter && !activeEntry && playerMoney < champ.entryFee && allErrors.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-300 p-2 mb-2 text-xs text-yellow-700">
            💰 Iscrizione: €{champ.entryFee.toLocaleString()} (hai €{playerMoney.toLocaleString()})
          </div>
        )}

        {/* Action */}
        <button
          onClick={() => canEnter && !joining && onEnter(champ)}
          disabled={!canEnter}
          className={`w-full py-2 font-bold border-2 text-sm transition-colors ${
            canEnter
              ? 'bg-win98-gray border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray hover:bg-green-100 active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white'
              : 'bg-gray-200 border-gray-400 text-gray-500 cursor-not-allowed'
          }`}
        >
          {joining ? '⌛ Iscrizione...' : isActive
            ? `▶ CONTINUA · ROUND ${activeEntry.currentRound}/${champ.rounds.length}`
            : canEnter ? `🏁 Iscriviti (€${champ.entryFee.toLocaleString()})`
              : activeEntry ? '🔒 Altro campionato in corso' : '🔒 Requisiti non soddisfatti'}
        </button>
      </div>
    </div>
  );
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
    <div className="bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray shadow-md">
      <div className={`px-3 py-2 flex justify-between items-center ${session.category === 'move' ? 'bg-purple-900' : 'bg-teal-800'} text-white`}>
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
  const [activeEntry, setActiveEntry] = useState(null);
  const [trainingSessions, setTrainingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const equippedCar = cars.find(c => c.id === equippedCarId);

  useEffect(() => {
    if (!userId) return undefined;
    Promise.all([fetchChampionships(), fetchTrainingSessions(), fetchActiveChampionshipEntry(userId)])
      .then(([champData, trainData, entry]) => {
        setChampionships(champData);
        setTrainingSessions(trainData);
        setActiveEntry(entry);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
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
    if (equippedCar.currentFuel < 5) {
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
      if (!firstRound) throw new Error('The first championship round is missing.');
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
      <div className="flex flex-col bg-win98-gray text-black">

        {/* Top Tab Navigation */}
        <div className="flex bg-win98-gray p-1 gap-1 border-b-2 border-win98-darkerGray">
          <button
            onClick={() => setActiveTab('competitions')}
            className={`flex-1 py-3 font-bold text-base border-2 transition-all ${activeTab === 'competitions' ? 'bg-white border-win98-darkerGray shadow-win98-inset' : 'border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray hover:bg-gray-100'}`}
          >
            🏆 COMPETIZIONI ORGANIZZATE
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`flex-1 py-3 font-bold text-base border-2 transition-all ${activeTab === 'training' ? 'bg-white border-win98-darkerGray shadow-win98-inset' : 'border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray hover:bg-gray-100'}`}
          >
            🎓 TRACK DAY — ALLENAMENTO
          </button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center gap-4 px-4 py-2 bg-win98-bg text-white text-sm border-b-2 border-win98-darkerGray">
          <span>👤 Lv.{level}</span>
          <span>💰 €{money.toLocaleString()}</span>
          <span>🚗 {equippedCar ? `${equippedCar.brand} ${equippedCar.name} (${equippedCar.cv} CV)` : <span className="text-red-400">Nessuna auto equipaggiata</span>}</span>
          <span className="ml-auto font-pixel text-yellow-300 text-xs">
            💡 {activeTab === 'competitions' ? 'Vinci round, accumula punti e punta al titolo.' : 'Investi in allenamento per migliorare le stat del pilota.'}
          </span>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center italic text-gray-500 text-lg">
            Caricamento calendatio eventi...
          </div>
        ) : (
          <div className="p-4">

            {/* ── COMPETITIONS TAB ── */}
            {activeTab === 'competitions' && (
              <div>
                {activeEntry && (
                  <div className="bg-[#101820] text-white border-2 border-yellow-400 p-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <div className="font-bold text-yellow-300 uppercase">🏁 Campionato in corso</div>
                      <div className="text-lg">{activeEntry.championship.name} · Round {activeEntry.currentRound}/{activeEntry.championship.rounds.length}</div>
                      <div className="text-sm text-cyan-200">
                        Classifica: {activeEntry.playerPoints} — {activeEntry.opponentPoints} punti
                        {' · '}Gap cumulativo: {activeEntry.gapDifference > 0 ? '+' : ''}{activeEntry.gapDifference}m
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
                      RIPRENDI LA GARA
                    </button>
                  </div>
                )}
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
                  <button className="underline font-bold" onClick={() => navigate('/garage/pilota')}>Scuola guida: lezione e prova pratica della frenata ↗</button><br /><strong>ℹ️ Come funziona il Track Day:</strong> Ogni sessione ha un costo in €. Le sessioni <span className="font-bold text-teal-700">STAT</span> aumentano permanentemente una statistica del pilota.
                  Le sessioni <span className="font-bold text-purple-700">MOSSA</span> sbloccano nuove tecniche di guida nel tuo Grimorio.
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
