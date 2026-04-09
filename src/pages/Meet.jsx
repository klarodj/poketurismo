import React from 'react';
import Win98Window from '../components/Win98Window';
import { useNavigate } from 'react-router-dom';

export default function Meet() {
  const navigate = useNavigate();

  return (
    <Win98Window title="Car Meet (Piazzale)" imageUrl="/images/meet.png">
      <div className="flex flex-col items-center justify-center p-8 bg-black h-full border-4 border-gray-700 text-white font-pixel">
        <h1 className="text-4xl text-yellow-400 mb-4 animate-pulse uppercase tracking-widest text-center">NIGHT RIDERZ MEET</h1>
        
        <p className="text-center text-sm mb-8 text-gray-300">
          Il piazzale è pieno di auto modificate. Senti puzza di gomma bruciata e musica a palla.<br/><br/>
          (Questa funzione multigiocatore asincrona per sfidare altri utenti o mostrare i propri veicoli sarà disponibile prossimamente).
        </p>

        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/map')}
            className="bg-win98-gray text-black px-6 py-2 border-4 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray font-bold"
          >
            Torna alla Mappa
          </button>
        </div>
      </div>
    </Win98Window>
  );
}
