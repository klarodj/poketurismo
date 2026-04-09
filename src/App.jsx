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

import { useEffect } from 'react';
import usePlayerStore from './store/playerStore';
import useGarageStore from './store/garageStore';
import useGameStore from './store/gameStore';

function App() {
  const initializePlayer = usePlayerStore(state => state.initialize);
  const initializeGarage = useGarageStore(state => state.initialize);
  const carDrive = usePlayerStore(state => state.carDrive);
  const equippedCarId = useGameStore(state => state.equippedCarId);
  const setEquippedCarId = useGameStore(state => state.setEquippedCarId);

  const isInitialized = React.useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    async function init() {
      await initializePlayer(1);
      await initializeGarage(1);
    }
    init();
  }, [initializePlayer, initializeGarage]);

  useEffect(() => {
    if (carDrive && carDrive !== equippedCarId) {
      setEquippedCarId(carDrive);
    }
  }, [carDrive, equippedCarId, setEquippedCarId]);

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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
