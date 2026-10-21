# Un ambiente di sviluppo/test e un database di riferimento

Piano aggiornato il 21 ottobre 2026 dopo la richiesta di consolidare le istanze e salvare il lavoro in Git. La migrazione PostgreSQL e gli account personali non sono ancora implementati.

## Consolidamento eseguito il 22 ottobre 2026

- Dopo l'attivazione di Full Access è stato verificato l'accesso effettivo a Docker, systemd, sudo e Tailscale.
- Backup iniziale di entrambi i database, configurazione Funnel, crontab, updater, Compose e modifiche legacy in `/home/klaro/.backups/poketurismo/consolidation-20261021T223325193420Z`.
- Il gateway è stato adeguato per accettare le due origini HTTPS previste (443 e 8443), respingendo origini estranee. Il servizio pubblico è stato riavviato e verificato.
- Entrambi gli indirizzi Funnel inoltrano ora soltanto a `127.0.0.1:5184`. Il vecchio inoltro `/api/` della 443 verso 3001 è stato rimosso. Non restano dipendenze Funnel dalle porte legacy.
- Il comando di consolidamento ha completato controlli, backup coerenti, disattivazione dell'updater, aggiornamento del Compose e arresto dei container. Backup finali e configurazioni in `/home/klaro/.backups/poketurismo/consolidamento-6at13xgi`; rapporto in `.preview/consolidation.json`, `stage: complete`.
- `webapp-frontend` e `webapp-backend` risultano fermi con `restart: no`; porte 5173 e 3001 libere anche su IPv6. Checkout e dipendenze condivise sono conservati.
- Rimosso dal crontab di klaro soltanto il job delle 04:00 di `update_poketurismo.sh`, conservando tutti gli altri job e una copia del crontab originale nella directory di backup finale.
- `poketurismo-dev` e `poketurismo-public` sono attivi e abilitati al boot; UFW consente la 5174 su IPv4 e IPv6.
- Google OAuth e SMTP non sono ancora configurati, come confermato dall'utente. Non dichiarare attivi gli account personali o PostgreSQL.

La diagnostica ha rilevato TLS valido collegandosi direttamente al nodo, ma chiusure intermittenti nell'ingresso pubblico. Dopo il riavvio di tailscaled due dei tre indirizzi IPv4 pubblici rispondevano, mentre `185.40.234.198` falliva. I controlli GET ora riprovano soltanto errori transitori; gli errori di verifica del certificato restano bloccanti. La disponibilità di un singolo relay va distinta dal corretto funzionamento dell'app e non viene risolta modificando il database.

## Decisione architetturale proposta

Usare un solo PostgreSQL persistente per Supabase Auth e dati di Poketurismo. Gli schemi sono contenitori di tabelle nello stesso database, non due server:

- `auth`: account, identità e sessioni, gestiti dalle migrazioni di Supabase Auth.
- `game`: piloti, catalogo, garage, inventario, progressi e gare, gestiti dalle migrazioni del gioco.

Un pilota ha un riferimento univoco alla chiave primaria di `auth.users`. Account e pilota restano entità diverse: dopo il primo accesso il giocatore può ancora dover completare la creazione del pilota. Questa operazione deve essere idempotente e accreditare il denaro iniziale una sola volta.

Express e Prisma rimangono responsabili delle regole, delle transazioni e della proprietà dei dati. L'identità deriva dalla sessione verificata, mai da un `userId` scelto dal browser. Il ruolo database dell'applicazione ha i permessi necessari sullo schema `game`; le migrazioni del gioco non devono modificare o azzerare `auth`. Lo schema `game` non viene esposto alle scritture dirette tramite le API automatiche di Supabase. L'isolamento per giocatore va comunque verificato nel backend: condividere il database non lo fornisce automaticamente.

Due database sono una scelta legittima quando si delega l'autenticazione a un servizio cloud separato. Ospitando tutto sulla stessa macchina, mantenere PostgreSQL per Auth e SQLite per il gioco aggiungerebbe due sistemi di backup, ripristino e migrazione senza un beneficio utile a questo progetto. Non serve sincronizzare due copie della carriera.

Il passaggio a PostgreSQL prepara la crescita e semplifica il collegamento dei dati; con due giocatori SQLite non è un problema di capacità. Supabase completo non è un'ottimizzazione di memoria: partire dai servizi necessari, disabilitando i componenti opzionali inutilizzati secondo la configurazione ufficiale. Verificare le dipendenze prima di rimuoverli; misurare il consumo effettivo sul server.

I test automatici e le prove di migrazione usano database temporanei isolati, eliminati al termine. I backup sono copie di sicurezza, non istanze di gioco in esecuzione.

## Stato osservato e istanza da conservare

