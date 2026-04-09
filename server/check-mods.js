const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const user1Garage = await prisma.garage.findMany({
    where: { userId: 1 },
    include: {
      car: true,
      mods: { include: { part: true } }
    }
  });

  console.log(`User 1 has ${user1Garage.length} cars in garage.`);
  user1Garage.forEach(item => {
    console.log(`Car: ${item.car.name} (Garage ID: ${item.id}) - Mods: ${item.mods.length}`);
    item.mods.forEach(m => {
       console.log(`   - Mod: ${m.part.name}`);
    });
  });

  const allModsCount = await prisma.mod.count();
  console.log(`Total mods in DB: ${allModsCount}`);
}

check().catch(console.error).finally(() => prisma.$disconnect());
