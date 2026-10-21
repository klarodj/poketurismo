const { fail, PILOT_STATS, publicPlayer } = require('./gameRules');
const { transaction } = require('./persistence');
const enabled = process.env.POKETURISMO_AUTH_ENABLED === '1';
const initialMoneyCents = 1_000_000;
const avatars = ['blue', 'red', 'green', 'yellow'];
const profiles = {
  balanced: Object.fromEntries(PILOT_STATS.map(key => [key, 11])),
  methodical: { ...Object.fromEntries(PILOT_STATS.map(key => [key, 10])), clean: 14, brake: 14 },
  instinctive: { ...Object.fromEntries(PILOT_STATS.map(key => [key, 10])), reflex: 14, brave: 14 },
  technical: { ...Object.fromEntries(PILOT_STATS.map(key => [key, 10])), shift: 14, throttle: 14 },
};
function config() {
  return { enabled, google: process.env.AUTH_GOOGLE_ENABLED === 'true', email: process.env.AUTH_EMAIL_ENABLED === 'true',
    publicKey: enabled ? process.env.SUPABASE_ANON_KEY || '' : '', initialMoney: initialMoneyCents / 100,
    baseStat: 10, extraPoints: 8, maxStat: 14, stats: PILOT_STATS, profiles, avatars };
}
async function identity(req) {
  const token = /^Bearer ([A-Za-z0-9_.-]{10,10000})$/.exec(req.headers.authorization || '')?.[1];
  if (!token) fail(401, 'Accedi per continuare');
  let response;
  try {
    response = await fetch(`${process.env.AUTH_INTERNAL_URL}/user`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(5000), redirect: 'error' });
  } catch { fail(503, 'Servizio di accesso temporaneamente non disponibile'); }
  if (response.status === 401 || response.status === 403) fail(401, 'Sessione scaduta: accedi di nuovo');
  if (!response.ok) fail(503, 'Servizio di accesso temporaneamente non disponibile');
  const user = await response.json();
  if (!/^[a-f0-9-]{36}$/i.test(user.id || '') || !user.email_confirmed_at) fail(401, 'Verifica prima il tuo indirizzo email');
  return { id: user.id, email: user.email };
}
function install(app, prisma, endpoint) {
  app.get('/api/auth/config', endpoint(async () => config()));
  app.get('/api/auth/templates/code', (req, res) => res.type('html').send('<!doctype html><html lang="it"><body><h1>Accesso a Poketurismo</h1><p>Il tuo codice monouso è:</p><p style="font-size:32px;letter-spacing:6px">{{ .Token }}</p><p>Scade tra 10 minuti. Se non hai richiesto questo accesso, ignora questa email.</p></body></html>'));
  if (enabled && (!/^postgres(?:ql)?:/.test(process.env.DATABASE_URL || '') || !process.env.AUTH_INTERNAL_URL || !process.env.SUPABASE_ANON_KEY)) {
    throw new Error('Gli account richiedono PostgreSQL, AUTH_INTERNAL_URL e SUPABASE_ANON_KEY configurati');
  }
  app.use('/api', async (req, res, next) => {
    if (!enabled || req.path === '/health') return next();
    try {
      req.identity = await identity(req);
      req.player = await prisma.user.findUnique({ where: { authUserId: req.identity.id } });
      // Only a verified, explicitly configured owner can claim the historical save.
      const owner = (process.env.LEGACY_OWNER_EMAIL || '').trim().toLowerCase();
      if (!req.player && owner && req.identity.email?.toLowerCase() === owner) {
        await prisma.user.updateMany({ where: { id: 1, authUserId: null }, data: { authUserId: req.identity.id, isAdmin: true } });
        req.player = await prisma.user.findUnique({ where: { authUserId: req.identity.id } });
      }
      if (req.path.startsWith('/account/')) return next();
      if (!req.player) fail(428, 'Crea prima il tuo pilota');
      if (req.body?.userId !== undefined && Number(req.body.userId) !== req.player.id) fail(403, 'Questo salvataggio appartiene a un altro giocatore');
      if (req.path.startsWith('/dev/') && !req.player.isAdmin) fail(403, 'Area riservata all’amministratore');
      next();
    } catch (error) { res.status(error.status || 500).json({ error: error.status ? error.message : 'Accesso non riuscito' }); }
  });
  app.get('/api/account/me', endpoint(async req => {
    if (!enabled) fail(404, 'Account personali non attivi');
    return { identity: req.identity, player: publicPlayer(req.player) };
  }));
  app.post('/api/account/pilot', endpoint(async req => {
    if (!enabled) fail(404, 'Account personali non attivi');
    const { nickname, avatar, stats, ...rest } = req.body;
    if (Object.keys(rest).length) fail(400, 'Campi di creazione pilota non validi');
    const name = typeof nickname === 'string' ? nickname.normalize('NFKC').trim() : '';
    if (!/^[\p{L}\p{N} _-]{3,20}$/u.test(name)) fail(400, 'Scegli un nome di 3–20 caratteri, usando lettere, numeri, spazi o trattini');
    if (!avatars.includes(avatar)) fail(400, 'Avatar non valido');
    if (!stats || Object.keys(stats).sort().join() !== [...PILOT_STATS].sort().join() ||
        PILOT_STATS.some(key => !Number.isInteger(stats[key]) || stats[key] < 10 || stats[key] > 14) ||
        PILOT_STATS.reduce((sum, key) => sum + stats[key], 0) !== 88) fail(400, 'Distribuisci esattamente 8 punti, con valori tra 10 e 14');
    try {
      return await transaction(prisma, async tx => {
        const existing = await tx.user.findUnique({ where: { authUserId: req.identity.id } });
        if (existing) return { player: publicPlayer(existing), created: false };
        const player = await tx.user.create({ data: { username: name, usernameKey: name.toLowerCase(), authUserId: req.identity.id,
          avatar, password: '', mail: '', carDrive: 0, moneyCents: initialMoneyCents, ...stats,
          progress: { create: {} }, development: { create: {} } } });
        return { player: publicPlayer(player), created: true };
      });
    } catch (error) {
      if (error.code === 'P2002') fail(409, 'Nome pilota già utilizzato');
      throw error;
    }
  }));
}
function playerId(req, candidate) {
  if (!enabled) return require('./gameRules').positiveId(candidate);
  if (!req.player) fail(401, 'Accedi per continuare');
  if (candidate !== undefined && Number(candidate) !== req.player.id) fail(403, 'Questo salvataggio appartiene a un altro giocatore');
  return req.player.id;
}
module.exports = { install, playerId, enabled, config };
