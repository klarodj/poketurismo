export const TRACK_SECTOR_COLORS=['#000080','#800000','#800080','#008000','#ff0000','#008080','#808000','#0000ff'];
import {periodTrackName} from './periodWorld.mjs';
// Presentation only. These club roadbooks never replace race geometry or saved layouts.
const rows = [
 ['bassa','Autodromo della Bassa · Cremonese','circuit','plain','Campi, pioppi e il piccolo paddock del club.',[[48,151],[270,151],[287,135],[275,113],[238,113],[250,87],[220,70],[245,47],[210,31],[68,31],[42,49],[60,70],[102,70],[116,92],[86,109],[48,109]]],
 ['santerno','Circuito del Santerno · Imolese','circuit','hills','Tribune basse, varianti e colline del Santerno.',[[52,148],[123,148],[140,133],[152,145],[220,138],[278,112],[260,76],[224,66],[214,43],[176,30],[155,53],[121,47],[108,69],[68,72],[42,111]]],
 ['ticino','Pista club del Ticino · Novarese','circuit','plain','Risaie, filari e officine dietro la rete.',[[41,146],[269,146],[287,125],[265,104],[212,104],[212,80],[269,80],[283,56],[258,34],[143,34],[124,58],[86,58],[86,88],[43,88],[30,110]]],
 ['san-rocco','Pistino di San Rocco · Pavese','circuit','plain','Pochi box, gomme accatastate e utilitarie del club.',[[58,146],[254,146],[274,127],[254,106],[197,106],[181,88],[201,70],[252,70],[269,49],[247,31],[80,31],[54,50],[54,79],[106,79],[124,98],[106,117],[58,117]]],
 ['garda','Autodromo del Garda · Bresciano','circuit','lake','Pioggia sul paddock e le Prealpi dietro il lago.',[[42,150],[265,150],[285,125],[261,106],[235,113],[218,91],[192,99],[176,75],[150,83],[138,57],[175,39],[245,39],[270,58],[289,43],[272,24],[85,24],[54,54],[76,77],[41,109]]],
 ['langhe','Circuito delle Colline · Langhe','circuit','hills','Nebbia leggera, vigneti e colline dietro i cordoli.',[[53,146],[126,157],[172,135],[247,142],[281,109],[255,87],[234,53],[190,31],[158,51],[123,36],[88,53],[66,82],[40,105]]],
 ['euganei','Anello dei Colli · Euganei','circuit','hills','Asfalto bagnato e colli scuri oltre le reti.',[[48,151],[163,151],[181,129],[193,144],[269,126],[289,98],[256,84],[241,51],[202,31],[179,54],[152,37],[137,66],[106,53],[86,83],[50,88],[30,120]]],
 ['cava','Pista della Cava · Veronese','circuit','quarry','Pietra chiara, dislivelli e barriere da pista di provincia.',[[45,145],[264,145],[284,123],[269,99],[225,104],[222,74],[196,69],[195,43],[158,29],[126,49],[87,42],[52,68],[72,90],[45,113]]],
 ['cascina','Circuito della Cascina · Lodigiano','circuit','plain','Una cascina, i campi e una domenica di pioggia.',[[46,149],[263,149],[282,127],[259,107],[219,114],[195,95],[165,111],[141,86],[188,65],[250,65],[269,44],[245,27],[79,27],[51,52],[70,76],[43,107]]],
 ['po','Pista club del Po · Ferrarese','circuit','plain','Argini, pioppi e il rettilineo del club ferrarese.',[[46,151],[274,151],[290,130],[268,107],[239,88],[272,66],[258,39],[219,26],[181,49],[151,38],[114,58],[78,44],[47,66],[35,105]]],
 ['stelvio','Stelvio · Prato → passo','point-to-point','alpine','Tornanti, muretti e cime sopra la Val Venosta.',[[40,164],[99,148],[54,131],[150,117],[76,100],[206,86],[126,70],[250,54],[184,38],[279,23]]],
 ['cisa','Cisa · strada del passo','point-to-point','woodland','Bosco appenninico, vecchio guardrail e bar del passo.',[[39,166],[77,148],[66,126],[112,119],[131,94],[169,102],[205,78],[190,58],[233,48],[270,24]]],
 ['iseo','Lago d’Iseo · porto → galleria','point-to-point','lake','Porticciolo, case sul lago e la vecchia galleria.',[[78,165],[98,147],[88,125],[115,110],[108,89],[148,77],[161,58],[205,47],[244,24]]],
 ['cervo','Passo del Cervo · Biellese','point-to-point','night','Fari alogeni, tornanti e il bar delle Prealpi biellesi.',[[41,163],[115,146],[60,127],[175,113],[101,95],[232,81],[153,62],[272,46],[220,25]]],
 ['cadore','Valico della Neve · Cadore','point-to-point','snow','Neve ai bordi della strada e abeti sotto le Dolomiti.',[[40,164],[115,148],[65,130],[160,111],[98,94],[222,79],[157,61],[272,45],[227,24]]],
 ['santuario','Salita del Santuario · Canavese','point-to-point','fog','Nebbia tra castagni, muretti e il santuario in alto.',[[40,164],[123,151],[60,133],[168,118],[91,101],[215,86],[143,69],[271,51],[213,35],[278,22]]],
 ['lario','Lario · statale del lago','point-to-point','wet-lake','Statale bagnata, monti sul lago e case di paese.',[[75,163],[101,146],[86,122],[137,105],[118,83],[171,66],[211,69],[245,48],[270,24]]],
 ['seriana','Val Seriana · strada delle cave','point-to-point','quarry','Cave, capannoni e curve verso le Prealpi bergamasche.',[[40,165],[110,149],[64,130],[175,113],[107,96],[230,78],[168,59],[273,43],[235,23]]],
 ['riviera','Riviera di Levante · statale costiera','point-to-point','coast','Aurelia, muretti sul mare e case liguri color pastello.',[[43,157],[75,141],[114,149],[132,124],[173,115],[161,91],[208,76],[229,87],[253,59],[276,29]]],
 ['castagni','Discesa dei Castagni · Valsesia','point-to-point','wet-woodland','Bosco bagnato, guardrail e tornanti verso il fondovalle.',[[269,24],[195,41],[250,58],[139,76],[210,94],[95,111],[161,129],[57,146],[91,166]]],
 ['parcheggio','Parcheggio · anello dei magazzini','point-to-point','parking','Parcheggio del centro commerciale, magazzini e lampioni.',[[36,158],[280,158],[280,113],[66,113],[66,68],[250,68],[250,28]]],
 ['officine','Zona industriale · viale delle officine','point-to-point','industrial','Capannoni, cancelli e vecchie insegne delle officine.',[[36,159],[142,159],[142,120],[278,120],[278,77],[78,77],[78,29],[251,29]]],
 ['tangenziale','Tangenziale · svincolo nord → interporto','point-to-point','motorway','Svincoli, barriere e il piazzale dell’interporto di notte.',[[32,158],[113,158],[143,132],[192,130],[222,106],[271,106],[287,86],[272,64],[239,65],[225,87],[202,80],[204,51],[249,26]]],
 ['bassa-officine','Strada delle officine · Bassa','point-to-point','industrial','Campi e officine lungo una strada della Bassa.',[[36,159],[88,159],[113,137],[159,137],[177,111],[150,90],[183,68],[224,68],[252,42],[280,24]]],
 ['prealpi','Salita della cava · Prealpi','point-to-point','quarry','Una cava, vecchi muri in pietra e tornanti prealpini.',[[37,164],[112,147],[65,129],[165,111],[104,92],[222,74],[162,55],[273,35],[245,23]]],
 ['monza','Monza','circuit','park','Parco, vecchi box e lunghi rettilinei dell’autodromo.',[[93,155],[242,155],[272,134],[268,107],[245,90],[243,45],[222,27],[197,34],[163,34],[150,53],[135,45],[102,70],[68,88],[57,118],[75,135]]],
 ['scuola','Circuito Scuola · Laboratorio tattico','circuit','plain','Pistino di scuola, box bassi e officine del club.',null],
];
export const TRACK_VISUALS=rows.map(([key,name,format,terrain,caption,points])=>({key,name,format,terrain,caption,points,image:`/images/tracks/${key}.png`}));
export function trackVisual(name){return TRACK_VISUALS.find(track=>track.name===periodTrackName(name))||null;}
// Split the illustrated roadbook in the same order and proportions as the actual sectors.
export function mapSectors(points,sections=[],closed=false){
 if(!points?.length)return [];
 const route=closed?[...points,points[0]]:points;
 const edges=route.slice(1).map((point,i)=>({a:route[i],b:point,length:Math.hypot(point[0]-route[i][0],point[1]-route[i][1])}));
 const total=edges.reduce((sum,edge)=>sum+edge.length,0);
 const weights=sections.length?sections.map(section=>Math.max(1,(section.segments||[]).reduce((sum,s)=>sum+(Number(s.lengthM)||0),0))):[1];
 const weightSum=weights.reduce((sum,n)=>sum+n,0);
 let from=0;
 return weights.map((weight,index)=>{const to=from+total*weight/weightSum,path=[];let offset=0;for(const edge of edges){const start=Math.max(from,offset),end=Math.min(to,offset+edge.length);if(end>start+1e-8){const point=at=>[edge.a[0]+(edge.b[0]-edge.a[0])*(at-offset)/edge.length,edge.a[1]+(edge.b[1]-edge.a[1])*(at-offset)/edge.length];if(!path.length)path.push(point(start));path.push(point(end));}offset+=edge.length;}from=to;return{index,points:path};});
}
export function sectorMapLabel(points){let remaining=points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),0)/2;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(remaining<=length)return[a[0]+(b[0]-a[0])*remaining/length,a[1]+(b[1]-a[1])*remaining/length];remaining-=length;}return points[0]||[160,100];}
