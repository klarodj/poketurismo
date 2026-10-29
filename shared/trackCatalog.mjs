import {REAL_TRACKS} from './realTracks.mjs';
// Provincial clubs and roads in northern Italy circa 2002: fictional gameplay layouts.
import { periodTrackName } from './periodWorld.mjs';
import { STREET_TRACKS } from './streetCatalog.mjs';
const rows = [
  ['Autodromo della Bassa · Cremonese', 'Bassa cremonese, Lombardia', 'Track', 5245, 41, 'sunny', 3, 'Rettilineo lungo tra campi e capannoni; il club gira la domenica.', [2,5,6,3,4,10,5,6,9,11,5,3,2]],
  ['Circuito del Santerno · Imolese', 'Imolese, Emilia-Romagna', 'Track', 4909, 35, 'sunny', 3, 'Varianti, saliscendi e frenate da preparare.', [2,11,1,11,10,3,1,12,9,5,6,11,2]],
  ['Pista club del Ticino · Novarese', 'Novarese, Piemonte', 'Track', 4085, 30, 'sunny', 2, 'Pista del club tra risaie e officine: allungo iniziale e finale guidato.', [2,5,6,1,3,4,12,1,11,5,2]],
  ['Pistino di San Rocco · Pavese', 'Pavese, Lombardia', 'Track', 2045, 5, 'sunny', 1, 'Il pistino del club: piccole auto, poche tribune e tanto da imparare.', [1,12,1,3,4,1,13,2,5]],
  ['Autodromo del Garda · Bresciano', 'Garda bresciano, Lombardia', 'Track', 5807, 40, 'rainy', 4, 'Esse in sequenza e curvoni da affrontare con ritmo.', [2,5,6,5,6,10,3,1,13,2,6,11,2]],
  ['Circuito delle Colline · Langhe', 'Langhe, Piemonte', 'Track', 3916, 35, 'foggy', 3, 'Curve ondulate e visibilità ridotta.', [1,5,9,10,12,4,1,5,6,9,3,2]],
  ['Anello dei Colli · Euganei', 'Colli Euganei, Veneto', 'Track', 7004, 100, 'rainy', 5, 'Allunghi, compressioni e curve veloci sotto la pioggia.', [1,12,9,8,10,5,2,11,3,4,9,6,5,2,11]],
  ['Pista della Cava · Veronese', 'Veronese, Veneto', 'Track', 3602, 55, 'sunny', 3, 'Tornanti e una discesa tecnica che richiede controllo.', [2,13,1,5,6,10,1,11,9,4,12,2]],
  ['Circuito della Cascina · Lodigiano', 'Lodigiano, Lombardia', 'Track', 4309, 43, 'rainy', 4, 'Frenate in pendenza e tratto centrale guidato.', [2,11,9,6,2,3,4,12,10,5,6,2]],
  ['Pista club del Po · Ferrarese', 'Ferrarese, Emilia-Romagna', 'Track', 4182, 30, 'sunny', 2, 'Lungo rettifilo, curve ampie e una variante lenta.', [2,3,5,4,1,6,12,11,10,5,2]],
  ['Stelvio · Prato → passo', 'Val Venosta, Alto Adige', 'Touge', 12000, 1100, 'sunny', 4, 'Salita alpina: tornanti ravvicinati e gestione della trazione.', [1,10,12,1,13,10,12,13,1,10,12,13,10,1]],
  ['Cisa · strada del passo', 'Appennino parmense, Emilia-Romagna', 'Touge', 9500, 600, 'sunny', 2, 'Misto in salita con tratti scorrevoli e cambi marcia frequenti.', [1,5,10,3,1,4,10,6,11,1,12,10]],
  ['Lago d’Iseo · porto → galleria', 'Sebino, Lombardia', 'City', 3200, 80, 'sunny', 1, 'Sprint sul lungolago tra il porto e la vecchia galleria.', [1,3,4,1,5,3,11,4,1]],
  ['Passo del Cervo · Biellese', 'Prealpi biellesi, Piemonte', 'Touge', 12500, 1000, 'night', 4, 'Salita notturna con inversioni e tornanti.', [1,10,12,3,13,10,14,1,15,10,12,13,1]],
  ['Valico della Neve · Cadore', 'Cadore, Veneto', 'Touge', 13000, 1150, 'snowy', 5, 'Il valico dopo la nevicata: salita lunga e aderenza da gestire.', [1,10,12,10,13,1,10,11,12,13,10,1,12]],
  ['Salita del Santuario · Canavese', 'Canavese, Piemonte', 'Touge', 8500, 600, 'foggy', 4, 'Sequenza serrata di tornanti con nebbia.', [1,10,12,13,12,10,13,1,12,13,10,12]],
  ['Lario · statale del lago', 'Lario, Lombardia', 'Touge', 7000, 350, 'rainy', 3, 'Curve medie e veloci sul bagnato, con cambi di quota.', [1,10,5,6,3,1,11,10,5,4,9,2]],
  ['Val Seriana · strada delle cave', 'Val Seriana, Lombardia', 'Touge', 11000, 900, 'sunny', 4, 'Salita panoramica con allunghi brevi e tornanti.', [1,10,12,1,13,5,10,11,12,13,10,2]],
  ['Riviera di Levante · statale costiera', 'Levante ligure, Liguria', 'Highway', 16000, 180, 'sunny', 2, 'Aurelia di provincia: curve sul mare e bar al distributore.', [2,5,6,1,3,5,9,4,1,6,5,2]],
  ['Discesa dei Castagni · Valsesia', 'Valsesia, Piemonte', 'Touge', 7500, 700, 'rainy', 5, 'Discesa bagnata, tornanti e gestione della frenata.', [1,9,12,9,13,1,9,12,13,9,11,1]],
];
export const TRACK_CATALOG = [...rows.map(([name, location, type, distanceM, elevation, weather, difficulty, description, sections]) => ({name,location,type,distanceM,elevation,weather,difficulty,description,sections,format:type === 'Track' ? 'circuit' : 'point-to-point'})),...REAL_TRACKS];
export function trackCatalogInfo(name) {
  if(name==='Monza')return {title:'Monza · Autodromo Nazionale',location:'Monza, Lombardia',difficulty:4,description:'Prima Variante, Roggia, Lesmo, Ascari e Parabolica nel parco. Sessione club storica del gioco: la distanza non rappresenta un giro omologato.',format:'circuit',interpretation:true,real:true};
  const entry = [...TRACK_CATALOG, ...STREET_TRACKS].find(track => track.name === periodTrackName(name));
  if (!entry) return null;
  const {location,difficulty,description,format,real,referencePeriod,eraException}=entry;
  return {location,difficulty,description,format,...(real?{real,referencePeriod,eraException}:{}),interpretation:!STREET_TRACKS.includes(entry)};
}
