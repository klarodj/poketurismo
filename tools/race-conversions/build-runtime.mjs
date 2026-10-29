import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(dir,'../..'),c=JSON.parse(fs.readFileSync(dir+'/catalogue.json'));
const rows=Object.fromEntries(c.models.map(m=>[m.stock.image,{key:m.key,name:m.candidate,profile:m.profile,revision:JSON.parse(fs.readFileSync(dir+'/records/'+m.key+'.json')).revision}]));
fs.writeFileSync(root+'/shared/racePreparationCatalog.mjs','// Approved racing sprites. Rebuild from curated catalogue/records; never regenerate images.\nexport const RACE_PREPARATIONS='+JSON.stringify(rows,null,2)+';\n');
