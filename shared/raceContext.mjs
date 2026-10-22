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
  const allowDuels = !state.timeTrial && !state.opponentFailure && (!state.lesson || state.trainingDuel);
  const canDefend = allowDuels && ahead && close && features.visibilityM >= 80;
  const manoeuvres = ['hold'];
  if (allowDuels && behind && Math.abs(gap) <= 3 && next && features.nextStraight) manoeuvres.push('prepare');
  if (allowDuels && behind && close && features.hasStraight) manoeuvres.push('slipstream');
  if (allowDuels && (behind || alongside) && close && features.passingSpace) manoeuvres.push('overtake');
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
function tacticalMovePlayable(move, section, next, gap, state, decision) {
  if (move.conditions) return techniqueContextMatches(move.conditions, section, next, gap, state, decision);
  return move.trigger === 'always' || move.trigger === section.type || (move.trigger === 'Gap-Negative' && gap < 0) || (move.trigger === 'Braking-Zone' && sectionFeatures(section, next).hasBrakingZone);
}
function techniqueContextMatches(c, section, next, gap = 0, state, decision) {
  if (!state) return false;
  const features = sectionFeatures(section, next, state.routeProfile), segments = section.segments || [];
  const weather = (state.environment?.weather || '').toLowerCase(), surface = (state.environment?.surface || '').toLowerCase();
  const wet = /rain|piogg|wet|bagn/.test(weather), snow = /snow|neve|ghiacc/.test(weather);
  const geometry = { braking: features.hasBrakingZone, corner: features.hasCorner, slowCorner: segments.some(s => s.radiusM > 0 && s.radiusM <= 40),
    fastCorner: segments.some(s => s.radiusM >= 90), chicane: segments.filter(s => s.radiusM > 0).length >= 2 || /chicane|variante|esse/i.test(section.type || section.name),
    straight: features.hasStraight, uphill: segments.some(s => s.grade > 0.01), downhill: segments.some(s => s.grade < -0.01) };
  if (c.geometry && !geometry[c.geometry]) return false;
  if (c.weather && !({ dry: !wet && !snow && !/fog|nebbia|night|notte/.test(weather), wet, snow, lowVisibility: /fog|nebbia|night|notte/.test(weather) })[c.weather]) return false;
  if (c.surface === 'loose' && !/terra|sterr|gravel|dirt|ghiaia/.test(surface)) return false;
  if (c.route && c.route !== state.routeProfile?.kind) return false;
  if (c.visibility === 'limited' && features.visibilityM > 120) return false;
  if (c.position === 'behind' && gap >= -0.01) return false;
  if (['pace', 'braking', 'line', 'manoeuvre'].some(key => c[key] && c[key] !== decision?.[key])) return false;
  return true;
}
export { tacticalMovePlayable, techniqueContextMatches, routeProfileFor, sectionFeatures, tacticalContext, contextualDecision, incidentPlan, incidentCue };
