import React from 'react';
import usePlayerStore from '../store/playerStore';
import useInventoryStore from '../store/inventoryStore';
import Win98Window from '../components/Win98Window';
import GarageTabs from '../components/GarageTabs';

import useRequestStore from '../store/requestStore';
import useRaceStore from '../store/raceStore';
import { equipMoves } from '../services/api';
import { PILOT_STAT_LABELS } from '../logic/raceEngine';

export default function GaragePilota() {
  const { id: userId, username, money, level, xp, stats } = usePlayerStore();
  const { moves, equippedMoves } = useInventoryStore();

  const playerMoves = moves;
  const pending = useRequestStore(state => state.pending);
  const activeRace = useRaceStore(state => state.activeRace);
  const toggleMove = async id => {
    const selected = equippedMoves.includes(id);
    if (!selected && equippedMoves.length >= 4) return;
    try { await equipMoves(userId, selected ? equippedMoves.filter(item => item !== id) : [...equippedMoves, id]); }
    catch { /* The shared request banner offers a retry. */ }
  };

  return (
    <Win98Window title="Profilo Pilota" imageUrl="/images/garage.png">
      <div className="flex flex-col bg-win98-gray text-black">
        
        <GarageTabs />

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
                <h2 className="text-xl font-bold bg-win98-darkerGray text-white px-2 mb-2">Abilità Pilota</h2>
                <div className="bg-win98-gray p-2 border border-gray-400 font-bold text-base space-y-1.5 uppercase font-pixel">
                   <div className="flex justify-between border-b border-gray-300 pb-0.5">
                     <span>💪 {PILOT_STAT_LABELS.brave}</span> <span>{stats.brave}</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-300 pb-0.5">
                     <span>🧼 {PILOT_STAT_LABELS.clean}</span> <span>{stats.clean}</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-300 pb-0.5">
                     <span>⚡ {PILOT_STAT_LABELS.reflex}</span> <span>{stats.reflex}</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-300 pb-0.5">
                     <span>🤸 {PILOT_STAT_LABELS.acro}</span> <span>{stats.acro}</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-300 pb-0.5">
                     <span>🎯 {PILOT_STAT_LABELS.turn}</span> <span>{stats.turn}</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-300 pb-0.5">
                     <span>🛑 {PILOT_STAT_LABELS.brake}</span> <span>{stats.brake}</span>
                   </div>
                   <div className="flex justify-between border-b border-gray-300 pb-0.5">
                     <span>🚀 {PILOT_STAT_LABELS.throttle}</span> <span>{stats.throttle}</span>
                   </div>
                   <div className="flex justify-between">
                     <span>⚙️ {PILOT_STAT_LABELS.shift}</span> <span>{stats.shift}</span>
                   </div>
                </div>
              </div>
          </div>

          {/* Right: Known Moves & Loadout */}
          <div className="flex-1">
            <div className="bg-white border-2 border-t-win98-darkerGray border-l-win98-darkerGray border-b-white border-r-white p-2 h-full shadow-win98-inset">
              <h2 className="text-xl font-bold bg-win98-blue text-white px-2 mb-2">Tecniche di guida (massimo 4 attive)</h2>
              <p className="text-sm mb-3 px-1 text-gray-700 font-bold">Le tecniche equipaggiate aiutano a sfruttare la vettura nei contesti indicati. La padronanza migliora con la pratica.</p>
              
              <div className="space-y-3">
                {playerMoves.map(move => (
                  <div key={move.id} className="bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray p-2 shadow-[1px_1px_0_0_#000]">
                    <div className="flex justify-between items-start mb-1">
                      <button className="font-bold font-pixel text-base underline disabled:opacity-50" disabled={(pending > 0 || !!activeRace || (!equippedMoves.includes(move.id) && equippedMoves.length >= 4))} onClick={() => toggleMove(move.id)}>{equippedMoves.includes(move.id) ? '☑' : '☐'} {move.name}</button>
                      <span className="text-xs bg-red-800 text-white px-1 leading-tight">{move.mastery || (move.trigger === 'always' ? 'Sempre utilizzabile' : move.trigger === 'Braking-Zone' ? 'Zona di frenata' : move.trigger === 'Gap-Negative' ? 'In recupero' : move.trigger)}</span>
                    </div>
                    <p className="text-sm mb-1 italic text-gray-800">{move.description}</p>
                    
                    <div className="flex gap-2 text-xs flex-wrap">
                      {move.bonus && Object.entries(move.bonus).map(([stat, val]) => (
                        <span key={stat} className="bg-green-200 border border-green-700 text-green-900 px-1 py-0.5">+{val} {PILOT_STAT_LABELS[stat] || stat}</span>
                      ))}
                      {move.costGrip > 0 && <span className="bg-gray-300 border border-black text-black px-1 py-0.5">Impegna le gomme</span>}
                      {move.costHealth > 0 && <span className="bg-gray-300 border border-black text-black px-1 py-0.5">Sollecita il motore</span>}
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