**Aggiornamento del 22 ottobre 2026:** l'output del server mostra che il Funnel 443 usa ancora `5173` per `/` e `3001/api` per `/api/`. Non è un sito indipendente: spegnere subito i container interromperebbe quell'indirizzo. Migrare esplicitamente gli inoltri e verificare l'origine consentita dal gateway prima dell'arresto. Il comando automatico ora rileva queste dipendenze e interrompe il preflight senza modificare servizi o configurazioni. Non eseguire neppure la procedura manuale di arresto finché questa dipendenza resta presente.

| Componente | Configurazione trovata | Destinazione |
| --- | --- | --- |
| `webapp-frontend` | Docker, porta 5173, checkout legacy | Arrestare e disabilitare il riavvio automatico |
| `webapp-backend` | Docker, porta 3001, database legacy | Arrestare e disabilitare il riavvio automatico |
| `poketurismo-dev.service` | Porta 5174, backend locale su porta libera, `.preview/game.db` | Unica istanza sviluppo/test |
| `poketurismo-public.service` | Gateway 5184, frontend compilato e proxy API verso 5174 | Conservare per l'accesso pubblico |
| Compose di questo repository | Template alternativo sulla 5180 | Non avviare insieme alla 5174 |

La lettura dei file conferma i collegamenti; l'ambiente dell'agente non permette l'accesso a Docker, systemd o alle porte del server, quindi lo stato runtime e l'arresto dei container restano da verificare/eseguire sul server.

Il salvataggio di sviluppo è quello già usato dal playtest pubblico. La copia legacy va archiviata separatamente, senza tentare una fusione automatica dei due salvataggi. Il checkout legacy va conservato anche dopo lo spegnimento: ospita il `.git` comune al worktree di sviluppo e il suo `node_modules` collegato simbolicamente.

Con una sola istanza, gli aggiornamenti e i riavvii coinvolgono anche gli amici che provano il gioco. Pubblicare build verificate e prevedere brevi interruzioni; i checkpoint devono permettere di riprendere. Il gateway attuale serve uno snapshot del frontend: aggiornarlo secondo `public-playtest.md` quando cambia il contratto delle API. In futuro si può servire la build direttamente da Express e usare il gateway come proxy, evitando snapshot divergenti.

## Consolidamento operativo sul server

È disponibile il comando automatico, da eseguire come `klaro` nel terminale del server:

```sh
python3 /home/klaro/poketurismo-work/scripts/consolidate-dev.py --apply
```

Senza `--apply` effettua soltanto i controlli. Può chiedere la password sudo per accedere a Docker. Richiede un checkout di sviluppo pulito e già salvato in Git. Prima di modificare alcunché controlla servizi, identità dei container, salute della 5174, credenziali e build del link pubblico. Crea backup SQLite verificati e conserva le configurazioni e il diff locale legacy in una nuova directory privata sotto `/home/klaro/.backups/poketurismo/`.

