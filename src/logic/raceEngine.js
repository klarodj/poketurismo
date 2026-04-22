export const CAR_STAT_LABELS = {
  speed: 'Velocità',
  acceleration: 'Accelerazione',
  revving: 'Ripresa',
  transmission: 'Cambio',
  turnSlow: 'Curve Lente',
  turnFast: 'Curve Veloci',
  brake: 'Freni',
  braking: 'Freni',
  traction: 'Trazione'
};

export const PILOT_STAT_LABELS = {
  brave: 'Coraggio',
  clean: 'Pulizia',
  reflex: 'Riflessi',
  acro: 'Acrobazia',
  turn: 'Curva',
  brake: 'Frenata',
  throttle: 'Accelerata',
  shift: 'Cambiata'
};

export const calculateDynamicWeight = (baseKG, currentFuelLiters) => {
  // Fuel density approx 0.75 KG per liter
  return Math.round(baseKG + (currentFuelLiters * 0.75));
};

export const calculateRaceStats = (car) => {
  const dynamicKG = calculateDynamicWeight(car.kg, car.currentFuel || 0);
  
  const gripFactor = (car.tireGrip ?? 100) / 100;
  const healthFactor = (car.engineHealth ?? 100) / 100;
  
  let diffKm = (car.km || 0) - (car.serviceKm || 0);
  let kmMalusPercent = 0;
  if (diffKm >= 400000) kmMalusPercent = 1.0;
  else if (diffKm >= 300000) kmMalusPercent = 0.50;
  else if (diffKm >= 200000) kmMalusPercent = 0.10;
  else if (diffKm >= 100000) kmMalusPercent = 0.01;

  const kmFactor = 1.0 - kmMalusPercent;

  const finalStats = {
    dynamicKG,
    speed: Number((car.speed * healthFactor * kmFactor).toFixed(2)) || 20,
    acceleration: Number((car.acceleration * gripFactor * healthFactor * kmFactor).toFixed(2)) || 20,
    revving: Number((car.revving * healthFactor * kmFactor).toFixed(2)) || 20,
    transmission: Number((car.transmission * healthFactor * kmFactor).toFixed(2)) || 20,
    turnSlow: Number((car.turnSlow * gripFactor * kmFactor).toFixed(2)) || 20,
    turnFast: Number((car.turnFast * gripFactor * kmFactor).toFixed(2)) || 20,
    brake: Number((car.brake * gripFactor * kmFactor).toFixed(2)) || 20,
    traction: Number((car.traction * gripFactor * kmFactor).toFixed(2)) || 20,
  };

  const malusInfo = {
    speed: Number((car.speed - finalStats.speed).toFixed(2)),
    acceleration: Number((car.acceleration - finalStats.acceleration).toFixed(2)),
    revving: Number((car.revving - finalStats.revving).toFixed(2)),
    transmission: Number((car.transmission - finalStats.transmission).toFixed(2)),
    turnSlow: Number((car.turnSlow - finalStats.turnSlow).toFixed(2)),
    turnFast: Number((car.turnFast - finalStats.turnFast).toFixed(2)),
    brake: Number((car.brake - finalStats.brake).toFixed(2)),
    traction: Number((car.traction - finalStats.traction).toFixed(2)),
  };

  return { ...finalStats, malusInfo };
};

/**
 * Calculates the probability of the engine breaking (KO).
 * Base 1%, grows exponentially with wear and KM malus.
 * Total Risk = (Wear%) + (KM Malus%)
 * Chance = 0.01 + (Risk ^ 2) * 0.5
 */
export const calculateEngineRisk = (car, moveRiskMultiplier = 1) => {
  const engineWear = (100 - (car.engineHealth ?? 100)) / 100; // 0 to 1
  
  let diffKm = (car.km || 0) - (car.serviceKm || 0);
  let kmMalusPercent = 0;
  if (diffKm >= 400000) kmMalusPercent = 1.0;
  else if (diffKm >= 300000) kmMalusPercent = 0.50;
  else if (diffKm >= 200000) kmMalusPercent = 0.10;
  else if (diffKm >= 100000) kmMalusPercent = 0.01;

  const totalRisk = Math.min(1, engineWear + kmMalusPercent);
  
  // Exponential growth: 1% base + risk^2 * 50%
  // If Risk=0.5 (50% wear), Chance = 1% + 0.25*50% = 13.5%
  // If Risk=1.0 (100% wear), Chance = 1% + 50% = 51%
  const chance = 0.01 + (Math.pow(totalRisk, 2) * 0.5);
  
  // Move can increase this risk for the current section
  return chance * moveRiskMultiplier;
};

export const rollDungeonMaster = () => {
  // Simulates rolling an invisible 20-sided die
  const roll = Math.floor(Math.random() * 20) + 1;
  if (roll <= 2) return { type: 'Macchia d\'Olio', penalty: { turnSlow: -30, turnFast: -30 } };
  if (roll <= 4) return { type: 'Traffico Improvviso', penalty: { speed: -20, acceleration: -20 } };
  if (roll === 5) return { type: 'Vuoto di Potenza', penalty: { acceleration: -40 } };
  return null; // No event
};

