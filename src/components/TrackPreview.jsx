import React from 'react';
import { sectionFeatures } from '../../shared/raceContext.mjs';
export default function TrackPreview({ sections, paths, index = -1, profile = {}, compact = false, title = 'Anteprima del tracciato' }) {
  if (!sections?.length) return null;
  const colors = ['#000080', '#800000', '#800080', '#008000', '#ff0000', '#008080', '#808000', '#0000ff'];
  return <section className="border-2 border-gray-600 bg-white p-3 space-y-3" aria-label={title}>
    <h2 className="font-bold">{title} · {profile.kind === 'road' ? 'Strada · da punto a punto' : 'Circuito'}</h2>
    {paths?.length === sections.length && <>
      <svg viewBox="50 35 510 245" className={`w-full ${compact ? 'max-h-40' : 'max-h-64'} bg-[#c0c0c0]`} role="img" aria-label="Schema del Circuito Scuola, con settori numerati">
        {paths.map((path, i) => <g key={i}><path d={path} fill="none" stroke={i === index ? '#facc15' : colors[i % colors.length]} strokeWidth={i === index ? 13 : 8} strokeLinecap="round"><title>{`${i + 1}. ${sections[i].name}${i === index ? ' · settore attuale' : ''}`}</title></path><path d={path} fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 6" /></g>)}
        {[[320,260],[540,205],[465,115],[250,52],[62,110],[220,145],[210,205],[125,262]].map(([x,y], i) => <text key={i} x={x} y={y} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#111827">{i + 1}</text>)}
        <text x="180" y="231" fontSize="12" textAnchor="middle">Partenza / arrivo</text>
      </svg>
      <p className="text-xs text-gray-600">Disegno schematico, non in scala. Distanze e difficoltà sono indicate nei settori.</p>
    </>}
    {!paths && <p className="text-xs text-gray-600">Schema dei settori ricostruito dal catalogo: non rappresenta la forma reale del percorso.</p>}
    {compact && sections[index] && <p className="text-sm font-bold">Ora: {sections[index].name}{sections[index + 1] ? ` · Poi: ${sections[index + 1].name}` : ' · Ultimo settore'}</p>}
    <details open={!compact}>
      <summary className="cursor-pointer text-sm font-bold">Settori, frenate e spazi di attacco</summary>
    <ol className="grid sm:grid-cols-2 gap-2 text-sm">
      {sections.map((section, i) => {
        const features = sectionFeatures(section, sections[i + 1], profile);
        return <li key={section.id || i} aria-current={i === index ? 'step' : undefined} className={`border-l-4 p-2 ${i === index ? 'bg-yellow-100 font-bold' : i < index ? 'bg-gray-100 text-gray-600' : 'bg-blue-50'}`} style={{ borderColor: colors[i % colors.length] }}>
          <span>{i + 1}. {section.name}{i === index ? ' · ORA' : i === index + 1 && index >= 0 ? ' · PROSSIMO' : ''}</span>
          <span className="block text-xs font-normal">{Math.round(section.segments.reduce((sum, segment) => sum + segment.lengthM, 0))} m · {features.hasCorner ? 'Curve' : 'Rettilineo'}{features.hasBrakingZone ? features.brakingAhead ? ' · frenata in fondo' : ' · frenata' : ''}{features.passingSpace ? ' · spazio per attaccare' : ' · sorpasso difficile'}{profile.kind === 'road' ? ` · visibilità ${features.visibilityM} m` : ''}</span>
        </li>;
      })}
    </ol>
    </details>
    {profile.kind === 'road' && <p className="text-xs">Visibilità e carreggiata limitano ritmo e sorpassi. {profile.traffic === 'light' ? 'Possibili veicoli lenti, molto raramente.' : 'Questo evento non prevede traffico civile.'}</p>}
  </section>;
}
