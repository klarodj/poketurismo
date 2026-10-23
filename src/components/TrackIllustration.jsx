import {trackSectionLabel} from '../../shared/trackSectionLabels.mjs';
import React from 'react';
import {trackVisual,mapSectors,sectorMapLabel,TRACK_SECTOR_COLORS} from '../../shared/trackVisuals.mjs';
import './track-art.css';
const line=points=>points.map(([x,y])=>`${Math.round(x)},${Math.round(y)}`).join(' ');
function MapGround({terrain}){
 const water=/lake|coast/.test(terrain),mountain=/alpine|snow|quarry|fog|woodland|night/.test(terrain),urban=/industrial|parking|motorway/.test(terrain);
 return <g aria-hidden="true"><rect width="320" height="200" fill={terrain==='snow'?'#dfdfdf':urban?'#b0a890':mountain?'#a8b090':'#b8c898'}/>
 {Array.from({length:8},(_,i)=><path key={i} d={`M 0 ${i*28+8} H 320`} stroke={urban?'#a09880':'#a8b888'} strokeWidth="1"/>)}
 {water&&<path d="M 0 0 H 61 L 43 32 L 65 63 L 39 94 L 55 126 L 34 160 L 52 200 H 0 Z" fill="#608898"/>}
 {mountain&&<><path d="M 215 0 L 240 18 L 263 0 M 262 0 L 287 27 L 320 8" fill="none" stroke="#808878" strokeWidth="8"/><path d="M 8 20 L 19 10 L 33 24 M 282 176 L 301 160 L 320 175" fill="none" stroke="#808878" strokeWidth="5"/></>}
 {urban?<g fill="#808080" stroke="#dfdfdf" strokeWidth="1"><rect x="20" y="35" width="30" height="22"/><rect x="180" y="155" width="36" height="21"/><rect x="99" y="21" width="24" height="22"/></g>:<g fill="#587048"><path d="M 12 55 h 6 v 6 h -6 Z M 18 60 h 6 v 6 h -6 Z M 285 169 h 7 v 7 h -7 Z M 293 176 h 7 v 7 h -7 Z M 148 175 h 5 v 5 h -5 Z M 157 179 h 5 v 5 h -5 Z"/></g>}
 </g>;
}
function Flag({point,label,start=false}){const[x,y]=point;return <g transform={`translate(${Math.round(x)} ${Math.round(y)})`}><rect x="-5" y="-5" width="10" height="10" fill={start?'#008000':'#fff'} stroke="#000" strokeWidth="1"/>{!start&&<path d="M -4 -4 h 4 v 4 h -4 Z M 0 0 h 4 v 4 h -4 Z" fill="#000"/>}<text x="0" y={y<40?21:-10} textAnchor="middle" fill="#000" stroke="#fff" strokeWidth="3" paintOrder="stroke" fontSize="12" fontWeight="bold">{label}</text></g>;}
export function TrackMinimap({visual,sections=[],index=-1,paths}){
 const demo=paths?.length===sections.length&&paths.length>0;
 if(!visual?.points&&!demo)return null;
 const closed=visual?.format==='circuit',groups=demo?[]:mapSectors(visual.points,sections,closed),points=visual?.points;
 return <svg className="track-minimap" viewBox={demo?'50 35 510 245':'0 0 320 200'} role="img" aria-label={`Minimappa di ${visual?.name||'Circuito Scuola'}${index>=0&&sections[index]?`, settore ${index+1} evidenziato`:''}`} shapeRendering="crispEdges">
 {demo?<rect x="50" y="35" width="510" height="245" fill="#b8c898"/>:<MapGround terrain={visual.terrain}/>}
 {demo?paths.map((path,i)=><g key={i}><path d={path} fill="none" stroke="#fff" strokeWidth="12"/><path d={path} fill="none" stroke={i===index?'#ffff00':TRACK_SECTOR_COLORS[i%8]} strokeWidth={i===index?9:7}><title>{`${i+1}. ${trackSectionLabel(sections[i].name)}`}</title></path></g>):<>
 <polyline points={line(closed?[...points,points[0]]:points)} fill="none" stroke="#303030" strokeWidth="12" strokeLinejoin="round"/><polyline points={line(closed?[...points,points[0]]:points)} fill="none" stroke="#fff" strokeWidth="9" strokeDasharray="5 5" strokeLinejoin="round"/>
 {groups.map(({points:part,index:i})=><polyline key={i} points={line(part)} fill="none" stroke={i===index?'#ffff00':sections.length?TRACK_SECTOR_COLORS[i%8]:'#505050'} strokeWidth={i===index?7:5} strokeLinejoin="round"><title>{sections[i]?`${i+1}. ${trackSectionLabel(sections[i].name)}${i===index?' · settore attuale':''}`:visual.name}</title></polyline>)}
 {sections.length>0&&groups.filter(({index:i})=>sections.length<=12||i%Math.ceil(sections.length/10)===0||i===sections.length-1||Math.abs(i-index)<=1).map(({points:part,index:i})=>{const[x,y]=sectorMapLabel(part);return <g key={i} transform={`translate(${Math.round(x)} ${Math.round(y)})`}><rect x="-7" y="-7" width="14" height="14" fill={i===index?'#ffff00':'#fff'} stroke="#000"/><text textAnchor="middle" y="4" fontSize="13" fontWeight="bold" fill="#000">{i+1}</text></g>;})}
 <Flag point={points[0]} label={closed?'P / A':'P'} start={!closed}/>{!closed&&<Flag point={points.at(-1)} label="A"/>}
 </>}
 {demo&&<><Flag point={[180,240]} label="P / A"/>{[[320,240],[520,205],[450,135],[250,70],[85,110],[220,170],[210,215],[125,240]].map(([x,y],i)=><text key={i} x={x} y={y-9} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#000" stroke="#fff" strokeWidth="3" paintOrder="stroke">{i+1}</text>)}</>}
 </svg>;
}
export default function TrackIllustration({name,sections=[],index=-1,paths,compact=false}){
 const visual=trackVisual(name);
 if(!visual&&!paths?.length)return null;
 return <div className={`track-art${compact?' track-art-compact':''}`}>
 {visual&&<figure className="track-art-scene"><div className="track-art-title">Cartolina dal percorso</div><img src={visual.image} alt={`${visual.name}: ${visual.caption}`} width="384" height="256" loading="lazy" decoding="async"/><figcaption>{visual.caption}</figcaption></figure>}
 <figure className="track-art-map"><div className="track-art-title">Minimappa · {visual?.format==='point-to-point'?'punto a punto':'circuito'}</div><TrackMinimap visual={visual} sections={sections} index={index} paths={paths}/><figcaption>{index>=0&&sections[index]?`Giallo: settore ${index+1} · `:''}P: partenza · A: arrivo{sections.length?` · ${sections.length} settori${sections.length>12?' · numeri principali':''}`:''}</figcaption></figure>
 <p className="track-art-note">{paths?.length?'Schema del Circuito Scuola.':'Roadbook del club: forma illustrativa, non in scala.'} {sections.length>0?'Ordine, distanze e difficoltà seguono i settori della gara.':'Apri la preparazione della gara per i settori e le distanze.'}</p>
 </div>;
}
