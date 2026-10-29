import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {TRACK_VISUALS,trackVisual,mapSectors,sectorMapLabel} from '../shared/trackVisuals.mjs';
import {TRACK_CATALOG} from '../shared/trackCatalog.mjs';
import {STREET_TRACKS} from '../shared/streetCatalog.mjs';
import {WORLD_TRACKS} from '../shared/periodWorld.mjs';
import {DEMO_TRACK} from '../shared/trackGeometry.mjs';
test('every northern route has its own roadbook and environment, including original tracks and school',()=>{
 const names=[...TRACK_CATALOG,...STREET_TRACKS,{name:'Monza'},{name:'Strada delle officine · Bassa'},{name:'Salita della cava · Prealpi'},DEMO_TRACK].map(t=>t.name);
 assert.equal(TRACK_VISUALS.length,27);assert.equal(new Set(names).size,27);assert.equal(new Set(TRACK_VISUALS.map(t=>t.image)).size,27);
 for(const name of names){const visual=trackVisual(name);assert.ok(visual,name);assert.ok(visual.caption.length>20);assert.ok(/^\/images\/world\/tracks\/[a-z-]+\.png$/.test(visual.image));}
 for(const[oldName,newName]of WORLD_TRACKS)assert.equal(trackVisual(oldName),trackVisual(newName));assert.equal(trackVisual('Percorso privato non in catalogo'),null);
 for(const track of [...TRACK_CATALOG,...STREET_TRACKS])assert.equal(trackVisual(track.name).format,track.format);
});
test('roadbooks have distinct shapes; open roads and closed circuits keep their endpoints',()=>{
 const shapes=[];
 for(const visual of TRACK_VISUALS.filter(v=>v.points)){assert.ok(visual.points.length>=6);assert.ok(visual.points.every(p=>p.every(Number.isFinite)&&p[0]>=15&&p[0]<=300&&p[1]>=20&&p[1]<=180));shapes.push(JSON.stringify(visual.points));const groups=mapSectors(visual.points,[],visual.format==='circuit');assert.deepEqual(groups[0].points[0],visual.points[0]);const last=groups.at(-1).points.at(-1),end=visual.format==='circuit'?visual.points[0]:visual.points.at(-1);assert.ok(Math.hypot(last[0]-end[0],last[1]-end[1])<1e-8);}
 assert.equal(new Set(shapes).size,shapes.length);
});
test('roadbook sectors preserve distance proportions, order and continuity without changing physics data',()=>{
 const points=Object.freeze([Object.freeze([0,0]),Object.freeze([10,0]),Object.freeze([10,10])]);const sections=Object.freeze([{segments:[{lengthM:1}]},{segments:[{lengthM:3}]}]);
 const groups=mapSectors(points,sections);assert.deepEqual(groups[0].points,[[0,0],[5,0]]);assert.deepEqual(groups[1].points,[[5,0],[10,0],[10,10]]);assert.deepEqual(sectorMapLabel(groups[1].points),[10,2.5]);assert.deepEqual(points,[[0,0],[10,0],[10,10]]);assert.deepEqual(mapSectors(null,sections),[]);
});
test('all eight tactical sectors fit every illustrated route with continuous joins',()=>{
 for(const visual of TRACK_VISUALS.filter(t=>t.points)){const groups=mapSectors(visual.points,DEMO_TRACK.sections,visual.format==='circuit');assert.equal(groups.length,8);for(let i=0;i<8;i++){assert.ok(groups[i].points.length>=2);assert.ok(groups[i].points.flat().every(Number.isFinite));if(i){const a=groups[i-1].points.at(-1),b=groups[i].points[0];assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1])<1e-8);}}}
});
test('each final environment is a compact PNG in the game asset directory',()=>{
 for(const visual of TRACK_VISUALS){const path='public'+visual.image;assert.ok(existsSync(path),path);const png=readFileSync(path);assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10]);assert.equal(png.readUInt32BE(16),320);assert.equal(png.readUInt32BE(20),180);assert.ok(png.length<400000,'Low resolution export too large: '+visual.key);}
});
