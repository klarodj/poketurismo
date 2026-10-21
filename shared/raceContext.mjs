// Shared context: UI and both drivers use the same opportunities.
function routeProfileFor(mode = 'track', name = '') {
  const road = mode === 'street';
  return { kind: road ? 'road' : 'circuit', format: road ? 'point-to-point' : 'lap',
    traffic: road && /traffico|traffic/i.test(name) ? 'light' : 'none' };
}
function sectionFeatures(section, next, profile = {}) {
  const segments = section?.segments || [];
  const road = profile.kind === 'road';
  const visibilityM = section?.visibilityM ?? (road ? 160 : 1000);
  const hasCorner = segments.some(segment => segment.radiusM > 0);
  const hasStraight = segments.some(segment => !segment.radiusM && segment.lengthM >= 150);
  return { hasCorner, hasStraight, visibilityM,
    hasBrakingZone: hasCorner || (next?.segments[0]?.radiusM || 0) > 0,
    brakingAhead: !hasCorner && (next?.segments[0]?.radiusM || 0) > 0,
    passingSpace: visibilityM >= 120 && segments.some(segment => segment.widthM >= (road ? 7 : 8) && (!road || !segment.radiusM || segment.radiusM >= 45)),
    nextStraight: !!next?.segments.some(segment => !segment.radiusM && segment.lengthM >= 200) };
}
function tacticalContext(state, side = 'player') {
  const section = state.sections[state.index], next = state.sections[state.index + 1];
  const profile = state.routeProfile || routeProfileFor(state.mode);
  const features = sectionFeatures(section, next, profile);
  const gap = (state.gapSeconds || 0) * (side === 'player' ? 1 : -1);
  const behind = gap < -0.01, ahead = gap > 0.01, alongside = !behind && !ahead;
  const close = Math.abs(gap) <= 1.2;
  const canDefend = !state.lesson && ahead && close && features.visibilityM >= 80;
  const manoeuvres = ['hold'];
  if (!state.lesson && behind && Math.abs(gap) <= 3 && next && features.nextStraight) manoeuvres.push('prepare');
  if (!state.lesson && behind && close && features.hasStraight) manoeuvres.push('slipstream');
  if (!state.lesson && (behind || alongside) && close && features.passingSpace) manoeuvres.push('overtake');
  if (canDefend && !features.hasCorner) manoeuvres.push('defend');
  return { ...features, behind, ahead, alongside, close, canDefend, profile,
    allowed: { pace: ['save', 'balanced', 'attack'], braking: features.hasBrakingZone ? ['early', 'optimal', 'late'] : ['optimal'],
      line: features.hasCorner ? ['exit', 'apex', ...(canDefend ? ['defend'] : [])] : ['exit'], manoeuvre: manoeuvres } };
}
function contextualDecision(state, decision, side = 'player') {
  const { allowed } = tacticalContext(state, side);
  const fallback = { pace: 'balanced', braking: 'optimal', line: 'exit', manoeuvre: 'hold' };
  const selected = Object.fromEntries(Object.keys(fallback).map(key => [key, allowed[key].includes(decision[key]) ? decision[key] : fallback[key]]));
  return selected;
}
// Separate deterministic stream: adding a sector never increases event probability.
function incidentPlan(seed, count, profile) {
  let value = (seed ^ 0x9e3779b9) >>> 0;
  const roll = () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296; };
  if (!count || roll() >= 0.05) return null;
  const index = Math.floor(roll() * count);
  const kind = profile?.kind === 'road' ? profile.traffic === 'light' ? 'slowVehicle' : 'roughSurface' : 'debris';
  return { index, kind };
}
function incidentCue(plan, index) {
  if (!plan || plan.index !== index) return null;
  const descriptions = { debris: 'Segnalato sporco sul bordo della pista: lascia un margine.',
    roughSurface: 'Asfalto irregolare nel prossimo tratto: evita manovre brusche.',
    slowVehicle: 'Veicolo lento segnalato nel settore: prepara un passaggio prudente.' };
  return { kind: plan.kind, description: descriptions[plan.kind] };
}
function tacticalMovePlayable(move, section, next, gap) {
  return move.trigger === 'always' || move.trigger === section.type || (move.trigger === 'Gap-Negative' && gap < 0) || (move.trigger === 'Braking-Zone' && sectionFeatures(section, next).hasBrakingZone);
}
export { tacticalMovePlayable, routeProfileFor, sectionFeatures, tacticalContext, contextualDecision, incidentPlan, incidentCue };
