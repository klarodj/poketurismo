# Consumi delle vetture

Dal 24 ottobre 2026 le stime mostrate al giocatore sono in **km/l**, convertite come `100 / valore in L/100 km`. Un valore più alto è migliore, anche nel delta del tuning. Le formule e gli esempi tecnici seguenti rimangono espressi nell’unità interna originaria per conservare il modello fisico. Serbatoio, acquisti e quantità effettivamente usate si misurano ancora in litri.

Le nuove gare usano un consumo legato a cilindrata, CV effettivi, peso e incremento di potenza rispetto al modello originale. Non si conta il numero di ricambi: aumentano i consumi le elaborazioni che aumentano realmente la potenza; freni e assetto non aggiungono da soli un costo carburante. Un alleggerimento riduce leggermente la richiesta. Turbo e compressore richiedono più carburante nel modello di gara, soprattutto se elaborati.

## Stima e comportamento

shared/fuelConsumption.mjs contiene la formula comune a server, anteprima del settore, garage, distributore e confronto tuning. La stima a motore caldo è un modello di gioco, non il consumo omologato di ogni vettura né una simulazione completa di iniezione, rapporti, giri motore e apertura farfalla.

Consumo misto indicativo in L/100 km:

    (3,6 + 1,4 × cilindrata in litri + 0,015 × CV effettivi
     + 0,001 × differenza di peso da 900 kg)
    × (1 + 0,20 × incremento relativo di CV sul motore di serie)

Il contributo del peso è limitato tra −400 e +2500 kg e quello dell'elaborazione aggiunge al massimo il 50%. Il dato usato è la preparazione effettiva dopo la sostituzione dei pezzi: nessuna somma dei bonus del componente vecchio e di quello nuovo. Cilindrata e tipo motore vengono dal catalogo; non si inventano aumenti di cilindrata per ricambi che nel gioco non la modificano. Se mancano metadati in un input di anteprima, esiste un fallback deterministico; le nuove gare normali ricevono sempre i dati reali del catalogo salvati dal server.

Il riferimento in gara è 1,45 volte il misto, con +8% per turbo e +6% per volumetrico; «Conserva» applica ×0,78 e «Attacco» ×1,30. Le tecniche mantengono il proprio moltiplicatore di aggressività. Pendenza integrata sulla distanza di ciascun tratto: +6% di salita aggiunge il 18%, −6% di discesa riduce il 18%; il fattore è limitato tra 0,75 e 1,50. Sono coefficienti di bilanciamento espliciti, non misure ottenute da prove reali dei modelli.

Il consumo cresce con i chilometri percorsi, senza un minimo fisso per turno: suddividere lo stesso tratto in quattro o venti decisioni non aumenta il carburante richiesto. Anteprima e addebito del settore usano lo stesso calcolo e la stessa precisione di quattro decimali. Nessun consumo da fermo nel garage, nei messaggi, nel piazzale o navigando nella mappa.

Esempi di serie dal catalogo del gioco, a motore caldo e senza pendenze o tecniche:

| Modello | cm³ / CV | Misto indicativo | Gara, ritmo pulito | Gara, attacco |
|---|---:|---:|---:|---:|
| Cinquecento Sporting | 1100 / 55 | 5,8 | 8,4 | 10,9 |
| MX-5 NA | 1800 / 131 | 8,2 | 11,9 | 15,4 |
| Clio RS | 2000 / 169 | 9,1 | 13,2 | 17,1 |
| M3 E30 | 2300 / 220 | 10,4 | 15,1 | 19,6 |
| Supra Mk4 | 3000 / 330 | 13,4 | 21,0 | 27,4 |

Valori in L/100 km, riferiti ai dati del catalogo esistente. Una Seicento da 55 CV su 3,04 km ha usato circa 0,256 L a ritmo pulito e 0,199 L conservando; la stessa vettura portata a 83 CV in attacco ha usato circa 0,393 L nel collaudo. Non sono dati stradali certificati.

