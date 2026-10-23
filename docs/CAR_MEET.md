# Car Meet — Night Riderz

Il piazzale sostituisce la schermata «prossimamente» con esposizioni volontarie e tempi condivisi. Accessibile dalla mappa anche senza auto, sempre dopo il login. Nessuna puntata, premio, addebito o sfida PvP in questa versione.

Pubblicato nell'istanza condivisa il 22 ottobre 2026. Dopo la migrazione verificati utenti, auto, ricambi montati, progressi, iscrizioni e gare invariati; esposizione inizialmente disattivata per tutti. Backup completo prima e dopo l'applicazione, pagina e API disponibili, lettura del raduno protetta dal login.

## Esposizione

Ogni giocatore può scegliere una sola auto posseduta. «Esponi e condividi i tempi» rende visibili agli altri iscritti nome pilota, livello, auto, dati tecnici e pezzi installati, insieme ai suoi tempi validi in pista. Nessuna esposizione automatica alla migrazione o alla registrazione. «Ritira dal raduno» nasconde sia la vettura sia i tempi condivisi; i record personali rimangono disponibili nell'Autodromo.

Foto e statistiche sono reali; aprendo la scheda si vedono i pezzi installati e il confronto con la propria vettura equipaggiata. L'IP segue shared/vehiclePerformance.mjs. Nessuna email, password, identificativo Auth, saldo, inventario o garage completo nelle risposte pubbliche. Le proiezioni selezionano soltanto campi di gioco autorizzati. Nessuna foto o nome dell'account Google: viene mostrato il nome del pilota scelto nel gioco.

Il server controlla la proprietà a ogni richiesta di esposizione e lettura. Vendere la vettura esposta la rimuove automaticamente dal piazzale e nasconde i tempi del precedente proprietario, senza esporre quelli del nuovo. Si può quindi scegliere un'altra vettura. Esporre o ritirare non cambia l'auto equipaggiata, non consuma carburante e non interrompe una gara attiva.

## Tempi condivisi

Filtri per circuito e modello: non si mescolano vetture diverse. Per ciascun pilota viene mostrato il miglior giro valido, con classifica, distacco, CV, peso e IP iniziale. Le nuove prove conservano anche salute del motore, gomme, carburante e ricambi al momento della partenza. Vecchi giri validi possono comparire ma indicano chiaramente che i dati iniziali sono parziali.

Assetti e abilità possono differire anche sullo stesso modello. Non si tratta di un campionato monomarca con condizioni normalizzate: i dettagli permettono di valutare i tempi. Il raduno non offre ancora un ranking tra categorie differenti. L'API supporta anche il filtro per impronta dell'assetto, ma l'interfaccia mostra il confronto per modello con i dettagli di preparazione.

Sono ammesse solo RaceSession track/completed, regole v3, marcate timeTrial dal server, senza guasti, con tutti i settori percorsi e tempo finito positivo. Escluse gare singole, lezioni, campionati, abbandoni e altri modelli. Una firma di geometria, meteo e fondo evita di mescolare vecchie configurazioni del circuito con quella attuale. I tempi vengono ricavati dalle sessioni salvate: nessun endpoint accetta un tempo dal browser.

Si mostra un solo miglior risultato per pilota, massimo 50 classificati; tempi uguali al millisecondo condividono la posizione. Ordine stabile per pilota a parità di tempo. Il pulsante Aggiorna ricarica piazzale e classifica; non ci sono notifiche automatiche, polling o messaggi inviati agli altri utenti.

## Dati e API

Migrazione additiva SQLite 0008 / PostgreSQL 0005: PlayerProgress.showcaseGarageId nullable, default NULL. Non cambia progressi, auto o sessioni precedenti. Il riferimento non usa una FK: una vettura venduta viene filtrata mediante il controllo congiunto di proprietario e ID, conservando i record personali storici.

- GET /api/meet?userId=...: piazzale e vettura attualmente esposta dal richiedente; identità verificata.
- POST /api/meet/showcase: solo garageId posseduto o null; identificativo operazione, retry sicuro e ricevuta aggiornata allo stato corrente. Compatibile con gare attive.
- GET /api/meet/leaderboard?trackId=...&modelId=...: proiezione pubblica dei soli giocatori con esposizione valida; accesso riservato agli iscritti.
- Nuove prove a tempo: trialSetup.configuration contiene metadati iniziali immutabili, senza cambiare motore, consumi, premi o regole delle prove.

## Collaudo

135 test JavaScript passati, inclusi proprietà, campi pubblici, ritiro con retry, vendita, gare attive, migliori tempi, filtri per layout/meteo/modello e rendering di foto/confronto/record precedenti. Nove test account/gateway passati, lint e build superati, migrazioni SQLite/PostgreSQL verificate.

Copia PostgreSQL: due nuovi giocatori completano un giro, espongono le vetture durante la gara, compaiono nel confronto, poi ritirano o vendono. Verificati assenza di campi privati, conservazione dei record personali e dati precedenti invariati. Script scripts/validate-car-meet.cjs, obbliga ACCOUNTS_VALIDATION_ENV_FILE a un database locale *_validation.

Nessun browser collegato disponibile per il controllo visivo interattivo; i componenti sono verificati anche tramite rendering automatico.

## Aggiornamento: parcheggio persistente

Le regole aggiornate di permanenza, ritiro alla partenza e consultazione periodica sono in [RADUNO_E_AMICIZIE.md](RADUNO_E_AMICIZIE.md). La stessa auto già in gara non può essere esposta; si può lasciare un'altra vettura al raduno. Lo scambio dei numeri aggiunge amicizie consensuali, mantenendo SMS e sfide asincrone.
