import PilotAvatar from './PilotAvatar';
import React from 'react';
import RaceCarArtwork from './RaceCarArtwork';
const number=value=>value.toLocaleString('it-IT',{maximumFractionDigits:1});
export function MeetShowcaseCard({showcase,mine,onOpen}){
 const {pilot,car}=showcase;
 return <button type="button" className="meet-card" onClick={onOpen} aria-label={`Apri auto di ${pilot.name}`}><div className="meet-card-owner"><span className="pilot-name-with-avatar"><PilotAvatar avatar={pilot.avatar} size={32} decorative/>{pilot.name}{mine?' · tu':''}</span><span>Liv. {pilot.level}</span></div><RaceCarArtwork car={car}/><strong>{car.brand} {car.name}</strong><span className="meet-card-spec">{car.cv} CV · {car.kg} kg · IP {car.performanceIndex}</span><span className="meet-card-spec">{car.parts.length?`${car.parts.length} pezzi installati`:'Allestimento di serie'} · {car.tier}</span><span className="meet-card-spec">Auto parcheggiata · il pilota può essere assente</span><span className="meet-card-link">Foto, caratteristiche e confronto ↗</span></button>;
}
export function MeetCarDetails({showcase,ownCar}){
 const {pilot,car}=showcase;const fields=[['Potenza','cv','CV'],['Coppia','nm','Nm'],['Peso','kg','kg'],['Motore','engineHealth','%'],['Gomme','tireGrip','%']];
 return <div className="meet-details"><p className="pilot-name-with-avatar"><PilotAvatar avatar={pilot.avatar} size={64} decorative/><strong>{pilot.name}</strong> · livello {pilot.level}</p><RaceCarArtwork car={car} large/><h3>{car.brand} {car.name} · {car.year}</h3><p>{car.engineType} · {car.driveType} · {number(car.km)} km · IP {car.performanceIndex}</p><table className="race-table"><caption>Confronto con la tua auto equipaggiata{ownCar?` (${ownCar.name})`:''}</caption><thead><tr><th>Dato</th><th>Auto esposta</th><th>La tua auto</th></tr></thead><tbody>{fields.map(([label,key,unit])=><tr key={key}><td>{label}</td><td>{number(car[key])} {unit}</td><td>{ownCar?`${number(ownCar[key])} ${unit}`:'—'}</td></tr>)}</tbody></table><h4>Pezzi installati</h4>{car.parts.length?<ul className="meet-parts">{car.parts.map(part=><li key={part.id}><strong>{part.name} · livello {part.level}</strong><p>{part.description}</p></li>)}</ul>:<p>Nessun pezzo aftermarket installato.</p>}</div>;
}
