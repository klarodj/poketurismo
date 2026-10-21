// The live service selects PostgreSQL explicitly; SQLite remains available for isolated tests and migration checks.
const postgres = /^postgres(?:ql)?:/.test(process.env.DATABASE_URL || '');
const { PrismaClient } = postgres ? require('./generated/postgres') : require('@prisma/client');
module.exports = { PrismaClient, postgres };
