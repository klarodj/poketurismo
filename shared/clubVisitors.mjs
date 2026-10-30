// Shared fictional attendance: refreshing does not reroll the parking lot.
export const CLUB_VISIT_INTERVAL = 30 * 60 * 1000;
const ids=['lele-riva','giada-bellini','sergio-brambilla','tommaso-villa'];
export function clubVisitors(now=Date.now()) {
 const slot=Math.floor(now/CLUB_VISIT_INTERVAL);
 let n=((slot%2147483647)+2147483647)%2147483647;
 n=Math.imul(n^0x45d9f3b,0x45d9f3b)>>>0;
 const count=n%5===0?0:1+n%2;
 const first=n%ids.length;
 return Array.from({length:count},(_,i)=>ids[(first+i*(1+(n%2)))%ids.length]);
}
const anecdotes={
 'lele-riva':['Ho passato un sabato a cercare un rumore nel cruscotto. Era una cassetta senza custodia nel portaoggetti. Franco ancora mi prende in giro.','Il quaderno serve: quando cerco un pezzo usato segno anche quello che devo lasciare per gomme e benzina. La Cinquecento deve riportarmi al lavoro lunedì.'],
 'giada-bellini':['Una domenica ho smesso di inseguire il tempo e mi sono concentrata su una frenata sola. Alla fine della giornata i giri erano diventati molto più simili.','Tengo ancora i fogli dei primi giri dell’Integra. Il cronometro ti dice quanto, gli appunti ti aiutano a ricordare perché.'],
 'sergio-brambilla':['A uno slalom aiutavo un amico ai box. Avevamo portato mezza officina e dimenticato il manometro. Da allora la lista la scrivo prima di caricare.','Questa 75 la riconosco dai rumori. Non vuol dire ignorarli: vuol dire sapere quando fermarsi e dare un’occhiata.'],
 'tommaso-villa':['La prima volta al club tutti guardavano la Ferrari. Poi ho parcheggiato storto e hanno cominciato a guardare me. Il venerdì dopo sono tornato lo stesso.','Mi piace arrivare presto e restare a parlare al bar. La F355 si fa notare da sola; per conoscere le persone devo scendere anch’io.']
};
export function clubConversation(id,status,now=Date.now()) {
 if(id==='lele-riva'){
 const lines={available:'Hai visto il mio SMS? Se ti va, c’è quel giro del club da fare. Nessuna fretta: apri gli incarichi quando sei pronto.',accepted:'Allora, come sei messo per la domenica al club? Hai già sistemato auto, gomme e benzina? Basta arrivare in fondo a una nuova gara singola, mica fare subito il fenomeno.', 'in-progress':'Come sta andando quel giro al club? Se hai dovuto fermarti non è un problema: rimetti a posto la macchina e riprova. Il nostro accordo resta quello.',paused:'Hai fatto bene a prenderti il tempo che serve. Quando vuoi riprendere quel giro del club trovi tutto negli incarichi sul telefono.',completed:'Bravo per quel giro al club! Arrivare in fondo era il nostro accordo. Adesso godiamoci due chiacchiere: il bonus era uno solo, l’amicizia mica finisce lì.'};
 if(lines[status])return {topic:status==='completed'?'Il giro del club':'Il tuo incarico',text:lines[status],mission:true};
 }
 const lines=anecdotes[id]||[];
 return {topic:'Due chiacchiere al piazzale',text:lines[Math.abs(Math.floor(now/CLUB_VISIT_INTERVAL))%lines.length]||'',mission:false};
}
