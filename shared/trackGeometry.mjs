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
function buildTacticalTrack(sections, distanceKm, profile = {}) {
  const inferred = sections.map(section => ({ section, geometry: inferredSegment(section) }));
  const totalWeight = inferred.reduce((sum, item) => sum + item.geometry.weight, 0);
  const segments = inferred.map(({ section, geometry }) => ({ ...geometry, lengthM: distanceKm * 1000 * geometry.weight / totalWeight, sourceName: section.name }));
  const count = Math.min(8, segments.length);
  return Array.from({ length: count }, (_, index) => {
    const start = Math.floor(index * segments.length / count), end = Math.floor((index + 1) * segments.length / count);
    const group = segments.slice(start, end).map(segment => ({ ...segment, widthM: profile.kind === 'road' ? Math.min(segment.widthM, 7.5) : segment.widthM }));
    const hasSlow = group.some(segment => segment.radiusM > 0 && segment.radiusM < 45);
    return { id: `block-${index}`, name: group.length === 1 ? group[0].sourceName : `${group[0].sourceName} → ${group.at(-1).sourceName}`,
      visibilityM: profile.kind === 'road' ? (/ciec|blind/i.test(group.map(segment => segment.sourceName).join(' ')) ? 65 : 160) : 1000,
      type: hasSlow ? 'Tornante' : group.some(segment => segment.radiusM > 0) ? 'Chicane' : 'Rettilineo', segments: group, geometrySource: 'inferred' };
  });
}
export { DEMO_TRACK, buildTacticalTrack };
