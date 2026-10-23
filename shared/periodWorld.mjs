// Fictional motoring clubs and provincial roads, northern Italy, circa 2002.
// Aliases preserve saved races, invitations and the identity of existing tracks.
export const GAME_ERA='2002';
export const WORLD_TRACKS=[
 ['test track','Strada delle officine · Bassa','Bassa padana, Lombardia'],
 ['quarn','Salita della cava · Prealpi','Prealpi lombarde, Lombardia'],
 ['Mugello · Toscana','Autodromo della Bassa · Cremonese','Bassa cremonese, Lombardia'],
 ['Imola · Emilia-Romagna','Circuito del Santerno · Imolese','Imolese, Emilia-Romagna'],
 ['Vallelunga · Lazio','Pista club del Ticino · Novarese','Novarese, Piemonte'],
 ['Tsukuba · Ibaraki','Pistino di San Rocco · Pavese','Pavese, Lombardia'],
 ['Suzuka · Mie','Autodromo del Garda · Bresciano','Garda bresciano, Lombardia'],
 ['Brands Hatch · Kent','Circuito delle Colline · Langhe','Langhe, Piemonte'],
 ['Spa · Ardenne','Anello dei Colli · Euganei','Colli Euganei, Veneto'],
 ['Laguna Seca · California','Pista della Cava · Veronese','Veronese, Veneto'],
 ['Interlagos · San Paolo','Circuito della Cascina · Lodigiano','Lodigiano, Lombardia'],
 ['Estoril · Cascais','Pista club del Po · Ferrarese','Ferrarese, Emilia-Romagna'],
 ['Stelvio · Prato → passo','Stelvio · Prato → passo','Val Venosta, Alto Adige'],
 ['Futa · Barberino → passo','Cisa · strada del passo','Appennino parmense, Emilia-Romagna'],
 ['Amalfitana · Maiori → Minori','Lago d’Iseo · porto → galleria','Sebino, Lombardia'],
 ['Turini · La Bollène → colle','Passo del Cervo · Biellese','Prealpi biellesi, Piemonte'],
 ['Grossglockner · Ferleiten → Fuscher Törl','Valico della Neve · Cadore','Cadore, Veneto'],
 ['Irohazaka · Nikko → Akechidaira','Salita del Santuario · Canavese','Canavese, Piemonte'],
 ['Hakone · lago Ashi → crinale','Lario · statale del lago','Lario, Lombardia'],
 ['Transfăgărășan · Bâlea cascata → lago','Val Seriana · strada delle cave','Val Seriana, Lombardia'],
 ['Great Ocean Road · Lorne → Wye River','Riviera di Levante · statale costiera','Levante ligure, Liguria'],
 ['Trollstigen · altopiano → valle','Discesa dei Castagni · Valsesia','Valsesia, Piemonte'],
 ['Parcheggio · anello dei magazzini','Parcheggio · anello dei magazzini','Cintura milanese, Lombardia'],
 ['Zona industriale · viale delle officine','Zona industriale · viale delle officine','Bassa bergamasca, Lombardia'],
 ['Tangenziale · svincolo nord → porto','Tangenziale · svincolo nord → interporto','Cintura padovana, Veneto'],
];
export function periodTrackName(name){return WORLD_TRACKS.find(row=>row[0]===name||row[1]===name)?.[1]||name;}
export function periodTrackLocation(name){return WORLD_TRACKS.find(row=>row[0]===name||row[1]===name)?.[2]||null;}
export function trackAliases(name){const row=WORLD_TRACKS.find(row=>row[0]===name||row[1]===name);return row?[...new Set(row.slice(0,2))]:[name];}
export const WORLD_CUPS=[['GT 280 · Serie Internazionale','Trofeo GT 280 · Nord Italia'],['Supercar · Masters','Coppa Gran Turismo · Club del Nord']];
export function periodCupName(name){return WORLD_CUPS.find(row=>row.includes(name))?.[1]||name;}
export function cupAliases(name){return WORLD_CUPS.find(row=>row.includes(name))||[name];}
