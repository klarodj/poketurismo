// Interpretations for gameplay, not surveyed replicas. Distances are playable metres.
const rows = [
  ['Mugello · Toscana', 'Scarperia, Italia', 'Track', 5245, 41, 'sunny', 3, 'Rettifilo veloce e cambi di direzione sulle colline.', [2,5,6,3,4,10,5,6,9,11,5,3,2]],
  ['Imola · Emilia-Romagna', 'Imola, Italia', 'Track', 4909, 35, 'sunny', 3, 'Varianti, saliscendi e frenate da preparare.', [2,11,1,11,10,3,1,12,9,5,6,11,2]],
  ['Vallelunga · Lazio', 'Campagnano, Italia', 'Track', 4085, 30, 'sunny', 2, 'Primo settore rapido e finale lento per allenare il rilancio.', [2,5,6,1,3,4,12,1,11,5,2]],
  ['Tsukuba · Ibaraki', 'Shimotsuma, Giappone', 'Track', 2045, 5, 'sunny', 1, 'Pista corta, adatta alle piccole auto e alla precisione.', [1,12,1,3,4,1,13,2,5]],
  ['Suzuka · Mie', 'Suzuka, Giappone', 'Track', 5807, 40, 'rainy', 4, 'Esse in sequenza e curvoni da affrontare con ritmo.', [2,5,6,5,6,10,3,1,13,2,6,11,2]],
  ['Brands Hatch · Kent', 'Kent, Regno Unito', 'Track', 3916, 35, 'foggy', 3, 'Curve ondulate e visibilità ridotta.', [1,5,9,10,12,4,1,5,6,9,3,2]],
  ['Spa · Ardenne', 'Stavelot, Belgio', 'Track', 7004, 100, 'rainy', 5, 'Allunghi, compressioni e curve veloci sotto la pioggia.', [1,12,9,8,10,5,2,11,3,4,9,6,5,2,11]],
  ['Laguna Seca · California', 'Monterey, Stati Uniti', 'Track', 3602, 55, 'sunny', 3, 'Tornanti e una discesa tecnica che richiede controllo.', [2,13,1,5,6,10,1,11,9,4,12,2]],
  ['Interlagos · San Paolo', 'San Paolo, Brasile', 'Track', 4309, 43, 'rainy', 4, 'Frenate in pendenza e tratto centrale guidato.', [2,11,9,6,2,3,4,12,10,5,6,2]],
  ['Estoril · Cascais', 'Cascais, Portogallo', 'Track', 4182, 30, 'sunny', 2, 'Lungo rettifilo, curve ampie e una variante lenta.', [2,3,5,4,1,6,12,11,10,5,2]],
  ['Stelvio · Prato → passo', 'Alto Adige, Italia', 'Touge', 12000, 1100, 'sunny', 4, 'Salita alpina: tornanti ravvicinati e gestione della trazione.', [1,10,12,1,13,10,12,13,1,10,12,13,10,1]],
  ['Futa · Barberino → passo', 'Appennino toscano, Italia', 'Touge', 9500, 600, 'sunny', 2, 'Misto in salita con tratti scorrevoli e cambi marcia frequenti.', [1,5,10,3,1,4,10,6,11,1,12,10]],
  ['Amalfitana · Maiori → Minori', 'Costiera Amalfitana, Italia', 'City', 3200, 80, 'sunny', 1, 'Sprint costiero breve: conta la pulizia più della potenza.', [1,3,4,1,5,3,11,4,1]],
  ['Turini · La Bollène → colle', 'Alpi Marittime, Francia', 'Touge', 12500, 1000, 'night', 4, 'Salita notturna con inversioni e tornanti.', [1,10,12,3,13,10,14,1,15,10,12,13,1]],
  ['Grossglockner · Ferleiten → Fuscher Törl', 'Salisburghese, Austria', 'Touge', 13000, 1150, 'snowy', 5, 'Versione invernale di gioco: aderenza delicata e salita lunga.', [1,10,12,10,13,1,10,11,12,13,10,1,12]],
  ['Irohazaka · Nikko → Akechidaira', 'Tochigi, Giappone', 'Touge', 8500, 600, 'foggy', 4, 'Sequenza serrata di tornanti con nebbia.', [1,10,12,13,12,10,13,1,12,13,10,12]],
  ['Hakone · lago Ashi → crinale', 'Kanagawa, Giappone', 'Touge', 7000, 350, 'rainy', 3, 'Curve medie e veloci sul bagnato, con cambi di quota.', [1,10,5,6,3,1,11,10,5,4,9,2]],
  ['Transfăgărășan · Bâlea cascata → lago', 'Carpazi, Romania', 'Touge', 11000, 900, 'sunny', 4, 'Salita panoramica con allunghi brevi e tornanti.', [1,10,12,1,13,5,10,11,12,13,10,2]],
  ['Great Ocean Road · Lorne → Wye River', 'Victoria, Australia', 'Highway', 16000, 180, 'sunny', 2, 'Misto costiero scorrevole: ritmo e risparmio gomme.', [2,5,6,1,3,5,9,4,1,6,5,2]],
  ['Trollstigen · altopiano → valle', 'Møre og Romsdal, Norvegia', 'Touge', 7500, 700, 'rainy', 5, 'Discesa bagnata, tornanti e gestione della frenata.', [1,9,12,9,13,1,9,12,13,9,11,1]],
];
export const TRACK_CATALOG = rows.map(([name, location, type, distanceM, elevation, weather, difficulty, description, sections]) => ({name,location,type,distanceM,elevation,weather,difficulty,description,sections,format:type === 'Track' ? 'circuit' : 'point-to-point'}));
export function trackCatalogInfo(name) {
  const entry = TRACK_CATALOG.find(track => track.name === name);
  if (!entry) return null;
  const {location,difficulty,description,format}=entry;
  return {location,difficulty,description,format,interpretation:true};
}
