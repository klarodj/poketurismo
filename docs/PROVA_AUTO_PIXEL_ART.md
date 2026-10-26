# Auto in pixel art · prova iniziale e catalogo completo

Richiesta dell'utente: valutare se ridisegnare le auto in vettoriale o pixel art, conservando tutto il catalogo attuale e provando inizialmente due modelli. La prova sceglie **pixel art** per la coerenza con il gioco; nessuna decisione di sostituire le 200 immagini.

Pagina separata `/previews/pixel-cars/`, collegata anche in fondo alla vecchia `/previews/seicento/`. Due modelli: **Fiat Punto GT prima serie, tre porte**, e **BMW M3 E30 due porte**. Confronto con l'originale oppure, a richiesta, con la verniciatura fotografica dello stesso colore; sette tinte, ingrandimento ×2 e tavola colori. Carrozzeria e dettagli visibili separatamente solo aprendo il dettaglio. Nessuna scrittura verso il gioco, nessun acquisto o modifica di auto/saldi.

## Riferimenti e generazione

Per la Punto: [progetto Italdesign](https://www.italdesign.it/it/project/punto/) e [scheda Giugiaro](https://www.giorgettofabriziogiugiaro.it/projects/vehicles/punto), verificati per la forma tondeggiante, la continuità cofano/parabrezza e i fanali posteriori verticali. Per la BMW: [storia ufficiale BMW M della M3 E30](https://www.bmw-m.com/en/topics/magazine-article-pool/bmw-m3-e30-portraet.html), per passaruota allargati, paraurti, minigonne, montante posteriore e alettone. Le immagini già fornite dall'utente sono state usate come riferimento di identità, non sovrascritte. Non sono pubblicate fotografie scaricate da siti terzi.

Due richieste distinte con lo strumento integrato **image_gen**, sfondo trasparente e vincoli comuni di prospettiva, proporzioni stradali, pixel netti e palette di materiali. I prompt integrali, le fonti e i percorsi di provenienza sono in [pixel-trial-sources.json](../tools/paint-prototype/pixel-trial-sources.json). Originali generati conservati in `tools/paint-prototype/pixel-trial-inputs/{punto,e30}.png`; copie dell'archivio image_gen lasciate al loro posto.

## Preparazione e colori

Il verde nei due disegni di costruzione è riservato alla carrozzeria; vetri blu/grigi, luci avorio/ambra/rosse, cerchi e gomme neutri. Questo permette di separare la vernice una volta, evitando di dover inseguire le sfumature di una fotografia per ogni tinta. La preparazione offline porta i disegni su una tela **320×128**, con campionamento nearest-neighbor, proporzioni conservate e alpha dei campioni originali. Palette dei dettagli limitata e sei toni dedicati alla vernice. Nessuna elaborazione o chiamata AI durante il gioco o la consultazione.

Asset separati in `public/images/pixel-cars/{punto,e30}/`: `base.png`, `body.png`, `details.png`, `index.png` e sette tinte, incluso il giallo. `index.png` conserva l'indice del tono di vernice; tutte le varianti riutilizzano gli stessi dettagli. Catalogo in `public/images/pixel-cars/catalog.json`. Nessun file nelle cartelle `public/images/car` e `public/images/paint` viene modificato.

```sh
npm ci --prefix tools/paint-prototype
node tools/paint-prototype/build-pixel-trial.cjs
```

Rapporto in `tools/paint-prototype/pixel-trial-validation.json`: 14 varianti, dimensioni e alpha identici alla base preparata, tutti i pixel esterni alla carrozzeria identici. La ricostruzione usa gli input salvati e non richiede una nuova generazione.

## Valutazione prima di estendere il catalogo

La pixel art con palette separata semplifica il cambio colore e rende lo stile più omogeneo. Il vettoriale avrebbe un vantaggio per forme e accessori modificabili, ma richiederebbe comunque disegni fedeli e una direzione grafica coerente per ogni modello. In entrambi i casi, duecento auto non diventano automaticamente corrette cercandone le schede sul web: bisogna verificare versioni, sagome, cerchi, luci e prospettiva.

Questi sono bozzetti da approvare, non repliche tecniche certificate. La carrozzeria è già separata, mentre nuovi cerchi, spoiler o altri accessori richiederanno livelli dedicati e prove di allineamento. La revisione delle vernici fotografiche e le sue note rimangono disponibili indipendentemente dall'esito di questa prova.

## Collaudo

Verificati i due modelli in tutte le sette tinte, più i 14 confronti con le vecchie vernici. Larghezze 320, 390 e 1280: nessuno scorrimento orizzontale esterno, anche ingrandendo lo sprite. Tavola completa, collegamento diretto modello/colore, passaggio dalla vecchia cartella, font e immagini caricati; nessun errore JavaScript o richiesta di scrittura. Controllo visivo desktop e telefono. Tutti i 200 originali e le 1.400 vernici precedenti identici ai file già pubblicati. Ricostruzione degli sprite ripetuta: 22 PNG identici byte per byte. Lint e build superati. Catture e report in `.preview/pixel-car-qa`.

## Pubblicazione

Album pubblicato il 25 ottobre 2026 sulla sola istanza 5174 attraverso il gateway 5184. Backup completo Auth + gioco e copia della build precedente in `/home/klaro/.backups/poketurismo/pixel-trial-2026-10-25T20-53-35-939Z`; backup ripetuto dopo la pubblicazione con esito positivo. Nessuna migrazione o operazione sui salvataggi.

Verifica dopo l'avvio dei servizi: gateway locale e indirizzi pubblici 443/8443, undici file HTML/JS/CSS/catalogo/PNG per indirizzo identici a quelli collaudati, salute HTTP 200 e API personali anonime HTTP 401. Catalogo di due modelli e sette colori. Servizi attivi; checkout e server temporanei rimossi. Rapporto in `.preview/pixel-car-qa/report-public.json`.

## Estensione ai 200 modelli · 26 ottobre 2026

L'utente ha approvato la direzione pixel art e richiesto tutto il catalogo, preferendo una prospettiva comune purché non deformi i modelli. L'album resta `/previews/pixel-cars/`: **200 modelli, sette tinte e 1.400 varianti**. I due prototipi Punto GT ed E30 conservano esattamente i 22 PNG approvati; le altre 198 auto hanno ciascuna una generazione image_gen distinta. Le immagini fotografiche e le 1.400 precedenti vernici rimangono separate e disponibili.

### Inquadratura e identità

Vista a tre quarti anteriore sinistra, muso verso il basso a sinistra, impostazione di camera e palette comuni. Non si ruotano o stirano le fotografie: ogni auto è ridisegnata usando l'originale come riferimento di identità e un prototipo approvato soltanto come riferimento di stile/camera. Piccole differenze di angolo sono ammesse per conservare sagoma e proporzioni. Anche l'adattamento alla tela nativa usa un solo fattore di scala, senza allungamenti diversi fra larghezza e altezza.

Vincoli specifici per modello in `pixel-catalog-notes.json`: numero di porte, versione, carrozzeria, luci, cerchi, spoiler e finiture visibili nell'immagine fornita. Per esempio, Z3 M coupé, RS2/RS4 Avant, Mini classica, 406 coupé, 22B due porte e Impreza GT quattro porte. Le strisce della Viper e le finiture decorative restano distinte dalla vernice; i cerchi bianchi o dorati sono conservati nei dettagli. Nomi, ID, anni e dati del gioco non vengono cambiati per adattarli al disegno.

Controlli aggiuntivi di identità con fonti del costruttore: [Audi Tradition, Avant RS2](https://www.audi-mediacenter.com/en/publications/more/audi-tradition-anniversary-dates-2024-1484/download), [BMW M, Z3 M Coupé](https://www.bmw-m.com/en/topics/magazine-article-pool/bmw-z3-m-coupe.html), [Renault Classic, 5 Turbo e Turbo 2](https://cdn.group.renault.com/ren/master/renault-classic/tools-and-services/Renault5TURBO.pdf.asset.pdf/d687c20fd2.pdf). Il catalogo chiama il modello `5maxi` «5 Maxi Turbo», mentre la foto usa l'aspetto stradale: il disegno mantiene il riferimento fornito, senza inventare una livrea da rally o modificare i dati del modello.

### File e riproduzione

Prompt integrali individuali, riferimento fotografico, riferimento di stile, provenienza e hash della generazione in `tools/paint-prototype/pixel-catalog-sources.json`. Gli output grezzi rimangono nell'archivio image_gen; gli input nativi definitivi delle 198 nuove auto sono salvati nel repository in `pixel-catalog-inputs`, evitando di duplicare centinaia di grandi PNG di lavorazione. Gli input grezzi dei due prototipi precedenti sono conservati. Tutti gli asset finali sono in `public/images/pixel-cars/<modello>/`.

`pixel-sprite.cjs` contiene preparazione e palette; `ingest-pixel-catalog.cjs` salva una generazione e incrementa la revisione del singolo modello. `build-pixel-catalog.cjs` ricostruisce l'indice e le varianti dagli input salvati, verificando alpha e dettagli invariati. `pixel-approved-hashes.json` protegge i due prototipi. Non servono nuove chiamate AI per ricostruire i file.

```sh
npm ci --prefix tools/paint-prototype
node tools/paint-prototype/build-pixel-catalog.cjs
```

Il vecchio ingresso `build-pixel-trial.cjs` ora richiama il catalogo completo. `init-pixel-catalog.cjs` è soltanto l'inizializzazione: rifiuta di sovrascrivere un lavoro già iniziato. I record intermedi della generazione sono stati salvati per modello e uniti all'indice; la ricostruzione finale usa gli input nativi e non dipende dai file intermedi.

### Revisione nell'album

Ricerca per marca/modello/ID, filtro marca e valutazione, elenco desktop e selettore mobile, precedente/successiva, originale o vecchia vernice dello stesso colore, sette tinte, zoom ×2 e tavola completa. La carrozzeria separata e i dettagli sono consultabili su richiesta.

Valutazioni e note locali in `poketurismo-pixel-review-v1`, esportabili come TXT con modello, colore e collegamento diretto. Lo stato delle vecchie vernici rimane in `poketurismo-paint-review-v1` e non viene modificato. I due prototipi partono approvati, gli altri 198 da valutare. Una successiva revisione di un modello conserva le note e richiede di ricontrollare un'approvazione precedente. La pagina prepara il controllo del catalogo: non sostituisce automaticamente le immagini delle auto nella partita e non introduce acquisti o addebiti.

### Collaudo del catalogo completo

Ispezionati tutti i 200 originali e i 200 disegni affiancati, più tavole dei sette colori su modelli con livree, ruote dorate/bianche, station wagon, cabrio e carrozzerie particolari. Verificata la conservazione delle strisce della Viper, delle finiture della 205 e delle ruote Williams/22B. Il controllo tecnico non costituisce approvazione estetica automatica dei 198 nuovi modelli: l'album conserva lo stato da valutare per il controllo dell'utente.

Rifinita la sola Volvo 850 station wagon con una seconda generazione mirata, per eliminare una vernice più puntinata rispetto allo stile scelto. Prompt e provenienza della prima versione conservati nella cronologia del modello; variante finale alla revisione 2, senza cambiare renderer, fotografie o prototipi approvati.

Browser completo: 1.400 selezioni delle tinte pixel art e 1.400 confronti con le vernici precedenti caricati correttamente. Ricerca, marca, stato, assenza di risultati, note mantenute al ricaricamento, esportazione TXT e collegamenti modello/colore verificati. Larghezze 320, 390 e 1280 senza scorrimento esterno, anche con zoom. Nessun errore JavaScript, immagine mancante o richiesta di scrittura. Le vecchie note delle fotografie restano identiche. Lint e build superati; rimane soltanto l'avviso preesistente sulla dimensione del bundle del gioco.

Validazioni di alpha/dettagli per tutte le tinte; 198 input generati individualmente e distinti, due prototipi e loro 22 PNG conservati, 200 foto originali e 1.400 vecchie vernici immutati. Ricostruzione ordinaria ripetuta con confronto dei 2.200 PNG nativi: identici byte per byte. Rapporti, tavole e catture in `.preview/pixel-catalog-qa`.
