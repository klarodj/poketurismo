# Prova dei punti 1 e 2

## Avvio

Sul terminale del server:

```bash
bash /home/klaro/poketurismo-work/scripts/preview.sh
```

Aprire `http://IP_DEL_SERVER:5174`. Sul server stesso usare `http://localhost:5174`. Lasciare il terminale aperto e chiudere con CTRL+C. Il backend usa una porta libera scelta dal sistema; le API passano attraverso la porta del frontend. La cache di Vite è in `.vite-cache`, separata dai `node_modules` condivisi.

Il comando crea una copia coerente del database attivo solo se `.preview/game.db` non esiste, applica le migrazioni alla copia, rigenera Prisma solo se necessario e avvia le due componenti. Non riavvia i container esistenti. Se la porta frontend 5174 è occupata, si interrompe: scegliere ad esempio `POKETURISMO_PREVIEW_PORT=5175 bash scripts/preview.sh`. Un backend già presente sulla porta 3002 non viene riutilizzato né fermato.

## Giro di prova

1. Annotare saldo e auto equipaggiata. Comprare un ricambio e ricaricare: saldo e inventario devono restare uguali a dopo l'acquisto.
2. Montare il ricambio, controllare le statistiche, smontarlo: il pezzo deve tornare nel magazzino. Provare una sostituzione con un altro livello dello stesso tipo.
3. Dal benzinaio scegliere tipo e quantità. Confermare, ricaricare e controllare quantità e saldo. Provare 0,1 litri per verificare i centesimi.
4. Nel profilo pilota scegliere fino a quattro mosse. Ricaricare e verificare la selezione; un allenamento per una nuova mossa deve conservarla nel grimorio.
5. Dall'Autodromo scegliere **Circuito Scuola** e uno scenario. Confrontare CV/t delle vetture, scegliere ritmo e staccata e osservare la stima di tempo, rischio e consumi. Giocare un settore e leggere tempi, velocità e spiegazioni. La scelta della staccata su un rettilineo riguarda la curva successiva. Provare anche uno scenario con vettura rivale superiore e pilota preparato.
6. Ricaricare a metà gara o tornare alla mappa. Usare **Riprendi gara**: settore, tempi, distacco in secondi, carburante e usura devono corrispondere all'ultimo turno salvato.
7. Completare la gara. Ricaricare la schermata del risultato: premi e chilometri non devono aumentare una seconda volta.
8. Provare le clandestine: €500 alla partenza, saldo finale conforme a vittoria/pareggio/sconfitta. Un avversario o tracciato personalizzato non deve generare denaro o XP.
9. Iscriversi a un campionato compatibile con la vettura. Completare più round, tornando al Centro Corse fra uno e l'altro: la classifica deve proseguire e i premi arrivare una volta sola al termine.
10. Fermare l'anteprima con CTRL+C e riavviarla con lo stesso comando: il salvataggio deve restare intatto.

Se la rete cade durante una richiesta, il messaggio di errore offre un nuovo tentativo per gli errori recuperabili. La richiesta conserva lo stesso identificativo. Se il server segnala un settore già giocato, ricaricare il checkpoint; non viene accreditato un altro premio.

Una gara attiva blocca manutenzione, rifornimenti, acquisti e cambi di equipaggiamento. Riprenderla o abbandonarla prima di queste operazioni. L'abbandono di un round conta come sconfitta e fa proseguire il campionato.

## Backup e ripristino verificabile

Usare un nuovo nome per ciascun file, senza sovrascrivere un database aperto:

```bash
python3 scripts/database.py backup .preview/game.db /tmp/poketurismo-backup-01.db
python3 scripts/database.py restore /tmp/poketurismo-backup-01.db /tmp/poketurismo-restored-01.db
```

Backup e ripristino usano l'API SQLite, includono i dati WAL confermati e controllano integrità e riferimenti. Il ripristino crea un nuovo database; per adottarlo, fermare l'applicazione e puntare `DATABASE_URL` al nuovo percorso.

I test Python esercitano anche rollback di migrazioni fallite, applicazione ripetuta e modifica indebita di migrazioni già applicate.