export const savingThrow = (pilotStats, event) => {
  if (!event) return true;
  // Reflex helps dodge hazards
  const reflexSave = Math.floor(Math.random() * 20) + 1 + pilotStats.reflex;
  return reflexSave > 15; // Success threshold
};

/**
 * Resolves a race turn using NORMALIZED scores to avoid stat-scale dominance.
 * Each stat is scored relatively: the winner of each parameter gets +1, loser gets 0
 * (with fractional advantage based on the ratio), then converted to meters.
 * 
 * Max gain/loss per section: ~30m. Typical competitive gap: -10 to +10m per section.
 */
export const resolveTurn = (section, carStats, pilotStats, move, opponentStats, rngEvent, saved) => {
  // Stat mapping to bridge DB names and Code names
  const mapping = { braking: 'brake' };
  const getStatKey = (key) => mapping[key] || key;

  // Helper: compare two stat values and return a normalized advantage [-1, +1]
  // Uses ratio so that 300 vs 200 = same advantage as 600 vs 400 (50% edge)
  const compareStats = (myVal, oppVal) => {
    const my = Math.max(1, myVal);
    const opp = Math.max(1, oppVal);
    const total = my + opp;
    // Returns a value in [-1, +1] where 0 means equal
    return (my - opp) / total;
  };

  // 1. Car Stat advantage (carStat)
  const csKey = getStatKey(section.carStat);
  const myCarStat = carStats[csKey] || 0;
  const oppCarStat = opponentStats[csKey] || 0;
  const carStatAdv = compareStats(myCarStat, oppCarStat);

  // 2. Car Tech advantage (carTech)
  const ctKey = getStatKey(section.carTech);
  const myCarTech = carStats[ctKey] || 0;
  const oppCarTech = opponentStats[ctKey] || 0;
  const carTechAdv = compareStats(myCarTech, oppCarTech);

  // 3. Driver Stat advantage (driverStat)
  const dsKey = getStatKey(section.driverStat);
  const myDriverStat = pilotStats[dsKey] || 0;
  const oppDriverStat = opponentStats.pilot?.[dsKey] || 0;
  const driverStatAdv = compareStats(myDriverStat, oppDriverStat);

  // 4. Driver Tech advantage (driverTech)
  const dtKey = getStatKey(section.driverTech);
  const myDriverTech = pilotStats[dtKey] || 0;
  const oppDriverTech = opponentStats.pilot?.[dtKey] || 0;
  const driverTechAdv = compareStats(myDriverTech, oppDriverTech);

  // Combined normalized advantage: average of 4 components → range [-1, +1]
  let combinedAdv = (carStatAdv + carTechAdv + driverStatAdv + driverTechAdv) / 4;

  // Apply Move bonus: move bonuses are small values (+5 to +20) on specific stats
  // Normalize them against a reference baseline of 100 so they have limited impact
  const MOVE_BONUS_BASELINE = 100;
  if (move && move.bonus) {
    let moveBonusSum = 0;
    Object.values(move.bonus).forEach(v => { moveBonusSum += v; });
    combinedAdv += (moveBonusSum / MOVE_BONUS_BASELINE) * 0.15; // max ~15% extra adv
  }

  // Apply RNG malus if not saved (penalties reduce advantage)
  if (rngEvent && !saved) {
    combinedAdv -= 0.2; // fixed -20% normalized penalty for uncontrolled events
  }

  // Opponent random luck factor: adds ±10% unpredictability even between similar racers
  const oppLuck = (Math.random() - 0.5) * 0.20;
  combinedAdv += oppLuck;

  // Clamp to [-1, +1]
  combinedAdv = Math.max(-1, Math.min(1, combinedAdv));

  // Convert normalized advantage to meters: max ±25m per section
  const METERS_PER_SECTION = 25;
  const delta = Math.round(combinedAdv * METERS_PER_SECTION);

  const debugLogStr = `[${section.name}]
CarStat (${csKey}): Tu ${myCarStat} vs Lui ${oppCarStat} -> ${(carStatAdv > 0 ? '+' : '')}${carStatAdv.toFixed(2)}
CarTech (${ctKey}): Tu ${myCarTech} vs Lui ${oppCarTech} -> ${(carTechAdv > 0 ? '+' : '')}${carTechAdv.toFixed(2)}
PilotStat (${dsKey}): Tu ${myDriverStat} vs Lui ${oppDriverStat} -> ${(driverStatAdv > 0 ? '+' : '')}${driverStatAdv.toFixed(2)}
PilotTech (${dtKey}): Tu ${myDriverTech} vs Lui ${oppDriverTech} -> ${(driverTechAdv > 0 ? '+' : '')}${driverTechAdv.toFixed(2)}
Luck RNG: ${(oppLuck > 0 ? '+' : '')}${oppLuck.toFixed(2)}
Delta Finale: ${delta}m`;

  return { delta, debugLog: debugLogStr };
};

export const consumeSectionFuel = (car, move) => {
  // Fuel burn based on CV and move aggressiveness
  const baseBurn = car.cv * 0.001;
  const moveMultiplier = move ? move.aggressiveness : 1;
  return Number((baseBurn * moveMultiplier).toFixed(2));
};
