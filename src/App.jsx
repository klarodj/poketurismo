import AccountGate from './components/AccountGate';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

import Dealership from './pages/Dealership';
import UsedCars from './pages/UsedCars';
import Workshop from './pages/Workshop';
import PartsShop from './pages/PartsShop';
import GasStation from './pages/GasStation';
import Racing from './pages/Racing';
import Autodrome from './pages/Autodrome';
import TimeTrials from './pages/TimeTrials';
import TrackRace from './pages/TrackRace';
import CityMap from './pages/CityMap';
import GaragePilota from './pages/GaragePilota';
import GarageAuto from './pages/GarageAuto';
import GarageScuolaGuida from './pages/GarageScuolaGuida';
import GarageCarDetail from './pages/GarageCarDetail';
import Meet from './pages/Meet';
import StreetRacing from './pages/StreetRacing';
import DevSandbox from './pages/DevSandbox';

import { useEffect } from 'react';
import usePlayerStore from './store/playerStore';
import useGameStore from './store/gameStore';

function App() {
  const carDrive = usePlayerStore(state => state.carDrive);
  const equippedCarId = useGameStore(state => state.equippedCarId);
  const setEquippedCarId = useGameStore(state => state.setEquippedCarId);


  useEffect(() => {
    if (carDrive !== null && carDrive !== equippedCarId) {
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
          <Route path="garage/scuola-guida" element={<GarageScuolaGuida />} />
          <Route path="garage/auto/:id" element={<GarageCarDetail />} />
          <Route path="dealership" element={<Dealership />} />
          <Route path="used-cars" element={<UsedCars />} />
          <Route path="workshop" element={<Workshop />} />
          <Route path="parts-shop" element={<PartsShop />} />
          <Route path="gas-station" element={<GasStation />} />
          <Route path="autodrome" element={<Autodrome />} />
          <Route path="time-trials" element={<TimeTrials />} />
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

export default function AuthenticatedApp() { return <AccountGate><App /></AccountGate>; }
