const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { PNG } = require('../paint-prototype/node_modules/pngjs');
const root = path.resolve(__dirname, '../..'), records = require('./records.json');
const assets = [];
for (const record of records) {
  const input = path.join(__dirname, 'inputs', record.id + '.png');
  if (!fs.existsSync(input)) fs.copyFileSync(record.source, input);
  const source = fs.readFileSync(input), src = PNG.sync.read(source), out = new PNG({width:64,height:64});
  for (let y=0;y<64;y++) for (let x=0;x<64;x++) {
    const sx=Math.min(src.width-1,Math.floor((x+.5)*src.width/64)),sy=Math.min(src.height-1,Math.floor((y+.5)*src.height/64));
    src.data.copy(out.data,(y*64+x)*4,(sy*src.width+sx)*4,(sy*src.width+sx)*4+4);
  }
  const output = 'public/images/story/' + record.id + '.png', bytes = PNG.sync.write(out);
  fs.mkdirSync(path.dirname(path.join(root, output)), {recursive:true});
  fs.writeFileSync(path.join(root, output), bytes);
  assets.push({id:record.id,input:'tools/story-art/inputs/'+record.id+'.png',sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),output,width:64,height:64,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
}
fs.writeFileSync(path.join(__dirname,'manifest.json'),JSON.stringify({tool:'image_gen (built-in)',preparation:'Nearest-neighbour 64x64 resize, no repainting or changes to existing assets',assets},null,2)+'\n');
console.log('Quattro ritratti NPC 64x64 preparati.');
