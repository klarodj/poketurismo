# Revisione generale dell’interfaccia · 24 ottobre 2026

Direzione: provincia del Nord Italia, circa 2002. Finestre grigie, titoli blu, font pixel VT323, foto originali; login in Tahoma e mercatino come forum dell’epoca. Panoramiche con immagini, condizioni, costo e prossima azione; schede approfondite apribili senza perdere il contesto.

## Interventi

| Area | Riscontro | Revisione |
|---|---|---|
| Finestre | Controlli che sembravano funzionanti; titoli ripetuti | Cornici coerenti, controlli decorativi non interattivi, X funzionante soltanto se esiste una chiusura; foto conservate |
| Barra generale | Saldi e carburante ripetuti, elementi di sviluppo fra i comandi di gioco | Mappa, cellulare, saldo e profilo; auto in una riga compatta fuori gara; strumenti solo per amministratori |
| Mappa | Nomi troncati in tre colonne su telefono | Due colonne, foto più leggibili, nomi completi, ultima destinazione a larghezza piena |
| Garage | Colonne incoerenti e telemetria prima delle azioni | Foto e condizioni, dettagli tecnici espandibili, selezione accessibile da tastiera; percorso per garage vuoto; vendita da riepilogo, blocchi durante gara |
| Scuola | Cinquanta schede estese | Corsi disponibili all’ingresso, filtri per tutti i 50, corsi compatti con dettagli e prove; ambientazione dedicata |
| Nuovo | Modelli casuali, valori minuti, acquisto poco esplicito | Ordinamento per prezzo, marca/ricerca/budget, 12 modelli alla volta, foto e dati base, scheda e conferma con prezzo |
| Usato | Annunci ripetitivi senza foto immediata | Otto annunci alla volta, foto/prezzo/condizioni, ispezione completa con ricambi conservata |
| Officina | Spiegazioni e preventivi estesi ripetuti | Quattro immagini delle lavorazioni sempre presenti, esito motore/gomme e costo prima dell’azione, dettaglio intervento; soccorso espanso soltanto quando serve |
| Ricambi | Varianti impilate e confronto inserito nella pagina | Varianti affiancate anche su mobile, filtro famiglia, confronto in finestra con delta e vincoli; acquisto e montaggio restano separati |
| Benzinaio | Spiegazioni prima del rifornimento, schermata molto lunga | Pompa con importo/litri affiancati, prezzo e quantità chiari, stima consumi su richiesta, rifornimento bloccato durante gara |
| Campionati | Pannelli scuri fuori tema, troppi requisiti prima del costo | Foto del circuito, quota e accesso, calendario/rivali/regolamento su richiesta, generale espandibile; errori di caricamento visibili |
| Tempi | Tutti i circuiti come schede lunghe, quasi tutte vuote | Circuito selezionabile con foto e minimappa, record in evidenza, storico separato e registro completo apribile |
| Atlante | Elenco lungo e geometria sempre aperta | Ricerca, filtri, altri percorsi su richiesta; settori tecnici espandibili |
| Raduno | Esposizione e spiegazioni ripetute in ogni sezione | Schede prima dei contenuti, gestione esposizione nel solo piazzale, nuova sfida compatta, classifica leggibile anche su 320 px |
| Cellulare | Popup persistente sopra il gioco | Avviso per 8 secondi, pausa su focus/hover; contatore e SMS rimangono, nessun acknowledgement automatico |

Le schermate di gara mantengono immagini, minimappa, comandi e avvisi critici. Nei campionati resta una sola sintesi di posizione/vicini; la tabella e i rilevamenti si aprono nel dettaglio. Le anteprime pre-gara mostrano i settori tecnici su richiesta.

## Coerenza logica

La visita ai servizi non richiede più un’auto: il nuovo pilota può consultare il mondo e leggere gli stati vuoti. I controlli sulla partenza e sulle operazioni rimangono nel server. Prezzi, carburanti, consumi, fisica, IP, premi, contratti congelati, record e salvataggi non cambiano.

Il livello dei ricambi montati viene mappato dai dati effettivi; tolti il falso “LVL ?”, il testo “ORANGE STOCK” e i ripieghi verso immagini esterne. Le variazioni di peso rispettano il segno della riduzione già usata dal motore. Il registro distingue consumi storici e attuali; il collegamento dal registro apre realmente la scheda tempi del raduno. Stili del login circoscritti al login, senza imporre Tahoma o larghezze minime ai pulsanti del gioco.

## Illustrazioni

`public/images/places/scuola-guida.png`: istruttore, utilitaria, coni, capannone e Prealpi; contrassegno italiano P. `public/images/places/cronometraggio.png`: ufficio del club con CRT, cronometro e corsia box. Entrambe 384×256, palette 96 colori. Generate con lo strumento integrato image_gen; copie distribuite ridotte nearest-neighbor, originali generati conservati. Prompt completi ed eventuale ritocco in [IMMAGINI_INTERFACCIA.json](IMMAGINI_INTERFACCIA.json). Nessuna immagine originale del gioco sostituita o cancellata.

## Collaudo

Copia PostgreSQL locale `_validation`, account sintetici e cataloghi reali: nessuna azione di prova sugli account pubblici. Controllo delle 16 destinazioni principali su 320, 390 e 1280 px; font VT323 effettivamente caricato, nessun errore JavaScript o overflow della pagina. Verificate anche finestra ricambi, ricerca percorsi, classifica raduno con dati, riepilogo vendita/annullamento, login su 320 e 1280 px e area amministrativa.

Nel browser: nuovo pilota senza auto, tutti i 50 corsi raggiungibili, lettura lezione e prova con auto in prestito, acquisto dal nuovo ed equipaggiamento, ricambio acquistato/montato/smontato, intervento e pieno, annunci successivi e ispezione usato, prova a tempo completa, SMS e invito dal raduno, iscrizione campionato/settore/classifica, cellulare e Snake. Verificata la chiusura degli avvisi senza segnare lettura, la pausa su hover e il nuovo avviso successivo.

Catture e report in `.preview/interface-qa` (solo dati di collaudo). I confronti di altezza preliminari usavano anche il carattere di ripiego: non sono misure prestazionali del gioco pubblico. La riduzione è verificabile dalla struttura: corsi e schede compatti, cataloghi progressivi e dettagli chiusi all’ingresso.

Verifica finale: 264 test JavaScript e 12 test account/gateway superati; lint, build e controllo del diff completati. Le prove con richieste di gioco sono state eseguite soltanto sulla copia locale; il login è stato ispezionato con configurazione simulata, senza inviare richieste OAuth.

## Pubblicazione

Online il 24 ottobre 2026 sulla singola istanza 5174 e gateway 5184. Backup completo Auth + gioco prima e dopo; build precedente e confronto privato in `/home/klaro/.backups/poketurismo/interface-review-2026-10-23T23-12-01-038Z`. Con servizi fermi, confronto integrale delle 32 tabelle game: tutte le righe identiche prima e dopo. Nessun cambiamento a server/shared, migrazioni o reset. Verificati gateway locale e Funnel 443/8443: pagine e health disponibili, API personali anonime 401, nuovo bundle e immagini corrispondenti agli artefatti distribuiti. Nessuna modifica alla configurazione Funnel.
