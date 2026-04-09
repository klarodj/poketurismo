const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.create({
  data: {
    id: -1,
    username: 'Market',
    password: '',
    mail: '',
    brave: 0,
    clean: 0,
    reflex: 0,
    acro: 0,
    turn: 0,
    brake: 0,
    throttle: 0,
    shift: 0,
    carDrive: 0
  }
}).then(console.log).catch(console.error).finally(()=>prisma.$disconnect());
