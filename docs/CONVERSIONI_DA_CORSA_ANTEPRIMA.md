# Conversioni da corsa · progetto e anteprima

Richiesta: un allestimento costoso per trasformare ciascuna auto in una versione da corsa, con nuova pixel art, benefici sensibili al telaio e nessun aumento di potenza del motore. Prima delle funzioni acquistabili è richiesta la revisione nell'album nascosto.

## Stato

Il catalogo comprende i 200 modelli attuali; tre riferimenti sono documentati (Seicento Gruppo A/Trofeo, Alfa Romeo 155 GTA del 1992, BMW M3 E30 Gruppo A/DTM). Gli altri modelli sono esplicitamente **da ricercare**, senza varianti o fonti inventate. L'indice completo con fonti e stato è `tools/race-conversions/catalogue.json`. Non sono state modificate immagini attive, database, acquisti o gare.

Prima di avviare l'intero catalogo sono state chieste tre preferenze: trattamento dei modelli senza versione storica entro il 2002; livrea dedicata o colore personale; conversione definitiva/reversibile e uso nelle clandestine. La prima decisione determina quali immagini si possano produrre senza attribuire una storia inventata alle vetture.

## Proposta di bilanciamento, non ancora attiva

`tools/race-conversions/proposal.mjs` è una funzione sperimentale esterna ai percorsi del gioco. Cinque profili (club, monomarca, rally asfalto, turismo, GT): alleggerimento netto del 7–12% con limite di 110–180 kg; miglioramenti mirati a curva lenta/veloce e frenata; piccola resistenza aerodinamica aggiuntiva. Nessuna modifica a CV, coppia, cilindrata, sovralimentazione, regime, trazione o condizioni del motore. Non è una promessa delle prestazioni delle vere auto storiche.

La conversione raggiunge un minimo di preparazione del telaio: i migliori pezzi già montati restano utili e non ricevono una seconda volta l'intero bonus. Nessun ripristino gratuito di motore, gomme, carburante o chilometri. La proposta è idempotente; la seconda applicazione non produce altri benefici né un altro prezzo.

Prezzo proposto da 25.000 €, crescente con valore del modello e complessità dell'allestimento. È un prezzo di bilanciamento del gioco, non una quotazione storica. Esempi senza tuning: Seicento 25.000 € e 735→669 kg; 155 Q4 46.000 € e 1.445→1.272 kg; E30 48.000 € e 1.200→1.056 kg. Potenza invariata rispettivamente a 55, 190 e 220 CV.

Due test verificano i 200 modelli su tutti i cinque profili: motore e stato invariati, miglioramenti limitati, rispetto delle preparazioni già migliori, applicazione non cumulabile. Primo controllo sul Circuito Scuola: stesso pilota e guida, nessun incidente, condizioni identiche; il profilo turismo migliora il tempo dell'1,20–2,51%. È un confronto controllato, non un bonus percentuale fisso a tutte le gare. Trazione/cambio non sono pubblicizzati come benefici se il simulatore non li usa autonomamente.

## Integrazione successiva alla revisione

Prima di rendere il servizio acquistabile occorreranno un flag di allestimento per esemplare, proiezione coerente delle statistiche, preventivo server verificato e addebito atomico/idempotente. Vanno aggiornati montaggio/sostituzione dei ricambi, valutazione dell'usato, immagini di garage/raduno/NPC e checkpoint di gara. Le vecchie gare e gli inviti già congelati conserveranno la vecchia configurazione; un vero cambiamento del telaio dovrà entrare nelle impronte di preparazione, a differenza della sola verniciatura. Niente pubblicazione di acquisti o migrazioni prima della revisione dell'anteprima richiesta.
