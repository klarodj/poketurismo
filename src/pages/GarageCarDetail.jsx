import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGarageStore from '../store/garageStore';
import usePlayerStore from '../store/playerStore';
import useInventoryStore from '../store/inventoryStore';
import useGameStore from '../store/gameStore';
import Win98Window from '../components/Win98Window';
import { unmountPart, mountPart } from '../services/api';

export default function GarageCarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cars, getCarStats, initialize: refreshGarage } = useGarageStore();
  const { id: userId } = usePlayerStore();
  const { parts: inventoryParts, removePart } = useInventoryStore();
  const { triggerEvent } = useGameStore();

  const [activeTab, setActiveTab] = useState('installed');

  const car = cars.find(c => c.id === parseInt(id));
  const stats = car ? getCarStats(car.id) : null;

  if (!car) return <div className="p-10 text-center font-bold">Auto non trovata...</div>;

  const handleAction = async (type, partId, partName) => {
      if (type === 'unmount') {
         try {
            const res = await unmountPart(car.id, partId);
            if (res.success) {
               triggerEvent({ type: 'info', title: 'Meccanico', message: `Hai rimosso "${partName}". L'auto ha perso i bonus corrispondenti.`});
               await refreshGarage(userId);
            }
         } catch(e) {
            triggerEvent({ type: 'error', title: 'Errore Officina', message: 'Impossibile smontare il pezzo.'});
         }
      } else if (type === 'mount') {
         try {
            const samePartMounted = car.mods?.find(m => m.id === partId);
            if (samePartMounted) {
               triggerEvent({ type: 'warning', title: 'Già Installato', message: 'Questo pezzo è già montato su questa vettura.'});
               return;
            }

            const res = await mountPart(car.id, partId);
            if (res.success) {
               removePart(partId);
               triggerEvent({ 
                 type: 'success', 
                 title: 'Montaggio Completato', 
                 message: `Hai installato "${partName}". Le prestazioni sono state aggiornate.`
               });
               await refreshGarage(userId);
            }
         } catch(e) {
            triggerEvent({ type: 'error', title: 'Errore Officina', message: 'Impossibile montare il pezzo.'});
         }
      }
  };

  return (
    <Win98Window title={`Scheda Tecnica - ${car.brand} ${car.name}`} imageUrl="/images/garage.png">
      <div className="flex flex-col h-[750px] overflow-hidden bg-win98-gray text-black">
        
        {/* Navigation Tabs (Consistent with Garage Home) */}
        <div className="flex gap-1 p-2 bg-win98-gray border-b-2 border-win98-darkerGray">
           <button 
             onClick={() => navigate('/garage/pilota')}
             className="px-6 py-1.5 bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white font-bold text-sm flex items-center gap-2"
           >
             👤 PILOTA
           </button>
           <button 
             onClick={() => navigate('/garage/auto')}
             className="px-6 py-1.5 bg-white border-2 border-win98-darkerGray shadow-win98-inset font-bold text-sm flex items-center gap-2"
           >
             🚗 AUTO
           </button>
        </div>

        {/* Sub-header Navigation */}
        <div className="p-2 border-b border-win98-darkGray flex justify-between items-center bg-win98-blue text-white">
           <button 
             onClick={() => navigate('/garage/auto')}
             className="px-4 py-1 bg-win98-gray text-black border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-win98-darkerGray font-bold text-base"
           >
             ⬅ Torna Indietro
           </button>
           <div className="font-pixel text-yellow-300 text-xl">
              {car.brand} {car.name} - LIVELLO PRESTAZIONI S1
           </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left: Giant Image & Big Stats */}
          <div className="w-full lg:w-1/2 flex flex-col p-4 border-r-2 border-win98-darkerGray overflow-y-auto bg-gray-100">
             <div className="bg-white border-2 border-win98-darkerGray shadow-win98-inset p-4 mb-4 flex items-center justify-center min-h-[400px]">
                <img 
                  src={`/images/car/${car.image}`} 
                  alt={car.name} 
                  className="max-w-full max-h-[360px] object-contain drop-shadow-2xl"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/400x200?text=Auto'}
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="bg-black text-green-400 p-5 font-pixel border-2 border-gray-600 shadow-xl">
                   <h4 className="text-yellow-500 underline mb-3 text-lg uppercase">Dati Banco Prova</h4>
                   <p className="text-4xl">{car.cv} CV</p>
                   <p className="text-2xl">{car.nm} NM</p>
                   <p className="text-base text-gray-400 mt-2">{car.kg} KG (Peso Totale)</p>
                </div>
                <div className="bg-win98-darkerGray text-white p-4 border-2 border-win98-gray">
                   <h4 className="text-base font-bold border-b border-gray-500 mb-3 uppercase">Telemetria</h4>
                   {stats && (
                     <div className="space-y-2 text-sm font-bold">
                        <div className="flex justify-between border-b border-white/10 pb-1"><span>VEL</span> <span>{stats.speed}</span></div>
                        <div className="flex justify-between border-b border-white/10 pb-1"><span>ACC</span> <span>{stats.acceleration}</span></div>
                        <div className="flex justify-between border-b border-white/10 pb-1"><span>BRK</span> <span>{stats.brake}</span></div>
                        <div className="flex justify-between"><span>TRC</span> <span>{stats.traction}</span></div>
                     </div>
                   )}
                </div>
             </div>
          </div>

          {/* Right: Management Area */}
          <div className="flex-1 flex flex-col bg-white border-l-2 border-win98-darkerGray shadow-win98-inset overflow-hidden">
             
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

             <div className="flex-1 p-4 overflow-y-auto">
                {activeTab === 'installed' ? (
                   <div className="space-y-4">
                      {car.mods && car.mods.length > 0 ? car.mods.map(mod => (
                        <div key={mod.id} className="bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray p-3 flex gap-3 shadow-win98-outset">
                           <div className="w-16 h-16 bg-white border border-gray-400 shrink-0 p-1">
                              <img 
                                src={`/images/part/${mod.image}`} 
                                alt={mod.name} 
                                className="w-full h-full object-contain"
                                onError={(e) => e.target.src = '/images/shop.png'}
                              />
                           </div>
                           <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                <div className="flex justify-between items-start">
                                   <span className="font-bold text-sm uppercase truncate pr-2">{mod.name}</span>
                                   <span className="text-[10px] bg-win98-blue text-white px-1 leading-tight shrink-0 uppercase">LVL ?</span>
                                </div>
                                <p className="text-xs text-gray-700 leading-tight italic truncate">{mod.description}</p>
                              </div>
                              <div className="mt-2 flex justify-between items-end">
                                 <div className="flex flex-wrap gap-1">
                                    {(mod.bonuses?.cv !== 0) && <span className="text-[9px] font-bold bg-green-200 text-green-800 px-1 border border-green-600">+{mod.bonuses?.cv} CV</span>}
                                    {(mod.bonuses?.kg !== 0) && <span className="text-[9px] font-bold bg-green-200 text-green-800 px-1 border border-green-600">-{mod.bonuses?.kg} KG</span>}
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
                        <div key={part.id || part.instanceId} className="bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray p-3 flex gap-3 shadow-win98-outset hover:border-blue-500">
                           <div className="w-16 h-16 bg-white border border-gray-400 shrink-0 p-1 relative">
                              <span className="absolute -top-1 -left-1 bg-win98-blue text-white text-[9px] px-1 font-bold border border-white">Lvl {part.level}</span>
                              <img 
                                src={`/images/part/${part.image}`} 
                                alt={part.name} 
                                className="w-full h-full object-contain"
                                onError={(e) => e.target.src = '/images/shop.png'}
                              />
                           </div>
                           <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                <span className="font-bold text-sm uppercase truncate block">{part.name}</span>
                                <p className="text-xs text-gray-700 leading-tight italic truncate">{part.description}</p>
                              </div>
                              <div className="mt-2 flex justify-between items-end">
                                 <div className="flex flex-wrap gap-1">
                                    {part.cvBonus > 0 && <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1 border border-blue-600">+{part.cvBonus} CV</span>}
                                    {part.kgBonus > 0 && <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1 border border-blue-600">-{part.kgBonus} KG</span>}
                                 </div>
                                 <button 
                                   onClick={() => handleAction('mount', part.id, part.name)}
                                   className="px-3 py-1 bg-green-100 text-green-800 border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray text-xs font-bold hover:bg-green-800 hover:text-white transition-colors"
                                 >
                                   INSTALLA
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
