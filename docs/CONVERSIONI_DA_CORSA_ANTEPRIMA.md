# Conversioni da corsa · progetto e anteprima

Richiesta: un allestimento costoso per trasformare ciascuna auto in una versione da corsa, con nuova pixel art, benefici sensibili al telaio e nessun aumento di potenza del motore. Prima delle funzioni acquistabili è richiesta la revisione nell'album nascosto.

## Stato

Il catalogo comprende i 200 modelli attuali. Le preparazioni sono distinte fra riferimenti storici, prototipi documentati che non necessariamente corsero, allestimenti ispirati alle competizioni e progetti del club dichiarati come interpretazioni. L'indice completo con fonti e stato è `tools/race-conversions/catalogue.json`. Le immagini stradali attive, il database, gli acquisti e le gare rimangono invariati.

L'utente ha confermato: repliche storiche quando documentabili, preparazioni plausibili del 2002 negli altri casi, livrea dedicata, futura conversione definitiva e utilizzabile anche nelle clandestine. Ha richiesto espressamente anche modifiche a spoiler, paraurti, allargamenti e cerchi: non una sola riverniciatura. Nessuna nuova richiesta di conferma è necessaria per queste scelte. La funzione acquistabile resta una fase successiva alla revisione dell'album.

## Immagini e riferimenti

Album separato `/previews/race-cars/`: confronto stradale/corsa, tavola completa, ricerca, marche e filtri; valutazioni locali con chiave separata `poketurismo-race-cars-review-v1`, note ed esportazione delle correzioni. Non sostituisce l'album stradale o le sue note. Ogni aggiornamento dello sprite incrementa la revisione: le note restano e le precedenti approvazioni tornano da verificare.

Generazione con **image_gen integrato**, una chiamata distinta per ogni modello. Ogni prompt specifica il kit estetico, la livrea, l'identità del modello e i vincoli di prospettiva/stile. Input approvati e output nativi trasparenti 320×128 in `tools/race-conversions/inputs` e `public/images/race-cars`; prompt, riferimenti e hash in `tools/race-conversions/records`. Il campionamento usa un solo fattore di scala per preservare le proporzioni; il builder ricopia le PNG native senza alterarle.

Le foto di riferimento sono controllate contro generazione, numero di porte, scocca e dettagli dei modelli approvati. Modellini, videogiochi, render e fotografie di altri modelli/generazioni sono esclusi dalla generazione. Quando è disponibile solo un riferimento stradale o una diversa derivazione, la scheda dichiara la preparazione come ispirata; non la spaccia per una replica esatta. Le scocche restano quelle del gioco: RS2/RS4 e Volvo 850 station wagon, Mini classica e Innocenti Mini Turbo distinte, Z3 M coupé, 406 coupé, Colt CA0, Delta HPE tre porte, ecc. Non vengono importati motori, trazioni o prestazioni della vettura storica.

Le ricerche e le fotografie grezze sono conservate privatamente sotto `/home/klaro/.backups/poketurismo/race-conversions-2026-10-27/`. Il repository conserva i link, i dati curati, i prompt e le PNG native, evitando di caricare nuovamente centinaia di immagini ad alta risoluzione. I file originali di image_gen rimangono anche nella destinazione del generatore.

## Proposta di bilanciamento, non ancora attiva

`tools/race-conversions/proposal.mjs` è una funzione sperimentale esterna ai percorsi del gioco. Cinque profili (club, monomarca, rally asfalto, turismo, GT): alleggerimento netto del 7–12% con limite di 110–180 kg; miglioramenti mirati a curva lenta/veloce e frenata; piccola resistenza aerodinamica aggiuntiva. Nessuna modifica a CV, coppia, cilindrata, sovralimentazione, regime, trazione o condizioni del motore. Non è una promessa delle prestazioni delle vere auto storiche.

La conversione raggiunge un minimo di preparazione del telaio: i migliori pezzi già montati restano utili e non ricevono una seconda volta l'intero bonus. Nessun ripristino gratuito di motore, gomme, carburante o chilometri. La proposta è idempotente; la seconda applicazione non produce altri benefici né un altro prezzo.

Prezzo proposto da 25.000 €, crescente con valore del modello e complessità dell'allestimento. È un prezzo di bilanciamento del gioco, non una quotazione storica. Esempi senza tuning: Seicento 25.000 € e 735→669 kg; 155 Q4 46.000 € e 1.445→1.272 kg; E30 48.000 € e 1.200→1.056 kg. Potenza invariata rispettivamente a 55, 190 e 220 CV.

Due test verificano i 200 modelli su tutti i cinque profili: motore e stato invariati, miglioramenti limitati, rispetto delle preparazioni già migliori, applicazione non cumulabile. Primo controllo sul Circuito Scuola: stesso pilota e guida, nessun incidente, condizioni identiche; il profilo turismo migliora il tempo dell'1,20–2,51%. È un confronto controllato, non un bonus percentuale fisso a tutte le gare. Trazione/cambio non sono pubblicizzati come benefici se il simulatore non li usa autonomamente.

## Integrazione successiva alla revisione

