# Poketurismo: provincia del Nord, circa 2002

Direzione esplicita dell'utente: **Nord Italia tra fine anni Novanta e primi Duemila; Windows 98 e web dei primi anni 2000**. Questa è l'identità del gioco e vale anche per ogni nuova funzione. Il riferimento di stagione è il 2002, già coerente con il distributore AGIP e i prezzi in euro. Non cambiare questa direzione aggiungendo interfacce contemporanee.

## Interfaccia

- Desktop verde petrolio #008080, finestre #c0c0c0, titoli #000080, ombre #808080/#000 e luci #fff. Bordi squadrati a rilievo/incasso, selezioni blu, indicatori segmentati e tabelle.
- Conservare il font pixel VT323 già usato nel gioco. Login in Tahoma/MS Sans Serif e forum in Verdana/Tahoma sono eccezioni deliberate, coerenti con l'epoca; non usare font di sistema moderni nelle sezioni aggiunte.
- Finestre, schede e pulsanti da programma Windows; bacheche, link blu sottolineati, listini, cartelle di posta e tabelle da sito/forum 2000. Niente pagine promozionali, pannelli blu petrolio contemporanei, pulsanti arrotondati, sfumature cinematografiche o ombre sfocate. La sfumatura della barra del titolo è quella di Windows 98, ammessa.
- Il raduno usa un elenco di vetture con intestazioni e foto, non un mosaico di schede moderne. La posta usa cartelle e righe di messaggi, non bolle da chat attuale. Autodromo e prove a tempo sono segreteria e registro del club; scuola guida è un manuale con schede e progressi segmentati.
- Cronometri/LCD neri e verdi possono restare: appartengono all'immaginario dell'epoca. Mantenere leggibilità, navigazione da tastiera e adattamento al telefono; la coerenza storica non richiede di rompere i controlli moderni di accessibilità.

## Immagini: usare quelle originali

Tutte le immagini precedenti sono conservate senza modificare i file. Non rimuovere foto e anteprime durante una riscrittura di pagina. Prima di sostituire un'immagine, verificare public/images e la storia Git della sezione. Niente filtri scuri o sovrapposizioni che nascondano la grafica fornita dall'utente.

| Servizio officina | Anteprima originale |
|---|---|
| Tagliando | public/images/work/oil.png |
| Gomme | public/images/work/tyre.png |
| Revisione motore | public/images/work/rebuild.png |
| Ripristino completo | public/images/work/repair.png |

Restano anche le foto del luogo in workshop.png, meet.png, track.png, street.png, garage.png, shop.png e fuel.png; foto dei modelli in images/car e ricambi in images/part. Le quattro anteprime dell'officina sono state ripristinate accanto al preventivo e ai benefici effettivi, senza tornare alle vecchie regole economiche.

## Ambientazione e linguaggio

Provincia, capannoni, centri commerciali, bar del passo, autolavaggi, distributori, club del venerdì sera, statali, laghi e strade alpine. Parcheggio con cofani aperti e amici del forum; segreteria del club con calendario delle domeniche in pista. Evitare tono da portale attuale e competizioni mondiali inserite nella mappa locale.

Le auto originali arrivano al 2001: nessun modello futuro è stato aggiunto o rimosso. Restano lecite auto d'importazione e soprannomi da forum/tuning dell'epoca. Nessun cambio di soldi, prezzi, tecniche, IP, premi o fisica in questa revisione.

I nuovi circuiti e percorsi ora richiamano Lombardia, Piemonte, Veneto, Alto Adige, Emilia-Romagna e Liguria: San Rocco nel Pavese, club della Bassa, Ticino, Garda, Langhe, Colli Euganei, Cisa, Lario, Sebino, Valsesia, Canavese e Levante ligure. Sono percorsi di gioco ispirati a quei luoghi; lunghezze e geometrie esistenti non diventano repliche cartografiche certificate. Monza rimane. Anche le due vecchie etichette di prova sono sostituite da nomi di strade di provincia.

Il raduno è «Club Motori del Nord». I due titoli che richiamavano eventi internazionali diventano «Trofeo GT 280 · Nord Italia» e «Coppa Gran Turismo · Club del Nord». Le informazioni di posta/scadenza usano giorno, mese e ora reali, senza mostrare un anno contemporaneo nella cornice del 2002; ordinamento e durata di 48 ore non cambiano.

## Compatibilità dei salvataggi

shared/periodWorld.mjs definisce nomi e alias. scripts/align-period-world.cjs mostra prima il piano; --apply aggiorna soltanto Track.name e i nomi/descrizioni dei due campionati interessati. L'operazione è transazionale e idempotente, e rifiuta alias duplicati ambigui. Nessuna cancellazione o ricreazione di tracciati, settori, auto o campionati; nessuna migrazione di schema.

ID, layout, meteo, distanze, calendari, risultati, record, saldi, progressi e conversazioni rimangono invariati. Le sessioni e i contratti già congelati conservano i dati originali; solo le proiezioni pubbliche mostrano i nuovi nomi, così le gare in corso e i vecchi tempi non perdono i collegamenti. I seed riconoscono sia i nomi precedenti sia quelli attuali per non duplicare contenuti.

## Verifica

175 test di gioco e 9 account/gateway passati, lint e build superati. Casi specifici: compatibilità dei vecchi nomi, calendari congelati, anteprima senza scritture, riallineamento idempotente, rollback su ambiguità, conservazione di record/settori/giocatori e presenza delle quattro immagini del meccanico.

Su copia PostgreSQL: 22 nomi di tracciati aggiornati e due campionati riallineati. Confronto di tutte le tabelle: soltanto nomi e descrizioni autorizzati cambiano. Tutte le foto dei 200 modelli e dei 48 ricambi, oltre alle lavorazioni, sono presenti; nessun file immagine originale modificato.

Controllo con browser headless su una copia locale e piloti sintetici: officina, raduno, posta, sfide, clandestine, ricambi e confronto, scuola, autodromo, tempi, benzinaio e campionati. Desktop 1280×960 e viste telefono 390×844: nessun errore JavaScript o scorrimento orizzontale nelle viste verificate. Controllo visivo delle foto del meccanico, font, cornici e schermate principali. Catture e report in .preview/period-qa, senza dati di account reali e senza modificare la partita pubblica durante il collaudo.

Pubblicato il 23 ottobre 2026 sulla sola istanza 5174 tramite il gateway 5184. Backup completo Auth + gioco prima e dopo; copia dei dati precedenti, build e rapporto di verifica in /home/klaro/.backups/poketurismo/period-mood-2026-10-23T05-09-21-406Z (accesso privato). Verificato anche sul database effettivo: 22 tracciati e due campionati aggiornati; confronto di tutte le tabelle superato, nessun altro campo modificato. Servizi attivi, health positivo, officina e raduno pubblici HTTP 200, API personali senza sessione HTTP 401. Anteprima e database di collaudo rimossi dopo la verifica.

Cartoline e minimappe: 27 ambientazioni lowres in public/images/tracks e atlante del club /tracks; linee guida e compatibilità in [ANTEPRIME_TRACCIATI.md](ANTEPRIME_TRACCIATI.md). Il circuito di prova conserva il disegno originale.
