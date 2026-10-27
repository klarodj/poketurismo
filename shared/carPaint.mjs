// Cosmetic only: never feed paint into performance, preparation hashes or race RNG.
const CAR_PAINTS = [
 {id:'rosso',name:'Rosso pastello',hex:'#b91c1c'},
 {id:'blu',name:'Blu scuro',hex:'#234486'},
 {id:'verde',name:'Verde bottiglia',hex:'#195335'},
 {id:'nero',name:'Nero',hex:'#171b1f'},
 {id:'bianco',name:'Bianco',hex:'#edede8'},
 {id:'argento',name:'Grigio argento',hex:'#9da8af'},
 {id:'giallo',name:'Giallo pastello',hex:'#f2cc20'},
];
const REPAINT_PRICE=2500;
const validPaint=value=>CAR_PAINTS.some(p=>p.id===value);
function seededPaint(seed){let n=2166136261;for(const c of String(seed)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return CAR_PAINTS[(n>>>0)%CAR_PAINTS.length].id;}
function paintFor(car){return validPaint(car?.paintColour)?car.paintColour:seededPaint(car?.car?.image||car?.image||'default');}
const paintName=colour=>CAR_PAINTS.find(p=>p.id===colour)?.name||'Colore di serie';
export {CAR_PAINTS,REPAINT_PRICE,validPaint,seededPaint,paintFor,paintName};
