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

## Revisione dei bordi · 25 ottobre 2026

Feedback dell’utente: sulle foto rosse restava una frangia della tinta originale sotto paraurti, passaruota e minigonne; sulle foto bianche/argento alcuni contorni dei pannelli rimanevano chiari dopo la verniciatura.

Correzione offline con `edge-repair.cjs`, riusando le maschere native e i pixel originali. Nessuna nuova generazione delle automobili e nessun filtro applicato all’intera immagine. La Seicento approvata conserva esattamente i suoi sette PNG.

- Vernice rossa: estensione selettiva della maschera sui pixel compatibili con la tinta originale, nella parte inferiore della carrozzeria. Banda limitata e riferita sempre alla maschera iniziale, con esclusione della zona dei fanali posteriori e del centro delle ruote. Recuperate anche le sfumature calde del bordo sotto i pannelli. Le strisce rosse decorative di vetture originariamente bianche non rientrano in questo intervento.
- Vernice chiara: selezione delle strette giunzioni fra pannelli e dei bordi luminosi adiacenti alla vernice. Contorni riportati a un tono quasi nero, distinto dalla ricolorazione della lamiera. Dimensioni minime e controlli sulle forme escludono piccoli marchi/maniglie e aperture dei fari; i riflessi ampi all’interno dei pannelli non vengono trasformati in linee. Controllate anche le fotografie argento con ombre che ne abbassano la luminosità mediana.

`mask.png` ora descrive l’unione delle aree modificabili: vernice e contorni. `outline.png` distingue i contorni da rendere scuri. I valori alpha restano quelli dell’originale, e i pixel esterni alle aree autorizzate non cambiano. Le maschere di partenza sono conservate in `tools/paint-prototype/mask-bases-v1`: ripetere la revisione non allarga progressivamente la selezione.

La ricostruzione normale rimane `node tools/paint-prototype/build-catalog.cjs`: riusa maschere e contorni già corretti. `--repair-edges` applica esplicitamente questa revisione globale dalle basi conservate; non usarlo per sovrascrivere successive correzioni manuali senza aggiornare la base o la revisione. Nessun `--prepare` necessario.

### Nuovo controllo nella preview

Stesso URL e stessi 200 modelli. Il filtro «Anteprime aggiornate» mostra le immagini effettivamente modificate. Il numero di revisione impedisce di riusare per errore immagini in cache.

Le note locali preesistenti rimangono salvate. Sui modelli modificati una precedente approvazione torna «Da valutare»; le segnalazioni «Da correggere» restano tali, accompagnate dall’indicazione che l’immagine è stata aggiornata. «Conferma valutazione» permette di confermare anche uno stato rimasto identico. Le auto non modificate e la Seicento conservano le approvazioni precedenti. L’esportazione segnala le note che si riferiscono ancora alla versione vecchia.

### Controlli della revisione

Test mirati per bordino rosso, fanali e sfondo protetti, giunzioni scure, riflessi ampi e piccoli dettagli conservati, famiglie di colore non coinvolte, punti della minigonna M635 e dei pannelli E39, striscia rossa originale della Peugeot 205. Verificati per tutte le 1.200 varianti alpha, dimensioni e conservazione dei pixel non interessati dal ritocco rispetto alla preview precedente. Nessuna modifica alle 200 foto originali o ai salvataggi del gioco.

Esito: 119 anteprime effettivamente aggiornate, sulle 71 foto rosse/calde e sulle foto chiare/argento con bordi da correggere. Le 81 anteprime non interessate restano identiche, compresa la Seicento. Controllati oltre 61 milioni di pixel non coinvolti dal ritocco: tutti identici alla preview precedente, con alpha e dimensioni conservati. Ricostruzione normale ripetuta: 1.520 PNG identici byte per byte, compresi i livelli dei contorni.

Browser finale: aperti tutti i 200 modelli e tutte le 1.200 varianti, nessuna immagine mancante o errore JavaScript; larghezze 320, 390 e 1280 senza scorrimento orizzontale. Verificate vecchie note conservate, approvazioni da ricontrollare solo sulle immagini modificate, vecchie segnalazioni mantenute, conferma della nuova revisione e filtro «Anteprime aggiornate». Nessuna richiesta di scrittura verso il gioco. Tavole prima/dopo e rapporti in `.preview/paint-edge-qa`.

### Pubblicazione della revisione

Revisione pubblicata il 25 ottobre 2026 sull'istanza unica, dopo backup completo Auth + gioco e copia della build precedente in `/home/klaro/.backups/poketurismo/paint-edges-2026-10-25T02-42-01-195Z`. Backup ripetuto dopo il rilascio, con esito positivo. Nessuna migrazione o scrittura sui salvataggi.

