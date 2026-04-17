const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.car.findMany({
    take: 5,
    select: { id: true, name: true, speed: true, acceleration: true, revving: true, transmission: true, turnSlow: true, turnFast: true, brake: true, traction: true }
  });
  console.log('=== CURRENT DB CAR STATS (first 5) ===');
  console.log(JSON.stringify(cars, null, 2));
  
  // Also check garages
  const garages = await prisma.garage.findMany({
    take: 3,
    select: { id: true, carId: true, speed: true, acceleration: true, turnSlow: true, traction: true }
  });
  console.log('\n=== CURRENT DB GARAGE STATS (first 3) ===');
  console.log(JSON.stringify(garages, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