Prima di rendere il servizio acquistabile occorreranno un flag di allestimento per esemplare, proiezione coerente delle statistiche, preventivo server verificato e addebito atomico/idempotente. Vanno aggiornati montaggio/sostituzione dei ricambi, valutazione dell'usato, immagini di garage/raduno/NPC e checkpoint di gara. Le vecchie gare e gli inviti già congelati conserveranno la vecchia configurazione; un vero cambiamento del telaio dovrà entrare nelle impronte di preparazione, a differenza della sola verniciatura. Niente pubblicazione di acquisti o migrazioni prima della revisione dell'anteprima richiesta.

La livrea dedicata sostituisce visivamente la tinta stradale dell'esemplare: il carrozziere non dovrà addebitare una verniciatura normale che non produce alcun cambiamento sulla versione da corsa. L'allestimento permanente deve sopravvivere a vendita e acquisto dell'usato; nessuna rivendita potrà creare un guadagno superiore al costo sostenuto. Le componenti strutturali già migliori richiedono un confronto prima/dopo esplicito nel futuro preventivo. Queste sono condizioni da implementare nella fase acquistabile, non modifiche già attive.

## Verifiche del 28 ottobre 2026

Completate e confrontate visivamente tutte le 200 immagini: 72 riferimenti storici, 2 prototipi, 95 preparazioni ispirate e 31 allestimenti del club. Hash e archivi originali verificati; nessun duplicato. Album provato a 320, 390 e 1280 px, zoom, ricerca, marche, 200 miniature, note persistenti, revisione delle approvazioni, esportazione e fallback appunti. Nessun errore JavaScript, asset mancante o richiesta di scrittura. Test meccanici, lint e build superati. Nessuna modifica ai percorsi di gioco, agli asset precedenti o al database.

Pubblicata l'anteprima il 28 ottobre 2026 all'indirizzo `https://server-klaro.tail6c534c.ts.net/previews/race-cars/`. Verificati gateway locale e Funnel HTTPS 443/8443: 204 risorse per indirizzo con hash identico alla build, health 200 e API privata 401. Servizi `poketurismo-dev` e `poketurismo-public` attivi; sempre una sola istanza di gioco. Backup precedente in `/home/klaro/.backups/poketurismo/race-cars-2026-10-28T08-16-52-297Z`. Report locali in `.preview/race-cars-qa`; tutte le immagini precedenti, i sorgenti runtime e i salvataggi sono invariati. Branch `fix/code-review` e `feat/race-conversion-preview` pubblicati senza forzature.

## Revisione dei 34 modelli · 28 ottobre 2026

Recepito l'elenco dell'utente in `tools/race-conversions/review-34.json`: 34 generazioni individuali image_gen integrato, revisione 2; le altre 166 immagini conservate byte per byte. Ricerca e confronto visivo con fotografie di vetture reali; esclusi i risultati di modellini e videogiochi. Prompt completi e riferimenti effettivi nei record per modello; fotografie e precedenti input archiviati privatamente in `/home/klaro/.backups/poketurismo/race-review2-2026-10-28`. La 306 riprende la vera Maxi gialla Motul fotografata, non il modellino apparso fra i risultati iniziali. La Coupé riceve cerchi multirazze; Sierra RS500 con ala originale; Delta con paraurti/passaruota originali e livree Gruppo A.

Riferimenti corretti: 155 V6 TI DTM Martini (non GTA), 360 N-GT, 550 Maranello Prodrive (il “500” negli appunti è interpretato come 550), GTO PUMA N1 endurance (non JGTC), Silvia S14 Xanavi, R32 JGTC, Celica ST185 Carlos Sainz Repsol 1992. Per Clio Maxi, Ibiza Kit Car e Silvia si usano anche le fotografie dei musei Renault/SEAT/Nissan. Le livree aggiunte ai prototipi 288 GTO Evoluzione e F50 GT sono dichiarate immaginarie; il prototipo non diventa per questo una vettura che ha corso. La Celica ZZT231 WedsSport GT300 richiesta è del 2003: indicazione esplicita nell'album come eccezione al riferimento 2002, senza retrodatazioni o attivazione nelle partite.

Filtro «Aggiornate · 34 modelli» nel medesimo album. Cache delle PNG distinta da `?rev=2`, script album v2; note precedenti conservate e approvazioni delle sole immagini ritoccate da rivedere. Verificati filtro (34), 200 PNG caricate, dimensioni 320×128, margini/trasparenza, desktop/mobile 320/390/1280, note ed esportazione. Test meccanici, lint e build superati; nessuna modifica al database o ai sorgenti del gioco attivo.

## Revisione dei 10 dettagli · 28 ottobre 2026

Appunti dell'utente conservati in `tools/race-conversions/review-10.json`; batch `details-10-2026-10-28`, filtro «Aggiornate · 10 modelli». Corretti soltanto Saxo, Xsara, ZX, Puma, Sierra RS500, Hyundai Coupé, 106, 306, Mégane e Ibiza; le altre 190 PNG restano identiche. Saxo a revisione 2, Xsara a revisione 4 dopo ulteriore controllo della camera, altre otto a revisione 3. Generazioni individuali con image_gen integrato; prompt e riferimenti completi nei record. Basi e fotografie in `/home/klaro/.backups/poketurismo/race-review3-2026-10-28`.

