// Run after Auth has initialized auth.users. Never grant the game access to Auth rows.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { createRequire } = require('node:module');
const requireServer = createRequire(path.resolve(__dirname, '../server/package.json'));
const config = requireServer('dotenv').parse(fs.readFileSync(process.env.ACCOUNTS_ENV_FILE || '/home/klaro/poketurismo-data/accounts/accounts.env'));
async function main() {
  const client = new (requireServer('pg').Client)({ connectionString: config.ADMIN_DATABASE_URL });
  await client.connect();
  try {
    const result = await client.query("SELECT to_regclass('auth.users') AS initialized");
    if (!result.rows[0].initialized) throw new Error('Avviare prima Supabase Auth e verificarne lo stato');
    await client.query('GRANT USAGE ON SCHEMA auth TO poketurismo_game; GRANT REFERENCES (id) ON auth.users TO poketurismo_game');
  } finally { await client.end(); }
  const result = spawnSync(process.execPath, [path.resolve(__dirname, '../server/node_modules/prisma/build/index.js'), 'migrate', 'deploy', '--schema', 'server/prisma/postgres/schema.prisma'], {
    cwd: path.resolve(__dirname, '..'), env: { ...process.env, DATABASE_URL: config.DATABASE_URL }, stdio: 'inherit',
  });
  if (result.error) throw result.error;
  process.exitCode = result.status || 0;
}
main().catch(error => { console.error('Migrazione interrotta:', error.message); process.exitCode = 1; });
