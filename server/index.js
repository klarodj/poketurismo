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

app.listen(PORT, () => {
  console.log(`PokeTurismo Backend running on http://localhost:${PORT}`);
});

