import React, { useState, useEffect } from 'react';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useGameStore from '../store/gameStore';
import ForumPost from '../components/ForumPost';
import { fetchMarket, purchaseCar } from '../services/api';

export default function UsedCars() {
  const { id: userId, money, initialize: refreshPlayer } = usePlayerStore();
  const { initialize: refreshGarage } = useGarageStore();
  const { triggerEvent } = useGameStore();
  const [marketCars, setMarketCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarket().then(data => {
      setMarketCars(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleBuy = async (car) => {
    // Note: car here is the "market" garage item
    if (money >= car.sellPrice) {
      try {
        await purchaseCar(userId, car.carId, car.sellPrice);
        await refreshPlayer(userId);
        await refreshGarage(userId);
        
        triggerEvent({
          type: 'info',
          title: 'Affare Concluso',
          message: `Hai comprato l'auto! Si trova nel tuo Garage.`
        });
        
        // Remove from local market list
        setMarketCars(prev => prev.filter(c => c.id !== car.id));
      } catch (err) {
        triggerEvent({
          type: 'error',
          title: 'Errore Forum',
          message: 'Il venditore ha annullato la transazione all\'ultimo secondo.'
        });
      }
    } else {
      triggerEvent({
        type: 'error',
        title: 'Fondi Insufficienti',
        message: 'Non hai i soldi richiesti. Il venditore ti ha bloccato.'
      });
    }
  };

  return (
    <div className="w-full h-full bg-[#f1f1f1] flex flex-col">
      {/* Forum Header */}
      <div className="bg-[#006699] text-white p-4 mb-4 shadow-md">
        <h1 className="text-2xl font-bold italic tracking-wider">Elaborare.info Forum</h1>
        <div className="text-xs mt-1 text-[#D1D7DC]">Indice del forum ➔ Mercatino Vendo Auto</div>
      </div>
      
      {/* Search / Breadcrumbs bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#EFEFEF] border border-[#D1D7DC] mb-4 text-sm text-[#006699] font-bold">
        <span>Argomenti: 2</span>
        <button className="bg-[#EFEFEF] border border-[#7799CC] px-2 py-1 hover:bg-white text-xs">
          Nuovo Argomento
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="bg-white p-4 border border-[#7799CC] italic text-[#006699]">
            Connessione al server del forum in corso (56k modem sound)...
          </div>
        ) : marketCars.length === 0 ? (
          <div className="bg-white p-4 border border-[#7799CC] text-center">
            Non ci sono annunci attivi in questa sezione.
          </div>
        ) : marketCars.map(item => (
          <ForumPost 
            key={item.id}
            author="Utente_Anonimo" // Legacy DB doesn't have sellers
            date="Oggi, 12:44"
            title={`${item.car.brand.name} ${item.car.name}`}
            carDetails={{
              ...item.car,
              brand: item.car.brand.name,
              km: item.km,
              engineHealth: 95, // Mocking wear for now as it's not in garages table
              tireGrip: 88,
            }}
            price={item.sellPrice}
            onBuy={() => handleBuy(item)}
          />
        ))}
      </div>
    </div>
  );
}
