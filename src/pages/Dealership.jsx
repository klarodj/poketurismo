import React, { useState, useEffect, useMemo } from 'react';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useGameStore from '../store/gameStore';
import Win98Window from '../components/Win98Window';
import { fetchCars, fetchBrands, purchaseCar } from '../services/api';

export default function Dealership() {
  const { id: userId, money, initialize: refreshPlayer } = usePlayerStore();
  const { initialize: refreshGarage } = useGarageStore();
  const { triggerEvent } = useGameStore();

  const [allCars, setAllCars] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [view, setView] = useState('random'); // 'random', 'brands', 'brand_detail'
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pick 6 random cars only once when data is loaded
  const randomCars = useMemo(() => {
    if (allCars.length === 0) return [];
    return [...allCars].sort(() => 0.5 - Math.random()).slice(0, 6);
  }, [allCars]);

  useEffect(() => {
    async function loadData() {
       try {
          const [carsData, brandsData] = await Promise.all([fetchCars(), fetchBrands()]);
          setAllCars(carsData);
          // Sort brands alphabetically
          setAllBrands(brandsData.sort((a, b) => a.name.localeCompare(b.name)));
          setLoading(false);
       } catch (err) {
          console.error(err);
          setLoading(false);
       }
    }
    loadData();
  }, []);

  const handleBuy = async (car) => {
    if (money >= car.price) {
      try {
        await purchaseCar(userId, car.id, car.price);
        await refreshPlayer(userId);
        await refreshGarage(userId);
        triggerEvent({ type: 'info', title: 'Acquisto Completato', message: `Hai acquistato una bellissima ${car.name}! La trovi nel tuo Garage.` });
      } catch (err) {
        triggerEvent({ type: 'error', title: 'Errore Sistema', message: 'L\'ufficio pratiche auto ha riscontrato un errore nel trasferimento.' });
      }
    } else {
      triggerEvent({ type: 'error', title: 'Fondi Insufficienti', message: 'Non hai abbastanza soldi per acquistare questa vettura.' });
    }
  };

  const filteredCars = useMemo(() => {
    if (!selectedBrand) return [];
    return allCars.filter(c => c.brandId === selectedBrand.id);
  }, [allCars, selectedBrand]);

  const renderCarGrid = (carsToRender) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {carsToRender.map(car => (
        <div key={car.id} className="bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray p-3 flex flex-col items-center shadow-win98-outset">
          <div className="w-full h-32 bg-white border-2 border-win98-darkerGray shadow-win98-inset mb-3 flex items-center justify-center overflow-hidden p-2">
            <img 
              src={`/images/car/${car.image}`} 
              alt={car.name} 
              className="max-h-full max-w-full object-contain" 
              onError={(e) => e.target.src = 'https://via.placeholder.com/150x80?text=Auto'} 
            />
          </div>
          
          <h3 className="font-bold text-center text-sm mb-2">{car.brand.name} {car.name}</h3>
          
          <div className="w-full text-[10px] bg-black text-green-400 p-2 font-pixel border border-gray-600 mb-3">
             <p>POWER: {car.cv} CV | NM: {car.nm}</p>
             <p>WEIGHT: {car.kg} KG | {car.driveType}</p>
             <p className="text-yellow-400 mt-1">PRICE: €{car.price.toLocaleString()}</p>
          </div>

          <button 
            onClick={() => handleBuy(car)}
            disabled={money < car.price}
            className={`w-full py-1 font-bold border-2 ${
              money >= car.price 
                ? 'bg-win98-gray border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-win98-darkerGray text-black hover:bg-gray-200' 
                : 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed'
            }`}
          >
            Scegli Vettura
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <Win98Window title="Concessionaria - Gran Turismo Auto" imageUrl="/images/dealer.png">
      <div className="flex flex-col bg-win98-gray text-black font-sans">
        
        {/* Toolbar */}
        <div className="p-1 bg-win98-gray border-b-2 border-win98-darkGray flex gap-2">
           <button 
             onClick={() => setView('random')}
             className={`px-4 py-1 border-2 font-bold text-sm ${view === 'random' ? 'bg-win98-darkGray text-white border-win98-darkerGray' : 'bg-win98-gray border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-win98-darkerGray'}`}
           >
             🏠 Home
           </button>
           <button 
             onClick={() => setView('brands')}
             className={`px-4 py-1 border-2 font-bold text-sm ${view === 'brands' || view === 'brand_detail' ? 'bg-win98-darkGray text-white border-win98-darkerGray' : 'bg-win98-gray border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-win98-darkerGray'}`}
           >
             🏁 Sfoglia per Brands
           </button>
        </div>

        <div className="p-4 flex-grow">
          {loading ? (
            <div className="p-10 text-center font-bold italic">
               <p>Connessione al database centrale in corso...</p>
               <div className="mt-4 w-64 h-4 bg-gray-300 border-2 border-win98-darkerGray mx-auto">
                  <div className="h-full bg-blue-800 animate-pulse w-full"></div>
               </div>
            </div>
          ) : (
            <>
              {view === 'random' && (
                <div>
                  <div className="bg-win98-blue text-white px-2 py-1 mb-4 flex justify-between">
                     <span className="font-bold">OFFERTE DEL GIORNO (Rilevate 6 vetture casuali)</span>
                     <span className="text-xs">Update: {new Date().toLocaleTimeString()}</span>
                  </div>
                  {renderCarGrid(randomCars)}
                </div>
              )}

              {view === 'brands' && (
                <div>
                  <h2 className="text-lg font-bold mb-4 border-b border-win98-darkGray pb-1 uppercase italic">Seleziona il Produttore</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                     {allBrands.map(brand => (
                       <div 
                         key={brand.id}
                         onClick={() => { setSelectedBrand(brand); setView('brand_detail'); }}
                         className="bg-white border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all active:shadow-win98-inset active:border-win98-darkerGray"
                       >
                         <div className="w-12 h-12 mb-2">
                           <img 
                             src={`/images/brand/${brand.logo}`} 
                             alt={brand.name} 
                             className="w-full h-full object-contain"
                             onError={(e) => e.target.src = 'https://via.placeholder.com/50?text=?'} 
                           />
                         </div>
                         <span className="text-[10px] font-bold text-center uppercase truncate w-full">{brand.name}</span>
                       </div>
                     ))}
                  </div>
                </div>
              )}

              {view === 'brand_detail' && (
                <div>
                  <div className="flex items-center gap-4 mb-6 bg-white p-4 border-2 border-t-win98-darkGray border-l-win98-darkGray border-b-white border-r-white">
                     <div className="w-20 h-20 bg-gray-50 border border-gray-300 p-2">
                        <img src={`/images/brand/${selectedBrand.logo}`} alt={selectedBrand.name} className="w-full h-full object-contain" />
                     </div>
                     <div>
                        <h1 className="text-2xl font-black italic uppercase text-win98-blue">{selectedBrand.name}</h1>
                        <p className="text-xs font-bold text-gray-500">{filteredCars.length} modelli disponibili in pronta consegna</p>
                        <button 
                          onClick={() => setView('brands')}
                          className="mt-2 text-xs text-blue-800 underline font-bold"
                        >
                          &laquo; Torna all'elenco Brand
                        </button>
                     </div>
                  </div>
                  {renderCarGrid(filteredCars)}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Footer info bar */}
        <div className="bg-win98-gray border-t-2 border-white p-1 text-[10px] flex justify-between px-3">
           <div className="flex gap-4">
              <span>Modelli Totatli: {allCars.length}</span>
              <span>Brands: {allBrands.length}</span>
           </div>
           <div className="font-bold text-win98-blue uppercase">
              Patrimonio Pilota: €{money.toLocaleString()}
           </div>
        </div>
      </div>
    </Win98Window>
  );
}

