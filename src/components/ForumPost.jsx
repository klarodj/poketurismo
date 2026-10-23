import React from 'react';
import UsedCarDetails from './UsedCarDetails';
import RaceCarArtwork from './RaceCarArtwork';
export default function ForumPost({author,date,title,carDetails,listing,price,onBuy,disabled=false,remainingMoney}){
 return <article className="market-post period-web"><header><strong>[VENDO] {title}</strong><span>{author} · {date}</span></header><div className="market-post-body"><RaceCarArtwork car={carDetails}/><div><p className="market-post-price">€{price.toLocaleString('it-IT')}</p><p>{carDetails.cv} CV · {carDetails.km.toLocaleString('it-IT')} km</p><p>Motore {carDetails.engineHealth}% · gomme {carDetails.tireGrip}%</p>{carDetails.starterFriendly&&<p>Adatta per iniziare</p>}</div></div><div className="market-post-footer"><p>{remainingMoney>=0?`Restano €${remainingMoney.toLocaleString('it-IT')}`:`Mancano €${Math.abs(remainingMoney).toLocaleString('it-IT')}`}</p><button type="button" className="win98-btn" onClick={onBuy} disabled={disabled}>Compra · €{price.toLocaleString('it-IT')}</button></div>{listing&&<UsedCarDetails listing={listing}/>}</article>;
}
