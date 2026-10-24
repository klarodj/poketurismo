# Verniciatura: prima prova sulla Fiat Seicento Sporting

Prototipo grafico richiesto dall’utente prima di estendere la lavorazione al catalogo. Non abilita ancora acquisti, né modifica auto, saldi, database, gare o contratti.

Anteprima interattiva: `/previews/seicento/`. Tavola di confronto: `/previews/seicento/confronto.png`. Selettore con giallo originale e sei nuove tinte: rosso pastello, blu scuro, verde bottiglia, nero, bianco e grigio argento. Prezzo proposto per la futura verniciatura: **2.500 €**, senza addebiti dall’anteprima.

## Immagine originale e maschera

`public/images/car/seicento.png` rimane intatta: 400×130 RGBA, SHA-256 `baf30f17a326f0d16acb341e91900954c7342febc15c2a2689f01f2e41d6faca`.

La bozza della maschera è generata con image_gen integrato, usando l’immagine originale come riferimento e richiedendo soltanto la selezione della carrozzeria. La generazione non viene usata come nuova immagine dell’auto. Prompt e percorsi in [SEICENTO_VERNICIATURA_PROMPT.json](SEICENTO_VERNICIATURA_PROMPT.json); bozza conservata in `tools/paint-prototype/seicento-mask-draft.png`.

Il preparatore offline riporta la selezione alle dimensioni native, la incrocia con i pixel della vernice gialla originale e applica le esclusioni rifinite a mano per fari, stemma e targa. La maschera finale seleziona 13.112 pixel. È specifica di questa immagine e va rivista per altri modelli: non è un filtro universale applicabile senza controllo alle 200 auto.

Le nuove tinte sono calcolate **dai pixel originali**, usando luminosità e saturazione per mantenere ombreggiature e riflessi; non si ridisegnano auto, cerchi o carrozzeria. Tutti i pixel fuori dalla maschera e tutti i valori alpha sono preservati esattamente. Non è una simulazione di nuove finiture metallizzate o perlate: questa prova riguarda il colore di base.

Asset pronti: `public/images/paint/seicento/{rosso,blu,verde,nero,bianco,argento}.png`, maschera `mask.png`, catalogo `catalog.json`. Le varianti hanno tutte dimensioni native 400×130 e trasparenza dell’originale; l’ingrandimento nell’anteprima usa nearest-neighbor. Nessuna elaborazione di immagini durante il gioco, nessuna chiamata a servizi AI dall’anteprima.

## Riproduzione e controlli

Preparatore isolato dalle dipendenze del gioco:

```sh
npm ci --prefix tools/paint-prototype
node tools/paint-prototype/build.cjs
```

Dipendenza `pngjs` confinata al solo strumento offline. `validation.json` registra hash, dimensioni, pixel selezionati e verifiche di conservazione per tutte le sei varianti. Il codice controlla che la sorgente non cambi e che ogni pixel esterno alla maschera e ogni valore alpha rimangano identici.

Anteprima Windows 98 con VT323, pulsanti a rilievo, originale/variante e tabella facoltativa di tutti i colori. Font già usato dal gioco, con copia della sua licenza nella cartella dell’anteprima. Test browser a 320, 390 e 1280 pixel: sette selezioni funzionanti, immagini native caricate, font disponibile, nessuno scorrimento orizzontale, errore JavaScript o richiesta di scrittura. Tavola e catture in `.preview/seicento-paint-qa`.
