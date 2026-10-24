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

## Catalogo completo per la valutazione

La stessa pagina `/previews/seicento/` ora raccoglie **200 modelli e 1.200 varianti**. Restano i sei colori della prima prova, più l’originale per ogni auto. Le 199 nuove maschere sono state preparate con una richiesta image_gen distinta per ogni immagine; le varianti sono renderizzate offline dai pixel originali. La Seicento già approvata conserva esattamente i sette PNG della prima prova, senza rigenerazione.

Ricerca per marca/modello, filtro marca, selezione del modello e Precedente/Successiva. Desktop con elenco laterale, telefono con selettore compatto. Confronto originale/variante, ingrandimento ×2 con scorrimento interno, confronto di tutti i colori e maschera visibile su richiesta. Ogni auto ha numero di catalogo e collegamento copiabile, ad esempio `?auto=punto&colore=blu`.

Valutazioni «Da valutare», «Va bene», «Da correggere» e nota libera per modello, conservate solo nel browser (`poketurismo-paint-review-v1`). La Seicento parte da «Va bene» perché approvata dall’utente; le altre 199 attendono la sua valutazione. Filtri per stato e conteggi. «Esporta correzioni» scarica un TXT con modello, colore, nota e collegamento; «Copia elenco» prepara lo stesso testo negli appunti, con selezione manuale se non disponibili. Nessuna nota inviata automaticamente e nessuna scrittura sul database del gioco.

La pagina ha `noindex,nofollow` e non è collegata dalla mappa: è una cartella di revisione raggiungibile conoscendo il suo URL, non una pagina con dati personali o un nuovo sistema di accesso.

### Asset e riproduzione

`public/images/paint/catalog.json` è l’indice dei 200 modelli. Ogni cartella `public/images/paint/<nome-immagine>/` contiene sei PNG e la maschera nativa; tutte le immagini originali in `public/images/car` restano immutate. Conservate le dimensioni 400×130 e quelle della singola immagine 404×138. Tutti i valori alpha e i pixel esterni alla maschera restano identici.

Modelli di sola lettura esportati dal catalogo in `tools/paint-prototype/models.json`: nessun utente, garage o saldo incluso. Prompt individuali, percorsi delle bozze image_gen, profili di luminosità e metriche delle maschere in `tools/paint-prototype/catalog-mask-sources.json`. Le bozze originali sono conservate nell’archivio image_gen; le maschere finali native sono tutte nel repository. Non si ridisegnano le automobili. Le foto scure usano una curva dedicata per rendere leggibile la nuova tinta senza perdere le ombre dei pannelli.

```sh
npm ci --prefix tools/paint-prototype
node tools/paint-prototype/build-catalog.cjs
```

La ricostruzione normale usa le maschere native e i profili salvati: funziona anche senza accedere ai PNG ad alta risoluzione dell’archivio image_gen. `--prepare` riparte invece dalle bozze locali e rifà la selezione; non usarlo per sovrascrivere maschere corrette e approvate durante la revisione. `catalog-render.cjs` contiene selezione, curva di ricolorazione e controlli di conservazione; `catalog-validation.json` riporta 200 modelli, 1.200 verifiche e nessun elemento mancante.

### Verifiche

Ispezione delle 200 immagini originali e di dieci tavole originale/variante. Browser: aperti tutti i modelli e selezionati tutti i sei nuovi colori, con 1.200 caricamenti riusciti. Verificati dimensioni native, ingrandimento contenuto, desktop 1280 e telefoni 390/320 pixel, font, assenza di scorrimento orizzontale/errori JavaScript/risposte HTTP errate. Note mantenute al ricaricamento e al cambio modello, filtri per marca/testo/stato, link copiabili, elenco negli appunti e download delle correzioni funzionanti. Nessuna richiesta di scrittura; nessuna modifica a dati o contratti del gioco. Report e catture in `.preview/paint-catalog-qa`.

Le maschere nuove sono una prima versione pronta per la revisione dell’utente: i controlli di conservazione non equivalgono all’approvazione estetica di ogni bordo. Le eventuali correzioni si applicano alla maschera del singolo modello e si propagano ai sei colori.

Ricostruzione di controllo con le maschere salvate: tutti i 1.400 PNG (maschere e sei varianti per modello) identici byte per byte prima della rifinitura finale della Primera. Rifinito poi il bordo inferiore/posteriore della foto 404×138, con estensione locale limitata ai pixel della vernice rossa; i sei colori e la navigazione sono stati ricontrollati su tre larghezze. La build pubblicabile è stata confrontata con tutti gli asset della cartella di revisione. Lint, controllo sintattico degli strumenti e build superati.

[Prompt individuali e provenienza delle 199 nuove maschere](../tools/paint-prototype/catalog-mask-sources.json).

### Pubblicazione verificata

Pubblicato il catalogo completo il 24 ottobre 2026 sull’istanza unica 5174, gateway 5184 e indirizzi Funnel 443/8443. URL conservato: `/previews/seicento/`. Backup completo Auth + gioco prima e dopo e build precedente in `/home/klaro/.backups/poketurismo/paint-catalog-2026-10-24T18-32-39-230Z` (accesso privato). Nessuna migrazione o operazione di modifica dei salvataggi.

Verificati su gateway e su entrambi gli indirizzi pubblici HTML, JavaScript, CSS, indice dei 200 modelli e PNG rappresentativi identici agli asset collaudati. Salute HTTP 200, API personali anonime HTTP 401. Ricontrollati gli hash di tutti i 200 originali. Servizi attivi e report in `.preview/paint-catalog-qa`; server temporaneo rimosso dopo il collaudo.
