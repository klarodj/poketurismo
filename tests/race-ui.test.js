import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transformWithOxc } from 'vite';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { makeRace } from '../scripts/race-balance.mjs';
import { publicDevelopment } from '../shared/driverDevelopment.mjs';
import { DEMO_TRACK } from '../shared/trackGeometry.mjs';
const require = createRequire(import.meta.url);
// Compile JSX without starting a Vite server or opening network ports.
const compiled = new Map();
async function compile(filename) {
  if (compiled.has(filename)) return compiled.get(filename);
  const promise = (async () => {
    const result = await transformWithOxc(readFileSync(filename, 'utf8'), filename, { jsx: { runtime: 'classic' } });
    const source = result.code.replace(/import ['"][^'"]+\.css['"];?/g, '');
    const imports = [...source.matchAll(/from ['"]([^'"]+)['"]/g)];
    const targets = await Promise.all(imports.map(async match => {
      const specifier = match[1];
      let target = specifier.startsWith('.') ? resolve(dirname(filename), specifier) : require.resolve(specifier);
      if (!existsSync(target)) target += existsSync(target + '.jsx') ? '.jsx' : '.js';
      return target.endsWith('.jsx') ? compile(target) : pathToFileURL(target).href;
    }));
    let index = 0;
    const code = source.replace(/from ['"]([^'"]+)['"]/g, () => `from ${JSON.stringify(targets[index++])}`);
    return 'data:text/javascript;base64,' + Buffer.from(code).toString('base64');
  })();
  compiled.set(filename, promise);
  return promise;
}
async function component(name, exported = 'default') {
  return (await import(await compile(resolve(`src/components/${name}.jsx`))))[exported];
}
test('race UI renders a labelled map and only relevant driving controls', async () => {
  const TrackPreview = await component('TrackPreview'), TacticalControls = await component('TacticalControls');
  const race = makeRace();
  const map = renderToStaticMarkup(React.createElement(TrackPreview, { sections: race.sections, paths: DEMO_TRACK.mapPaths, index: 0, compact: true }));
  assert.ok(map.includes('<svg')); assert.ok(map.includes('aria-current="step"')); assert.ok(map.includes('PROSSIMO'));
  race.index = 7; race.gapSeconds = 2;
  const straight = renderToStaticMarkup(React.createElement(TacticalControls, { race, pending: 0, onTurn() {} }));
  assert.ok(!straight.includes('Staccata')); assert.ok(!straight.includes('Traiettoria')); assert.ok(!straight.includes('Prepara il sorpasso'));
  race.index = 1; race.gapSeconds = 0.5;
  const corner = renderToStaticMarkup(React.createElement(TacticalControls, { race, pending: 0, onTurn() {} }));
  assert.ok(corner.includes('Chiudi l’interno')); assert.ok(corner.includes('Staccata'));
  race.index = 3; race.gapSeconds = -0.5; race.incidentCue = { description: 'Sporco segnalato' };
  const behind = renderToStaticMarkup(React.createElement(TacticalControls, { race, pending: 0, onTurn() {} }));
  assert.ok(behind.includes('Sfrutta la scia')); assert.ok(behind.includes('Tenta il sorpasso')); assert.ok(behind.includes('Sporco segnalato'));
  assert.ok(!behind.includes('Chiudi l’interno'));
});


test('cockpit shows both real car images and keeps technical data out of the main view', async () => {
  const Dashboard = await component('RaceDashboard');
  const race = makeRace();
  Object.assign(race, { status: 'active', mode: 'track', trackName: 'Circuito Scuola' });
  race.car.image = '106.png'; race.opponent.car.image = '114.png';
  const markup = renderToStaticMarkup(React.createElement(Dashboard, { race, pending: 0, onAbandon() {} }, 'CONTROLLI'));
  assert.ok(markup.includes('/images/car/106.png')); assert.ok(markup.includes('/images/car/114.png'));
  assert.ok(markup.includes('Apri dettaglio: La tua auto')); assert.ok(markup.includes('Apri dettaglio: Auto rivale'));
  assert.ok(markup.includes('Apri dettaglio: tempi e distacco')); assert.ok(markup.includes('Settore attuale'));
  assert.ok(markup.includes('CONTROLLI'));
  assert.ok(!markup.includes('<dialog')); assert.ok(!markup.includes('Geometria dei tratti')); assert.ok(!markup.includes('<table'));
  assert.ok(!markup.includes('Abbandona gara'));
});

