# Luoghi, menu e ricambi in pixel art

Richiesta del 27 ottobre 2026: rifare le altre immagini della mappa e dei menu nello stile delle 200 auto approvate. La sostituzione riguarda la presentazione: nessuna modifica a partite, prezzi, prestazioni, percorsi, minimappe, settori o regole.

## Catalogo

95 immagini in `public/images/world`: 14 scene per mappa/menu, 6 lavorazioni dell'officina compresa la verniciatura, 48 ricambi distinti (16 famiglie × 3 livelli) e 27 cartoline dei percorsi. Le scene sono a 320×180 pixel, servizi e ricambi a 128×128. I ricambi conservano la trasparenza generata. Tutte le immagini si ingrandiscono senza interpolazione. Le finestre, il font e i controlli Windows 98 conservano lo stile esistente.

L'album di controllo è `/previews/pixel-world/`, con tutte le immagini raggruppate per luoghi, lavorazioni, ricambi e tracciati. È una pagina di consultazione, non modifica la partita. Le auto rimangono nell'album separato già esistente.

## Direzione visiva e produzione

Provincia del Nord Italia, riferimento 2002: tetti in cotto, capannoni, pioppi, Alpi e Prealpi; garage domestico, piccola officina indipendente, distributore d'epoca e raduno nel parcheggio. Auto e attrezzature precedenti o contemporanee al 2002. Disegno con contorni scuri a gradini, campiture semplici e ombre a pochi toni. Le scene iniziali troppo fotografiche sono state scartate e rigenerate con riferimenti espliciti alla pixel art del gioco.

Strumento: **image_gen integrato**, senza CLI/API esterne. Ogni immagine è generata singolarmente; le tre elaborazioni di ciascun ricambio hanno soggetti distinti. Prompt finali completi, riferimenti di stile, provenienza e destinazioni sono nei 95 file `tools/world-art/records/*.json`. Input nativi selezionati in `tools/world-art/inputs`: sono le PNG finali alla risoluzione del gioco, copiate byte per byte dal builder quando `nativeInput` è attivo. Il percorso di preparazione dai file ad alta risoluzione usa solo nearest-neighbour, senza filtri che simulano la pixel art su fotografie. Manifest con hash degli input nativi e degli output in `tools/world-art/manifest.json`.

Tutti i 95 sorgenti completi di image_gen, circa 152 MB, sono conservati nel backup privato `/home/klaro/.backups/poketurismo/pixel-world-2026-10-27T17-48-22-212Z/generated-inputs`, oltre alla destinazione originale del generatore. Ogni record conserva percorso e SHA-256 del sorgente completo. Git conserva le PNG native, i prompt, gli strumenti e gli originali storici; non deve caricare nuovamente i file ad alta risoluzione per ricostruire il gioco. Questa preparazione non modifica alcun pixel delle immagini pubblicate.

## Conservazione e compatibilità

Le 94 immagini precedenti vengono archiviate byte per byte in `tools/world-art/archive`, fuori dalla cartella pubblica. Il carrozziere aggiunge una nuova anteprima, senza un'immagine precedente da archiviare. I nuovi URL `/images/world/...` evitano di riutilizzare le fotografie nella cache. I nomi dei file dei ricambi nel database restano invariati: cambia il prefisso nel client.

Le 2.200 PNG delle auto approvate, i 20 avatar, i 10 ciceroni e i 46 loghi dei marchi restano invariati. Le minimappe continuano a usare la geometria e i settori salvati: cambiano solo le cartoline dell'ambiente, anche nelle gare già esistenti. Originali storici e precedenti correzioni delle auto restano nei rispettivi archivi.

## Verifica

Build, lint e 26 test dell'interfaccia superati. Nel browser, su dati sintetici intercettati e senza collegamenti al database: dieci luoghi della mappa, officina, carrozziere, login e album completo; nessun errore JavaScript, risorsa mancante o scrittura. Schermate a 320, 390 e 1280 pixel senza scorrimento esterno. Le etichette della mappa sono sotto il disegno e non coprono più il soggetto. Verificati tutti i 95 file, gli hash identici dei 94 originali archiviati e dei 2.276 asset conservati (auto, ritratti e marchi), oltre al confronto esatto delle geometrie delle minimappe. Rapporti e catture in `.preview/pixel-world-qa`.

Pubblicato il 27 ottobre 2026 sulla sola istanza 5174 tramite gateway 5184, con riavvio verificato dei servizi. Backup della build precedente in `/home/klaro/.backups/poketurismo/pixel-world-2026-10-27T17-48-22-212Z`. Nessun collegamento o intervento sul database per la pubblicazione. Controllate 100 risorse byte per byte (build, album e tutte le 95 immagini) sul gateway locale e su entrambi gli indirizzi pubblici HTTPS 443/8443; vecchie fotografie non più servite, health positivo e officina privata correttamente protetta da autenticazione. Rapporto in `public-report.json` e dati della pubblicazione in `deployment.json`, nella stessa cartella di collaudo.
