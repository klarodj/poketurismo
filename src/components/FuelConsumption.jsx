import React from 'react';
import{consumptionEstimate}from'../../shared/fuelConsumption.mjs';
import{kmPerLiter,efficiencyLabel}from'../logic/displayUnits.mjs';
export default function FuelConsumption({car}){
 const estimate=consumptionEstimate(car),show=key=>efficiencyLabel(kmPerLiter(estimate[key]));
 return <details className="fuel-consumption border-2 border-t-gray-500 border-l-gray-500 border-b-white border-r-white bg-win98-gray p-2 text-black" aria-label="Consumo stimato"><summary className="font-bold">Consumo stimato · {show('mixed')} km/l</summary><p>Misto indicativo: <strong>{show('mixed')} km/l</strong></p><p>In gara: <strong>{show('save')} km/l</strong> conserva · <strong>{show('balanced')} km/l</strong> ritmo pulito · <strong>{show('attack')} km/l</strong> attacco</p><p>Più km/l significa meno carburante usato sulla stessa distanza. Stima a motore caldo sulla preparazione attuale; pendenza e tecniche possono cambiarla, non è un dato omologato.</p></details>;
}
