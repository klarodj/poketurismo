# Revisione dei 18 modelli · 27 ottobre 2026

Richiesta dell'utente dopo il controllo del catalogo: correggere i modelli segnalati usando anche fotografie posteriori e a tre quarti, evitando di ricostruire fanali e code dalla sola vista anteriore. La correzione riguarda tutti e sette i colori di ciascuna auto.

Album invariato: `/previews/pixel-cars/`. Il filtro **«Aggiornate · 18 modelli»** isola questa revisione; collegamento diretto `/previews/pixel-cars/?filtro=aggiornate`. I modelli corretti passano dalla revisione 1 alla 2, mentre la Volvo 850 già rifinita mantiene la propria revisione 2 e non entra nel nuovo filtro. Le note rimangono nel browser: una vecchia approvazione su un modello cambiato torna da verificare; una segnalazione rimane visibile fino alla conferma dell'utente.

## Correzioni

| Modello | Intervento |
| --- | --- |
| Alfa Romeo 33 Quadrifoglio | Coda più corta e tronca; conservati i cinque porte e il frontale della serie nella foto originale. |
| Citroën AX GTi | Fanali trapezoidali sotto il lunotto, senza fascia luminosa prolungata fino al tetto; paraurti e finiture nere. |
| Daihatsu Charade GTti | Arco posteriore con sommità più piatta, fanali bassi orizzontali e angoli ambra. |
| Fiat Seicento Sporting | Fanali bassi e orizzontali; montante posteriore libero dalle luci verticali inventate. |
| Ford Fiesta Turbo | Fanali compatti sotto gli angoli del lunotto; mantenute le tre razze e i quattro fari nel paraurti. |
| Honda Civic EG | Gruppi posteriori bassi e orizzontali; nessuna striscia lungo i montanti. |
| Lancia Delta Evoluzione | Profilo dell'alettone regolabile sopra il portellone, verificato con fotografia ravvicinata. |
| Lancia Delta HPE | Ridisegnata la carrozzeria HPE della seconda generazione a tre porte, con montante largo, frontale e spoiler del portellone corretti. |
| Mitsubishi Colt GTI | Ridisegnata la CA0 arrotondata della fotografia originale; scartate le immagini della precedente C50, anche se etichettate con lo stesso anno. |
| Nissan Micra Super S | Fanali compatti sotto il lunotto, coda e tetto arrotondati K11. |
| Opel Corsa GSi mk2 | Ridisegnata la Corsa B GSi a tre porte, usando anche una fotografia del costruttore per il frontale. |
| Opel Kadett GSi | Portellone molto più inclinato e montante triangolare; conservate le tre porte e le ruote della foto originale. |
| Renault 19 16v | Carrozzeria a tre porte, coda e montante della fase 2, rimossi i due sportelli posteriori introdotti nel primo bozzetto. |
| Renault Clio RS | Fari anteriori arrotondati della fase 1 e fanali posteriori verificati con foto della stessa versione. |
| Renault Clio Williams | Rimosso lo spoiler su richiesta; conservate le ruote dorate. |
| Renault Laguna | Mascherina e bordo del cofano della prima serie, con parte centrale a V e prese laterali sottili. |
| Subaru Impreza 22B | Spalla del parafango posteriore più larga e sfaccettata; conservate le due porte, l'alettone e le ruote dorate. |
| Suzuki Swift GTi | Fanali bassi rettangolari e orizzontali, senza prolungamenti sul montante. |

## Riferimenti e file

Utilizzato lo strumento integrato **image_gen**, con una richiesta distinta per ciascuno dei 18 modelli. Ogni richiesta separa i ruoli delle immagini: originale fornito dall'utente per identità e allestimento, fotografia reale posteriore per anatomia, eventuale fotografia frontale aggiuntiva e Punto GT approvata soltanto per stile e camera. La prospettiva rimane anteriore a tre quarti: le fotografie posteriori non impongono di disegnare parti nascoste.

