const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Championships & Training Sessions...');

  // We need at least 1 track to exist — fetch the first one
  const tracks = await prisma.track.findMany({ take: 3 });
  if (tracks.length === 0) {
    console.error('❌ No tracks found! Run the main seed first.');
    process.exit(1);
  }

  const t1 = tracks[0]?.id ?? 1;
  const t2 = tracks[1]?.id ?? 1;
  const t3 = tracks[2]?.id ?? 1;

  // ─── CHAMPIONSHIPS ───────────────────────────────────────────────────

  await prisma.championship.deleteMany();
  await prisma.championshipRace.deleteMany();

  const championships = [
    {
      name: 'Coppa Kei Car',
      description: 'Solo piccole auto giapponesi sotto 660cc e 85 CV. Semplicità assoluta.',
      category: 'N/A',
      image: 'track.png',
      minCv: 40, maxCv: 85, minPerfIndex: 0,
      allowedDrive: 'any',
      minLevel: 1, minBrave: 0, minClean: 0, minReflex: 0, minShift: 0,
      entryFee: 500, rewardMoney: 2500, rewardXp: 200,
      rounds: [
        { trackId: t1, ord: 1, opponentName: 'Tanaka-san', opponentCarName: 'Honda Beat', opponentDifficulty: 0.8 },
        { trackId: t2, ord: 2, opponentName: 'Suzuki', opponentCarName: 'Daihatsu Copen', opponentDifficulty: 0.9 },
        { trackId: t3, ord: 3, opponentName: 'Yamamoto', opponentCarName: 'Suzuki Cappuccino', opponentDifficulty: 1.0 },
      ]
    },
    {
      name: 'Trofeo Aspirato',
      description: 'Motori naturalmente aspirati soltanto. La purezza del suono è la regola.',
      category: 'Aspirato',
      image: 'track.png',
      minCv: 80, maxCv: 150, minPerfIndex: 30,
      allowedDrive: 'any',
      minLevel: 2, minBrave: 2, minClean: 3, minReflex: 2, minShift: 2,
      entryFee: 1200, rewardMoney: 6000, rewardXp: 400,
      rounds: [
        { trackId: t1, ord: 1, opponentName: 'Ferrari Kid', opponentCarName: '156 GTA', opponentDifficulty: 1.0 },
        { trackId: t2, ord: 2, opponentName: 'Rossi', opponentCarName: 'Mazda MX-5 NA', opponentDifficulty: 1.1 },
        { trackId: t3, ord: 3, opponentName: 'Alfa Fanatico', opponentCarName: 'Alfa 33', opponentDifficulty: 1.2 },
      ]
    },
    {
      name: 'GT Cup — Classe B',
      description: 'Gran Turismo per vetture performance fino a 250 CV. Il primo salto serio.',
      category: 'GT',
      image: 'track.png',
      minCv: 150, maxCv: 280, minPerfIndex: 45,
      allowedDrive: 'any',
      minLevel: 3, minBrave: 4, minClean: 3, minReflex: 4, minShift: 3,
      entryFee: 3000, rewardMoney: 15000, rewardXp: 700,
      rounds: [
        { trackId: t1, ord: 1, opponentName: 'Mister Gomme', opponentCarName: 'BMW E36 328i', opponentDifficulty: 1.1 },
        { trackId: t2, ord: 2, opponentName: 'Drift King Jr', opponentCarName: 'Nissan S14', opponentDifficulty: 1.2 },
        { trackId: t3, ord: 3, opponentName: 'Il Ragno', opponentCarName: 'Porsche 944', opponentDifficulty: 1.3 },
      ]
    },
    {
      name: 'Super Car Trophy',
      description: 'Vetture turbo oltre i 350 CV. Non è un gioco per deboli.',
      category: 'Turbo',
      image: 'track.png',
      minCv: 350, maxCv: 9999, minPerfIndex: 60,
      allowedDrive: 'any',
      minLevel: 5, minBrave: 7, minClean: 5, minReflex: 7, minShift: 6,
      entryFee: 10000, rewardMoney: 45000, rewardXp: 1200,
      rounds: [
        { trackId: t1, ord: 1, opponentName: 'Thunder', opponentCarName: 'Lancer Evo VIII', opponentDifficulty: 1.2 },
        { trackId: t2, ord: 2, opponentName: 'Il Diavolo', opponentCarName: 'Ferrari F355', opponentDifficulty: 1.35 },
        { trackId: t3, ord: 3, opponentName: 'Rex', opponentCarName: 'Subaru Impreza STi', opponentDifficulty: 1.5 },
      ]
    },
    {
      name: 'Leggenda Italiana',
      description: 'Solo auto italiane. Nessun limite di CV, ma il cuore conta.',
      category: 'Leggenda',
      image: 'track.png',
      minCv: 0, maxCv: 9999, minPerfIndex: 0,
      allowedDrive: 'any',
      minLevel: 4, minBrave: 5, minClean: 4, minReflex: 4, minShift: 4,
      entryFee: 5000, rewardMoney: 22000, rewardXp: 900,
      rounds: [
        { trackId: t1, ord: 1, opponentName: 'Nonno Enzo', opponentCarName: 'Fiat 124 Sport', opponentDifficulty: 0.9 },
        { trackId: t2, ord: 2, opponentName: 'La Panthera', opponentCarName: 'Lancia Delta HF', opponentDifficulty: 1.2 },
        { trackId: t3, ord: 3, opponentName: 'Signor Bello', opponentCarName: 'Alfa GTV6', opponentDifficulty: 1.3 },
      ]
    },
    {
      name: 'Open Grid — Trazione Posteriore',
      description: 'Solo trazione posteriore (FR/MR). Potenza e drifting premiati.',
      category: 'Open',
      image: 'track.png',
      minCv: 100, maxCv: 9999, minPerfIndex: 35,
      allowedDrive: 'FR',
      minLevel: 3, minBrave: 5, minClean: 2, minReflex: 5, minShift: 4,
      entryFee: 2500, rewardMoney: 12000, rewardXp: 600,
      rounds: [
        { trackId: t1, ord: 1, opponentName: 'Sideways', opponentCarName: 'Toyota AE86', opponentDifficulty: 1.0 },
        { trackId: t2, ord: 2, opponentName: 'Il Cobra', opponentCarName: 'Dodge Viper', opponentDifficulty: 1.3 },
        { trackId: t3, ord: 3, opponentName: 'Ghost Driver', opponentCarName: 'BMW M3 E46', opponentDifficulty: 1.4 },
      ]
    },
  ];

  for (const champ of championships) {
    const { rounds, ...champData } = champ;
    const created = await prisma.championship.create({ data: champData });
    for (const round of rounds) {
      await prisma.championshipRace.create({
        data: { ...round, championshipId: created.id }
      });
    }
    console.log(`  ✅ Championship: ${created.name}`);
  }

  // ─── TRAINING SESSIONS ───────────────────────────────────────────────

  await prisma.trainingSession.deleteMany();

  const sessions = [
    {
      name: 'Scuola di Frenata',
      description: 'Esercizi intensivi di late braking e ABS control. Migliora la tua tecnica frenante.',
      category: 'stat', targetStat: 'brake', targetMove: '',
      statGain: 2, xpReward: 150, cost: 800, minLevel: 1, trackId: t1,
    },
    {
      name: 'Smooth Driver Lab',
      description: 'Guida fluida, zero errori. Premi consistenza e pulizia di traiettoria.',
      category: 'stat', targetStat: 'clean', targetMove: '',
      statGain: 1, xpReward: 120, cost: 600, minLevel: 1, trackId: t1,
    },
    {
      name: 'Sorpasso Difficile',
      description: 'Simulazione di duelli ravvicinati e sorpassi azzardati. Per i coraggiosi.',
      category: 'stat', targetStat: 'brave', targetMove: '',
      statGain: 2, xpReward: 180, cost: 900, minLevel: 2, trackId: t2,
    },
    {
      name: 'Throttle Control Pro',
      description: 'Gestione perfetta del gas in uscita di curva. Migliora le cambiate.',
      category: 'stat', targetStat: 'shift', targetMove: '',
      statGain: 2, xpReward: 160, cost: 1000, minLevel: 2, trackId: t2,
    },
    {
      name: 'Visione Totale',
      description: 'Allenamento per prevedere le traiettorie degli avversari e reagire più velocemente.',
      category: 'stat', targetStat: 'reflex', targetMove: '',
      statGain: 1, xpReward: 200, cost: 1200, minLevel: 3, trackId: t3,
    },
    {
      name: 'Punta-Tacco Masterclass',
      description: 'Impara la tecnica heel-and-toe per scalate perfette nei tornanti.',
      category: 'move', targetStat: '', targetMove: 'Punta-Tacco',
      statGain: 0, xpReward: 300, cost: 3000, minLevel: 2, trackId: t1,
    },
    {
      name: 'Trail Braking Workshop',
      description: 'Tecnica avanzata di frenata in entrata curva per guadagnare grip.',
      category: 'move', targetStat: '', targetMove: 'Trail Braking',
      statGain: 0, xpReward: 350, cost: 4500, minLevel: 3, trackId: t2,
    },
    {
      name: 'Recupero da Testacoda',
      description: 'Impara a gestire la perdita di controllo e recuperare in extremis.',
      category: 'move', targetStat: '', targetMove: 'Recupero Disperato',
      statGain: 0, xpReward: 400, cost: 5000, minLevel: 4, trackId: t3,
    },
  ];

  for (const session of sessions) {
    await prisma.trainingSession.create({ data: session });
    console.log(`  ✅ Training: ${session.name}`);
  }

  console.log('\n🏁 Seed completato!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
