# Account personali e PostgreSQL

## Stato del 22 ottobre 2026

Attivo dal 22 ottobre 2026: il servizio unico sulla 5174 usa PostgreSQL 18.6 e accessi personali Google; il gateway 5184 serve la build corrente e non richiede più l'accesso Basic condiviso. Entrambi i Funnel HTTPS (443/8443) raggiungono questa istanza. Le vecchie 5173/3001 restano spente; SQLite è archiviato nei backup privati fuori dal repository. Non eliminare il checkout legacy che contiene il repository comune.

Google OAuth è stato configurato con il JSON privato fornito dall'utente; credenziali e redirect sono stati verificati. SMTP resta disabilitato. L'utente ha autorizzato il reset del salvataggio storico: si conservano cataloghi e percorsi, senza importare piloti, auto possedute o progressi. L'indirizzo amministratore è configurato privatamente in `ADMIN_EMAILS`, separatamente dalla partita. Le credenziali restano fuori da Git.

## Architettura e nuovi piloti

Un solo PostgreSQL persistente: schema `auth` gestito da Supabase GoTrue, schema `game` gestito da Express/Prisma. Nessun secondo database operativo, nessuno stack completo Supabase con servizi inutilizzati. Il ruolo del gioco non può leggere le righe Auth: può solo referenziare `auth.users.id`. L'identità viene verificata presso GoTrue; saldo, acquisti, gare e premi rimangono responsabilità del backend.

Accesso Google con PKCE e codice email monouso, sessioni tramite SDK ufficiale `@supabase/auth-js`. Il gateway conserva il Bearer delle API e inoltra `/auth/v1` al servizio locale; l'amministrazione Auth non è pubblicata. Il browser non sceglie il giocatore tramite `userId`: il backend verifica la corrispondenza con la sessione. Logout e cambio account svuotano gli store e invalidano le risposte tardive.

Nuovo pilota: nickname unico normalizzato, quattro colori, livello 1, zero esperienza, **€10.000**, garage vuoto, nessuna auto equipaggiata. Le otto statistiche partono da 10, con 8 punti aggiuntivi e massimo 14 ciascuna. Quattro profili hanno tutti totale 88; è possibile personalizzarli. Budget e statistiche sono validati sul server. La creazione concorrente non duplica pilota o denaro. La scuola guida usa la vettura in prestito già prevista dal gioco.

Il salvataggio storico non è stato importato, come richiesto: il database definitivo è partito con zero piloti, zero garage e zero progressi. Un nuovo pilota riceve privilegi amministrativi soltanto se la sua email verificata compare in `ADMIN_EMAILS`; il browser non può assegnarli. Anche l'amministratore parte con lo stesso budget e senza auto. Gli strumenti `/api/dev` verificano l'identità e il ruolo sul backend; il gateway li inoltra in modalità account. `LEGACY_OWNER_EMAIL` rimane vuoto; l'opzione di collegamento storico è riservata a eventuali importazioni future esplicitamente richieste.

## Configurazione privata

`scripts/accounts-init.py` genera una sola volta `/home/klaro/poketurismo-data/accounts/accounts.env` con permessi 0600, password distinte e chiave JWT casuale. Il file è già stato creato sul server; non rigenerarlo e non stamparlo. Google ed email sono inizialmente disabilitati.

Per Google creare un client OAuth di tipo applicazione web, configurare il consenso e, se in modalità test, autorizzare i tester. Redirect autorizzato esatto:

`https://server-klaro.tail6c534c.ts.net/auth/v1/callback`

Inserire privatamente `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, quindi `AUTH_GOOGLE_ENABLED=true`. L'URL canonico è HTTPS 443; la 8443 continua a raggiungere lo stesso gioco. Il ritorno all'app usa `/auth/callback` su una delle due origini consentite.

Per i codici email configurare il servizio SMTP e il mittente, inclusa l'eventuale verifica DNS del dominio richiesta dal fornitore. Compilare `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, poi `AUTH_EMAIL_ENABLED=true`. Il template include `{{ .Token }}` e scadenza 10 minuti; GoTrue lo recupera dal backend attraverso `host.docker.internal:5174`, esplicitamente autorizzato da Vite. Non abilitare autoconferma email. Controllare consegna, spam e limiti del fornitore con una casella reale prima di aprire gli iscritti.

Impostare inoltre `ADMIN_EMAILS` agli indirizzi verificati autorizzati, separati da virgole. Per questa installazione lasciare `LEGACY_OWNER_EMAIL` vuoto. `scripts/prepare-account-runtime.cjs` rifiuta configurazioni incomplete e genera due EnvironmentFile privati senza riavviare servizi.

## Sequenza del passaggio definitivo

