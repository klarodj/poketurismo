import PerformanceBadge from './PerformanceBadge';
import {partName,partDescription} from '../logic/partLabels.mjs';
import React from 'react';
import RaceCarArtwork from './RaceCarArtwork';
import {paintFor,paintName} from '../../shared/carPaint.mjs';
import { CAR_STAT_LABELS, calculateRaceStats } from '../logic/raceEngine';

const format = value => Number.isFinite(value) ? value.toLocaleString('it-IT', { maximumFractionDigits: 2 }) : '—';

export default function UsedCarDetails({ listing }) {
  const car = listing.car;
  const mods = listing.mods ?? [];
  const stats = calculateRaceStats(listing);
  const specifications = [
    ['Colore',listing.racePrepared?'Livrea da gara':paintName(paintFor(listing))], ['Anno', car.year], ['Cilindrata', `${format(car.cc)} cm³`],
    ['Motore', car.engineType], ['Trazione', car.driveType],
    ['Potenza attuale', `${format(listing.cv)} CV`], ['Coppia attuale', `${format(listing.nm)} Nm`],
    ['Peso attuale', `${format(listing.kg)} kg`], ['Chilometri', `${format(listing.km)} km`],
    ['Stato motore', `${format(listing.engineHealth)}%`], ['Stato gomme', `${format(listing.tireGrip)}%`],
    ['Carburante', `${format(listing.currentFuel)} L · ${listing.fuelType || '—'}`],
    ['Km dall’ultimo tagliando', format(Math.max(0, listing.km - listing.serviceKm))],
    ['Velocità massima di serie', `${format(car.velMax)} km/h`],
    ['0–100 km/h di serie', `${format(car.zeroToHundred)} s`],
  ];

  return (
    <details className="border border-[#7799CC] bg-[#F4F6F8] mt-3">
      <summary className="cursor-pointer px-3 py-2 font-bold text-[#006699] hover:bg-[#D1D7DC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#006699]">
        Apri foto, caratteristiche e pezzi installati ({mods.length})
      </summary>
      <div className="border-t border-[#7799CC] p-3 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-300 p-3 flex items-center justify-center min-h-40">
            {listing.racePrepared&&<p className="period-notice">Auto da gara · solo pista. Trasformazione definitiva, componenti di livello 3 vincolati.</p>}<PerformanceBadge car={listing}/><RaceCarArtwork car={{...car,racePrepared:listing.racePrepared,paintColour:listing.paintColour}} large/>
          </div>
          <div>
            <h3 className="font-bold text-[#006699] mb-2">Scheda dell’auto in vendita</h3>
            <dl className="text-xs space-y-1">
              {specifications.map(([label, value]) => <div key={label} className="flex justify-between gap-3 border-b border-gray-200 pb-1"><dt>{label}</dt><dd className="font-bold text-right">{value ?? '—'}</dd></div>)}
            </dl>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-[#006699] mb-2">Caratteristiche attuali in gara</h3>
          <p className="text-xs text-gray-600 mb-2">Valori con modifiche e usura dell’esemplare. Velocità massima e 0–100 sopra sono i riferimenti del modello di serie.</p>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {['speed', 'acceleration', 'revving', 'transmission', 'turnSlow', 'turnFast', 'brake', 'traction'].map(key => <div key={key} className="bg-white border border-gray-300 p-2"><dt>{CAR_STAT_LABELS[key]}</dt><dd className="font-bold">{format(stats[key])}</dd></div>)}
          </dl>
        </div>
        <div>
          <h3 className="font-bold text-[#006699] mb-2">Pezzi già installati</h3>
          {mods.length ? <ul className="space-y-2">{mods.map(mod => <li key={mod.id} className="bg-white border border-gray-300 p-2">
            <p className="font-bold">{partName(mod.part.name)} <span className="font-normal text-xs">· {mod.part.category==='Engine'?'Motore e trasmissione':mod.part.category==='Dynamic'?'Assetto e ciclistica':mod.part.category} · livello {mod.part.level}</span></p>
            <p className="text-xs mt-1">{partDescription(mod.part)}</p>
          </li>)}</ul> : <p className="text-xs">Nessun pezzo aftermarket installato: allestimento di serie.</p>}
          <p className="text-xs text-gray-600 mt-2">I pezzi elencati sono inclusi nel prezzo e rimangono sull’auto dopo l’acquisto.</p>
        </div>
      </div>
    </details>
  );
}
