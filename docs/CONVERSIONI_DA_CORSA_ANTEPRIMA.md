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