1. Completare provider e amministratore, conservare backup privato dei segreti separatamente dal database. La produzione usa PostgreSQL 18.6 dai pacchetti ufficiali Ubuntu e `compose.auth.yml` per GoTrue 2.197.0. Il cluster `18/poketurismo` è sulla porta loopback 5434, dati in `/var/lib/postgresql/18/poketurismo`; Auth usa rete host e ascolta soltanto 127.0.0.1:9999. `compose.accounts.yml` con PostgreSQL 17 rimane un'alternativa non utilizzata: non avviarlo insieme al cluster nativo.
2. Il download dell'immagine PostgreSQL 17 è stato abbandonato per lentezza persistente. La versione Ubuntu 18.6 già collaudata è stata installata con pacchetti verificati; la creazione automatica del cluster generico è disabilitata, non esiste un secondo PostgreSQL sulla 5432. Il reset e la nuova assegnazione admin sono stati collaudati nuovamente sul cluster definitivo usando un database temporaneo separato, poi rimosso.
3. Integrare il branch nella copia principale, installare le dipendenze con lockfile e generare entrambi i client Prisma. Preparare la build. Conservare gateway e autenticazione condivisa fino alla finestra di passaggio; nessuna seconda partita permanente.
4. Avviare il cluster `postgresql@18-poketurismo` e Auth con `compose.auth.yml` e il file privato. L'init crea i ruoli e gli schemi; attendere `/health` Auth. Eseguire `node scripts/migrate-account-schema.cjs`: concede soltanto USAGE/REFERENCES e applica le migrazioni versionate del gioco. Non usare `db push` o sincronizzazioni automatiche distruttive.
5. Fermare il gateway pubblico e lo sviluppo, quindi fare il backup SQLite finale coerente con `scripts/database.py backup`. Importare quel backup con `node scripts/import-postgres.cjs PERCORSO_BACKUP --fresh-start`. L'importatore rifiuta una destinazione con dati, usa una transazione serializzabile, controlla conteggi e hash dei campi di tutte le 26 tabelle e riallinea le sequenze. In modalità `--fresh-start` le nove tabelle dei giocatori restano vuote; cataloghi e configurazioni vengono importati e verificati. Nessuna password o email storica diventa una credenziale. Su errore l'importazione è annullata.
6. Preparare gli EnvironmentFile con `node scripts/prepare-account-runtime.cjs`, installare le unità aggiornate, daemon-reload e avviare la stessa istanza 5174 e il gateway 5184. Il supervisore continua a riavviare lo sviluppo dopo le build; in modalità account il gateway serve `dist` corrente. SQLite resta un archivio offline.
7. Verificare il proprietario e un secondo account, accesso Google, codice email se abilitato, callback pubblico, refresh e logout/cambio account. Verificare nuovo pilota, garage vuoto, acquisto e ripresa di una gara. Non dichiarare concluso il passaggio senza questi controlli pubblici.
8. Attivare backup dell'intero PostgreSQL, includendo `auth` e `game`, e provare il ripristino su database isolato. Conservare segreti e backup anche fuori dalla macchina. Il solo dump del gioco non basta per conservare gli account.

Prima di nuove scritture su PostgreSQL si può ripristinare il vecchio codice e rimuovere gli EnvironmentFile account per ripartire dalla copia SQLite finale. Dopo nuove scritture, preservare prima PostgreSQL e recuperare anche quei progressi: tornare semplicemente al vecchio SQLite li perderebbe. Non riavviare container legacy né il vecchio updater con hard reset.

## Verifiche già eseguite

- 81 test del gioco/client e 9 test HTTP su account/gateway passati; lint e build passati.
- PostgreSQL **18.6** reale e GoTrue **2.197.0** reale in ambiente temporaneo, su loopback. Migrazioni Auth e gioco applicate; importazione della copia SQLite verificata per tutte le 26 tabelle.
- Prove reali: utenti verificati, sei creazioni simultanee dello stesso pilota (una sola assegnazione), nickname occupato, garage vuoto, budget, accesso ad altri salvataggi rifiutato, cinque richieste concorrenti di acquisto con stessa operazione (una sola spesa), privilegi separati, vincolo sul saldo, collegamento esplicito del proprietario e strumenti amministrativi.
- Emissione e verifica del codice OTP con account sintetici e API amministrativa locale; **nessuna email inviata**. La pagina pubblica e il redirect Google con PKCE sono stati verificati su HTTPS 443 e 8443; l’utente ha confermato il primo accesso Google completo e la creazione del pilota. Il rinnovo della sessione resta da verificare nel tempo. SMTP resta da configurare.
- Dump completo e ripristino PostgreSQL in un altro database temporaneo: hash delle righe corrispondenti in tutte le **54 tabelle** Auth e gioco.

`scripts/validate-account-stack.cjs` rende ripetibile la prova reale: richiede `ACCOUNTS_VALIDATION_ENV_FILE`, rifiuta database non locali o nomi che non terminano in `_validation`, e va eseguito su una nuova copia temporanea migrata/importata con ID 1 non ancora collegato. Crea account sintetici e operazioni solo in tale database. Mai puntarlo al salvataggio pubblico.

Il backup completo è automatizzato da `poketurismo-backup.timer`, ogni giorno verso le 04:15, con archivi privati e checksum in `/home/klaro/.backups/poketurismo/postgres`. Serve ancora una copia fuori dal server.

Un nuovo backup e ripristino del database definitivo ha verificato tutte le 54 tabelle sul medesimo snapshot PostgreSQL, senza fermare le scritture. I database di collaudo e ripristino e il container Auth temporaneo sono stati rimossi.

I database e i container temporanei di collaudo vanno fermati dopo la prova; non sono una seconda istanza di gioco. Non considerare l'importazione temporanea una migrazione del servizio pubblico.
