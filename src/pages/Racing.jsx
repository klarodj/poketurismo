import {AUTODROME_IMAGES,championshipCover} from '../../shared/championshipVisuals.mjs';
import PerformanceBadge from '../components/PerformanceBadge';
import {trackVisual} from '../../shared/trackVisuals.mjs';
import TrackIllustration from '../components/TrackIllustration';
import ChampionshipTable from '../components/ChampionshipTable';
import {championshipCarErrors,championshipSeries} from '../../shared/championshipCatalog.mjs';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Win98Window from '../components/Win98Window';
import useGarageStore from '../store/garageStore';
import useGameStore from '../store/gameStore';
import usePlayerStore from '../store/playerStore';
import {
  fetchChampionships,
  fetchChampionshipHistory,
  fetchActiveChampionshipEntry,
  enterChampionship
} from '../services/api';

// ─── HELPERS ────────────────────────────────────────────────────────────────

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
 const isActive=activeEntry?.championshipId===champ.id,drivers=isActive?activeEntry.participants:champ.drivers,knownIP=(drivers||[]).map(d=>d.performanceIndex).filter(Number.isFinite),knownIG=(drivers||[]).map(d=>d.driverIndex).filter(Number.isFinite),mean=values=>values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length):undefined,errors=[...checkCarRequirements(equippedCar,champ),...checkPilotRequirements(playerStats,playerLevel,champ)];
 const canEnter=isActive||(!activeEntry&&!errors.length&&playerMoney>=champ.entryFee),cover=championshipCover(champ.name)||trackVisual(champ.rounds?.[0]?.track?.name)?.image;
 return <article className="championship-listing"><h2>{champ.name}</h2>{cover&&<img className="championship-cover" src={cover} alt={`Copertina: ${champ.name}`} loading="lazy" width="320" height="180"/>}<p>Preparazione media avversari: <PerformanceBadge value={mean(knownIP)}/><PerformanceBadge kind="IG" value={mean(knownIG)}/></p><div className="championship-listing-overview"><div><p><strong>{champ.rounds?.length||0} gare</strong> · livello {champ.minLevel}+</p><p>{champ.minCv}–{champ.maxCv} CV · {champ.category}</p><p>Iscrizione <strong>€{champ.entryFee.toLocaleString('it-IT')}</strong></p></div></div><p className="championship-prize">Titolo: €{champ.rewardMoney.toLocaleString('it-IT')} · {champ.rewardXp} XP</p>
 {!canEnter&&<p className="period-notice">{activeEntry?'Concludi prima il campionato in corso.':errors[0]||`Mancano €${(champ.entryFee-playerMoney).toLocaleString('it-IT')} per l’iscrizione.`}</p>}
 <button type="button" className="win98-btn" disabled={!canEnter||joining} onClick={()=>onEnter(champ)}>{joining?'Iscrizione…':isActive?`Continua · round ${activeEntry.currentRound}`:canEnter?'Iscriviti · €'+champ.entryFee.toLocaleString('it-IT'):'Iscrizione non disponibile'}</button>
 <details className="period-details"><summary>Calendario, rivali e regolamento</summary><p>{champ.description}</p><p>{champ.format==='grid'?'Otto piloti · punti 10–8–6–5–4–3–2–1. Premi finali: 100% / 60% / 35% sul podio, 15% agli altri classificati.':'Campionato storico a duelli.'}</p>{champ.rules?.racePrepared&&<p><strong>Vetture da gara obbligatorie</strong>{champ.rules.maxCc?` · massimo ${champ.rules.maxCc} cm³`:''}</p>}<p>Trazione: {champ.allowedDrive==='any'?'libera':champ.allowedDrive}{champ.rules?.engineTypes?' · solo aspirati':''}{champ.rules?.brands?' · marchi italiani':''}{champ.rules?.drives?` · ${champ.rules.drives.join(', ')}`:''}</p>{errors.length>0&&<ul>{errors.map(e=><li key={e}>{e}</li>)}</ul>}
 {(isActive?activeEntry.participants:champ.drivers)&&<details><summary>I sette rivali · auto e piloti</summary><p>IG riassume le abilità; IP descrive l’auto. Il percorso può cambiare i rapporti di forza.</p><ul>{(isActive?activeEntry.participants:champ.drivers).map(d=><li key={d.id}>{d.name} · {d.carName} <PerformanceBadge value={d.performanceIndex}/><PerformanceBadge kind="IG" value={d.driverIndex}/></li>)}</ul></details>}
 <ol>{champ.rounds?.map(r=><li key={r.id}><strong>Gara {r.ord} · {r.track?.name||'—'}</strong><p>Rivale iniziale: {r.opponentName} · {r.opponentCarName}</p><details className="track-art-details"><summary>Mappa e ambientazione</summary><TrackIllustration name={r.track?.name} compact/></details></li>)}</ol></details></article>;
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────

