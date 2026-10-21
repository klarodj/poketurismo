// Public build gateway: no source files, fixed API upstream, HTTP Basic over Funnel HTTPS.
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { timingSafeEqual, createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(new URL('../server/package.json', import.meta.url));
const express = require('express');
const accountMode = process.env.POKETURISMO_AUTH_ENABLED === '1';
const root = fileURLToPath(new URL(accountMode ? '../dist/' : '../.preview/public-dist/', import.meta.url));
const access = accountMode ? null : JSON.parse(readFileSync(new URL('../.preview/public-access.json', import.meta.url)));
const digest = value => createHash('sha256').update(value).digest();
const expected = access ? digest(`Basic ${Buffer.from(`${access.username}:${access.password}`).toString('base64')}`) : null;
const origins = new Set(['https://server-klaro.tail6c534c.ts.net', 'https://server-klaro.tail6c534c.ts.net:8443']);
const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('Referrer-Policy', 'same-origin');
  res.set('Cache-Control', 'no-store');
  if (!accountMode && !timingSafeEqual(expected, digest(req.headers.authorization || ''))) {
    res.set('WWW-Authenticate', 'Basic realm="Poketurismo playtest", charset="UTF-8"');
    return res.status(401).send('Accesso riservato al playtest.');
  }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      (req.headers['sec-fetch-site'] === 'cross-site' ||
       (req.headers.origin && !origins.has(req.headers.origin)))) {
    return res.status(403).json({ error: 'Origine non consentita' });
  }
  next();
});
app.use((req, res, next) => {
  let path;
  try { path = decodeURIComponent(req.path); } catch { return res.sendStatus(400); }
  if (path.split('/').some(part => part.startsWith('.')) ||
      /^\/(?:src|server|scripts|node_modules|@fs|@vite|@id)(?:\/|$)/.test(path) ||
      /\.(?:db|sqlite|map)(?:$|\/)/i.test(path)) return res.sendStatus(404);
  const authRequest = accountMode && /^\/auth\/v1(?:\/|$)/.test(path);
  if (!/^\/api(?:\/|$)/.test(path) && !authRequest) return next();
  if (authRequest && /^\/auth\/v1\/admin(?:\/|$)/.test(path)) return res.sendStatus(404);
  // Development editors remain read-only from the public endpoint.
  if (/^\/api\/dev(?:\/|$)/.test(path) && !['GET', 'HEAD'].includes(req.method)) {
    return res.status(403).json({ error: 'Editor disabilitato nel playtest pubblico' });
  }
  const headers = { ...req.headers, host: '127.0.0.1:5174' };
  if (!accountMode) delete headers.authorization;
  if (!authRequest) delete headers.cookie;
  headers['x-forwarded-proto'] = 'https';
  headers['x-forwarded-for'] = req.socket.remoteAddress;
  delete headers.connection;
  const target = authRequest ? new URL(process.env.AUTH_INTERNAL_URL || 'http://127.0.0.1:9999') : new URL('http://127.0.0.1:5174');
  const upstreamPath = authRequest ? req.originalUrl.replace(/^\/auth\/v1(?=\/|\?|$)/, '') || '/' : req.originalUrl;
  headers.host = target.host;
  const upstream = http.request({ hostname: target.hostname, port: target.port,
    path: upstreamPath, method: req.method, headers, timeout: 20000 }, response => {
    const forwarded = { ...response.headers };
    for (const key of Object.keys(forwarded)) {
      if (key.startsWith('access-control-') || ['connection', 'x-powered-by'].includes(key) || (key === 'set-cookie' && !authRequest)) delete forwarded[key];
    }
    forwarded['cache-control'] = 'no-store';
    res.writeHead(response.statusCode, forwarded);
    response.pipe(res);
  });
  upstream.on('timeout', () => upstream.destroy());
  upstream.on('error', () => {
    if (!res.headersSent) res.status(502).json({ error: 'Anteprima in riavvio, riprova tra pochi secondi' });
    else res.destroy();
  });
  req.on('aborted', () => upstream.destroy());
  req.pipe(upstream);
});
app.use(express.static(root, { dotfiles: 'deny', index: 'index.html' }));
app.get('/{*path}', (req, res) => res.sendFile('index.html', { root }));
export { app };
if (import.meta.main) app.listen(5184, '127.0.0.1', () => console.log('Public playtest gateway ready on 127.0.0.1:5184'));
