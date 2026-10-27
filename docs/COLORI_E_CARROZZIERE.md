# Auto pixel art, colori e carrozziere

Richiesta dell'utente: usare nel gioco tutti i 200 disegni approvati, scegliere il colore nel concessionario, aggiungere il carrozziere al meccanico e variare i colori di usati e avversari.

## Immagini e archivio

Le schermate del gioco usano esclusivamente `public/images/pixel-cars/<modello>/<colore>.png`: garage, concessionario, usato e relativi dettagli, raduno, sfide e gare. Il selettore comune usa un elenco di 200 nomi consentiti e la revisione del modello per aggiornare la cache. Le sette varianti per modello sono quelle approvate; nessuna nuova generazione o alterazione delle 2.200 immagini native.

Le vecchie fotografie e le relative vernici sono rimosse da `public/images/car` e `public/images/paint` e conservate, byte per byte, in `tools/paint-prototype/archive/images`. La precedente pagina fotografica e la prova iniziale sono archiviate; `/previews/seicento/` rimanda all'album attivo. `/previews/pixel-cars/` mostra soltanto le pixel art, conserva note e valutazioni locali e non richiede più fotografie pubbliche. Il font della pagina è conservato.

`build-pixel-catalog.cjs` continua a ricostruire gli asset dagli input nativi e legge i riferimenti fotografici dall'archivio. Aggiorna anche `shared/carArtwork.mjs`, compresi gli indici di revisione. I vecchi costruttori delle vernici fotografiche segnalano l'archiviazione anziché ricreare accidentalmente quelle cartelle pubbliche.

## Colori e acquisti

Sette tinte in `shared/carPaint.mjs`: rosso pastello, blu scuro, verde bottiglia, nero, bianco, grigio argento e giallo pastello. Campo opzionale `Garage.paintColour` per il singolo esemplare; un vecchio esemplare privo di colore usa un valore stabile ricavato dal modello, senza modificare vecchie gare o contratti. Il colore non entra nel calcolo delle prestazioni.

Nella scheda di acquisto del concessionario il colore si sceglie con pulsanti e anteprima. Tutte le tinte sono incluse nel prezzo del nuovo; il server valida il valore e applica il prezzo di catalogo, senza accettare prezzi dal client. I client precedenti che omettono il colore ricevono la tinta predefinita del modello.

Gli usati esistenti ricevono un assortimento persistente durante la migrazione, senza cambiare disponibilità, proprietari, prezzi o condizioni. I futuri lotti assegnano la tinta alla creazione. Un usato mantiene il colore dell'annuncio dopo l'acquisto; vendita e riacquisto conservano la tinta. Non si può cambiare colore passando un parametro nell'acquisto dell'usato.

## Officina e carrozziere

Nella stessa finestra dell'officina ci sono due reparti: Meccanico e Carrozziere. Seleziona una tua auto, confronta i sette colori e conferma la verniciatura completa a **2.500 €**. Il colore rimane salvato dopo ricaricamento ed è mostrato anche nell'esposizione al raduno.

Endpoint `POST /api/garage/:garageId/paint`, protetto dalla stessa autenticazione e gestione delle operazioni delle altre spese. Verifiche di proprietà, colore, preventivo corrente, fondi e assenza di gare attive. Una tinta già presente non viene addebitata. Addebito e modifica del solo campo colore nella stessa transazione; il medesimo identificativo operazione può essere ritentato senza un secondo addebito. Nessuna riparazione, montaggio, consumo di carburante o variazione dei chilometri inclusa nel servizio.

## Gare e sfide

Le nuove gare salvano la tinta nel checkpoint del giocatore e dell'avversario. Clandestini con colore coerente fra offerta e partenza; campionati con tinte dei rivali congelate nel contratto; gare singole con varietà ricavata dal seme già disponibile. L'assegnazione cosmetica non consuma il generatore della simulazione e non altera difficoltà o premi.

Le sfide Meet mostrano il colore dell'esemplare ma lo escludono dall'impronta della preparazione: una riverniciatura non invalida inviti esistenti o configurazioni delle prove a tempo. I contratti e i risultati precedenti non vengono riscritti. Le immagini delle nuove gare e sfide rimangono quelle del checkpoint, anche se si cambia tinta successivamente.

## Migrazione e verifica

PostgreSQL: `server/prisma/postgres/migrations/0009_car_paint/migration.sql`, transazionale. SQLite per i test: `server/prisma/migrations/0012_car_paint/migration.sql`. Colonna con vincolo sulle sette tinte; i vecchi esemplari posseduti rimangono compatibili con il valore nullo, mentre i soli annunci di mercato vengono colorati dalla migrazione.

278 test del gioco superati, inclusi prezzo, proprietà, fondi insufficienti, preventivo scaduto, ripetizione della richiesta, blocco in gara, trasferimento del colore dell'usato, impronte delle sfide e tinta del rivale clandestino. Prova su PostgreSQL temporaneo: 32 annunci con sette colori, vincolo SQL contro colori sconosciuti, altri campi del garage invariati, utenti/saldi e catalogo vetture invariati.

Browser su database temporaneo: acquisto blu, riverniciatura gialla a 2.500 €, persistenza dopo ricaricamento, annuncio usato con colore conservato, raduno e gara con tinte corrette, interventi disabilitati durante la gara. Desktop 1280 e telefoni 320/390, senza scorrimento esterno; nessun errore JavaScript, risorsa mancante o richiesta alle cartelle fotografiche ritirate. Archivio di 1.949 file identico agli originali e tutte le 2.200 pixel art approvate identiche. Rapporti e catture in `.preview/car-colours-qa`.