Le stradali forniscono il riferimento della prospettiva per Xsara/ZX/106/306/Ibiza e dell'alettone per Sierra. Saxo senza rivetti e con raccordi ispirati alla Super1600, conservando generazione e livrea del gioco (interpretazione dichiarata, non replica della facelift). Puma senza paraspruzzi e con lip più pronunciato; Hyundai con lip integro; Mégane con spoiler corretto da foto anteriori e posteriori; Ibiza da asfalto, senza persone e senza rete protettiva nella presa del paraurti. Xsara senza pilota/copilota. Le fotografie completano i dettagli dei kit senza imporre il loro angolo di ripresa. Valutazioni locali conservate; solo le approvazioni riferite alle immagini cambiate tornano da rivedere. Nessuna nuova funzione acquistabile o scrittura nel database.

## Revisione dei quattro modelli · 28 ottobre 2026

`tools/race-conversions/review-4.json` registra le nuove richieste su Saxo, Xsara, Mégane e Ibiza. Batch `body-four-2026-10-28`, filtro «Aggiornate · 4 modelli». Altre 196 PNG conservate byte per byte. Saxo a revisione 3, Xsara a revisione 5, Mégane e Ibiza a revisione 4. Quattro generazioni individuali image_gen integrato, prompt e provenienza nei record per modello. Backup di basi e riferimenti in `/home/klaro/.backups/poketurismo/race-review4-2026-10-28`.

Saxo ridisegnata seguendo la vera Super1600, comprese carrozzeria e livrea rossa Citroën/Total/PlayStation n.53; riferimento della camera dalla stradale. Xsara con parafanghi e fianchi più ampi, confrontati con fotografie della vera Kit Car e dettagli del kit. Mégane con coda e parafanghi posteriori rivisti da fotografie reali posteriori e a tre quarti (Ourense e Tour de Corse); frontale e livrea conservati. Ibiza con proporzioni e prospettiva della stradale, mantenendo kit, livrea e assetto da asfalto già valutati. Fonti delle foto consultabili nelle schede. Abitacoli senza persone; note locali preservate, valutazioni da rivedere solo per i quattro sprite cambiati. Nessun acquisto attivato o modifica al database.

## Scala Saxo e scocca Mégane · 28 ottobre 2026

Nuova richiesta limitata a Saxo e Mégane in `tools/race-conversions/review-2.json`, batch `size-two-2026-10-28`, filtro «Aggiornate · 2 modelli». Saxo rev4: antenna completamente rimossa, larghezza nativa 291 px come la stradale. Mégane rev6 dopo confronto diretto: scocca ricostruita dalla stradale, coda compatta, passo/ruota posteriore e lunotto coerenti; larghezza 287 px come la stradale. Kit e livree da corsa mantenuti. Xsara e Ibiza approvate dall’utente; tutte le altre 198 immagini restano byte per byte identiche, senza riscrivere le note locali.

Generazione/modifica con image_gen integrato. Prompt completi nei record di Saxo e Mégane; basi, passaggi e confronto diretto in `/home/klaro/.backups/poketurismo/race-review5-2026-10-28`. Opzione `matchRoadWidth` dell’ingest: solo su richiesta esplicita, ricava la larghezza del riferimento stradale e ridimensiona con un unico fattore di scala, senza stirare il disegno; gli altri asset restano immutati. Il builder ricopia gli input nativi e non riapplica l’ingest. Valutazioni locali conservate, revisioni solo dei due modelli. Nessun acquisto, migrazione o modifica della partita.

## Selezione esplicita delle versioni · 29 ottobre 2026

L'utente ha scelto direttamente due file del generatore, superando le successive prove di allargamenti e proporzioni: Saxo `exec-8660843c-bd4f-4c83-89b0-104282363e0a.png`; Mégane `exec-4615ff09-58eb-4efc-81bc-fbbd32269281.png`. Queste scelte sono la nuova base vincolante. Non applicare automaticamente i ritocchi delle versioni successive o un nuovo adattamento alla larghezza stradale.

Saxo ripristinata senza nuova generazione: il PNG nativo è verificato byte per byte rispetto al relativo input della revisione 3 selezionata; nuova revisione di pubblicazione 6. Mégane ripresa dal file scelto, con una sola modifica tramite image_gen integrato: spoiler più simile al Maxi reale, piano orizzontale e piccoli supporti sottili; forma, carrozzeria, kit, cerchi e livrea della versione scelta conservati nel confronto visivo. Nuova revisione di pubblicazione 8. Prompt, file selezionati e provenienza in `tools/race-conversions/user-selected-two.json` e nei record; confronti e basi in `/home/klaro/.backups/poketurismo/race-selected-2026-10-29`.

Batch `selected-two-2026-10-29`; filtro «Aggiornate · 2 modelli». Note locali conservate e altre 198 immagini byte per byte invariate. Le prove interrotte del kit successivo non sono pubblicate. Nessun acquisto, migrazione o modifica alle partite.
