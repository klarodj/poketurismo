import {trackSectionLabel} from '../../shared/trackSectionLabels.mjs';
import React from 'react';
import {sectionFeatures} from '../../shared/raceContext.mjs';
import {trackVisual,TRACK_SECTOR_COLORS} from '../../shared/trackVisuals.mjs';
import TrackIllustration from './TrackIllustration';
export default function TrackPreview({sections,paths,trackName,index=-1,profile={},compact=false,title='Anteprima del tracciato'}){
 if(!sections?.length)return null;
 const visual=trackVisual(trackName),road=visual?visual.format==='point-to-point':profile.kind==='road';
 return <section className="track-preview" aria-label={title}>
 <h2>{title} · {road?'Strada · da punto a punto':'Circuito'} · {sections.length} settori</h2>
 <TrackIllustration name={trackName} sections={sections} paths={paths} index={index} compact={compact}/>
 {!visual&&!paths&&<p className="text-xs">Schema dei settori ricostruito dal catalogo: non rappresenta la forma reale del percorso.</p>}
 {compact&&sections[index]&&<p className="font-bold">Ora: {trackSectionLabel(sections[index].name)}{sections[index+1]?` · Poi: ${trackSectionLabel(sections[index+1].name)}`:' · Ultimo settore'}</p>}
 <details open={!compact}><summary className="cursor-pointer font-bold">Settori, frenate e spazi di attacco</summary><ol className="track-preview-sectors">{sections.map((section,i)=>{const features=sectionFeatures(section,sections[i+1],profile);return <li key={section.id||i} aria-current={i===index?'step':undefined} className={i<index?'track-sector-done':''} style={{borderLeftColor:TRACK_SECTOR_COLORS[i%8]}}><span>{i+1}. {trackSectionLabel(section.name)}{i===index?' · ORA':i===index+1&&index>=0?' · PROSSIMO':''}</span><small>{Math.round(section.segments.reduce((sum,s)=>sum+s.lengthM,0))} m · {features.hasCorner?'Curve':'Rettilineo'}{features.hasBrakingZone?features.brakingAhead?' · frenata in fondo':' · frenata':''}{features.passingSpace?' · spazio per attaccare':' · sorpasso difficile'}{profile.kind==='road'?` · visibilità ${features.visibilityM} m`:''}</small></li>;})}</ol></details>
 {profile.kind==='road'&&<p className="text-xs">Visibilità e carreggiata limitano ritmo e sorpassi. {profile.traffic==='light'?'Possibili veicoli lenti, molto raramente.':'Questo evento non prevede traffico civile.'}</p>}
 </section>;
}