Riferimenti qualitativi: [EPA — fattori che modificano i consumi](https://www.epa.gov/greenvehicles/your-mileage-may-vary) e [DOE/AFDC — stile di guida e carburante](https://afdc.energy.gov/conserve/driving-behavior). Confermano il ruolo di guida, massa e percorso; i coefficienti sopra sono stati scelti e verificati per questo gioco, non ricavati come taratura certificata da queste fonti.

## Conservazione delle gare e dei tempi

Nuovi stati di gara e nuovi contratti di campionato/sfida conservano fuelModelVersion 2. Le gare già memorizzate senza versione continuano con la formula precedente; anche un vecchio campionato o una vecchia sfida che iniziano una nuova manche mantengono il proprio regolamento. Entrambi i tentativi di una sfida usano la versione congelata nel contratto.

Gli inviti ancora pendenti prima del rilascio restano accettabili: la verifica riconosce l'impronta precedente. Gli inviti nuovi includono anche cilindrata e tipo motore nell'impronta, così una modifica dei dati del motore non passa come la stessa preparazione. Nessun contratto o sessione esistente viene riscritto al rilascio.

Tempi precedenti conservati e separati da quelli attuali: nel registro personale si vedono il tempo attuale e il riferimento storico; al raduno il selettore «Regolamento consumi» permette di passare ai tempi precedenti. Nessuna classifica mescola le due versioni, dato che il carburante residuo incide anche sul peso in gara. Nessun reset di gare o record.

## Interfaccia

Garage e distributore mostrano misto indicativo e stime in gara per conserva/ritmo pulito/attacco, sulla preparazione attuale. Il confronto tuning mostra consumo prima/dopo e segnala gli aumenti. In gara resta disponibile il consumo del prossimo settore e il riepilogo di ogni tratto. Immagini esistenti e stile Windows 98 conservati.

Non cambia il prezzo della benzina, la capacità dei serbatoi, il bonus prestazionale della Premium, il budget iniziale o i premi. La Premium non riceve un nuovo sconto artificiale sui litri. Nessuna migrazione di schema o correzione retroattiva di carburante, saldi o chilometraggi.

## Collaudo

233 test di gioco/client e 12 account/gateway passati, lint e build validi. Casi dedicati: effetto indipendente di cilindrata, potenza e rapporto di elaborazione; nessuna penalità per il numero di pezzi; pendenze, ritmo e tecniche; stessa distanza con quattro o venti settori; precisione identica tra anteprima e consumo; vecchie gare, vecchi inviti e campionati; separazione dei record e conservazione degli storici.

scripts/validate-fuel-consumption.cjs rifiuta database non locali o non terminanti in _validation. Eseguito su copia completa PostgreSQL: 200 modelli con stime finite, quattro gare via HTTP (serie, conserva, elaborata in attacco, vecchie regole), controllo di ogni checkpoint e retry senza doppio consumo, tutti i dati preesistenti invariati. Anche validate-meet-social.cjs supera il controllo di due tentativi asincroni con stesso tempo a parità di scelte, senza modifiche alla carriera reale.

Browser con API reale sulla copia PostgreSQL e pilota sintetico: distributore e garage con stime coerenti, confronto tuning con delta positivo e spiegazione, desktop 1280×960 e telefono 390×844 senza errori JavaScript o scorrimento orizzontale nelle viste verificate. Catture e rapporti in .preview/fuel-qa. Nessuna gara o acquisto di collaudo sui giocatori pubblici.

## Rilascio verificato

Pubblicato il 23 ottobre 2026 sulla sola istanza 5174 attraverso il gateway 5184. Backup completo Auth + gioco prima e dopo; build precedente, dati e rapporto di verifica in /home/klaro/.backups/poketurismo/fuel-model-2026-10-23T12-39-14.355Z (privato). Confronto delle 32 tabelle dello schema game superato: tutte le righe e tutti i campi invariati, compresi carburante, saldi, contratti e gare già in corso. Nessuna migrazione di schema o cancellazione di record.

Servizi attivi, health positivo, distributore pubblico HTTP 200 e API personali senza sessione HTTP 401. Verificato il bundle effettivamente servito dal Funnel con le nuove stime e il selettore dei regolamenti. Browser, anteprima e database temporaneo vengono rimossi dopo il collaudo.
