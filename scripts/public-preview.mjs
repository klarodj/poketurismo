// Public build gateway: no source files, fixed API upstream, HTTP Basic over Funnel HTTPS.
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { timingSafeEqual, createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(new URL('../server/package.json', import.meta.url));
const express = require('express');
const root = fileURLToPath(new URL('../.preview/public-dist/', import.meta.url));
const access = JSON.parse(readFileSync(new URL('../.preview/public-access.json', import.meta.url)));
const digest = value => createHash('sha256').update(value).digest();
const expected = digest(`Basic ${Buffer.from(`${access.username}:${access.password}`).toString('base64')}`);
const origins = new Set(['https://server-klaro.tail6c534c.ts.net', 'https://server-klaro.tail6c534c.ts.net:8443']);
const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('Referrer-Policy', 'same-origin');
  res.set('Cache-Control', 'no-store');
  if (!timingSafeEqual(expected, digest(req.headers.authorization || ''))) {
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
  if (!/^\/api(?:\/|$)/.test(path)) return next();
  // Development editors remain read-only from the public endpoint.
  if (/^\/api\/dev(?:\/|$)/.test(path) && !['GET', 'HEAD'].includes(req.method)) {
    return res.status(403).json({ error: 'Editor disabilitato nel playtest pubblico' });
  }
  const headers = { ...req.headers, host: '127.0.0.1:5174' };
  delete headers.authorization;
  delete headers.cookie;
  delete headers.connection;
  const upstream = http.request({ hostname: '127.0.0.1', port: 5174,
    path: req.originalUrl, method: req.method, headers, timeout: 20000 }, response => {
    const forwarded = { ...response.headers };
    for (const key of Object.keys(forwarded)) {
      if (key.startsWith('access-control-') || ['connection', 'set-cookie', 'x-powered-by'].includes(key)) delete forwarded[key];
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
app.listen(5184, '127.0.0.1', () => console.log('Public playtest gateway ready on 127.0.0.1:5184'));
