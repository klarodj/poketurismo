# Cartoline e roadbook del club

Nord Italia, riferimento 2002. Tutti i 26 tracciati persistenti e il Circuito Scuola hanno una veduta dedicata; i 26 roadbook nuovi hanno forme distinte. Il Circuito Scuola conserva i percorsi SVG originali di shared/trackGeometry.mjs.

## Dove si vedono

- Atlante del club, /tracks, raggiungibile dall’autodromo e dai ritrovi: tutti i percorsi, filtro circuiti/strade, una scheda aperta alla volta.
- Preparazione della gara e della prova a tempo; dettaglio Pista nelle gare in corso, con il settore attuale in giallo.
- Percorso offerto da un rivale clandestino.
- Calendario dei round, registro dei tempi, classifiche del raduno, composizione e riepilogo delle sfide fra piloti.

Le cartoline mostrano il luogo e le condizioni del catalogo: campi e pioppi della Bassa, risaie, cave, capannoni, colline, laghi, Liguria, boschi, valichi, notte, nebbia, neve. Font pixel, cornici grigie in incasso e titoli blu; nessuna sostituzione delle immagini originali dei luoghi o del meccanico.

## Asset e produzione

Asset finali: public/images/tracks/*.png, 27 immagini native 384×256. Generazione con lo strumento integrato image_gen; prompt completo per ogni file in TRACK_ART_PROMPTS.json, accanto a questo documento. Esportazione PNG a campionamento nearest-neighbor per il formato lowres del gioco; originali di generazione conservati nella raccolta privata di Codex. Le immagini sono illustrazioni d’ambientazione, non fotografie documentali dei luoghi.

Modello di prompt: veduta di pista/strada nella specifica provincia del Nord nel 2002, fotografia pixellata da gioco PC 320×200 dell’epoca, palette contenuta, dithering, strutture provinciali e vetture precedenti al 2002; senza interfaccia, scritte, edifici o auto contemporanei. Notte/neve/pioggia/nebbia rispettano la stagione scenica del relativo percorso. File e immagini vengono caricati solo nelle schede aperte; nessuna generazione AI durante una partita.

## Schemi e compatibilità

shared/trackVisuals.mjs associa nomi/alias, cartoline, formato e punti del roadbook. Il disegno rappresenta una forma illustrativa, non una replica cartografica. Si distingue sempre il circuito chiuso dalla strada aperta; P/A coincidono solo sui circuiti. I settori sono suddivisi lungo lo schema in ordine e in proporzione alle lunghezze della sessione; il loro elenco conserva distanze, opportunità e condizioni reali della simulazione.

La minimappa è SVG con bordi netti e una palette classica. Le geometrie sono solo di presentazione: nessuna modifica a TrackBuild, distanze, formule fisiche, meteo, regole, contratti congelati o tempi. I nomi precedenti continuano a trovare la stessa grafica tramite periodTrackName. Per un percorso personalizzato sconosciuto rimane l’elenco dei settori, senza attribuirgli una cartolina o una mappa di un altro luogo.

Quando si aggiunge una pista, aggiungere anche la sua voce visuale, il PNG e il prompt; non cambiare i dati di gara per adattarli a un disegno. Durante le gare passare sempre trackName e sections della sessione al componente TrackPreview.

## Collaudo

182 test di gioco e 9 account/gateway superati; lint e build superati. I casi aggiunti verificano copertura di tutti i percorsi e dei vecchi alias, distinzione circuito/strada, suddivisione proporzionale e continua dei settori, conservazione del disegno scuola, marcatura del settore attuale e immagini PNG native 384×256 (27 file, circa 7,2 MB complessivi).

Browser headless con pilota sintetico e database PostgreSQL di collaudo: aperte tutte le 27 schede dell’atlante, provati entrambi i filtri, preparazione scuola e pista del catalogo, registro tempi e anteprima della sfida al raduno. Desktop 1280×960 e telefono 390×844; 33 controlli senza errori JavaScript o scorrimenti orizzontali. Catture e rapporto in .preview/track-qa. Il caricamento asincrono dei circuiti ora seleziona correttamente il circuito iniziale della sfida, anche quando il componente si monta prima che arrivi il catalogo.

Pubblicato il 23 ottobre 2026 sull’istanza unica 5174 attraverso il gateway 5184. Backup Auth + gioco prima e dopo; build precedente, copia privata dei dati e confronto di tutte le tabelle in /home/klaro/.backups/poketurismo/track-art-2026-10-23T06-02-31-509Z. Nessuna riga o campo del database modificato durante il rilascio. Servizi attivi, health positivo, /tracks pubblico HTTP 200, API senza sessione HTTP 401. Tutti i 27 PNG serviti dal gateway sono identici agli asset collaudati; verificati anche contenuto e HTTP 200 delle immagini notte/pioggia tramite l’URL pubblico. Anteprima e PostgreSQL temporanei di collaudo rimossi dopo la verifica.

### Nomi italiani dei settori

Dal 23 ottobre 2026 shared/trackSectionLabels.mjs traduce i 16 nomi del catalogo nelle viste: rettilineo breve/lungo, curva lenta/veloce a destra/sinistra, dosso, avvallamento, salita, discesa, variante, tornante e inversione a destra/sinistra, ostacolo. Vale anche per le combinazioni con →, le etichette delle minimappe, il settore attuale/successivo, tempi e cronologia delle sessioni già salvate. I nomi personalizzati restano riconoscibili. Si traduce soltanto la visualizzazione: database, identificatori, inferenza della geometria e contratti salvati restano invariati. Verifica: 183 test di gioco superati, lint e build superati, inclusi casi di resa italiana e conservazione dei dati originali.

### Anteprima in gara e settori variabili

Dal rilascio descritto in [SETTORI_E_AZZERAMENTO.md](SETTORI_E_AZZERAMENTO.md), cartolina e minimappa sono aperte anche durante la gara; settori e numerazione seguono la nuova struttura variabile. Mappe e anteprime sono un’attività principale dell’autodromo, e l’atlante apre subito una scheda. Il reset dello storico è stato autorizzato esplicitamente dall’utente per questa fase di test, con backup e conservazione della carriera.
