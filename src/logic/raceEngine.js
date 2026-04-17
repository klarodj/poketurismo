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
  
  // Moltiplicatori basati sullo stato dell'auto (100 = 1.0)
  const gripFactor = (car.tireGrip ?? 100) / 100;
  const healthFactor = (car.engineHealth ?? 100) / 100;
  
  // Utilizziamo le statistiche base provenienti dal DB, che sono già bilanciate per ogni componente (circa 10-100 come valori decimali)
  // Applichiamo i malus per usura pneumatici o stato motore:
  // - La salute del motore impatta velocità, accelerazione e cambio
  // - L'usura gomme impatta frenata, trazione e tenuta di strada
  
  return {
    dynamicKG,
    speed: Number((car.speed * healthFactor).toFixed(2)) || 20,
    acceleration: Number((car.acceleration * gripFactor * healthFactor).toFixed(2)) || 20,
    revving: Number((car.revving * healthFactor).toFixed(2)) || 20,
    transmission: Number((car.transmission * healthFactor).toFixed(2)) || 20,
    turnSlow: Number((car.turnSlow * gripFactor).toFixed(2)) || 20,
    turnFast: Number((car.turnFast * gripFactor).toFixed(2)) || 20,
    brake: Number((car.brake * gripFactor).toFixed(2)) || 20,
    traction: Number((car.traction * gripFactor).toFixed(2)) || 20,
  };
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
  return Math.round(combinedAdv * METERS_PER_SECTION);
};

export const consumeSectionFuel = (car, move) => {
  // Fuel burn based on CV and move aggressiveness
  const baseBurn = car.cv * 0.001;
  const moveMultiplier = move ? move.aggressiveness : 1;
  return Number((baseBurn * moveMultiplier).toFixed(2));
};
