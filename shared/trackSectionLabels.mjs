// Display labels only: keep stored names and physics inference unchanged.
const labels={
 'short straight':'Rettilineo breve','long straight':'Rettilineo lungo',
 'slow right turn':'Curva lenta a destra','slow left turn':'Curva lenta a sinistra',
 'fast right turn':'Curva veloce a destra','fast left turn':'Curva veloce a sinistra',
 hump:'Dosso',depression:'Avvallamento',descent:'Discesa',climb:'Salita',chicane:'Variante',
 'hairpin right':'Tornante a destra','hairpin left':'Tornante a sinistra',
 'right inversion':'Inversione a destra','left inversion':'Inversione a sinistra',obstacle:'Ostacolo',
};
export function trackSectionLabel(name){
 if(typeof name!=='string')return '';
 return name.split(/\s*→\s*/u).map(part=>labels[part.toLowerCase()]||part).join(' → ');
}