Controllati gateway 5184 e indirizzi pubblici 443/8443: HTML, JavaScript, CSS, indice e sei PNG rappresentativi identici ai file collaudati; 200 modelli, 119 revisioni aggiornate. Il catalogo pubblico ha richiesto circa 20–22 secondi in questo controllo: il primo timeout a 15 secondi è stato risolto estendendo il tempo del collaudo, senza modificare la configurazione Funnel. Salute HTTP 200 e API personali anonime HTTP 401 su tutti e tre gli indirizzi. Hash dei 200 originali verificati; servizi attivi. Rapporto in `.preview/paint-edge-qa/report-public.json`; server e checkout temporanei rimossi.

## Revisione 3 · elenco di 83 modelli e giallo

Nuovi appunti dell'utente conservati in `tools/paint-prototype/review3-notes.json`. Le correzioni valgono per tutte le tinte. Aggiunto **Giallo pastello** per tutti i 200 modelli: ora sette tinte e 1.400 varianti nella stessa pagina nascosta. Prezzo proposto sempre 2.500 €; questa revisione non introduce acquisti o scritture sui salvataggi.

Ritocchi alle maschere native e alle giunzioni, con regole specifiche in `review3-rules.cjs` e operazioni riproducibili in `review3-repair.cjs`. Coperti anche colori di partenza diversi dal rosso, punti isolati degli specchietti, passaruota e bordi inferiori. Il rettangolo sul muso della Corvette C5 è carrozzeria e ora segue la vernice. Ripristinati i fari della Visa esclusi dalla maschera; mantenute frecce, fendinebbia e vetri nelle aree di dettaglio. Cornici dei vetri della Trueno e giunzioni dei pannelli delle auto segnalate portate a toni scuri. Sulle quattro fotografie scure AX, Delta HPE, Mazda 323 e 180SX: esclusioni dei vetri rifinite e luminanza della sola vernice regolarizzata localmente, riducendo il contrasto irregolare delle tinte chiare senza ricampionare gli sprite.

Il nuovo feedback autorizza esplicitamente a correggere anche la Seicento: il vincolo precedente sui suoi sette PNG era relativo alla prima approvazione ed è superato da questo elenco. Ripulito il bordo giallo sopra il faro mantenendo la parte arancione dell'indicatore. Il suo profilo di ombreggiatura resta quello della prima prova.

La ricostruzione ordinaria (`build-catalog.cjs`, oppure il vecchio ingresso `build.cjs`) riusa maschere, contorni e profili salvati. `--prepare` e `--repair-edges` sono bloccati in presenza dei ritocchi della revisione 3, per impedirne la perdita. `apply-review3.cjs` è soltanto la revisione esplicita dalle basi congelate in `mask-bases-review2`: non va eseguito dopo successive correzioni manuali senza aggiornare la revisione. La provenienza delle bozze precedenti resta conservata.

Filtro «Anteprime aggiornate» riferito agli **83 modelli di questo elenco**, non a tutte le modifiche storiche. Note e segnalazioni locali conservate; precedenti approvazioni tornano da valutare solo sui modelli cambiati, Seicento compresa. Le altre 117 auto conservano stato e note. Cache delle immagini modificate e JavaScript aggiornate alla revisione 3.

### Verifiche della revisione 3

Dieci test passati, inclusi: quattro punti degli specchietti, bordo del faro Seicento, luci Visa, indicatore ambra della 993, vetri delle quattro foto scure, muso C5, giunzioni scure e riduzione del rumore di luminanza nella vernice chiara. Verificati alpha, dimensioni e pixel esterni alle maschere per tutte le 1.400 varianti, oltre agli hash dei 200 originali. I 117 modelli non interessati conservano byte per byte le loro 702 varianti precedenti; identici oltre 42 milioni di pixel non interessati dai ritocchi rispetto alla preview precedente. Ricostruzione ordinaria ripetuta: tutti i 1.747 PNG di maschere, contorni e tinte identici byte per byte.

Browser: 200 modelli e 1.400 selezioni colore caricate correttamente; filtro aggiornate a 83, giallo selezionabile e collegabile direttamente, note vecchie conservate, conferma di revisione e approvazioni precedenti ricontrollate solo dove previsto. Nessuna immagine mancante, errore JavaScript o richiesta di scrittura. Larghezze 320, 390 e 1280 senza scorrimento orizzontale. Lint e build superati. Confronti originali/nero/blu/bianco e dettagli ingranditi in `.preview/paint-review-3-qa`; la valutazione estetica finale resta affidata al nuovo controllo dell'utente.
