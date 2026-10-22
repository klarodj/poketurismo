// Validate provider configuration before enabling personal accounts. No values are printed.
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const requireServer = createRequire(path.resolve(__dirname, '../server/package.json'));
const dotenv = requireServer('dotenv');
const file = process.env.ACCOUNTS_ENV_FILE || '/home/klaro/poketurismo-data/accounts/accounts.env';
const config = dotenv.parse(fs.readFileSync(file));
const email = config.AUTH_EMAIL_ENABLED === 'true', google = config.AUTH_GOOGLE_ENABLED === 'true';
if (!email && !google) throw new Error('Configurare e abilitare almeno un metodo di accesso prima del passaggio. Il gioco corrente non viene modificato.');
for (const name of ['DATABASE_URL','AUTH_INTERNAL_URL','SUPABASE_ANON_KEY','PUBLIC_URL','ADMIN_EMAILS',
  ...(email ? ['SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS','SMTP_FROM'] : []), ...(google ? ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET'] : [])]) {
  if (!config[name]) throw new Error('Configurazione mancante: ' + name);
}
if (!/^https:\/\//.test(config.PUBLIC_URL) || !/^postgres(?:ql)?:/.test(config.DATABASE_URL)) throw new Error('Usare HTTPS per il sito e PostgreSQL per il gioco');
const directory = path.resolve(__dirname, '../.preview');
fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
const runtime = { POKETURISMO_AUTH_ENABLED: '1', DATABASE_URL: config.DATABASE_URL,
  AUTH_INTERNAL_URL: config.AUTH_INTERNAL_URL, SUPABASE_ANON_KEY: config.SUPABASE_ANON_KEY, PUBLIC_URL: config.PUBLIC_URL,
  AUTH_EMAIL_ENABLED: String(email), AUTH_GOOGLE_ENABLED: String(google), ADMIN_EMAILS: config.ADMIN_EMAILS,
  LEGACY_OWNER_EMAIL: config.LEGACY_OWNER_EMAIL || '' };
const gateway = { POKETURISMO_AUTH_ENABLED: '1', AUTH_INTERNAL_URL: config.AUTH_INTERNAL_URL };
function write(name, values) {
  const destination = path.join(directory, name), temporary = destination + '.' + process.pid + '.tmp';
  fs.writeFileSync(temporary, Object.entries(values).map(([key, value]) => `${key}=${JSON.stringify(value)}\n`).join(''), { mode: 0o600, flag: 'wx' });
  fs.renameSync(temporary, destination);
}
write('accounts-runtime.env', runtime);
write('accounts-gateway.env', gateway);
console.log('Configurazioni runtime private preparate. Servizi non riavviati; seguire la procedura di migrazione e controllo prima del passaggio.');
