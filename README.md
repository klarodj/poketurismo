# PokeTurismo

Gestionale automobilistico con gare tattiche a turni, garage, tuning e campionati. Interfaccia ispirata a Windows 98, Nokia e forum automobilistici dei primi anni 2000.

React/Vite/Tailwind/Zustand per il frontend; Express/Prisma/SQLite per il backend. Una sola implementazione delle regole in `shared/raceEngine.mjs`: il server decide e salva i turni; il browser mostra le scelte e i confronti.

Dal 21 ottobre 2026 la direzione di lavoro è una sola istanza sviluppo/test sulla **5174**, seguita dalla migrazione a un PostgreSQL condiviso da Supabase Auth e gioco. Il [piano di consolidamento](docs/AMBIENTE_UNICO.md) distingue configurazione attuale, operazioni ancora da eseguire e migrazione futura. Il checkout legacy va conservato anche dopo lo spegnimento dei suoi container.

## Prova sul server attuale

Richiede Node **24**, npm, Python 3 e curl. Le dipendenze sono già presenti nella copia di lavoro attuale.

```bash
bash /home/klaro/poketurismo-work/scripts/preview.sh
```

Aprire `http://localhost:5174` dal server oppure `http://IP_DEL_SERVER:5174` dalla rete locale. CTRL+C ferma l'anteprima.

Alla prima esecuzione viene creato un backup coerente del database attivo, inclusi i dati WAL, in `.preview/game.db`. Le esecuzioni successive conservano il salvataggio di anteprima. Le migrazioni producono un backup prima di intervenire. Il frontend sulla porta 5174 usa tramite proxy `/api` un backend dedicato su una porta libera scelta dal sistema. Vite usa la cache scrivibile `.vite-cache`, separata dai `node_modules` condivisi.

La copia di anteprima è separata dal gioco attivo; non risincronizza automaticamente i progressi successivi di quest'ultimo. Non usare `git reset --hard` per aggiornare una cartella contenente un database tracciato.

## Nuova gara tattica

Dall'Autodromo scegliere **Circuito Scuola** (selezionato inizialmente): otto decisioni, tempo in secondi, ritmi di guida, staccate, traiettorie e tentativi di sorpasso. Prima di confermare si vedono tempo indicativo, rischio d'errore, carburante e usura; dopo il settore si leggono tempi, velocità e motivi del guadagno o della perdita.

Gli scenari del laboratorio confrontano la tua vettura con auto del catalogo equivalenti o superiori, guidate da principianti o piloti preparati. Non ci sono quote o premi nel laboratorio; carburante e usura sono comunque salvati.

Le nuove gare sugli altri tracciati usano lo stesso modello, accorpando i tratti in massimo otto decisioni. La loro geometria è stimata dai vecchi nomi dei settori; il Circuito Scuola ha lunghezze e raggi disegnati esplicitamente. Le gare già iniziate conservano le regole precedenti fino alla conclusione; lo stesso vale per campionati già iniziati a punteggio con quelle regole.

Il modello usa potenza, massa, velocità massima, accelerazione di partenza, aderenza e frenata. Il pilota sfrutta una frazione del potenziale: le tecniche aiutano controllo e precisione, senza creare cavalli. È una simulazione semplificata per il gioco, non una riproduzione validata di vetture o circuiti reali. Vedi [risultati e criteri di bilanciamento](docs/BILANCIAMENTO.md).

## Installazione delle dipendenze

Da una nuova copia del repository:

```bash
npm ci
npm --prefix server ci
DATABASE_URL=file:/percorso/assoluto/game.db npm --prefix server run generate
```

Il database runtime e i suoi backup devono stare fuori dal checkout di produzione. Copiare un database esistente con lo strumento di backup, poi applicare le migrazioni; una migrazione non importa il catalogo auto da zero.

```bash
python3 scripts/database.py backup /vecchio/percorso/game.db /nuovo/percorso/game.db
python3 scripts/database.py migrate /nuovo/percorso/game.db
```