[Elenco dei 18 prompt e riferimenti](../tools/paint-prototype/pixel-rear-review.json). [Manifesto completo e cronologia delle generazioni](../tools/paint-prototype/pixel-catalog-sources.json), con percorsi dell'archivio image_gen, hash e versione precedente. Le fotografie esterne sono riferimenti di lavorazione locali e non vengono pubblicate nell'album o aggiunte agli asset del gioco.

Esempi di fonti consultate: [Seicento Sporting, vista posteriore](https://motoryzacja.interia.pl/samochody-uzywane/news-uzywany-fiat-seicento-1998-2010%2CnId%2C717671), [Colt 1994, fotografia posteriore CA0](https://www.cargurus.com/research/1994-Mitsubishi-Colt-c9489), [Corsa B, archivio Opel/Stellantis](https://www.media.stellantis.com/em-en/opel/press/30-years-opel-corsa-b-innovative-and-independent-sales-hit), [Delta Evoluzione, dettaglio spoiler](https://www.auctomobile.com/auctions/results/1991-lancia-delta-integrale-evoluzione.html), [Clio RS fase 1, album anteriore e posteriore](https://www.themarket.co.uk/en/listings/renault/clio-rs-172-phase-1/ae3b85e5-75fd-4ae8-a51f-c68adfb453b1). Gli URL delle altre fotografie effettivamente utilizzate sono nel manifesto dei 18 modelli.

Input nativi in `tools/paint-prototype/pixel-catalog-inputs/<modello>.png`; output in `public/images/pixel-cars/<modello>/`: base, carrozzeria, dettagli, indice e sette vernici. Dimensioni 320×128, trasparenza conservata e stessa palette del catalogo. Il renderer comune non cambia: la correzione della forma si trova nell'immagine del singolo modello, quindi vale per tutti i colori.

I 182 modelli non segnalati conservano tutti gli undici PNG byte per byte, inclusi i due prototipi approvati. Le 200 fotografie e le 1.400 vernici fotografiche rimangono intatte. Nessun cambiamento alle immagini nella partita, ai salvataggi o agli acquisti.

## Verifica

Controllati visivamente i 18 confronti prima/dopo e le 126 varianti. Validazione completa di alpha e dettagli sulle 1.400 tinte del catalogo; ricostruzione dei 2.200 PNG ripetuta senza differenze. Confronto con la versione pubblicata: 182 modelli invariati byte per byte, 18 revisioni incrementate e tutte le rispettive tinte aggiornate, 200 foto e 1.400 vecchie vernici conservate.

Browser: caricate tutte le 1.400 tinte e i 1.400 confronti fotografici, verificati ricerca, filtri, note persistenti, esportazione, vecchie approvazioni da ricontrollare solo sui modelli modificati e mantenimento delle segnalazioni precedenti. Filtro aggiornate e collegamenti verificati anche dopo ricaricamento; pagina a 320, 390 e 1280 pixel senza scorrimento orizzontale esterno. Nessun errore JavaScript, file mancante o richiesta di scrittura. Rapporti e tavole in `.preview/pixel-rear-qa`.

## Pubblicazione

Pubblicata il 27 ottobre 2026 sull'unica istanza 5174 tramite il gateway 5184. Build e lint superati. Backup completo Auth + gioco prima e dopo la pubblicazione; build precedente conservata in `/home/klaro/.backups/poketurismo/pixel-rear-2026-10-27T07-50-06-102Z`. Nessuna migrazione o modifica dei dati del gioco.

Verificati gateway locale e i due indirizzi pubblici HTTPS 443/8443: 17 risorse HTML, JavaScript, CSS, catalogo e immagini per ciascun indirizzo corrispondono ai file collaudati; catalogo di 200 modelli e sette colori, salute HTTP 200 e API private anonime HTTP 401. Entrambi i servizi attivi. Rapporto in `.preview/pixel-rear-qa/report-public.json`.
