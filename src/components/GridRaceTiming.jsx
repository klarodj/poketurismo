import {formatRaceTime} from '../logic/racePresentation';
import React from 'react';
const gap=ms=>ms==null?'—':`${(ms/1000).toLocaleString('it-IT',{minimumFractionDigits:3,maximumFractionDigits:3})} s`;
function Neighbor({title,person,empty,showCar=true}){return <div className="grid-neighbor"><h3>{title}</h3>{person?<><strong>{person.name}</strong>{showCar&&<span>{person.carName}</span>}<b>{gap(person.gapMs)}</b>{person.tied&&<small>Stessa posizione in classifica</small>}</>:<p>{empty}</p>}</div>;}
export function GridSectorSummary({timing}){return <div className="grid-sector-summary"><strong>{timing.playerRetired?'Ritirato':timing.position==null?'Partenza':`Posizione ${timing.position} / ${timing.total}`}</strong>{timing.started&&!timing.playerRetired&&<><span>Davanti: {timing.ahead?`${timing.ahead.name} · ${gap(timing.ahead.gapMs)}`:'sei al comando'}</span><span>Dietro: {timing.behind?`${timing.behind.name} · ${gap(timing.behind.gapMs)}`:'nessun pilota in corsa'}</span></>}</div>;}
export default function GridRaceTiming({timing}){
 if(!timing)return <section className="grid-timing"><h2>Classifica del gruppo</h2><p>Rilevamento non disponibile. Il confronto tattico non indica la tua posizione nel gruppo.</p></section>;
 const waiting='In attesa del primo rilevamento',retired='Il tuo tentativo è concluso.';
 return <section className="grid-timing" aria-label="Classifica del gruppo"><header><div><h2>{timing.finished?'Classifica finale del round':'Classifica al rilevamento'}</h2><p>{timing.finished?'Round concluso':timing.started?`Dopo il settore ${timing.sector} / ${timing.totalSectors}`:`Partenza · ${timing.total} piloti, posizioni ancora da assegnare`}</p></div><strong className="grid-current-position" role="status">{timing.playerRetired?'Ritirato':timing.position==null?'Al via':`Posizione ${timing.position} / ${timing.total}`}</strong></header>
 <div className="grid-neighbors"><Neighbor title="Davanti a te" person={timing.ahead} empty={timing.playerRetired?retired:timing.started?'Sei al comando':waiting}/><Neighbor title="Dietro di te" person={timing.behind} empty={timing.playerRetired?retired:timing.started?'Nessun pilota in corsa dietro di te':waiting}/></div>
 {timing.started&&!timing.playerRetired&&<p className="grid-leader-gap">Il tuo tempo: <strong>{formatRaceTime((timing.rows.find(row=>row.player)?.timeMs||0)/1000)}</strong> · Distacco dal primo: <strong>{gap(timing.leaderGapMs)}</strong></p>}
 <table className="grid-timing-table"><caption>{timing.started?'Tempi cumulati allo stesso rilevamento':'Partecipanti · ordine non cronometrato'}</caption><thead><tr><th scope="col">Pos.</th><th scope="col">Pilota / auto</th><th scope="col">Dal primo</th><th scope="col">Intervallo</th></tr></thead><tbody>{timing.rows.map(row=><tr key={row.id} className={row.player?'grid-player-row':''} aria-current={row.player?'true':undefined}><th scope="row">{row.position??'—'}</th><td><strong>{row.name}{row.player?' (tu)':''}</strong><small>{row.carName}</small>{row.featured&&<small>Confronto tattico</small>}</td><td>{row.failure?'Ritirato':row.leaderGapMs==null?'—':row.leaderGapMs===0?'—':`+${gap(row.leaderGapMs)}`}</td><td>{row.failure||row.intervalMs==null?'—':`+${gap(row.intervalMs)}`}</td></tr>)}</tbody></table>
 <p className="grid-timing-note">Intervallo = distacco dal pilota che precede in classifica. I distacchi sono misurati alla fine del settore, non tra vetture in tempo reale.</p>
 </section>;
}

// The cockpit carries only the current position and immediate neighbours.
// The complete standings and past checkpoints belong in the timing dialog.
export function GridRaceSnapshot({timing}) {
 if(!timing)return <section className="grid-race-snapshot"><p>Rilevamento non disponibile. Apri la classifica per i dettagli.</p></section>;
 const player = timing.rows.find(row=>row.player);
 return <section className="grid-race-snapshot" aria-label="Posizione e distacchi" aria-live="polite" aria-atomic="true">
   <header><strong className="grid-snapshot-position">{timing.playerRetired?'Ritirato':timing.position==null?'Al via':<>{timing.position}° <small>/ {timing.total}</small></>}</strong><span>{timing.started?<>Tempo <b>{formatRaceTime((player?.timeMs||0)/1000)}</b><small>Dopo il settore {timing.sector}</small></>:<>{timing.total} piloti<small>Posizioni al primo rilevamento</small></>}</span></header>
   {timing.started&&!timing.playerRetired&&<div className="grid-snapshot-neighbors">
     <Neighbor title="Davanti a te" person={timing.ahead} empty="Sei al comando" showCar={false}/>
     <Neighbor title="Dietro di te" person={timing.behind} empty="Sei l’ultimo in corsa" showCar={false}/>
   </div>}
   {timing.playerRetired&&<p>Il tuo tentativo è concluso.</p>}
 </section>;
}
