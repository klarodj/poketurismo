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

## Secondo controllo · sei modelli

Dopo il nuovo elenco dell'utente, il filtro **«Aggiornate · 6 modelli»** indica solo l'ultima revisione: Alfa Romeo 145 Quadrifoglio, 155 Q4, 75 Quadrifoglio, Citroën ZX 2.0, Daihatsu Charade GTti e Renault Clio Williams. Il collegamento resta `/previews/pixel-cars/?filtro=aggiornate`. Le altre 194 auto conservano gli undici PNG e la revisione precedente.

Rivista la coda tronca della 145, con fanali sottili orizzontali; baule della 155 più squadrato e alto; ripristinata la fascia nera sotto i finestrini della 75, con coda verificata sulla fotografia posteriore. La ZX perde la striscia luminosa sul montante: fanali rettangolari bassi sotto il lunotto. Per la Charade una foto laterale aggiuntiva guida la sommità piatta del passaruota posteriore: si modifica l'apertura della carrozzeria, lasciando tondi ruota e pneumatico. Sulla Williams il corpo del paraurti anteriore è ora verniciato, mentre fascia sottile, prese d'aria e recessi rimangono scuri; conservate ruote dorate e assenza di spoiler.

Sei modifiche distinte con lo strumento integrato **image_gen**, partendo dallo sprite esistente per conservare stile e dettagli non interessati. Fotografia originale per identità, fotografie posteriori/laterali o del paraurti per il dettaglio da correggere. [Prompt completi, correzioni e riferimenti](../tools/paint-prototype/pixel-detail-review.json). Il manifesto completo conserva la cronologia, gli hash e il commit degli sprite usati come input; nessuna fotografia esterna è pubblicata come asset. Quattro modelli passano da revisione 1 a 2; Charade e Williams da 2 a 3. Le note locali rimangono conservate e le precedenti approvazioni su questi sei modelli richiedono un nuovo controllo.

Asset finali in `public/images/pixel-cars/{145,155,75,zx,charade,williams}/`, input riproducibili in `tools/paint-prototype/pixel-catalog-inputs/`. Sette colori per modello, 42 varianti aggiornate. Il renderer non cambia; le fotografie, le vecchie vernici e le immagini usate nella partita restano conservate.

Controllo aggiuntivo: confronto visivo prima/dopo e tavola delle 42 tinte, validazione alpha/dettagli sull'intero catalogo e ricostruzione ripetuta dei 2.200 PNG senza differenze. Verificate byte per byte le 194 auto non interessate, i due prototipi, 200 fotografie e 1.400 vernici fotografiche. Browser sulle 42 tinte aggiornate e relativi confronti fotografici; controllati i passaggi di revisione 1→2 e 2→3, le note persistenti, l'approvazione invariata di una vettura della revisione precedente, l'esportazione e il filtro a sei modelli. Desktop 1280 e telefoni 320/390, zoom senza scorrimento esterno. Nessun errore JavaScript, file mancante o richiesta di scrittura. Rapporti in `.preview/pixel-six-qa`.

Secondo controllo pubblicato il 27 ottobre 2026 sulla stessa istanza 5174/gateway 5184, con build e lint superati. Backup completo Auth + gioco prima e dopo; build precedente in `/home/klaro/.backups/poketurismo/pixel-six-2026-10-27T09-50-15-741Z`. Gateway locale e indirizzi HTTPS 443/8443 verificati: 17 risorse per indirizzo identiche ai file collaudati, salute 200, API private anonime 401 e servizi attivi. Nessuna migrazione o modifica dei salvataggi. Rapporti pubblici in `.preview/pixel-six-qa`.

## Nuova ricostruzione della sola Alfa Romeo 155 Q4

L'utente ha respinto nuovamente il retro della 155. Il precedente ritocco aveva reso il volume posteriore troppo generico e il fanale d'angolo alto e arancione. Questa volta la vettura è ridisegnata dalle fotografie originali, senza usare il precedente sprite come modello geometrico: foto frontale fornita dall'utente, profilo laterale di una Q4 di serie del 1992, vista posteriore a tre quarti dello stesso esemplare e altra Q4 bianca vista da dietro. La Punto approvata serve soltanto per stile e camera, senza trasferire la forma della carrozzeria.

Ridisegnati montante posteriore, raccordo con il baule, sbalzo dietro l'asse posteriore e parte inferiore del paraurti. Fanale d'angolo corto e rosso, senza la precedente barra arancione verticale; mantenute quattro porte, carrozzeria stretta della prima serie, cerchi argento e assenza di alettone aggiunto. L'angolo resta anteriore a tre quarti: i riferimenti posteriori guidano la geometria senza imporre di mostrare parti nascoste.

Generazione con **image_gen integrato**. [Prompt e fotografie di riferimento](../tools/paint-prototype/pixel-155-review.json); provenienza e versioni precedenti nel manifesto completo. Output in `public/images/pixel-cars/155/`, input nativo in `tools/paint-prototype/pixel-catalog-inputs/155.png`. Tutti e sette i colori sono aggiornati; revisione 3, batch `rebuild-155-2026-10-27`. Il filtro «Aggiornata · Alfa 155 Q4» isola questo intervento. Le note del browser rimangono disponibili, mentre un'approvazione precedente della 155 richiede un nuovo controllo. Le altre 199 auto, le fotografie e le vecchie vernici rimangono invariate.

Verifica della ricostruzione: confronto visivo con la versione respinta e tavola dei sette colori; alpha/dettagli e ricostruzione ripetuta del catalogo completi. I 199 modelli non coinvolti conservano tutti gli undici PNG byte per byte; originali e vecchie vernici intatti. Browser su sette tinte e sette confronti fotografici, revisione 2→3, note/esportazione e approvazioni degli altri modelli conservate; larghezze 320, 390 e 1280 e zoom senza scorrimento esterno. Nessun errore JavaScript, file mancante o richiesta di scrittura. Rapporti in `.preview/pixel-155-qa`.

Ricostruzione della 155 pubblicata il 27 ottobre 2026, con lint e build superati e riavvio dell'istanza 5174/gateway 5184. Backup completo prima e dopo; build precedente in `/home/klaro/.backups/poketurismo/pixel-155-2026-10-27T11-37-31-989Z`. Gateway locale e HTTPS 443/8443 verificati su 16 risorse ciascuno, inclusi tutti i sette PNG della 155 alla revisione 3: file identici alla build collaudata, salute 200, API anonime private 401 e servizi attivi. Nessuna modifica dei dati del gioco. Rapporto in `.preview/pixel-155-qa/report-public.json`.
