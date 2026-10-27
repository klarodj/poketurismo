import LocationGuide from '../components/LocationGuide';
import React, { useState, useEffect } from 'react';
import usePlayerStore from '../store/playerStore';
import useGameStore from '../store/gameStore';
import ForumPost from '../components/ForumPost';
import useRequestStore from '../store/requestStore';
import { fetchMarket, purchaseCar } from '../services/api';

export default function UsedCars() {
  const { id: userId, money } = usePlayerStore();
  const { triggerEvent } = useGameStore();
  const [marketCars, setMarketCars] = useState([]);
  const [limit,setLimit]=useState(8);
  const [error,setError]=useState('');
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState('all');
  const [affordableOnly, setAffordableOnly] = useState(false);
  const pending = useRequestStore(state => state.pending);
  const tiers = [...new Map(marketCars.filter(item => item.marketTier).map(item => [item.marketTier.id, item.marketTier.name])).entries()];
  const filtered = marketCars.filter(item => (tier === 'all' || item.marketTier?.id === tier) && (!affordableOnly || item.sellPrice <= money));

  useEffect(() => {
    fetchMarket().then(data => {
      setMarketCars(data);
      setLoading(false);
    }).catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, []);

  const handleBuy = async (car) => {
    // Note: car here is the "market" garage item
    if (money >= car.sellPrice) {
      try {
        await purchaseCar(userId, car.carId, car.id);
        
        triggerEvent({
          type: 'info',
          title: 'Affare Concluso',
          message: `Hai comprato l'auto! Si trova nel tuo Garage.`
        });
        
        // Remove from local market list
        setMarketCars(prev => prev.filter(c => c.id !== car.id));
      } catch {
        triggerEvent({
          type: 'error',
          title: 'Errore Forum',
          message: 'Annuncio non più disponibile o acquisto non riuscito. Ricarica il mercato e riprova.'
        });
      }
    } else {
      triggerEvent({
        type: 'error',
        title: 'Fondi Insufficienti',
        message: 'Il prezzo supera il tuo saldo disponibile.'
      });
    }
  };

  return (
    <div className="period-web w-full bg-[#f1f1f1] flex flex-col">
      {/* Forum Header */}
      <div className="bg-[#006699] text-white p-4 mb-4 shadow-md flex items-center gap-2"><div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl font-bold italic break-words">Elaborare.info Forum</h1>
        <div className="text-xs mt-1 text-[#D1D7DC]">Indice del forum ➔ Mercatino Vendo Auto</div></div><LocationGuide guideId="used"/>
      </div>
      
      <div className="px-4 mb-4 space-y-3 text-sm">
        <p className="font-bold text-[#006699]">Saldo disponibile: €{money.toLocaleString('it-IT')} · Annunci: {filtered.length}</p>
        <p>Le auto Primi passi sono adatte per cominciare. Conserva un margine per carburante, gomme e manutenzione.</p>
        <div className="flex flex-wrap items-center gap-4">
          <label>Fascia <select className="bg-white border-2 border-gray-500 px-2 py-1 ml-2" value={tier} onChange={event => {setTier(event.target.value);setLimit(8);}}><option value="all">Tutte le fasce</option>{tiers.map(([id,name]) => <option key={id} value={id}>{name}</option>)}</select></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={affordableOnly} onChange={event => {setAffordableOnly(event.target.checked);setLimit(8);}} />Solo auto nel mio budget</label>
        </div>
      </div>

      {error&&<p role="alert" className="period-notice">{error}</p>}
      <div className="px-4 pb-4">
        {loading ? (
          <div className="bg-white p-4 border border-[#7799CC] italic text-[#006699]">
            Connessione al mercatino in corso…
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-4 border border-[#7799CC] text-center">
            Nessun annuncio corrisponde ai filtri selezionati.
          </div>
        ) : filtered.slice(0,limit).map(item => (
          <ForumPost 
            key={item.id}
            author="Mercatino Poketurismo"
            date="Annuncio attivo"
            title={`${item.car.brand.name} ${item.car.name}`}
            listing={item}
            carDetails={{
              ...item.car,paintColour:item.paintColour,
              brand: item.car.brand.name,
              cv: item.cv, kg: item.kg, currentFuel: item.currentFuel,
              marketTier: item.marketTier?.name, starterFriendly: item.starterFriendly,
              km: item.km,
              engineHealth: item.engineHealth,
              tireGrip: item.tireGrip,
            }}
            price={item.sellPrice}
            disabled={pending > 0 || money < item.sellPrice}
            remainingMoney={money - item.sellPrice}
            onBuy={() => handleBuy(item)}
          />
        ))}
        {filtered.length>limit&&<button className="win98-btn" onClick={()=>setLimit(n=>n+8)}>Altri annunci ({filtered.length-limit})</button>}
      </div>
    </div>
  );
}