export default function Racing() {
  const navigate = useNavigate();
  const [searchParams]=useSearchParams();
  const series=searchParams.get('series')==='aci-csai'?'aci-csai':'northern';
  const title=series==='aci-csai'?'Campionati ACI CSAI':'Campionati Settentrionali';
  const { cars } = useGarageStore();
  const { equippedCarId, triggerEvent } = useGameStore();
  const { id: userId, money, level, stats } = usePlayerStore();

  const [championships, setChampionships] = useState([]);
  const [history,setHistory]=useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [loadError,setLoadError]=useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const equippedCar = cars.find(c => c.id === equippedCarId);

  useEffect(() => {
    if (!userId) return undefined;
    Promise.all([fetchChampionships(), fetchActiveChampionshipEntry(userId), fetchChampionshipHistory(userId)])
      .then(([champData, entry, previous]) => {
        setChampionships(champData);
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

  const seriesCups=championships.filter(c=>championshipSeries(c)===series);
  const seriesHistory=history.filter(e=>championshipSeries(e.championship)===series);
  const categories = ['all', ...new Set(seriesCups.map(c => c.category))];
  const effectiveCategory=categories.includes(filterCategory)?filterCategory:'all';
  const filteredChamps = effectiveCategory === 'all' ? seriesCups : seriesCups.filter(c => c.category === effectiveCategory);

  return (
    <Win98Window guideId="autodrome" title={`Autodromo — ${title}`} imageUrl={AUTODROME_IMAGES[series]}>
      <div className="racing-page flex flex-col bg-win98-gray text-black">

        <button className="win98-btn m-2" onClick={()=>navigate('/autodrome')}>Torna all’Autodromo</button>
        {loadError&&<p role="alert" className="period-notice">{loadError} <button className="win98-btn" onClick={()=>window.location.reload()}>Riprova</button></p>}
        {loading ? (
          <div className="flex-1 flex items-center justify-center italic text-gray-500 text-lg">
            Caricamento del calendario…
          </div>
        ) : (
          <div className="p-4">

            <h1>{title}</h1>
            {series==='aci-csai'&&<p className="period-notice">Solo vetture con preparazione da gara definitiva del meccanico. Controlla anche potenza, cilindrata e trazione del singolo trofeo. <button type="button" className="win98-btn" onClick={()=>navigate('/workshop')}>Vai in officina</button></p>}
            {/* ── COMPETITIONS TAB ── */}
            {(
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
                {seriesHistory.length > 0 && <details className="border border-gray-500 bg-white p-3 my-3"><summary className="cursor-pointer font-bold">Campionati conclusi ({seriesHistory.length})</summary>{seriesHistory.map(entry=><details key={entry.id} className="border-t border-gray-300 mt-3 pt-2"><summary className="cursor-pointer">{entry.championship.name} · {entry.playerPoints} punti</summary>{entry.format==='grid'?<ChampionshipTable rows={entry.standings}/>:<p className="text-sm">Classifica storica: {entry.playerPoints} — {entry.opponentPoints}</p>}</details>)}</details>}
                {/* Category Filter */}
                <div className="flex gap-1 mb-4 flex-wrap">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-4 py-1.5 font-bold text-sm border-2 ${effectiveCategory === cat ? 'bg-win98-blue text-white border-win98-darkerGray shadow-win98-inset' : 'bg-win98-gray border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray hover:bg-gray-200'}`}
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



          </div>
        )}
      </div>
    </Win98Window>
  );
}
