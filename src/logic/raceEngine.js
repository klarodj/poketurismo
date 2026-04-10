export const calculateDynamicWeight = (baseKG, currentFuelLiters) => {
  // Fuel density approx 0.75 KG per liter
  return Math.round(baseKG + (currentFuelLiters * 0.75));
};

export const calculateRaceStats = (car) => {
  const dynamicKG = calculateDynamicWeight(car.kg, car.currentFuel);
  
  // Base formulas (simplified for game mechanics)
  // Higher weight hurts speed/accel/braking but helps traction, TurnSlow and TurnFast depend on grip and weight.
  // CV is horsepower, NM is torque.
  
  const powerToWeight = car.cv / dynamicKG;
  const torqueToWeight = car.nm / dynamicKG;
  const gripFactor = car.tireGrip / 100;
  const healthFactor = car.engineHealth / 100;
  
  const speed = Math.round((car.cv * 1.5) - (dynamicKG * 0.1)) * healthFactor;
  const acceleration = Math.round((torqueToWeight * 1000) * gripFactor) * healthFactor;
  
  // Braking is worse with more weight, better with grip
  const brake = Math.round(500 - (dynamicKG * 0.2) + (car.tireGrip * 2));
  
  // Traction is better with weight (to a point) and grip
  const traction = Math.round((dynamicKG * 0.05) + (car.tireGrip * 3));
  
  // Handling
  const turnSlow = Math.round(200 - (dynamicKG * 0.1) + (car.tireGrip * 2));
  const turnFast = Math.round(300 - (dynamicKG * 0.05) + (car.tireGrip * 1.5));
  
  return {
    dynamicKG,
    speed: Math.max(10, Math.round(speed)),
    acceleration: Math.max(10, Math.round(acceleration)),
    brake: Math.max(10, Math.round(brake)),
    traction: Math.max(10, Math.round(traction)),
    turnSlow: Math.max(10, Math.round(turnSlow)),
    turnFast: Math.max(10, Math.round(turnFast)),
    revving: car.revving || 50,
    transmission: car.transmission || 50,
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
 * Resolves a race turn based on the 4 requirements defined in the DB:
 * carStat, carTech, driverStat, driverTech
 */
export const resolveTurn = (section, carStats, pilotStats, move, opponentStats, rngEvent, saved) => {
  let pScore = 0;
  let oScore = 0;

  // Stat mapping to bridge DB names and Code names
  const mapping = {
    braking: 'brake'
  };

  const getStatKey = (key) => mapping[key] || key;

  // 1. Car Stats (carStat + carTech)
  const csKey = getStatKey(section.carStat);
  const ctKey = getStatKey(section.carTech);
  
  pScore += (carStats[csKey] || 0) + (carStats[ctKey] || 0);
  oScore += (opponentStats[csKey] || 0) + (opponentStats[ctKey] || 0);

  // 2. Pilot Stats (driverStat + driverTech)
  const dsKey = getStatKey(section.driverStat);
  const dtKey = getStatKey(section.driverTech);

  pScore += (pilotStats[dsKey] || 0) + (pilotStats[dtKey] || 0);
  oScore += (opponentStats.pilot?.[dsKey] || 0) + (opponentStats.pilot?.[dtKey] || 0);

  // Apply Moves
  if (move && move.bonus) {
    Object.entries(move.bonus).forEach(([k, v]) => {
      pScore += v;
    });
  }

  // Apply RNG malus if not saved
  if (rngEvent && !saved) {
    if (rngEvent.penalty.speed) pScore += rngEvent.penalty.speed;
    if (rngEvent.penalty.acceleration) pScore += rngEvent.penalty.acceleration;
    if (rngEvent.penalty.turnSlow) pScore += rngEvent.penalty.turnSlow;
    if (rngEvent.penalty.turnFast) pScore += rngEvent.penalty.turnFast;
  }

  // Calculate Delta Gap
  return Math.round(pScore - oScore);
};

export const consumeSectionFuel = (car, move) => {
  // Fuel burn based on CV and move aggressiveness
  const baseBurn = car.cv * 0.001;
  const moveMultiplier = move ? move.aggressiveness : 1;
  return Number((baseBurn * moveMultiplier).toFixed(2));
};
