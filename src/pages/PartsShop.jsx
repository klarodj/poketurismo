import React, { useState, useEffect } from 'react';
import usePlayerStore from '../store/playerStore';
import useInventoryStore from '../store/inventoryStore';
import useGameStore from '../store/gameStore';
import useGarageStore from '../store/garageStore';
import Win98Window from '../components/Win98Window';
import { fetchParts } from '../services/api';

import { CAR_STAT_LABELS } from '../logic/raceEngine';

export default function PartsShop() {
  const { money, removeMoney } = usePlayerStore();
  const { addPart } = useInventoryStore();
  const { triggerEvent } = useGameStore();
  const { equippedCarId } = useGameStore();
  const { cars } = useGarageStore();
  
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Motore');
  const [selectedPart, setSelectedPart] = useState(null);

  const equippedCar = cars.find(c => c.id === equippedCarId);

  useEffect(() => {
    fetchParts().then(data => {
      setParts(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const engineParts = parts.filter(p => p.category === 'Engine');
  const chassisParts = parts.filter(p => p.category === 'Dynamic');

  const handleBuy = (part) => {
    if (money >= part.price) {
      removeMoney(part.price);
      addPart({ ...part, instanceId: `part_${Date.now()}` });
      setSelectedPart(null);
      triggerEvent({
        type: 'success',
        title: 'Ricambio Acquistato',
        message: `Hai comprato ${part.name}. Lo trovi nel tuo inventario ricambi.`
      });
    } else {
      triggerEvent({
        type: 'error',
        title: 'Fondi Insufficienti',
        message: 'Non puoi permetterti questo pezzo speciale.'
      });
    }
  };

  const displayedParts = activeTab === 'Motore' ? engineParts : chassisParts;

  // Group parts by name
  const groupedParts = displayedParts.reduce((acc, part) => {
    if (!acc[part.name]) acc[part.name] = [];
    acc[part.name].push(part);
    return acc;
  }, {});

  // Sort each group by level
  Object.keys(groupedParts).forEach(name => {
    groupedParts[name].sort((a, b) => a.level - b.level);
  });

  const StatComparison = ({ label, current, bonus }) => {
    if (!bonus || bonus === 0) return null;
    const isPositive = bonus > 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    return (
      <div className="flex justify-between text-sm border-b border-dotted border-gray-400 py-1">
        <span className="text-gray-700 font-bold">{label}:</span>
        <div className="flex gap-2 font-bold">
          <span>{current}</span>
          <span className={color}>→ {current + bonus}</span>
        </div>
      </div>
    );
  };

  // Weight is special (bonus is subtraction usually for reduction)
  const WeightComparison = ({ current, bonus }) => {
    if (!bonus || bonus === 0) return null;
    return (
      <div className="flex justify-between text-sm border-b border-dotted border-gray-400 py-1">
        <span className="text-gray-700 font-bold">Peso (KG):</span>
        <div className="flex gap-2 font-bold">
          <span>{current}kg</span>
          <span className="text-green-600">→ {current - bonus}kg</span>
        </div>
      </div>
    );
  };

  return (
    <Win98Window title="Negozio Ricambi ed Elaborazioni" imageUrl="/images/shop.png">
      <div className="flex flex-col bg-win98-gray text-black select-none">
        
        {/* Categories Tabs */}
        <div className="flex bg-win98-gray p-1 gap-1 border-b-2 border-win98-darkerGray">
          {['Motore', 'Ciclistica'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-base font-bold border-2 transition-all ${
                activeTab === tab 
                  ? 'bg-white border-win98-darkerGray shadow-win98-inset' 
                  : 'bg-win98-gray border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-win98-darkerGray'
              }`}
            >
              {tab === 'Motore' ? '🔧 MOTORE' : '🏎️ CICLISTICA'}
            </button>
          ))}
        </div>

        <div className="p-4">
           {loading ? (
             <div className="flex items-center justify-center h-full italic text-lg">Sfogliando il catalogo cartaceo...</div>
           ) : Object.keys(groupedParts).length === 0 ? (
             <div className="flex items-center justify-center h-full italic text-lg text-gray-500">Nessun pezzo disponibile in questa categoria.</div>
           ) : (
             <div className="space-y-8">
               {Object.entries(groupedParts).map(([groupName, variants]) => (
                 <div key={groupName} className="bg-white border-2 border-t-win98-darkerGray border-l-win98-darkerGray border-b-white border-r-white p-4 shadow-win98-inset">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b-2 border-win98-darkerGray pb-1 text-blue-900 uppercase">
                       <img src={`/images/part/${variants[0].image}`} alt={groupName} className="w-8 h-8 object-contain" onError={(e) => e.target.src = '/images/shop.png'} />
                       {groupName}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {variants.map(part => (
                        <div 
                          key={part.id} 
                          onClick={() => setSelectedPart(part)}
                          className="bg-win98-gray p-3 border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray flex gap-4 hover:bg-gray-200 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 shadow-md"
                        >
                          <div className="w-20 h-20 bg-white border-2 border-win98-darkerGray flex-shrink-0 flex items-center justify-center relative shadow-win98-inset">
                              <span className="absolute -top-1 -left-1 bg-win98-blue text-white text-xs px-2 py-0.5 font-bold border-2 border-white shadow-md">Lvl {part.level}</span>
                              <img 
                                src={`/images/part/${part.image}`} 
                                alt={part.name} 
                                className="w-full h-full object-contain p-1"
                                onError={(e) => { e.target.src = '/images/shop.png'; }}
                              />
                          </div>
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <p className="font-bold text-base leading-tight text-blue-900 mb-1">{part.description}</p>
                            </div>
                            <div className="flex justify-between items-center mt-auto border-t border-gray-300 pt-2">
                              <span className="font-bold text-green-700 text-base">€{part.price.toLocaleString()}</span>
                              <span className="text-xs text-gray-500 font-bold uppercase underline">Dettagli</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray w-full max-w-md shadow-2xl">
            <div className="bg-win98-blue px-2 py-1.5 flex justify-between items-center border-b-2 border-white">
              <span className="text-white font-bold text-base">Scheda Tecnica: {selectedPart.name}</span>
              <button 
                onClick={() => setSelectedPart(null)}
                className="bg-win98-gray w-6 h-6 flex items-center justify-center text-base font-bold border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 flex flex-col gap-5">
              <div className="flex gap-5">
                <div className="w-36 h-36 bg-white border-2 border-win98-darkerGray flex-shrink-0 flex items-center justify-center p-2 shadow-win98-inset">
                  <img 
                    src={`/images/part/${selectedPart.image}`} 
                    alt={selectedPart.name} 
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.src = '/images/shop.png'; }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-blue-900 leading-tight">{selectedPart.name}</h3>
                  <p className="text-sm text-win98-darkerGray font-bold uppercase mb-2">Livello {selectedPart.level} - {selectedPart.category}</p>
                  <p className="text-base border-t border-gray-300 pt-2 italic leading-tight">{selectedPart.description}</p>
                  <div className="mt-4 bg-[#008080] text-white p-2 text-center font-bold text-xl">
                    €{selectedPart.price.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Bonus / Stat Preview Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 p-3 border border-gray-300">
                  <h4 className="text-sm font-bold border-b border-gray-400 mb-2 uppercase">Bonus Tecnici</h4>
                  <div className="space-y-1.5 text-sm">
                    {selectedPart.cvBonus > 0 && <p className="text-green-600 font-bold">+{selectedPart.cvBonus} CV</p>}
                    {selectedPart.nmBonus > 0 && <p className="text-green-600 font-bold">+{selectedPart.nmBonus} NM</p>}
                    {selectedPart.kgBonus > 0 && <p className="text-green-600 font-bold">-{selectedPart.kgBonus} KG (Riduzione Peso)</p>}
                    {selectedPart.speedBonus > 0 && <p className="text-green-800">+{selectedPart.speedBonus} {CAR_STAT_LABELS.speed}</p>}
                    {selectedPart.accelBonus > 0 && <p className="text-green-800">+{selectedPart.accelBonus} {CAR_STAT_LABELS.acceleration}</p>}
                    {selectedPart.brakeBonus > 0 && <p className="text-green-800">+{selectedPart.brakeBonus} {CAR_STAT_LABELS.brake}</p>}
                  </div>
                </div>

                <div className="bg-[#FFFFE1] p-3 border border-gray-400">
                  <h4 className="text-sm font-bold border-b border-gray-400 mb-2 uppercase flex justify-between">
                    <span>Anteprima Stats</span>
                    {equippedCar ? <span className="text-xs opacity-70">({equippedCar.name})</span> : null}
                  </h4>
                  {equippedCar ? (
                    <div className="space-y-2">
                      <StatComparison label="CV" current={equippedCar.cv} bonus={selectedPart.cvBonus} />
                      <StatComparison label="Coppia" current={equippedCar.nm} bonus={selectedPart.nmBonus} />
                      <WeightComparison current={equippedCar.kg} bonus={selectedPart.kgBonus} />
                    </div>
                  ) : (
                    <p className="text-sm italic text-center text-red-700">Equipaggia un'auto nel garage per vedere l'anteprima.</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={() => handleBuy(selectedPart)}
                  className="flex-1 bg-win98-gray py-2 border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray font-bold hover:bg-green-100 active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white"
                >
                  Acquista Ora
                </button>
                <button 
                  onClick={() => setSelectedPart(null)}
                  className="px-6 bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray font-bold active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white"
                >
                  Indietro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Win98Window>
  );
}
