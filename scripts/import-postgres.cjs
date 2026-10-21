// Import once into an EMPTY game schema, atomically. Credentials are read from a private env file.
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { createRequire } = require('node:module');
const requireServer = createRequire(path.resolve(__dirname, '../server/package.json'));
requireServer('dotenv').config({ path: process.env.ACCOUNTS_ENV_FILE || '/home/klaro/poketurismo-data/accounts/accounts.env', quiet: true });
const { Client, types } = requireServer('pg');
types.setTypeParser(1114, value => new Date(value.replace(' ', 'T') + 'Z'));
const { Prisma } = require('../server/generated/postgres');
const source = process.argv[2];
if (!source || !/^postgres(?:ql)?:/.test(process.env.DATABASE_URL || '')) throw new Error('Specificare il database SQLite sorgente e configurare DATABASE_URL PostgreSQL');
const tables = ['Brand','Car','Class','User','Garage','Level','Part','Mod','TrackType','TrackSurface','TrackMeteo','Track','TrackSection','TrackBuild','Championship','ChampionshipRace','ChampionshipEntry','TrainingSession','CustomOpponent','CustomTrack','CustomTrackSection','PlayerProgress','InventoryPart','GameOperation','RaceSession','DriverDevelopment'];
const quote = value => '"' + value.replaceAll('"','""') + '"';
function normalizeDate(value) {
  if (value === null) return null;
  if (typeof value === 'string' && !/(?:Z|[+-]\d\d:\d\d)$/.test(value)) value = value.replace(' ', 'T') + 'Z';
  return new Date(value).toISOString();
}
function digest(rows, fields) {
  const canonical = rows.map(row => JSON.stringify(fields.map(field => row[field.name]))).sort();
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}
async function main() {
  const data = JSON.parse(execFileSync('python3', [path.join(__dirname, 'export-sqlite.py'), source], { maxBuffer: 64 * 1024 * 1024 }));
  const connection = new Client({ connectionString: process.env.DATABASE_URL });
  await connection.connect();
  const report = {};
  try {
    await connection.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const seenNames = new Set();
    for (const table of tables) {
      const model = Prisma.dmmf.datamodel.models.find(model => model.name === table);
      const target = `game.${quote(table)}`;
      if (Number((await connection.query(`SELECT count(*) FROM ${target}`)).rows[0].count)) throw new Error('Destinazione non vuota: ' + table);
      const originals = data[table] || [];
      const fields = model.fields.filter(field => field.kind === 'scalar' && field.name in (originals[0] || {}));
      const rows = originals.map(original => {
        const row = Object.fromEntries(fields.map(field => [field.name, field.type === 'DateTime' ? normalizeDate(original[field.name]) : field.type === 'Boolean' ? Boolean(original[field.name]) : original[field.name]]));
        // Legacy passwords and email addresses are not credentials for the new authentication system.
        if (table === 'User') {
          row.password = ''; row.mail = '';
          const key = original.username.normalize('NFKC').trim().toLowerCase();
          row.usernameKey = seenNames.has(key) ? null : key;
          seenNames.add(key);
        }
        return row;
      });
      for (const row of rows) {
        const names = Object.keys(row);
        await connection.query(`INSERT INTO ${target} (${names.map(quote).join(',')}) VALUES (${names.map((_,i)=>'$'+(i+1)).join(',')})`, names.map(name => row[name]));
      }
      const exported = (await connection.query(`SELECT * FROM ${target}`)).rows.map(row => Object.fromEntries(fields.map(field => [field.name, field.type === 'DateTime' && row[field.name] !== null ? normalizeDate(row[field.name]) : row[field.name]])));
      if (digest(rows, fields) !== digest(exported, fields)) throw new Error('Verifica dei dati fallita: ' + table);
      if (model.fields.some(field => field.name === 'id' && field.type === 'Int' && field.isId && field.hasDefaultValue)) {
        await connection.query(`SELECT setval(pg_get_serial_sequence($1,'id'),GREATEST(COALESCE(MAX(id),0),1),COALESCE(MAX(id),0)>=1) FROM ${target}`, [`game.${quote(table)}`]);
      }
      report[table] = { count: rows.length, verified: true };
    }
    await connection.query('COMMIT');
    console.log(JSON.stringify({ imported: true, source: path.resolve(source), schema: 'game', tables: report }, null, 2));
  } catch (error) {
    await connection.query('ROLLBACK');
    throw error;
  } finally { await connection.end(); }
}
main().catch(error => { console.error('Importazione interrotta:', error.message); process.exitCode = 1; });
