const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- PLAYER / AUTH ---
app.get('/api/player/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        garages: {
          include: {
            car: { include: { brand: true } },
            mods: { include: { part: true } }
          }
        }
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/player/:id/equip', async (req, res) => {
  try {
    const { id } = req.params;
    const { carDrive } = req.body;
    console.log(`Equip attempt -> userId: ${id} (${typeof id}), carDrive (garageId): ${carDrive} (${typeof carDrive})`);
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { carDrive: carDrive }
    });
    console.log(`Equip Success!`);
    res.json(user);
  } catch (err) {
    console.error('Equip Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- CARS (DEALERSHIP) ---
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await prisma.car.findMany({
      include: { brand: true }
    });
    res.json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/brands', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany();
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GARAGE ---
app.get('/api/garage/:userId', async (req, res) => {
  try {
    const items = await prisma.garage.findMany({
      where: { userId: parseInt(req.params.userId) },
      include: {
        car: { include: { brand: true } },
        mods: { include: { part: true } }
      }
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MARKET (USED CARS) ---
app.get('/api/market', async (req, res) => {
  try {
    const marketCars = await prisma.garage.findMany({
      where: { userId: -1 },
      include: {
        car: { include: { brand: true } },
        mods: { include: { part: true } }
      }
    });
    res.json(marketCars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/market/sell', async (req, res) => {
  try {
    const { userId, garageId } = req.body;
    
    const pGarageId = parseInt(garageId, 10);
    const pUserId = parseInt(userId, 10);
    
    // Validate 
    const garageItem = await prisma.garage.findUnique({
      where: { id: pGarageId },
      include: { car: true }
    });

    console.log(`Sell attempt -> requested userId: ${userId} (${typeof userId}), garageId: ${garageId} (${typeof garageId})`);
    if (garageItem) {
       console.log(`Found garage item! Owner ID: ${garageItem.userId} (${typeof garageItem.userId})`);
    } else {
       console.log(`Garage item NOT FOUND!`);
    }

    if (!garageItem || garageItem.userId !== pUserId) {
      console.log('403 Forbidden trigger match.');
      return res.status(403).json({ error: 'Nessuna auto posseduta con questo ID' });
    }

    // Calcula devalutation to 50%
    const nominalValue = garageItem.cv * 20; 
    const sellValue = Math.floor(nominalValue * 0.5);

    // 1. Reassign owner to market
    await prisma.garage.update({
      where: { id: pGarageId },
      data: { userId: -1 }
    });

    // 2. Add funds
    const user = await prisma.user.update({
      where: { id: pUserId },
      data: { money: { increment: sellValue } }
    });

    res.json({ success: true, money: user.money, sellValue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/garage/:garageId/mount', async (req, res) => {
  try {
    const { garageId } = req.params;
    const { partId } = req.body;
    
    const gId = parseInt(garageId);
    const pId = parseInt(partId);

    // 1. Get the part details
    const newPart = await prisma.part.findUnique({ where: { id: pId } });
    if (!newPart) return res.status(404).json({ error: 'Part not found' });

    // 2. Check if car already has a part with the same NAME
    const existingMods = await prisma.mod.findMany({
      where: { garageId: gId },
      include: { part: true }
    });

    const conflictMod = existingMods.find(m => m.part.name === newPart.name);

    // 3. If exists, unmount it first
    if (conflictMod) {
      await prisma.garage.update({
        where: { id: gId },
        data: {
          cv: { decrement: Math.round(conflictMod.part.cvBonus) },
          nm: { decrement: Math.round(conflictMod.part.nmBonus) },
          kg: { increment: Math.round(conflictMod.part.kgBonus) },
          speed: { decrement: conflictMod.part.speedBonus },
          acceleration: { decrement: conflictMod.part.accelBonus },
          brake: { decrement: conflictMod.part.brakeBonus },
          traction: { decrement: conflictMod.part.tractBonus }
        }
      });
      await prisma.mod.delete({ where: { id: conflictMod.id } });
    }

    // 4. Mount the new part
    await prisma.garage.update({
      where: { id: gId },
      data: {
        cv: { increment: Math.round(newPart.cvBonus) },
        nm: { increment: Math.round(newPart.nmBonus) },
        kg: { decrement: Math.round(newPart.kgBonus) },
        speed: { increment: newPart.speedBonus },
        acceleration: { increment: newPart.accelBonus },
        brake: { increment: newPart.brakeBonus },
        traction: { increment: newPart.tractBonus }
      }
    });

    const newMod = await prisma.mod.create({
      data: {
        garageId: gId,
        partId: pId,
        speedValue: newPart.speedBonus,
        accelValue: newPart.accelBonus,
        revvValue: newPart.revvBonus,
        transValue: newPart.transBonus,
        turnSlowValue: newPart.turnSlowBonus,
        turnFastValue: newPart.turnFastBonus,
        brakeValue: newPart.brakeBonus,
        tractValue: newPart.tractBonus,
        cvValue: newPart.cvBonus,
        nmValue: newPart.nmBonus,
        kgValue: newPart.kgBonus
      }
    });

    res.json({ success: true, mod: newMod });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/garage/:garageId/mods/:modId', async (req, res) => {
  try {
    const { garageId, modId } = req.params;
    
    // 1. Find mod and its part bonuses
    const mod = await prisma.mod.findUnique({
      where: { id: parseInt(modId) },
      include: { part: true }
    });

    if (!mod) return res.status(404).json({ error: 'Mod non trovata' });

    const part = mod.part;

    // 2. Update Garage stats (subtract bonuses)
    await prisma.garage.update({
      where: { id: parseInt(garageId) },
      data: {
        cv: { decrement: Math.round(part.cvBonus) },
        nm: { decrement: Math.round(part.nmBonus) },
        kg: { increment: Math.round(part.kgBonus) },
        speed: { decrement: part.speedBonus },
        acceleration: { decrement: part.accelBonus },
        brake: { decrement: part.brakeBonus },
        traction: { decrement: part.tractBonus }
      }
    });

    // 3. Remove mod record
    await prisma.mod.delete({
      where: { id: parseInt(modId) }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/garage/:garageId/service', async (req, res) => {
  try {
    const { garageId } = req.params;
    const { serviceType, price, userId } = req.body;
    
    // Check funds
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (user.money < price) {
      return res.status(400).json({ error: 'Fondi insufficienti' });
    }

    // Deduct money
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { money: { decrement: price } }
    });

    const garage = await prisma.garage.findUnique({ where: { id: parseInt(garageId) } });
    let updateData = {};

    if (serviceType === 'tires') {
      updateData.tireGrip = 100;
    } else if (serviceType === 'engine') {
      updateData.engineHealth = 100;
      updateData.serviceKm = garage.km;
    } else if (serviceType === 'rebuild') {
      updateData.engineHealth = 100;
      updateData.serviceKm = garage.km;
    } else if (serviceType === 'full') {
      updateData.engineHealth = 100;
      updateData.tireGrip = 100;
      updateData.serviceKm = garage.km;
    }

    const updatedGarage = await prisma.garage.update({
      where: { id: parseInt(garageId) },
      data: updateData
    });

    res.json({ success: true, updatedGarage, money: user.money - price });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/purchase', async (req, res) => {
  try {
    const { userId, carId, price } = req.body;
    
    // 1. Deduct money
    const user = await prisma.user.update({
      where: { id: userId },
      data: { money: { decrement: price } }
    });

    // 2. Add to garage
    // If it's a new car (buying from brand), we create a new garage entry with base stats
    // If it's a used car (buying from market), we would normally reassign the userId, 
    // but for simplicity in this proto let's just create a new record for the user.
    const baseCar = await prisma.car.findUnique({ where: { id: carId } });
    
    const newGarageItem = await prisma.garage.create({
      data: {
        userId: userId,
        carId: carId,
        cv: baseCar.cv,
        nm: baseCar.nm,
        kg: baseCar.kg,
        speed: baseCar.speed,
        acceleration: baseCar.acceleration,
        revving: baseCar.revving,
        transmission: baseCar.transmission,
        turnSlow: baseCar.turnSlow,
        turnFast: baseCar.turnFast,
        brake: baseCar.brake,
        traction: baseCar.traction,
        km: 0
      }
    });

    res.json({ user, newGarageItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/garage/:garageId/stats', async (req, res) => {
  try {
    const { garageId } = req.params;
    const { km, engineHealth, tireGrip, currentFuel } = req.body;
    
    const updated = await prisma.garage.update({
      where: { id: parseInt(garageId) },
      data: {
        km: km !== undefined ? { increment: km } : undefined,
        engineHealth: engineHealth !== undefined ? Math.max(0, engineHealth) : undefined,
        tireGrip: tireGrip !== undefined ? Math.max(0, tireGrip) : undefined,
        // fuel is currently not in DB but managed locally in store, 
        // but if we want to persist it we'd need to add it to schema.
        // For now let's just persist what we have.
      }
    });
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PARTS ---
app.get('/api/parts', async (req, res) => {
  try {
    const parts = await prisma.part.findMany();
    res.json(parts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TRACKS ---
app.get('/api/tracks', async (req, res) => {
  try {
    const tracks = await prisma.track.findMany({
      include: {
        type: true,
        surface: true,
        meteo: true,
        builds: { include: { section: true }, orderBy: { ord: 'asc' } }
      }
    });
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CHAMPIONSHIPS ---
const championshipEntryInclude = {
  championship: {
    include: {
      rounds: {
        include: { track: { include: { type: true, surface: true, meteo: true } } },
        orderBy: { ord: 'asc' }
      }
    }
  }
};

const serializeChampionshipEntry = (entry) => ({
  ...entry,
  results: JSON.parse(entry.results)
});

app.get('/api/championship-entries/active/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const entry = await prisma.championshipEntry.findFirst({
      where: { userId, status: 'active' },
      include: championshipEntryInclude,
      orderBy: { createdAt: 'desc' }
    });
    res.json(entry ? serializeChampionshipEntry(entry) : null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/championship-entries/:entryId', async (req, res) => {
  try {
    const entryId = Number(req.params.entryId);
    const userId = Number(req.query.userId);
    if (!Number.isSafeInteger(entryId) || entryId <= 0 || !Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid championship entry or user id' });
    }

    const entry = await prisma.championshipEntry.findFirst({
      where: { id: entryId, userId },
      include: championshipEntryInclude
    });
    if (!entry) return res.status(404).json({ error: 'Championship entry not found' });
    res.json(serializeChampionshipEntry(entry));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/championships/:championshipId/enter', async (req, res) => {
  try {
    const championshipId = Number(req.params.championshipId);
    const userId = Number(req.body.userId);
    if (!Number.isSafeInteger(championshipId) || championshipId <= 0 || !Number.isSafeInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid championship or user id' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const championship = await tx.championship.findUnique({
        where: { id: championshipId },
        include: { rounds: { orderBy: { ord: 'asc' } } }
      });
      if (!championship) return { status: 404, error: 'Championship not found' };
      if (championship.rounds.length === 0) return { status: 400, error: 'Championship has no rounds' };

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) return { status: 404, error: 'Player not found' };

      const activeEntry = await tx.championshipEntry.findFirst({
        where: { userId, status: 'active' }
      });
      if (activeEntry) return { status: 409, error: 'Finish or abandon your active championship first' };

      const charge = await tx.user.updateMany({
        where: { id: userId, money: { gte: championship.entryFee } },
        data: { money: { decrement: championship.entryFee } }
      });
      if (charge.count !== 1) return { status: 400, error: 'Insufficient funds for championship entry' };

      const entry = await tx.championshipEntry.create({
        data: { userId, championshipId },
        include: championshipEntryInclude
      });
      const updatedUser = await tx.user.findUnique({
        where: { id: userId },
        select: { money: true, exp: true, level: true }
      });
      return { entry, user: updatedUser };
    });

    if (result.error) return res.status(result.status).json({ error: result.error });
    res.status(201).json({
      entry: serializeChampionshipEntry(result.entry),
      user: result.user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/championship-entries/:entryId/results', async (req, res) => {
  try {
    const entryId = Number(req.params.entryId);
    const userId = Number(req.body.userId);
    const round = Number(req.body.round);
    const trackId = Number(req.body.trackId);
    const gap = Number(req.body.gap);
    const engineBroken = req.body.engineBroken;
    if (
      !Number.isSafeInteger(entryId) || entryId <= 0 ||
      !Number.isSafeInteger(userId) || userId <= 0 ||
      !Number.isSafeInteger(round) || round <= 0 ||
      !Number.isSafeInteger(trackId) || trackId <= 0 ||
      !Number.isFinite(gap) ||
      typeof engineBroken !== 'boolean'
    ) {
      return res.status(400).json({ error: 'Invalid championship round result' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const entry = await tx.championshipEntry.findFirst({
        where: { id: entryId, userId },
        include: championshipEntryInclude
      });
      if (!entry) return { status: 404, error: 'Championship entry not found' };
      if (entry.status !== 'active') return { status: 409, error: 'Championship is already complete' };
      if (entry.currentRound !== round) return { status: 409, error: 'This round has already been recorded or is not next' };

      const roundData = entry.championship.rounds.find((item) => item.ord === round);
      if (!roundData || roundData.trackId !== trackId) {
        return { status: 400, error: 'Track does not match the current championship round' };
      }

      const playerWon = !engineBroken && gap > 0;
      const tied = !engineBroken && gap === 0;
      const playerRoundPoints = playerWon || tied ? (playerWon ? 3 : 1) : 0;
      const opponentRoundPoints = playerWon ? 0 : tied ? 1 : 3;
      const gapForStandings = engineBroken ? -Math.max(1, Math.abs(Math.trunc(gap))) : Math.trunc(gap);
      const isFinalRound = round === entry.championship.rounds.length;
      const playerPoints = entry.playerPoints + playerRoundPoints;
      const opponentPoints = entry.opponentPoints + opponentRoundPoints;
      const gapDifference = entry.gapDifference + gapForStandings;
      const playerIsChampion = playerPoints > opponentPoints ||
        (playerPoints === opponentPoints && gapDifference >= 0);
      const results = [
        ...JSON.parse(entry.results),
        {
          round,
          trackId,
          trackName: roundData.track.name,
          opponentName: roundData.opponentName,
          gap: Math.trunc(gap),
          outcome: playerWon ? 'win' : tied ? 'draw' : 'loss',
          playerPoints: playerRoundPoints,
          opponentPoints: opponentRoundPoints
        }
      ];
      const rewardMoney = isFinalRound
        ? playerIsChampion
          ? entry.championship.rewardMoney
          : Math.floor(entry.championship.rewardMoney * 0.25)
        : 0;
      const rewardXp = isFinalRound
        ? playerIsChampion
          ? entry.championship.rewardXp
          : Math.floor(entry.championship.rewardXp * 0.5)
        : 0;
      const player = await tx.user.findUnique({ where: { id: userId } });
      if (!player) return { status: 404, error: 'Player not found' };

      const updatedEntry = await tx.championshipEntry.update({
        where: { id: entry.id },
        data: {
          currentRound: isFinalRound ? round : round + 1,
          playerPoints,
          opponentPoints,
          gapDifference,
          results: JSON.stringify(results),
          status: isFinalRound ? 'completed' : 'active'
        },
        include: championshipEntryInclude
      });
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          money: { increment: rewardMoney },
          exp: { increment: rewardXp },
          level: Math.floor((player.exp + rewardXp) / 1000) + 1
        },
        select: { money: true, exp: true, level: true }
      });

      return {
        entry: updatedEntry,
        user,
        roundResult: results[results.length - 1],
        completed: isFinalRound,
        champion: isFinalRound ? playerIsChampion : null,
        rewardMoney,
        rewardXp
      };
    });

    if (result.error) return res.status(result.status).json({ error: result.error });
    res.json({
      ...result,
      entry: serializeChampionshipEntry(result.entry)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/championships', async (req, res) => {
  try {
    const championships = await prisma.championship.findMany({
      include: {
        rounds: {
          include: { track: { include: { type: true, surface: true, meteo: true } } },
          orderBy: { ord: 'asc' }
        }
      },
      orderBy: { id: 'asc' }
    });
    res.json(championships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TRAINING SESSIONS ---
app.get('/api/training-sessions', async (req, res) => {
  try {
    const sessions = await prisma.trainingSession.findMany({
      include: { track: { include: { type: true, meteo: true } } },
      orderBy: { minLevel: 'asc' }
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complete a training session — applies stat gain or unlocks move
// Body: { userId, statGain?, targetStat?, targetMove? }
app.post('/api/training-sessions/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, statGain, targetStat } = req.body;
    const sessionId = parseInt(id);
    const pUserId = parseInt(userId);

    const session = await prisma.trainingSession.findUnique({ where: { id: sessionId } });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Deduct money
    const user = await prisma.user.update({
      where: { id: pUserId },
      data: { money: { decrement: session.cost } }
    });

    // Apply stat gain if stat-type session
    if (session.category === 'stat' && session.targetStat && session.statGain > 0) {
      const statField = session.targetStat; // e.g. "brave", "reflex", "brake", "clean", "shift"
      await prisma.user.update({
        where: { id: pUserId },
        data: { [statField]: { increment: session.statGain } }
      });
    }

    // XP reward
    await prisma.user.update({
      where: { id: pUserId },
      data: { exp: { increment: session.xpReward } }
    });

    res.json({ success: true, session, updatedMoney: user.money - session.cost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DEV SANDBOX ────────────────────────────────────────────────────────

app.get('/api/track-sections', async (req, res) => {
  try {
    const sections = await prisma.trackSection.findMany();
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dev/opponents', async (req, res) => {
  try {
    const opponents = await prisma.customOpponent.findMany({
      include: { car: { include: { brand: true } } }
    });
    res.json(opponents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/dev/opponents', async (req, res) => {
  try {
    const data = req.body;
    const opponent = await prisma.customOpponent.create({
      data: {
        name: data.name,
        carId: parseInt(data.carId),
        level: parseInt(data.level),
        shift: parseInt(data.shift),
        reflex: parseInt(data.reflex),
        brave: parseInt(data.brave),
        clean: parseInt(data.clean),
        acro: parseInt(data.acro),
        turn: parseInt(data.turn),
        brake: parseInt(data.brake),
        throttle: parseInt(data.throttle)
      }
    });
    res.json({ success: true, opponent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dev/tracks', async (req, res) => {
  try {
    const tracks = await prisma.customTrack.findMany({
      include: {
        sections: {
          include: { section: true },
          orderBy: { ord: 'asc' }
        }
      }
    });
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/dev/tracks', async (req, res) => {
  try {
    const { name, sections } = req.body; // sections is an array of sectionIds
    
    const track = await prisma.customTrack.create({
      data: { name }
    });

    for (let i = 0; i < sections.length; i++) {
      await prisma.customTrackSection.create({
        data: {
          customTrackId: track.id,
          sectionId: parseInt(sections[i]),
          ord: i + 1
        }
      });
    }

    const fullTrack = await prisma.customTrack.findUnique({
      where: { id: track.id },
      include: {
        sections: {
          include: { section: true },
          orderBy: { ord: 'asc' }
        }
      }
    });

    res.json({ success: true, track: fullTrack });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`PokeTurismo Backend running on http://localhost:${PORT}`);
});
