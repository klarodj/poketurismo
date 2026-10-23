import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {periodTrackName,periodCupName} from '../shared/periodWorld.mjs';
import {trackCatalogInfo,TRACK_CATALOG} from '../shared/trackCatalog.mjs';
import {STREET_TRACKS,STREET_ZONES} from '../shared/streetCatalog.mjs';
const require=createRequire(import.meta.url);
test('old track and championship labels resolve to the northern setting without losing catalogue rules',()=>{
 assert.equal(periodTrackName('Tsukuba · Ibaraki'),'Pistino di San Rocco · Pavese');assert.equal(periodCupName('GT 280 · Serie Internazionale'),'Trofeo GT 280 · Nord Italia');assert.deepEqual(trackCatalogInfo('Tsukuba · Ibaraki'),trackCatalogInfo('Pistino di San Rocco · Pavese'));
 for(const track of [...TRACK_CATALOG,...STREET_TRACKS]){assert.match(track.location,/Lombardia|Piemonte|Veneto|Alto Adige|Emilia-Romagna|Liguria/);assert.ok(!/Giappone|California|Brasile|Portogallo|Regno Unito/.test(track.name+' '+track.location));}
 for(const zone of STREET_ZONES)for(const name of zone.tracks)assert.ok([...TRACK_CATALOG,...STREET_TRACKS].some(track=>track.name===name),name);
});
test('frozen championship calendars and historical results are relabelled only in their public projection',()=>{
 const {publicEntry}=require('../server/championships');const contract={version:1,playerName:'Lele',championship:{name:'GT 280 · Serie Internazionale',rounds:[{ord:1,trackId:11,track:{id:11,name:'Tsukuba · Ibaraki'}}]},drivers:[]};const row={id:1,contract:JSON.stringify(contract),results:JSON.stringify([{round:1,trackId:11,trackName:'Tsukuba · Ibaraki',classification:[{id:'player',timeMs:100000,points:10,position:1}]}])};const before=JSON.stringify(row),shown=publicEntry(row);
 assert.equal(shown.championship.name,'Trofeo GT 280 · Nord Italia');assert.equal(shown.championship.rounds[0].track.name,'Pistino di San Rocco · Pavese');assert.equal(shown.results[0].trackName,'Pistino di San Rocco · Pavese');assert.equal(shown.results[0].classification[0].timeMs,100000);assert.equal(JSON.stringify(row),before);
});
