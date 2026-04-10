import React from 'react';
import { useNavigate } from 'react-router-dom';
import usePlayerStore from '../store/playerStore';
import useInventoryStore from '../store/inventoryStore';
import Win98Window from '../components/Win98Window';

export default function GaragePilota() {
  const navigate = useNavigate();
  const { username, money, level, xp, stats } = usePlayerStore();
  const { moves, equippedMoves } = useInventoryStore();

  const playerMoves = moves.filter(m => equippedMoves.includes(m.id));

  return (
    <Win98Window title="Profilo Pilota" imageUrl="/images/garage.png">
      <div className="flex flex-col bg-win98-gray text-black">
        
        {/* Navigation Tabs */}
        <div className="flex gap-1 p-2 bg-win98-gray border-b-2 border-win98-darkerGray">
           <button 
             onClick={() => navigate('/garage/pilota')}
             className="px-6 py-2 bg-white border-2 border-win98-darkerGray shadow-win98-inset font-bold text-base flex items-center gap-2"
           >
             👤 PILOTA
           </button>
           <button 
             onClick={() => navigate('/garage/auto')}
             className="px-6 py-2 bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white font-bold text-base flex items-center gap-2"
           >
             🚗 AUTO
           </button>
        </div>

        <div className="p-4 flex flex-col md:flex-row gap-6">
        
          {/* Left: Pilot Info & Stats */}
          <div className="flex-1 space-y-4">
            <div className="bg-white border-2 border-t-win98-darkerGray border-l-win98-darkerGray border-b-white border-r-white p-4 shadow-win98-inset">
              <h2 className="text-xl font-bold bg-win98-blue text-white px-2 mb-4">Dati Generali</h2>
              <div className="flex gap-4 mb-4">
                 <div className="w-24 h-24 bg-gray-300 border-2 border-gray-500 overflow-hidden shrink-0">
                    <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=Pilota${level}`} alt="Avatar" className="w-full h-full object-cover"/>
                 </div>
                 <div className="flex-1 text-base font-bold flex flex-col justify-center">
                   <p className="text-xl">Utente: {username}</p>
                   <p>Livello: {level} ({xp} XP)</p>
                   <p className="text-green-700">Saldo: €{money.toLocaleString()}</p>
                 </div>
              </div>
            </div>

            <div className="bg-white border-2 border-t-win98-darkerGray border-l-win98-darkerGray border-b-white border-r-white p-4 shadow-win98-inset">
              <h2 className="text-xl font-bold bg-win98-darkerGray text-white px-2 mb-2">Statistiche Pilota (Saving Throws)</h2>
              <div className="bg-win98-gray p-2 border border-gray-400 font-bold text-base space-y-2">
                 <div className="flex justify-between border-b border-gray-300 pb-1">
                   <span>💪 Brave (Coraggio)</span> <span>{stats.brave}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-300 pb-1">
                   <span>🧼 Clean (Pulizia)</span> <span>{stats.clean}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-300 pb-1">
                   <span>⚡ Reflex (Riflessi)</span> <span>{stats.reflex}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>⚙️ Shift (Cambiata)</span> <span>{stats.shift}</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Right: Known Moves & Loadout */}
          <div className="flex-1">
            <div className="bg-white border-2 border-t-win98-darkerGray border-l-win98-darkerGray border-b-white border-r-white p-2 h-full shadow-win98-inset">
              <h2 className="text-xl font-bold bg-win98-blue text-white px-2 mb-2">Grimorio Mosse (Loadout Attivo)</h2>
              <p className="text-sm mb-3 px-1 text-gray-700 font-bold">Le mosse equipaggiate ti permettono di ottenere bonus specifici in gara durante determinate sezioni o condizioni meteo.</p>
              
              <div className="space-y-3">
                {playerMoves.map(move => (
                  <div key={move.id} className="bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray p-2 shadow-[1px_1px_0_0_#000]">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold font-pixel text-base">{move.name}</span>
                      <span className="text-xs bg-red-800 text-white px-1 leading-tight">Trigger: {move.trigger}</span>
                    </div>
                    <p className="text-sm mb-1 italic text-gray-800">{move.description}</p>
                    
                    <div className="flex gap-2 text-xs flex-wrap">
                      {move.bonus && Object.entries(move.bonus).map(([stat, val]) => (
                        <span key={stat} className="bg-green-200 border border-green-700 text-green-900 px-1 py-0.5">+{val} {stat}</span>
                      ))}
                      {move.costGrip > 0 && <span className="bg-gray-300 border border-black text-black px-1 py-0.5">-{move.costGrip}% Gomme</span>}
                      {move.costHealth > 0 && <span className="bg-gray-300 border border-black text-black px-1 py-0.5">-{move.costHealth}% Motore</span>}
                    </div>
                  </div>
                ))}
                {playerMoves.length === 0 && <p className="p-4 italic text-gray-500">Nessuna mossa padroneggiata.</p>}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </Win98Window>
  );
}