Poi sostituisce il vecchio updater con uno script senza operazioni (archiviando l'originale), imposta `restart: "no"` nel Compose legacy, disabilita il riavvio automatico dei due container verificati e li ferma per identificativo. Non cambia crontab, altre applicazioni, il checkout legacy, il servizio 5174 o il gateway. Una vecchia invocazione pianificata dell'updater diventa quindi innocua e non invia notifiche.

Il controllo finale verifica container fermi, porte 5173/3001 libere e salute dell'istanza pubblica e locale. Il rapporto è in `.preview/consolidation.json` e nella directory di backup. Solo `stage: "complete"` conferma il consolidamento; un'interruzione non viene presentata come successo. Il comando è ripetibile e conserva i backup precedenti. Prima di installare PostgreSQL verificare il successo di questo passaggio: non avviare un altro runtime del gioco.

I test automatici esercitano il procedimento con database SQLite reali temporanei e comandi Docker/HTTP simulati, inclusi identità errata, playtest indisponibile, job in corso, backup fallito, file modificati durante l'operazione, arresto fallito e seconda esecuzione. Non sostituiscono il controllo sul server. L'agente non ha eseguito l'arresto reale perché l'accesso a Docker e systemd è bloccato nel suo ambiente.

### Procedura manuale alternativa

Eseguire dal terminale del server. I controlli iniziali devono riuscire prima di fermare la versione legacy. Questi comandi non sono stati eseguiti dall'agente.

1. Verificare l'istanza che rimarrà e identificare i container:

   ```sh
   systemctl is-active poketurismo-dev poketurismo-public
   curl --fail --max-time 10 http://127.0.0.1:5174/api/health
   sudo docker inspect --format '{{.Name}} {{.Config.Labels}} {{.HostConfig.RestartPolicy.Name}}' webapp-frontend webapp-backend
   ```

   La salute deve indicare `ok: true`, servizio `poketurismo`, versione 2. Verificare anche il link pubblico con le credenziali di playtest e una partita riprendibile. I container devono appartenere al progetto `/home/klaro/docker-server/webapp/docker-compose.yml`.

2. Sospendere il job che esegue `/home/klaro/scripts/update_poketurismo.sh` nel pianificatore/crontab del server e attendere che un'eventuale esecuzione già iniziata termini. Il vecchio job fa un hard reset e riavvia entrambi i container: non basta fermarli lasciandolo attivo. Individuare il job effettivo, senza cancellare altri aggiornamenti o notifiche.

3. Creare backup fuori dai checkout, conservando anche le modifiche locali legacy:

   ```sh
   cd /home/klaro/poketurismo-work
   umask 077
   POKETURISMO_ARCHIVE="$(mktemp -d /home/klaro/.backups/poketurismo/consolidamento.XXXXXX)"
   python3 scripts/database.py backup .preview/game.db "$POKETURISMO_ARCHIVE/development.db"
   python3 scripts/database.py backup /home/klaro/docker-server/webapp/app/server/prisma/dev.db "$POKETURISMO_ARCHIVE/legacy-before-stop.db"
   git -C /home/klaro/docker-server/webapp/app diff --binary > "$POKETURISMO_ARCHIVE/legacy-local-changes.patch"
   cp -p /home/klaro/scripts/update_poketurismo.sh "$POKETURISMO_ARCHIVE/update_poketurismo.sh"
   cp -p /home/klaro/docker-server/webapp/docker-compose.yml "$POKETURISMO_ARCHIVE/legacy-compose.yml"
   ```

4. Impedire il riavvio al boot e fermare soltanto i due container identificati:

   ```sh
   sudo docker update --restart=no webapp-frontend webapp-backend
   sudo docker stop webapp-frontend webapp-backend
   python3 scripts/database.py backup /home/klaro/docker-server/webapp/app/server/prisma/dev.db "$POKETURISMO_ARCHIVE/legacy-final.db"
   ```

   Impostare anche `restart: "no"` nei due servizi del Compose legacy, in modo che una successiva ricreazione non ripristini la vecchia politica. Non usare comandi globali `docker stop`, `prune` o rimozione dei volumi. La copia finale include le eventuali ultime scritture intervenute dopo il primo backup.

5. Verificare che 5173 e 3001 siano libere, 5174 risponda e il link pubblico funzioni ancora:

   ```sh
   sudo docker inspect --format '{{.Name}} running={{.State.Running}} restart={{.HostConfig.RestartPolicy.Name}}' webapp-frontend webapp-backend
   ss -ltnp
   curl --fail --max-time 10 http://127.0.0.1:5174/api/health
   systemctl is-active poketurismo-dev poketurismo-public
   ```

Per ripristinare soltanto la disponibilità legacy, riattivare i due container con la politica `unless-stopped` e ripristinare il Compose archiviato. Non riattivare l'hard reset automatico. Il salvataggio legacy riparte dai suoi dati precedenti: non contiene i progressi fatti nel frattempo sulla 5174.

## Passaggio successivo a PostgreSQL e utenti

1. Preparare una copia di migrazione temporanea, schema `game`, ruoli e vincoli; importare il salvataggio di sviluppo verificando conteggi, centesimi, inventario, gare e progressi. Adeguare SQL specifico SQLite e test di concorrenza a PostgreSQL.
2. Implementare Google e codice email, identità verificata, proprietà di tutte le risorse e protezione degli strumenti amministrativi.
3. Creare il percorso iniziale: nickname, avatar, distribuzione delle statistiche, budget verificato sul catalogo, garage vuoto e scuola guida disponibile senza auto. Collegare esplicitamente il salvataggio storico al proprietario; non assegnarlo al primo iscritto.
4. Adeguare il gateway: attualmente richiede HTTP Basic e rimuove `Authorization`, cookie e `Set-Cookie`. Non è compatibile così com'è con le sessioni del gioco. Sostituire l'accesso condiviso con gli accessi personali quando le API sono protette, e verificare redirect OAuth e rinnovo della sessione tramite l'URL pubblico.
5. Per il passaggio definitivo bloccare le scritture, creare il backup finale, importare e verificare, quindi avviare la stessa istanza sulla 5174 con PostgreSQL. Archiviare SQLite senza lasciarlo come secondo database operativo.
6. Verificare due account contemporanei, retry, logout/cambio account, cache, ripresa delle gare e backup/ripristino dell'intero database. I nuovi utenti ricevono il saldo iniziale una sola volta e nessuna auto.

Un rollback alla copia SQLite è sicuro solo prima di accettare nuove scritture su PostgreSQL; dopo occorre preservare e recuperare anche quei progressi. Il backup PostgreSQL deve comprendere Auth e gioco, con configurazione e segreti custoditi separatamente fuori da Git e una copia fuori dal server.

## Riferimenti verificati

- [Supabase: dati utente e schema Auth](https://supabase.com/docs/guides/auth/managing-user-data)
- [Supabase: installazione Docker e componenti opzionali](https://supabase.com/docs/guides/self-hosting/docker)
- [Supabase: collegamento diretto a PostgreSQL](https://supabase.com/docs/guides/database/connecting-to-postgres)