## Passaggio futuro al volume dati esterno

Questa procedura è preparatoria alla pubblicazione, non è stata eseguita sull'app attiva.

1. Fermare le scritture del gioco corrente per il passaggio definitivo. Il backup online è coerente, ma le partite successive al backup rimarrebbero nel vecchio salvataggio.
2. Prima di integrare la rimozione dei database da Git, creare la copia fuori dal checkout:

   ```bash
   python3 /home/klaro/poketurismo-work/scripts/database.py backup /home/klaro/docker-server/webapp/app/server/prisma/dev.db /home/klaro/poketurismo-data/game.db
   ```

3. Usare `POKETURISMO_DATA_DIR=/home/klaro/poketurismo-data` nel nuovo Compose. Le migrazioni e i backup useranno quel volume, non i file nel repository.
4. Sostituire il vecchio job di aggiornamento che usa `git reset --hard`; il nuovo `scripts/update-code.sh` non cancella modifiche locali e rifiuta checkout con database ancora tracciati.
5. Costruire e avviare la nuova versione con `docker compose up -d --build`; verificare salute, salvataggio e ripristino prima di spostare l'indirizzo pubblico.

La rimozione dal versionamento è preparata solo nel branch di sviluppo. Il vecchio job e i container attivi non sono stati modificati. L'anteprima serve a provare il nuovo gioco prima di questo passaggio.

## Copertura automatica e limiti

- Test Node: veri handler Express e Prisma, database temporaneo, precisione dei centesimi, inventario, mosse, concorrenza e retry, checkpoint, campionati, motore deterministico.
- Test Python: backup con WAL aperto, ripristino, integrità, conservazione del saldo legacy, migrazioni ripetibili e rollback.
- Build frontend e lint.

Questo ambiente di sviluppo non consente l'apertura delle porte (`listen EPERM`): i test non fanno chiamate HTTP reali e la prova completa nel browser va eseguita avviando il comando dal terminale del server. La configurazione Docker è preparata ma non è stata avviata qui.

## Bilanciamento tattico

`npm run balance` ripete undici scenari con 1.000 semi ciascuno. Il report e i limiti accettati sono in [BILANCIAMENTO.md](BILANCIAMENTO.md). Non modificare le soglie solo per far passare un cambio di formula: valutare se il comportamento desiderato resta quello concordato. Le fixture rappresentano categorie progettuali, non modelli reali misurati.

Per un confronto manuale partire da una vettura non troppo modificata. Il laboratorio sceglie l'avversario per rapporto CV/t; se il catalogo non contiene una vettura abbastanza superiore, lo scenario viene rifiutato con un messaggio. Le differenze di aderenza e velocità massima contano oltre al rapporto CV/t.

## Sviluppo sempre attivo sulla porta 5174

Fermare con Ctrl+C l'eventuale anteprima avviata manualmente, poi eseguire una volta dal terminale del server:

```bash
bash /home/klaro/poketurismo-work/scripts/enable-dev.sh
```

Il comando apre UFW sulla porta TCP 5174 a tutti e installa `poketurismo-dev.service`, eseguito come klaro e avviato anche al boot. Il gioco è raggiungibile su `http://IP_DEL_SERVER:5174`; eventuali firewall del provider o del router vanno configurati separatamente.

Il supervisore riavvia l'anteprima dopo modifiche ai sorgenti e dopo ogni `npm run build` riuscita. Ignora database, backup e cache per evitare riavvii durante una partita. Se il processo termina, riprova automaticamente. I progressi restano in `.preview/game.db`.

```bash
sudo systemctl status poketurismo-dev --no-pager
sudo journalctl -u poketurismo-dev -f
```

Il servizio e la regola firewall devono essere attivati dal terminale del server: l'ambiente dell'agente non permette sudo, accesso a systemd o apertura di porte.

## Prova della mappa e dei comandi contestuali

