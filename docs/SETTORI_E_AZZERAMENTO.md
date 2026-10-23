# Settori variabili e anteprima durante la gara

## Interfaccia

La gara mostra sempre, sopra auto e controlli, la cartolina del percorso e la minimappa, con settore attuale giallo e indicazioni Ora/Poi. Il pulsante «Esamina tutti i settori» apre l’elenco completo senza nascondere la guida ordinaria. Vale per gare su pista, clandestine, campionati, prove a tempo e sfide fra piloti con un percorso del catalogo. Il pannello è aperto anche su telefono; la grafica resta Windows 98. Nelle mappe oltre 12 settori si mostrano numeri principali e vicini al settore attuale per mantenerle leggibili; tutti i settori restano nell’elenco. Il cronometro dispone i settori su più righe quando necessario.

«Mappe e anteprime» è ora una delle attività principali dell’autodromo; l’atlante apre subito San Rocco, senza richiedere di scoprire le schede chiuse.

## Decisioni in base al percorso

shared/trackGeometry.mjs genera la stessa struttura per anteprima, gara, stima rivale, campionato, classifiche e nuovi contratti delle sfide. Fasce obiettivo:

| Lunghezza | Decisioni |
|---|---|
| Fino a 3 km | 4–6 |
| 3–6 km | 7–10 |
| 6–10 km | 11–14 |
| Oltre 10 km | 15–20 |

Dentro la fascia, più tornanti e varianti spostano il conteggio verso l’alto. Il raggruppamento mantiene ordine e distanza complessiva, e favorisce punti di decisione tecnici; se servono altri settori, divide solo rettilinei di almeno 600 m, senza tagliare curve a metà. Un percorso con pochissimi tratti può restare sotto la fascia per evitare settori inventati. I settori fisici già presenti nel database, con i loro ID e riferimenti, non vengono cancellati o riscritti. Il Circuito Scuola conserva le otto decisioni disegnate a mano; anche le lezioni restano con i loro esercizi originali.

Esempi effettivi: San Rocco 6, Garda 10, Colli Euganei 12, Cisa 14, Stelvio 18, Cadore 19, Riviera di Levante 20. Nei 26 percorsi persistenti ci sono 12 conteggi differenti.

Il nuovo layout ha versione 2. L’esposizione all’errore segue i metri percorsi, con riferimento 500 m: suddividere la stessa distanza non moltiplica da solo la probabilità di almeno un errore. I guasti seguono un rischio per chilometro. Consumi ordinari, usura e chilometri restano proporzionali alla distanza, senza costo minimo di carburante per ogni nuova decisione. Le tecniche mantengono i loro costi di utilizzo; i limiti di pratica per gara/percorso rimangono attivi. Gli imprevisti scelgono un settore nell’intera struttura nuova, non soltanto nei primi otto. La firma della classifica include versione ed esposizione del layout.

## Azzeramento richiesto dall’utente

L’utente ha autorizzato esplicitamente la cancellazione di gare e record di test. Operazione singola, dopo backup completo Auth + gioco e sospensione delle scritture; nessun azzeramento automatico all’avvio o a ogni build.

server/resetRaceHistory.js e scripts/reset-race-history.cjs eliminano RaceSession (incluse prove a tempo e relativi record), ChampionshipEntry (iscrizioni/classifiche attive e concluse), MeetChallenge (inviti e risultati). PlayerProgress.streetState conserva la reputazione delle zone ma perde precedenti vittorie/sconfitte/pareggi, avversari affrontati, offerte e mazzi precedenti. Il nuovo test riparte quindi anche con i precedenti dei rivali vuoti. Non vengono restituiti costi di gare già pagati né alterati saldi: i valori della carriera restano quelli del momento del reset.

Le ricevute di operazioni di gara vengono invalidate con una marca, conservando chiavi e impronte: una richiesta precedente ritentata riceve HTTP 410 e non ricrea una gara o un addebito. Restano valide le ricevute di acquisti e delle altre operazioni economiche. Non eliminare tutta GameOperation: permetterebbe di eseguire di nuovo acquisti già pagati.

Preservati: account e amministratori, piloti, livelli, XP, soldi, garage, preparazioni, inventario, chilometri e condizioni delle auto, tecniche e pratica, debiti, esposizione al raduno, messaggi, blocchi e segnalazioni, cataloghi di auto/ricambi/tracciati/campionati. Nessuna migrazione di schema.

Il comando mostra soltanto il piano per impostazione predefinita. L’applicazione richiede entrambi --apply e --confirm-reset-races. Non invocarlo nei servizi o nei seed.

## Collaudo

189 test di gioco e 9 account/gateway passati, lint e build superati. Casi specifici: varietà dei conteggi, distanze e ordine conservati, curve non spezzate, esposizione al rischio per distanza, consumo/usura equivalenti con 4 e 20 decisioni, anteprima aperta durante la gara, azzeramento idempotente e deduplicazione degli acquisti conservata.

Su copia PostgreSQL: piano senza scritture e reset applicato, confronto di tutte le tabelle e dei campi preservati; risultati, iscrizioni e sfide vuoti, progressi e messaggi invariati. Completata anche una nuova gara sintetica dello Stelvio in 18 turni tramite le API vere. Nel browser: pannello aperto prima/dopo la scelta, evidenziazione aggiornata, vista telefono, dettaglio di tutti i 18 settori, atlante aperto alla prima visita, Riviera da 20 settori e accesso evidente dall’autodromo. Otto verifiche a 1280×960 e 390×844 senza errori JavaScript o scorrimento orizzontale. Catture e report in .preview/sectors-qa; nessun account reale usato per giocare nel collaudo.
