import React from 'react';

export default function ForumPost({ author, avatar, date, title, carDetails, price, onBuy }) {
  return (
    <div className="border border-[#7799CC] mb-4 bg-white font-sans text-sm shadow-[1px_1px_2px_rgba(0,0,0,0.1)]">
      {/* Forum Thread Header */}
      <div className="bg-[#D1D7DC] px-2 py-1 flex justify-between border-b border-[#7799CC] text-[#006699] font-bold text-xs">
        <div>Re: [VENDO] {title}</div>
        <div>Inviato: {date}</div>
      </div>
      
      {/* Post Body */}
      <div className="flex flex-col md:flex-row min-h-[150px]">
        {/* User Info Sidebar (Left) */}
        <div className="w-full md:w-[150px] bg-[#EFEFEF] border-b md:border-b-0 md:border-r border-[#D1D7DC] p-2 flex flex-col items-center gap-2">
          <span className="font-bold text-[#006699] hover:underline cursor-pointer">{author}</span>
          <div className="w-20 h-20 bg-gray-300 border border-gray-400 flex items-center justify-center overflow-hidden">
            {avatar ? (
               <img src={avatar} alt="avatar" className="w-full h-full object-cover pixelated" />
            ) : (
               <span className="text-xs text-gray-500 text-center">No<br/>Avatar</span>
            )}
          </div>
          <div className="text-[10px] text-gray-600 text-center w-full">
            Messaggi: {Math.floor(Math.random() * 5000)}<br/>
            Iscritto: 2001
          </div>
        </div>

        {/* Post Content (Right) */}
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <p className="mb-4 text-[#333333]">
              Vendo causa inutilizzo la mia {carDetails.brand} {carDetails.name}.<br/>
              Macchina tenuta da amatore, motore {carDetails.engineType}, trazione {carDetails.driveType}.<br/><br/>
              <strong>Kilometri:</strong> {carDetails.km.toLocaleString()} KM<br/>
              <strong>Stato Motore:</strong> {carDetails.engineHealth}%<br/>
              <strong>Gomme:</strong> {carDetails.tireGrip}%<br/><br/>
              Prezzo non trattabile, no perditempo.
            </p>
          </div>
          
          <div className="border-t border-dashed border-gray-300 pt-2 flex justify-between items-center mt-4">
            <span className="text-[#006699] font-bold underline cursor-pointer hover:text-red-500 text-xs">
              Manda Messaggio Privato (MP)
            </span>
            
            <button 
              onClick={onBuy}
              className="bg-[#006699] text-white font-bold px-4 py-1 text-xs hover:bg-[#004e7a] border border-[#003366] shadow-sm transform active:translate-y-[1px]"
            >
              Compra per €{price}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
