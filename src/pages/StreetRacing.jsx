import React from 'react';
import Win98Window from '../components/Win98Window';
import { useNavigate } from 'react-router-dom';

export default function StreetRacing() {
  const navigate = useNavigate();

  return (
    <Win98Window title="Corse Clandestine" imageUrl="/images/street.png">
      <div className="flex flex-col items-center justify-center p-8 bg-black border-4 border-gray-800 h-full text-white font-pixel shadow-[inset_0_10px_50px_rgba(0,0,0,0.8)]">
        <h1 className="text-4xl text-white mb-2 font-bold italic tracking-widest drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">STREET RACING</h1>
        <h2 className="text-xl text-red-300 mb-8 border-b-2 border-red-500 pb-2">Viale Industriale Sud</h2>
        
        <p className="text-center text-sm mb-6 max-w-lg leading-relaxed bg-black/50 p-4 border border-red-800">
          Qui le regole della pista non valgono. Si corre nel traffico, si evitano le volanti della Polizia, e si gioca con il <strong>Pink Slip (Libretto dell'auto)</strong>.<br/><br/>
          Se perdi, torni a piedi. Sblocca la reputazione livello 10 per accedere.
        </p>

        <div className="flex gap-4 mt-auto">
          <button 
            disabled
            className="bg-gray-600 text-gray-400 px-6 py-2 border-2 border-gray-500 font-bold opacity-50 cursor-not-allowed line-through"
          >
            Trova Avversario
          </button>
          <button 
            onClick={() => navigate('/map')}
            className="bg-win98-gray text-black px-6 py-2 border-4 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray font-bold hover:bg-gray-200"
          >
            Sgomma Via
          </button>
        </div>
      </div>
    </Win98Window>
  );
}