Le migrazioni SQL versionate sono in `server/prisma/migrations` e vengono gestite dal runner Python, con checksum e transazione. Il runner completa le tabelle mancanti della versione precedente e converte il saldo legacy in centesimi una sola volta. **Non alternare questo runner a `prisma db push` o `prisma migrate deploy` su un salvataggio esistente.**

## Template Docker alternativo

`Dockerfile` e `compose.yml` costruiscono frontend e backend insieme, con un volume dati esterno al repository. Il frontend compilato viene servito da Express sulla stessa origine delle API. Il template usa ancora la porta **5180** e SQLite; non avviarlo come istanza aggiuntiva. Se adottato per il nuovo ambiente unico, va aggiornato e deve sostituire il runtime sulla 5174 dopo il passaggio dei dati. Non è stato avviato durante lo sviluppo.

Prima del primo avvio, copiare il salvataggio nel percorso host scelto, come descritto in [TESTING.md](docs/TESTING.md), e impostare `POKETURISMO_DATA_DIR` copiando `.env.example` in `.env`. Solo dopo la preparazione dei dati, il comando di pubblicazione è `docker compose up -d --build`. L'immagine applica le migrazioni e i backup all'avvio; una migrazione fallita impedisce l'avvio del server.

`scripts/update-code.sh` aggiorna soltanto checkout puliti con fast-forward e rifiuta database legacy tracciati. È la sostituzione preparata per il vecchio aggiornamento con hard reset: il job attivo sul server non è stato sostituito automaticamente.

## Verifiche

```bash
npm run lint
npm test
npm run balance
python3 -m unittest discover -s scripts -p test_database.py
npm run build -- --configLoader native
```

I test usano database temporanei e i veri handler Express/Prisma senza aprire porte. Coprono salvataggi, precisione monetaria, inventario, concorrenza, replay, risultati, campionati e determinismo del motore. Le prove automatiche non sostituiscono il giro completo nel browser.

## Regole e salvataggi

- Il saldo è salvato in centesimi interi; carburante e usura mantengono i decimali.
- Ricambi acquistati, quantità, mosse conosciute e fino a quattro mosse equipaggiate sono persistenti.
- Montaggio e sostituzione consumano il pezzo posseduto; il pezzo rimosso torna in inventario.
- La benzina premium migliora del 2% le prestazioni del motore fino al successivo rifornimento normale.
- Le nuove gare calcolano tempi di percorrenza usando limiti dell'auto e capacità del pilota. Le scelte comportano vantaggi e costi specifici: attaccare aumenta usura e rischio, difendere sacrifica ritmo, preparare un sorpasso può migliorare il successivo rilancio.
- Il campo legacy `Track.lenght` esprime chilometri per valori sotto 100 e metri per valori da 100 in su; il server normalizza la distanza in chilometri.
- La gara salva un checkpoint dopo ogni settore e si riprende dal pulsante nell'HUD. Durante una gara attiva, gli altri interventi su auto, pilota e portafoglio sono bloccati.
- Nelle clandestine la quota di €500 viene detratta alla partenza: vittoria accredita €1.500 (netto +€1.000), pareggio restituisce €500, sconfitta o abbandono perdono la quota.
- Le gare con avversari o tracciati personalizzati sono allenamenti gratuiti senza premi economici o XP.
- Le richieste economiche hanno un identificativo persistito: un doppio invio non duplica premi, pezzi o addebiti. Le vecchie API per inviare risultati o usura calcolati dal browser sono disabilitate.

## Limiti e passi successivi

Il giocatore resta quello con ID 1; gli ID delle API **non sono un'autenticazione**. Login, sessioni, carriera iniziale bilanciata e multiplayer restano fasi successive. I dati che la versione precedente conservava soltanto nel browser non possono essere ricostruiti dal vecchio database; il carburante legacy viene inizializzato a 20 litri.

Vedi il [piano aggiornato](docs/PIANO_SVILUPPO.md) e la [procedura di prova](docs/TESTING.md).