test('car, sector and history details retain the requested data and missing images have a fallback', async () => {
  const CarDetail = await component('RaceDetails', 'CarDetail');
  const SectorDetail = await component('RaceDetails', 'SectorDetail');
  const History = await component('RaceDetails', 'RaceHistory');
  const race = makeRace();
  const car = renderToStaticMarkup(React.createElement(CarDetail, { car: race.car, pilot: race.pilot, name: 'Tu' }));
  assert.ok(car.includes('Immagine non disponibile')); assert.ok(car.includes('Potenza')); assert.ok(car.includes('Motore')); assert.ok(car.includes('Coraggio'));
  const sector = renderToStaticMarkup(React.createElement(SectorDetail, { race }));
  assert.ok(sector.includes('Geometria dei tratti')); assert.ok(sector.includes('Larghezza'));
  const history = renderToStaticMarkup(React.createElement(History, { race }));
  assert.ok(history.includes('Nessun settore ancora percorso'));
});

test('cockpit keeps critical warnings visible and tolerates a finished or legacy race', async () => {
  const Dashboard = await component('RaceDashboard');
  const race = makeRace();
  Object.assign(race, { status: 'active', mode: 'street', trackName: 'Strada', incidentCue: { description: 'Sporco segnalato' } });
  Object.assign(race.car, { currentFuel: 0.5, engineHealth: 20, tireGrip: 30 });
  let markup = renderToStaticMarkup(React.createElement(Dashboard, { race, pending: 0, onAbandon() {} }));
  assert.ok(markup.includes('Sporco segnalato')); assert.ok(markup.includes('Carburante basso')); assert.ok(markup.includes('Gomme usurate')); assert.ok(markup.includes('Motore compromesso'));
  race.index = race.sections.length; race.status = 'completed';
  markup = renderToStaticMarkup(React.createElement(Dashboard, { race, pending: 0, onAbandon() {} }));
  assert.ok(markup.includes('Gara conclusa')); assert.ok(!markup.includes('Carburante basso'));
  delete race.rulesVersion; race.gap = -100; race.sections = [{ name: 'Vecchio settore' }]; race.index = 0;
  markup = renderToStaticMarkup(React.createElement(Dashboard, { race, pending: 0, onAbandon() {} }));
  assert.ok(markup.includes('100')); assert.ok(markup.includes('Sei dietro'));
});


test('pilot development UI explains the school, bounded practice and first-time rewards', async () => {
  const Panel = await component('DriverDevelopmentPanel');
  const Summary = await component('DevelopmentSummary');
  const development = publicDevelopment(null);
  let markup = renderToStaticMarkup(React.createElement(Panel, { development, onRead() {}, onStart() {} }));
  assert.ok(markup.includes('Scuola guida')); assert.ok(markup.includes('Leggi la lezione'));
  assert.ok(markup.includes('disabled=""')); assert.ok(markup.includes('0/120'));
  const learned = publicDevelopment({ lessonRead: true, lessonPassed: true, earlyPractice: 4, referencePractice: 4, latePractice: 4, techniquePractice: 20 });
  markup = renderToStaticMarkup(React.createElement(Panel, { development: learned, onRead() {}, onStart() {} }));
  assert.ok(markup.includes('Ripeti la prova')); assert.ok(markup.includes('Consolidata')); assert.ok(markup.includes('senza altre ricompense'));
  markup = renderToStaticMarkup(React.createElement(Summary, { summary: { message: 'Promosso', gains: { early: 4, optimal: 4, late: 4 }, xp: 40, techniqueGain: 0, lesson: { passed: true, correct: 4, total: 4 } } }));
  assert.ok(markup.includes('Prova superata')); assert.ok(markup.includes('+40 XP')); assert.ok(markup.includes('Frenata al riferimento'));
});
