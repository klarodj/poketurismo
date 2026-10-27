import {carArtwork} from '../../shared/carArtwork.mjs';
import {paintFor,paintName} from '../../shared/carPaint.mjs';
import {partName,partDescription} from '../logic/partLabels.mjs';
import FuelConsumption from '../components/FuelConsumption';
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGarageStore from '../store/garageStore';
import usePlayerStore from '../store/playerStore';
import useInventoryStore from '../store/inventoryStore';
import useGameStore from '../store/gameStore';
import Win98Window from '../components/Win98Window';
import GarageTabs from '../components/GarageTabs';
import { unmountPart, mountPart, fetchTuning } from '../services/api';
import TuningPreview from '../components/TuningPreview';
import useRequestStore from '../store/requestStore';
import useRaceStore from '../store/raceStore';
import {performanceIndex} from '../../shared/vehiclePerformance.mjs';
import '../components/tuning.css';

import { CAR_STAT_LABELS } from '../logic/raceEngine';

export default function GarageCarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cars, getCarStats } = useGarageStore();
  const { id: userId } = usePlayerStore();
  const { parts: inventoryParts } = useInventoryStore();
  const { triggerEvent } = useGameStore();

  const [activeTab, setActiveTab] = useState('installed');
  const [review,setReview]=useState(null);
  const [reviewLoading,setReviewLoading]=useState(false);
  const money=usePlayerStore(state=>state.money);
  const pending=useRequestStore(state=>state.pending);
  const activeRace=useRaceStore(state=>state.activeRace);

  const car = cars.find(c => c.id === parseInt(id));
  const stats = car ? getCarStats(car.id) : null;

  if (!car) return <div className="p-10 text-center font-bold">Auto non trovata...</div>;

  const handleAction = async (type, partId, partTitle) => {
    try {
      if(type==='unmount'){
        await unmountPart(car.id,partId,userId);
        triggerEvent({type:'info',title:'Meccanico',message:`Hai rimosso "${partName(partTitle)}". Il ricambio è tornato in inventario.`});
      }else{
        setReviewLoading(true);
        const data=await fetchTuning(userId,car.id);
        const selected=data.parts.find(part=>part.id===partId);
        if(!selected)throw new Error('Ricambio non disponibile');
        setReview(selected);
      }
    }catch(error){triggerEvent({type:'error',title:'Errore Officina',message:error.message});}
    finally{setReviewLoading(false);}
  };
  const confirmMount=async()=>{
    try{
      await mountPart(car.id,review.id,userId,review.preview.quoteKey);
      setReview(null);
      triggerEvent({type:'success',title:'Montaggio completato',message:'Preparazione aggiornata. Il pezzo sostituito è tornato in magazzino.'});
    }catch(error){setReview(null);triggerEvent({type:'error',title:'Montaggio non riuscito',message:error.message+' Riapri il confronto per aggiornare il preventivo.'});}
  };

  return (
    <Win98Window guideId="garage" title={`Scheda Tecnica - ${car.brand} ${car.name}`} imageUrl="/images/garage.png">
      <div className="flex flex-col bg-win98-gray text-black">
        
        <GarageTabs />
        {review&&<section className="tuning-garage-review" aria-label="Conferma preparazione"><button className="win98-btn" autoFocus onClick={()=>setReview(null)}>Chiudi confronto</button><TuningPreview part={review} carName={`${car.brand} ${car.name}`} money={money} disabled={pending>0||Boolean(activeRace)} onMount={confirmMount}/></section>}

        {/* Sub-header Navigation */}
        <div className="garage-detail-toolbar p-2 border-b border-win98-darkGray flex flex-wrap gap-2 justify-between items-center bg-win98-blue text-white">
           <button 
             onClick={() => navigate('/garage/auto')}
             className="px-4 py-1 bg-win98-gray text-black border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-win98-darkerGray font-bold text-base"
           >
             ⬅ Torna Indietro
           </button>
           <div className="font-pixel text-yellow-300 text-xl">
              {car.brand} {car.name} · IP {performanceIndex(car)}
           </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          
          {/* Left: Giant Image & Big Stats */}
          <div className="w-full lg:w-1/2 flex flex-col p-4 border-r-2 border-win98-darkerGray bg-gray-100">
             <div className="bg-white border-2 border-win98-darkerGray shadow-win98-inset p-4 mb-4 flex items-center justify-center min-h-[170px]">
                <img 
                  src={carArtwork(car)}
                  alt={`${car.name} · ${paintName(paintFor(car))}`}
                  className="pixel-car-image max-w-full max-h-[200px] object-contain"
                  onError={(e) => e.target.src = '/images/garage.png'}
                />
             </div>

             <FuelConsumption car={car}/><details className="period-details mt-2"><summary>Dati banco prova e telemetria</summary><div className="grid grid-cols-2 gap-4">
                <div className="bg-black text-green-400 p-5 font-pixel border-2 border-gray-600 shadow-xl">
                   <h4 className="text-yellow-500 underline mb-3 text-lg uppercase">Dati Banco Prova</h4>
                   <p className="text-4xl">{car.cv} CV</p>
                   <p className="text-2xl">{car.nm} NM</p>
                   <p className="text-base text-gray-400 mt-2">{car.kg} KG (Peso Totale)</p>
                </div>
                <div className="bg-win98-darkerGray text-white p-4 border-2 border-win98-gray">
                   <h4 className="text-base font-bold border-b border-gray-500 mb-3 uppercase">Telemetria</h4>
                    {stats && (
                      <div className="space-y-1 text-[10px] font-bold uppercase">
                         {[
                           { key: 'speed', label: CAR_STAT_LABELS.speed },
                           { key: 'acceleration', label: CAR_STAT_LABELS.acceleration },
                           { key: 'revving', label: CAR_STAT_LABELS.revving },
                           { key: 'transmission', label: CAR_STAT_LABELS.transmission },
                           { key: 'brake', label: CAR_STAT_LABELS.brake },
                           { key: 'traction', label: CAR_STAT_LABELS.traction },
                           { key: 'turnSlow', label: CAR_STAT_LABELS.turnSlow },
                           { key: 'turnFast', label: CAR_STAT_LABELS.turnFast }
                         ].map(({ key, label }) => (
                           <div key={key} className="flex justify-between border-b border-white/10 pb-0.5">
                             <span>{label}</span>
                             <span>
                               {stats[key]}
                               {stats.malusInfo && stats.malusInfo[key] > 0 && (
                                 <span className="text-red-500 ml-1">(-{stats.malusInfo[key]})</span>
                               )}
                             </span>
                           </div>
                         ))}
                      </div>
                    )}
                </div>
             </div>
             </details>
          </div>

          {/* Right: Management Area */}
          <div className="flex-1 flex flex-col bg-white border-l-2 border-win98-darkerGray shadow-win98-inset">
             
             {/* Tabs Toggle */}
             <div className="flex bg-win98-gray p-1 gap-1 border-b-2 border-win98-darkerGray">
                <button 
                  onClick={() => setActiveTab('installed')}
                  className={`flex-1 py-2 font-bold text-sm border-2 ${activeTab === 'installed' ? 'bg-white border-win98-darkerGray shadow-win98-inset' : 'border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray'}`}
                >
                  🛠️ INSTALLATI ({car.mods?.length || 0})
                </button>
                <button 
                  onClick={() => setActiveTab('warehouse')}
                  className={`flex-1 py-2 font-bold text-sm border-2 ${activeTab === 'warehouse' ? 'bg-white border-win98-darkerGray shadow-win98-inset' : 'border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray'}`}
                >
                  📦 MAGAZZINO ({inventoryParts.length})
                </button>
             </div>

             <div className="flex-1 p-4">
                {activeTab === 'installed' ? (
                   <div className="space-y-4">
                      {car.mods && car.mods.length > 0 ? car.mods.map(mod => (
                        <div key={mod.id} className="bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray p-3 flex gap-3 shadow-win98-outset">
                           <div className="w-16 h-16 bg-white border border-gray-400 shrink-0 p-1">
                              <img 
                                src={`/images/part/${mod.image}`} 
                                alt={partName(mod.name)}
                                className="w-full h-full object-contain"
                                onError={(e) => e.target.src = '/images/shop.png'}
                              />
                           </div>
                           <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                <div className="flex justify-between items-start">
                                   <span className="font-bold text-sm uppercase truncate pr-2">{partName(mod.name)}</span>
                                   <span className="text-[10px] bg-win98-blue text-white px-1 leading-tight shrink-0 uppercase">Liv. {mod.level ?? '—'}</span>
                                </div>
                                <p className="text-xs text-gray-700 leading-tight italic truncate">{partDescription(mod)}</p>
                              </div>
                              <div className="mt-2 flex justify-between items-end">
                                 <div className="flex flex-wrap gap-1">
                                    {(Number.isFinite(mod.bonuses?.cv) && mod.bonuses.cv !== 0) && <span className="text-[9px] font-bold bg-green-200 text-green-800 px-1 border border-green-600">+{mod.bonuses?.cv} CV</span>}
                                    {(Number.isFinite(mod.bonuses?.kg) && mod.bonuses.kg !== 0) && <span className="text-[9px] font-bold bg-green-200 text-green-800 px-1 border border-green-600">{-mod.bonuses.kg} kg</span>}
                                 </div>
                                 <button 
                                   onClick={() => handleAction('unmount', mod.id, mod.name)}
                                   className="px-2 py-1 bg-red-100 text-red-800 border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray text-xs font-bold hover:bg-red-800 hover:text-white transition-colors h-fit shrink-0 ml-2"
                                 >
                                   SMONTA
                                 </button>
                              </div>
                           </div>
                        </div>
                      )) : (
                        <div className="p-8 text-center border-2 border-dashed border-gray-300 text-gray-400 italic text-sm">
                           Nessun pezzo installato. L'auto è di serie.
                        </div>
                      )}
                   </div>
                ) : (
                   <div className="space-y-4">
                      <p className="text-[11px] bg-yellow-100 border border-yellow-400 p-2 mb-4 font-bold">
                        ⚠️ NOTA: Installare un pezzo dello stesso tipo (es: Scarico) sostituirà automaticamente quello attualmente montato, indipendentemente dal livello.
                      </p>
                      {inventoryParts.length > 0 ? inventoryParts.map(part => (
                        <div key={part.instanceId || part.id} className="bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray p-3 flex gap-3 shadow-win98-outset hover:border-blue-500">
                           <div className="w-16 h-16 bg-white border border-gray-400 shrink-0 p-1 relative">
                              <span className="absolute -top-1 -left-1 bg-win98-blue text-white text-[9px] px-1 font-bold border border-white">Lvl {part.level}</span>
                              <img 
                                src={`/images/part/${part.image}`} 
                                alt={partName(part.name)}
                                className="w-full h-full object-contain"
                                onError={(e) => e.target.src = '/images/shop.png'}
                              />
                           </div>
                           <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                <span className="font-bold text-sm uppercase truncate block">{partName(part.name)}</span>
                                <p className="text-xs text-gray-700 leading-tight italic truncate">{partDescription(part)}</p>
                              </div>
                              <div className="mt-2 flex justify-between items-end">
                                 <div className="flex flex-wrap gap-1">
                                    {part.cvBonus > 0 && <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1 border border-blue-600">+{part.cvBonus} CV</span>}
                                    {part.kgBonus > 0 && <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1 border border-blue-600">-{part.kgBonus} KG</span>}
                                 </div>
                                 <button 
                                   disabled={reviewLoading||pending>0||Boolean(activeRace)}
                                   onClick={() => handleAction('mount', part.id, part.name)}
                                   className="px-3 py-1 bg-green-100 text-green-800 border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray text-xs font-bold hover:bg-green-800 hover:text-white transition-colors"
                                 >
                                   CONFRONTA E MONTA
                                 </button>
                              </div>
                           </div>
                        </div>
                      )) : (
                        <div className="p-8 text-center border-2 border-dashed border-gray-300 text-gray-400 italic text-sm">
                           Magazzino vuoto. Acquista ricambi nel Negozio Tuning.
                        </div>
                      )}
                   </div>
                )}
             </div>
          </div>

        </div>
      </div>

    </Win98Window>
  );
}
