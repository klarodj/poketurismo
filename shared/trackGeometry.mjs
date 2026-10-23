// Hand-authored geometry for the demonstrator; inferred geometry for legacy tracks.
const DEMO_TRACK = {
  mapPaths: [
    'M 180 240 L 470 240',
    'M 470 240 Q 520 240 520 195 Q 520 170 485 170',
    'M 485 170 C 430 170 470 120 420 120 C 370 120 410 70 365 70',
    'M 365 70 L 140 70',
    'M 140 70 Q 85 70 85 110 Q 85 150 140 150',
    'M 140 150 Q 220 150 240 190 L 300 190',
    'M 300 190 L 280 215 L 110 215 L 90 240',
    'M 90 240 L 180 240'
  ],
  id: 'demo', name: 'Circuito Scuola · Laboratorio tattico', distanceKm: 3.04,
  environment: { weather: 'Asciutto', surface: 'Asfalto' },
  sections: [
    { name: 'Partenza e allungo', segments: [{ lengthM: 500, radiusM: 0, widthM: 12 }] },
    { name: 'Staccata della Quercia', segments: [{ lengthM: 90, radiusM: 22, widthM: 9 }] },
    { name: 'Esse del Bosco', segments: [{ lengthM: 140, radiusM: 60, widthM: 8 }, { lengthM: 140, radiusM: 55, widthM: 8 }, { lengthM: 120, radiusM: 0, widthM: 10 }] },
    { name: 'Rettifilo delle Officine', segments: [{ lengthM: 800, radiusM: 0, widthM: 12 }] },
    { name: 'Tornante del Ponte', segments: [{ lengthM: 80, radiusM: 18, widthM: 7 }] },
    { name: 'Curvone e rilancio', segments: [{ lengthM: 180, radiusM: 95, widthM: 10 }, { lengthM: 250, radiusM: 0, widthM: 10 }] },
    { name: 'Variante stretta', segments: [{ lengthM: 140, radiusM: 35, widthM: 7 }] },
    { name: 'Allungo finale', segments: [{ lengthM: 600, radiusM: 0, widthM: 12 }] }
  ].map((section, i) => ({ ...section, id: `demo-${i}`, type: section.segments.some(segment => segment.radiusM > 0 && segment.radiusM < 45) ? 'Tornante' : section.segments.some(segment => segment.radiusM > 0) ? 'Chicane' : 'Rettilineo', geometrySource: 'authored' }))
};
function inferredSegment(section) {
  const name = (section.name || '').toLowerCase();
  if (/hairpin|tornant|inversion/.test(name)) return { radiusM: 20, weight: 0.7, widthM: 7 };
  if (/chicane|variante|esse/.test(name)) return { radiusM: 40, weight: 1, widthM: 8 };
  if (/slow|curva lenta/.test(name)) return { radiusM: 38, weight: 1, widthM: 9 };
  if (/fast|curvone|parabolica/.test(name)) return { radiusM: 110, weight: 1.7, widthM: 10 };
  if (/straight|rettif|rettiline|semaforo/.test(name)) return { radiusM: 0, weight: /long|lung/.test(name) ? 4 : 2.5, widthM: 12 };
  if (/climb|salita/.test(name)) return { radiusM: 0, weight: 2, widthM: 9, grade: 0.04 };
  if (/descent|discesa/.test(name)) return { radiusM: 0, weight: 2, widthM: 9, grade: -0.04 };
  return { radiusM: 65, weight: 1.3, widthM: 9 };
}
// Target decision count by distance; technical routes use the upper part of each band.
function tacticalSectorCount(sections, distanceKm) {
  if (sections.length < 2) return sections.length;
  const km = Math.max(0, Number(distanceKm) || 0);
  const [from,to,low,high] = km <= 3 ? [0,3,4,6] : km <= 6 ? [3,6,7,10] : km <= 10 ? [6,10,11,14] : [10,16,15,20];
  const technical = sections.filter(section => {const g=inferredSegment(section);return g.radiusM>0&&g.radiusM<=40;}).length / sections.length;
  return Math.min(high, Math.max(low, Math.round(low+(high-low)*Math.min(1,(km-from)/(to-from)))+(technical>=0.4?1:0)));
}
function buildTacticalTrack(sections, distanceKm, profile = {}) {
  if (!sections.length) return [];
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) throw new Error('Lunghezza del tracciato non valida');
  const inferred = sections.map(section => ({ section, geometry: inferredSegment(section) }));
  const totalWeight = inferred.reduce((sum, item) => sum + item.geometry.weight, 0);
  const segments = inferred.map(({ section, geometry },sourceIndex) => ({ ...geometry, lengthM: distanceKm * 1000 * geometry.weight / totalWeight, sourceName: section.name, sourceIndex,
    widthM: profile.kind === 'road' ? Math.min(geometry.widthM, 7.5) : geometry.widthM }));
  const target=tacticalSectorCount(sections,distanceKm);
  // Additional decisions only split long straights; a corner is never cut in half.
  while(segments.length<target){let at=-1;for(let i=0;i<segments.length;i++)if(!segments[i].radiusM&&segments[i].lengthM>=600&&(at<0||segments[i].lengthM>segments[at].lengthM))at=i;
    if(at<0)break;const half={...segments[at],lengthM:segments[at].lengthM/2};segments.splice(at,1,{...half},{...half});}
  const count=Math.min(target,segments.length),n=segments.length,prefix=[0],technical=[0];
  for(const segment of segments){prefix.push(prefix.at(-1)+segment.lengthM);technical.push(technical.at(-1)+(segment.radiusM>0&&segment.radiusM<=40?1:0));}
  const mean=distanceKm*1000/count,dp=Array.from({length:count+1},()=>Array(n+1).fill(Infinity)),previous=Array.from({length:count+1},()=>Array(n+1).fill(-1));dp[0][0]=0;
  for(let k=1;k<=count;k++)for(let end=k;end<=n-(count-k);end++)for(let begin=k-1;begin<end;begin++){
    const distance=prefix[end]-prefix[begin],mergedTechnical=end-begin>1?technical[end]-technical[begin]:0;
    const cost=dp[k-1][begin]+((distance-mean)/mean)**2+mergedTechnical*0.8;
    if(cost<dp[k][end]){dp[k][end]=cost;previous[k][end]=begin;}}
  const groups=[];let end=n;for(let k=count;k>0;k--){const begin=previous[k][end];groups.unshift(segments.slice(begin,end));end=begin;}
  return groups.map((group,index)=>{
    const hasSlow=group.some(segment=>segment.radiusM>0&&segment.radiusM<45);
    const names=[...new Set(group.map(segment=>segment.sourceName))];
    return {id:`block-${index}`,name:names.length===1?names[0]:`${names[0]} → ${names.at(-1)}`,
      visibilityM:profile.kind==='road'?(/ciec|blind/i.test(names.join(' '))?65:160):1000,
      type:hasSlow?'Tornante':group.some(segment=>segment.radiusM>0)?'Chicane':'Rettilineo',segments:group,geometrySource:'inferred',layoutVersion:2,
      riskExposure:group.reduce((sum,segment)=>sum+segment.lengthM,0)/500};
  });
}
export { DEMO_TRACK, buildTacticalTrack, tacticalSectorCount };
