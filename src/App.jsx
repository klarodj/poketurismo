import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

import Dealership from './pages/Dealership';
import UsedCars from './pages/UsedCars';
import Workshop from './pages/Workshop';
import PartsShop from './pages/PartsShop';
import GasStation from './pages/GasStation';
import Racing from './pages/Racing';
import TrackRace from './pages/TrackRace';
import CityMap from './pages/CityMap';
import GaragePilota from './pages/GaragePilota';
import GarageAuto from './pages/GarageAuto';
import GarageCarDetail from './pages/GarageCarDetail';
import Meet from './pages/Meet';
import StreetRacing from './pages/StreetRacing';
import DevSandbox from './pages/DevSandbox';

import { useEffect } from 'react';
import usePlayerStore from './store/playerStore';
import { applyGameState } from './services/gameState';
import { fetchState } from './services/api';
import useGameStore from './store/gameStore';

function App() {
  const [startupError, setStartupError] = React.useState('');
  const carDrive = usePlayerStore(state => state.carDrive);
  const equippedCarId = useGameStore(state => state.equippedCarId);
  const setEquippedCarId = useGameStore(state => state.setEquippedCarId);

  useEffect(() => {
    let cancelled = false;
    fetchState(1).then(data => { if (!cancelled) applyGameState(data); }).catch(error => { if (!cancelled) setStartupError(error.message); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (carDrive !== null && carDrive !== equippedCarId) {
      setEquippedCarId(carDrive);
    }
  }, [carDrive, equippedCarId, setEquippedCarId]);

  if (startupError) return <div className="p-6 text-white" role="alert">Impossibile caricare il salvataggio: {startupError}<button className="block mt-4 underline" onClick={() => window.location.reload()}>Riprova</button></div>;
  return (
    <BrowserRouter>
      <Routes>
        {/* App Content */}
        <Route path="/" element={<Layout />}>
          <Route index element={<CityMap />} />
          <Route path="map" element={<CityMap />} />
          <Route path="garage" element={<Navigate to="/garage/pilota" replace />} />
          <Route path="garage/pilota" element={<GaragePilota />} />
          <Route path="garage/auto" element={<GarageAuto />} />
          <Route path="garage/auto/:id" element={<GarageCarDetail />} />
          <Route path="dealership" element={<Dealership />} />
          <Route path="used-cars" element={<UsedCars />} />
          <Route path="workshop" element={<Workshop />} />
          <Route path="parts-shop" element={<PartsShop />} />
          <Route path="gas-station" element={<GasStation />} />
          <Route path="racing" element={<Racing />} />
          <Route path="track-race" element={<TrackRace />} />
          <Route path="meet" element={<Meet />} />
          <Route path="street-racing" element={<StreetRacing />} />
          <Route path="dev-sandbox" element={<DevSandbox />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
