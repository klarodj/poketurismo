// One-off presentation-only integration. No database, price, race or save changes.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const walk = dir => fs.readdirSync(dir, {withFileTypes: true}).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
for (const file of walk(path.join(root, 'src')).filter(f => /\.(jsx|js|css)$/.test(f))) {
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(/\/images\/(city|dealer|fuel|garage|login|meet|setting|shop|street|track|used|workshop)\.png/g, '/images/world/$1.png');
  text = text.replace(/\/images\/(part|work|places)\//g, '/images/world/$1/');
  text = text.replace('/images/computer.png', '/images/world/setting.png');
  if (file.endsWith('Autodrome.jsx')) text = text.replace('src={`/images/${image}`}', 'src={`/images/world/${image}`}');
  if (text !== fs.readFileSync(file, 'utf8')) fs.writeFileSync(file, text);
}
