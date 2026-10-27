// Build only from the individually generated image_gen inputs, never from old photographs.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {PNG} = require('../paint-prototype/node_modules/pngjs');
const root = path.resolve(__dirname, '../..');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const records = fs.readdirSync(path.join(__dirname, 'records')).filter(f => f.endsWith('.json')).sort();
const report = [];
for (const file of records) {
  const record = JSON.parse(fs.readFileSync(path.join(__dirname, 'records', file)));
  const sourceBytes = fs.readFileSync(path.join(root, record.input));
  const raw = PNG.sync.read(sourceBytes);
  const square = record.output.includes('/part/') || record.output.includes('/work/');
  const width = square ? 128 : 320, height = square ? 128 : 180;
  const image = new PNG({width, height});
  const part = record.output.includes('/part/');
  let left = 0, top = 0, right = raw.width - 1, bottom = raw.height - 1;
  if (part) {
    left = raw.width; top = raw.height; right = -1; bottom = -1;
    for (let y = 0; y < raw.height; y++) for (let x = 0; x < raw.width; x++) if (raw.data[(y * raw.width + x) * 4 + 3] > 32) {
      left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
    if (right < left || bottom < top) throw Error('Empty item: ' + record.key);
  }
  const scale = part ? Math.min(112 / (right - left + 1), 112 / (bottom - top + 1)) : null;
  const drawWidth = part ? Math.max(1, Math.round((right - left + 1) * scale)) : width;
  const drawHeight = part ? Math.max(1, Math.round((bottom - top + 1) * scale)) : height;
  const ox = Math.floor((width - drawWidth) / 2), oy = Math.floor((height - drawHeight) / 2);
  // Nearest-neighbour sampling preserves the generated hard pixel edges and alpha.
  for (let y = 0; y < drawHeight; y++) for (let x = 0; x < drawWidth; x++) {
    const sx = Math.min(right, left + Math.floor((x + .5) * (right - left + 1) / drawWidth));
    const sy = Math.min(bottom, top + Math.floor((y + .5) * (bottom - top + 1) / drawHeight));
    const from = (sy * raw.width + sx) * 4, to = ((y + oy) * width + x + ox) * 4;
    raw.data.copy(image.data, to, from, from + 4);
  }
  const legacy = path.join(root, record.output);
  const relative = record.output.replace('public/images/', '');
  const archive = path.join(__dirname, 'archive', relative);
  if (fs.existsSync(legacy)) {
    const bytes = fs.readFileSync(legacy);
    fs.mkdirSync(path.dirname(archive), {recursive: true});
    if (fs.existsSync(archive) && sha(fs.readFileSync(archive)) !== sha(bytes)) throw Error('Archive mismatch: ' + relative);
    if (!fs.existsSync(archive)) fs.copyFileSync(legacy, archive);
    fs.unlinkSync(legacy);
  }
  const output = path.join(root, 'public/images/world', relative);
  fs.mkdirSync(path.dirname(output), {recursive: true});
  const bytes = record.nativeInput ? sourceBytes : PNG.sync.write(image);
  if (!fs.existsSync(output) || !fs.readFileSync(output).equals(bytes)) fs.writeFileSync(output, bytes);
  report.push({key: record.key, input: record.input, sourceSha256: sha(sourceBytes), output: path.relative(root, output), sha256: sha(bytes), width, height, archivedOriginal: fs.existsSync(archive) ? 'tools/world-art/archive/' + relative : null});
}
fs.writeFileSync(path.join(__dirname, 'manifest.json'), JSON.stringify({tool: 'image_gen built-in', preparation: 'Nearest-neighbour only; generated alpha retained', assets: report}, null, 2) + '\n');
const names = {garage:'Garage / Casa',city:'La provincia',dealer:'Concessionario',fuel:'Benzinaio',workshop:'Meccanico',shop:'Negozio tuning',street:'Corse clandestine',track:'Autodromo',used:'Auto usate',meet:'Raduno del club',login:'Benvenuto in provincia',setting:'Il computer di casa','places/scuola-guida':'Scuola guida','places/cronometraggio':'Cronometraggio',oil:'Tagliando',tyre:'Cambio gomme',rebuild:'Revisione motore',repair:'Ripristino completo',soccorso:'Soccorso essenziale',verniciatura:'Carrozziere'};
const catalog = report.map((asset, index) => {
  const record = JSON.parse(fs.readFileSync(path.join(__dirname, 'records', records[index])));
  return {group: record.output.includes('/part/') ? 'part' : record.output.includes('/work/') ? 'work' : record.output.includes('/tracks/') ? 'tracks' : 'places', name: record.level ? record.name + ' · Livello ' + record.level : record.name || names[record.key] || record.key, image: '/' + asset.output.replace('public/', ''), width: asset.width, height: asset.height};
});
fs.writeFileSync(path.join(root, 'public/previews/pixel-world/catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
console.log(JSON.stringify({assets: report.length, expected: 95, complete: report.length === 95}));