1. Aprire Autodromo → Circuito Scuola: prima della partenza sono visibili mappa, settori, frenate e spazi di attacco.
2. In gara verificare evidenziazione del settore e prossimo tratto. Il riepilogo dei settori si può espandere.
3. Sul rettilineo iniziale la staccata riguarda la curva successiva; sull'allungo finale non compaiono staccata e traiettoria.
4. Con il rivale vicino davanti compaiono attacco e, in rettilineo, scia. Davanti con rivale vicino compare difesa; quando è lontano rimangono le scelte di passo.
5. In una nuova corsa clandestina verificare il profilo strada, carreggiata e visibilità. La scelta casuale mostra lo schema solo dopo l'avvio; selezionando un percorso lo si vede prima.
6. Gli imprevisti esterni sono volutamente rari (5% per gara): non aspettarsi di trovarli in ogni prova. I test automatici verificano frequenza su 10.000 semi, segnalazione, effetto su entrambi i piloti, checkpoint e retry.

Le gare già salvate possono essere riprese, ma per provare tutti i nuovi dati del percorso e gli imprevisti partire con una nuova sessione.

## Interfaccia di gara e sottofinestre

La schermata in gara mostra le due vetture, il distacco, il settore e le scelte. I pannelli cliccabili aprono auto/pilota, tempi, pista, settore, cronologia e opzioni di sessione. Le immagini mancanti hanno una sagoma di riserva, senza nascondere il modello dell'auto.

Per la prova nel browser sulla 5174:

1. Riprendere una gara o avviarne una nuova. Verificare che entrambe le immagini siano visibili e il distacco leggibile.
2. Cambiare ritmo, traiettoria e tecnica; aprire «Dettagli strategia», poi chiudere con pulsante, Escape e clic sullo sfondo. Le scelte devono rimanere impostate e nessun settore deve avanzare.
3. Aprire a turno i dettagli delle due auto, pista, settore, tempi e cronologia. Con Tab il focus deve rimanere nella sottofinestra; chiudendola deve tornare al pulsante che l'ha aperta. Lo sfondo non deve scorrere mentre il dettaglio è aperto.
4. Percorrere un settore: cronologia e riepilogo devono aggiornarsi; tempi e scelte proprie e del rivale devono essere consultabili nei dettagli.
5. Su telefono verificare auto affiancate, distacco sopra le auto, comandi senza scorrimento orizzontale e sottofinestra con corpo scorrevole.
6. Gli avvisi di carburante basso, gomme usurate, motore compromesso, aderenza ridotta e imprevisti restano nella vista principale. «Abbandona gara» è in «Sessione e opzioni».

I test di rendering verificano immagini, dettagli separati, comandi contestuali, avvisi e compatibilità con gare concluse/legacy. Navigazione con tastiera, comportamento del dialogo nativo e impaginazione su dispositivi reali richiedono la prova nel browser.

## Progressione del pilota

1. Su 5174 aprire Garage → Pilota → Scuola guida. Le abilità precedenti e le tecniche conosciute devono restare presenti.
2. Leggere la lezione e confermare; poi avviare i quattro esercizi. Seguire l'istruttore, confrontando le sue valutazioni nella cronologia.
3. Riprendere la prova dopo aver lasciato la pagina: obiettivi e checkpoint devono restare coerenti.
4. Superarla: verificare 40 XP, pratica e tecnica Rilascio progressivo; ripeterla non deve dare altri premi. Vettura personale, carburante e denaro devono restare invariati.
5. Equipaggiare la tecnica e avviare nuove gare. La tecnica compare solo nelle zone di frenata; il riepilogo finale indica pratica, benefici ridotti e consigli. Lo stesso percorso dà meno pratica ripetendo lo stesso fondamentale; la tecnica usa un conteggio separato.
6. Abbandoni, gare personalizzate e rettilinei senza frenata non devono assegnare pratica pertinente. I vecchi corsi mostrano le ripetizioni e il prossimo beneficio effettivo.

I test coprono lettura senza ricompense, prove errate, auto scuola senza auto equipaggiata, integrità della vettura personale, acquisizione e limite della tecnica, ripetizioni, richieste falsificate, retry, finali concorrenti con identificativi uguali e diversi, checkpoint da una nuova connessione e vincoli SQLite. Il report di bilanciamento aggiunge pratica e tecnica massime. Il comportamento resta da provare nel browser.
