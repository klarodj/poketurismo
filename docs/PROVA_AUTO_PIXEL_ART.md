# Prova auto in pixel art · due modelli

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
