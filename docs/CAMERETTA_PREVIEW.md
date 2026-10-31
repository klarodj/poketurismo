# Anteprima della cameretta

Prima versione da valutare, 31 ottobre 2026. Pagina nascosta `/previews/casa/`, indipendente dalla casa attuale. Non sostituisce nessuna destinazione e non completa B05: l’album e i futuri contenuti restano da sviluppare.

Una stanza di provincia del Nord, circa 2002: legno, monitor CRT beige, CD, poster e modellini, calendario, letto e porta verso il garage. La scena è un menu ambientato ispirato ai gestionali e alle avventure anni Novanta.

Sei oggetti selezionabili, con aree allineate all’immagine in `public/previews/casa/objects.js`:

- Specchio → `/garage/pilota`, profilo attuale, con accesso del gioco normale.
- Chiavi → `/garage/auto`, garage attuale, senza cambi di vettura.
- Raccoglitore → finestra illustrativa dell’album futuro (B05).
- CRT → finestra illustrativa di forum/posta/annunci (B07).
- Rivista sul letto → finestra illustrativa del magazine (B08).
- Calendario → finestra illustrativa degli appuntamenti (B09).

Le quattro finestre future sono esplicitamente anteprime: nessun dato personale inventato, archivio fittizio o premio. Nessuna richiesta API, nessuna scrittura di database o localStorage. Il link Torna al gioco e i collegamenti a profilo/garage restano normali link, con autenticazione esistente al momento dell’apertura.

Cornice Win98, VT323 del gioco, bordi squadrati, etichette su hover/focus o con Mostra oggetti; Elenco delle sezioni alternativo. Dialoghi nativi con Escape, ripristino del focus e chiusura esplicita. La scena è almeno960px, solo il suo riquadro scorre in orizzontale. Su telefono: swipe nativo, frecce e prima inquadratura sulla scrivania. Da tastiera: Tab fra gli oggetti, frecce quando il riquadro ha il focus. Trascinamento mouse sullo sfondo, nessun drag personalizzato per touch. Le preferenze di movimento ridotto disabilitano lo scorrimento animato. La pagina resta senza overflow orizzontale globale.

## Immagine e provenienza

- Asset finale: `public/previews/casa/cameretta-v1.png`,1536×768, griglia logica768×384 con pixel raddoppiati.
- Generazione: strumento integrato **image_gen**, singola nuova illustrazione; nessuna immagine esistente sovrascritta.
- Prompt completo e percorso di origine: `tools/bedroom-art/record.json`.
- Originale: `tools/bedroom-art/input-v1.png`.
- Preparazione nearest-neighbour e hash: `tools/bedroom-art/build.cjs` e `manifest.json`. Nessuna riverniciatura tramite codice.

## Verifiche

Lint e build. Browser a320/390/768/1280/1440px: sei oggetti, quattro finestre, Escape/focus, etichette ed elenco, destinazioni reali di profilo e garage, frecce/tastiera e swipe touch nativo via Chromium. Nessun errore JavaScript o richiesta API. Controllo visivo della stanza e delle aree cliccabili su desktop e mobile. Pubblicazione ancora da verificare.
