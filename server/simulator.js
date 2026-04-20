const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==========================================
// PORTED RACE LOGIC
// ==========================================
const calculateRaceStats = (car) => {
  const gripFactor = (car.tireGrip ?? 100) / 100;
  const healthFactor = (car.engineHealth ?? 100) / 100;
  
  return {
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

const resolveTurn = (section, carStats, pilotStats, opponentStats) => {
  const mapping = { braking: 'brake' };
  const getStatKey = (key) => mapping[key] || key;

  const compareStats = (myVal, oppVal) => {
    const my = Math.max(1, myVal);
    const opp = Math.max(1, oppVal);
    const total = my + opp;
    return (my - opp) / total;
  };

  const csKey = getStatKey(section.carStat);
  const ctKey = getStatKey(section.carTech);
  const dsKey = getStatKey(section.driverStat);
  const dtKey = getStatKey(section.driverTech);

  const carStatAdv = compareStats(carStats[csKey] || 0, opponentStats[csKey] || 0);
  const carTechAdv = compareStats(carStats[ctKey] || 0, opponentStats[ctKey] || 0);
  const driverStatAdv = compareStats(pilotStats[dsKey] || 0, opponentStats.pilot?.[dsKey] || 0);
  const driverTechAdv = compareStats(pilotStats[dtKey] || 0, opponentStats.pilot?.[dtKey] || 0);

  let combinedAdv = (carStatAdv + carTechAdv + driverStatAdv + driverTechAdv) / 4;

  const oppLuck = (Math.random() - 0.5) * 0.20;
  combinedAdv += oppLuck;

  combinedAdv = Math.max(-1, Math.min(1, combinedAdv));
  return Math.round(combinedAdv * 25);
};

const TRACK_POOL = [
  { id: 1, carStat: 'acceleration', carTech: 'traction', driverStat: 'reflex', driverTech: 'shift' },
  { id: 2, carStat: 'speed', carTech: 'traction', driverStat: 'brave', driverTech: 'shift' },
  { id: 3, carStat: 'revving', carTech: 'turnSlow', driverStat: 'clean', driverTech: 'turn' },
  { id: 4, carStat: 'speed', carTech: 'turnFast', driverStat: 'clean', driverTech: 'turn' },
  { id: 5, carStat: 'revving', carTech: 'braking', driverStat: 'acro', driverTech: 'brake' }
];

// ==========================================
// SIMULATOR
// ==========================================
async function runSimulator() {
  console.log("🏎️ Avvio Simulatore Headless di PokeTurismo...\n");

  const cars = await prisma.car.findMany();
  if (cars.length < 2) {
    console.log("Errore: Servono almeno 2 auto nel database per simulare.");
    process.exit(1);
  }

  // Selezioniamo le prime due auto dal DB per il test
  const carA = cars[0];
  const carB = cars[1];

  console.log(`Sfida: [A] ${carA.brand} ${carA.name} vs [B] ${carB.brand} ${carB.name}`);

  const statsA = calculateRaceStats(carA);
  const statsB = calculateRaceStats(carB);

  // Pilota standard medio-buono (Lv 10)
  const pilotA = { shift: 30, reflex: 30, brave: 30, clean: 30, acro: 30, turn: 30, brake: 30, throttle: 30 };
  const pilotB = { shift: 30, reflex: 30, brave: 30, clean: 30, acro: 30, turn: 30, brake: 30, throttle: 30 };

  const oppStatsB = { ...statsB, pilot: pilotB };

  let winsA = 0;
  let winsB = 0;
  let totalGap = 0;
  const ITERATIONS = 1000;

  for (let i = 0; i < ITERATIONS; i++) {
    let gap = 0;
    // Tracciato casuale di 4 settori
    const track = [...TRACK_POOL].sort(() => 0.5 - Math.random()).slice(0, 4);

    for (const section of track) {
      gap += resolveTurn(section, statsA, pilotA, oppStatsB);
    }

    if (gap > 0) winsA++;
    else if (gap < 0) winsB++;
    
    totalGap += gap;
  }

  console.log(`\nRisultati su ${ITERATIONS} gare:`);
  console.log(`Vittorie Auto A: ${winsA} (${((winsA/ITERATIONS)*100).toFixed(1)}%)`);
  console.log(`Vittorie Auto B: ${winsB} (${((winsB/ITERATIONS)*100).toFixed(1)}%)`);
  console.log(`Pareggi: ${ITERATIONS - winsA - winsB} (${(((ITERATIONS - winsA - winsB)/ITERATIONS)*100).toFixed(1)}%)`);
  console.log(`\nDistacco medio finale: ${totalGap > 0 ? '+' : ''}${(totalGap/ITERATIONS).toFixed(2)} metri (Positivo = A vince)`);
  
  console.log("\nSimulazione completata.");
  process.exit(0);
}

runSimulator().catch(console.error);
