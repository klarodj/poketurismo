# Account personali e PostgreSQL

## Stato del 22 ottobre 2026

Preparazione sul branch `feat/accounts-postgres`, worktree isolato `.preview/accounts`.
Non è ancora la versione pubblica: il servizio su 5174 continua a usare SQLite e l'accesso Basic condiviso sul gateway 5184. Le vecchie istanze 5173/3001 restano spente. Non eliminare il checkout legacy che contiene il repository comune.

L'utente ha confermato che Google OAuth e SMTP sono entrambi da configurare. Il passaggio pubblico richiede almeno un metodo funzionante e l'indirizzo verificabile del proprietario del salvataggio storico. Non attivare una schermata di login senza un metodo utilizzabile. Le credenziali vanno inserite sul server fuori da Git, mai in chat.

## Architettura e nuovi piloti

Un solo PostgreSQL persistente: schema `auth` gestito da Supabase GoTrue, schema `game` gestito da Express/Prisma. Nessun secondo database operativo, nessuno stack completo Supabase con servizi inutilizzati. Il ruolo del gioco non può leggere le righe Auth: può solo referenziare `auth.users.id`. L'identità viene verificata presso GoTrue; saldo, acquisti, gare e premi rimangono responsabilità del backend.

Accesso Google con PKCE e codice email monouso, sessioni tramite SDK ufficiale `@supabase/auth-js`. Il gateway conserva il Bearer delle API e inoltra `/auth/v1` al servizio locale; l'amministrazione Auth non è pubblicata. Il browser non sceglie il giocatore tramite `userId`: il backend verifica la corrispondenza con la sessione. Logout e cambio account svuotano gli store e invalidano le risposte tardive.

Nuovo pilota: nickname unico normalizzato, quattro colori, livello 1, zero esperienza, **€10.000**, garage vuoto, nessuna auto equipaggiata. Le otto statistiche partono da 10, con 8 punti aggiuntivi e massimo 14 ciascuna. Quattro profili hanno tutti totale 88; è possibile personalizzarli. Budget e statistiche sono validati sul server. La creazione concorrente non duplica pilota o denaro. La scuola guida usa la vettura in prestito già prevista dal gioco.

Il salvataggio ID 1 viene collegato soltanto all'email verificata configurata in `LEGACY_OWNER_EMAIL`; nessun privilegio al primo iscritto. Il collegamento conserva soldi, garage e progressi. Gli strumenti `/api/dev` richiedono un amministratore; il gateway continua a bloccarne le scritture pubbliche.

## Configurazione privata

`scripts/accounts-init.py` genera una sola volta `/home/klaro/poketurismo-data/accounts/accounts.env` con permessi 0600, password distinte e chiave JWT casuale. Il file è già stato creato sul server; non rigenerarlo e non stamparlo. Google ed email sono inizialmente disabilitati.

Per Google creare un client OAuth di tipo applicazione web, configurare il consenso e, se in modalità test, autorizzare i tester. Redirect autorizzato esatto:

`https://server-klaro.tail6c534c.ts.net/auth/v1/callback`

Inserire privatamente `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, quindi `AUTH_GOOGLE_ENABLED=true`. L'URL canonico è HTTPS 443; la 8443 continua a raggiungere lo stesso gioco. Il ritorno all'app usa `/auth/callback` su una delle due origini consentite.

Per i codici email configurare il servizio SMTP e il mittente, inclusa l'eventuale verifica DNS del dominio richiesta dal fornitore. Compilare `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, poi `AUTH_EMAIL_ENABLED=true`. Il template include `{{ .Token }}` e scadenza 10 minuti; GoTrue lo recupera dal backend attraverso `host.docker.internal:5174`, esplicitamente autorizzato da Vite. Non abilitare autoconferma email. Controllare consegna, spam e limiti del fornitore con una casella reale prima di aprire gli iscritti.

Impostare inoltre `LEGACY_OWNER_EMAIL` all'indirizzo che il proprietario userà davvero per accedere. `scripts/prepare-account-runtime.cjs` rifiuta configurazioni incomplete e genera due EnvironmentFile privati senza riavviare servizi.

## Sequenza del passaggio definitivo

1. Completare provider e proprietario, conservare backup privato dei segreti separatamente dal database. Verificare il Compose senza stampare i valori risolti (`docker compose ... config --quiet`). Il Compose usa PostgreSQL 17 Alpine e GoTrue 2.197.0, entrambi pubblicati solo su loopback (5434 e 9999). Il volume PostgreSQL è fuori dal repository. Non sostituire la major di un volume esistente.
2. Ripetere le prove con l'immagine PostgreSQL 17 prevista dal Compose. Il collaudo già eseguito usa PostgreSQL 18.6 estratto da pacchetti Ubuntu verificati, poiché il download Docker di PostgreSQL si interrompeva; questa differenza resta da chiudere prima del passaggio pubblico.
3. Integrare il branch nella copia principale, installare le dipendenze con lockfile e generare entrambi i client Prisma. Preparare la build. Conservare gateway e autenticazione condivisa fino alla finestra di passaggio; nessuna seconda partita permanente.
4. Avviare PostgreSQL e Auth con `compose.accounts.yml` e il file privato. L'init crea i ruoli e gli schemi; attendere `/health` Auth. Eseguire `node scripts/migrate-account-schema.cjs`: concede soltanto USAGE/REFERENCES e applica le migrazioni versionate del gioco. Non usare `db push` o sincronizzazioni automatiche distruttive.
5. Fermare il gateway pubblico e lo sviluppo, quindi fare il backup SQLite finale coerente con `scripts/database.py backup`. Importare quel backup con `node scripts/import-postgres.cjs PERCORSO_BACKUP`. L'importatore rifiuta una destinazione con dati, usa una transazione serializzabile, controlla conteggi e hash dei campi di tutte le 26 tabelle e riallinea le sequenze. Vecchie password/email non diventano credenziali e vengono svuotate. Su errore l'importazione è annullata.
6. Preparare gli EnvironmentFile con `node scripts/prepare-account-runtime.cjs`, installare le unità aggiornate, daemon-reload e avviare la stessa istanza 5174 e il gateway 5184. Il supervisore continua a riavviare lo sviluppo dopo le build; in modalità account il gateway serve `dist` corrente. SQLite resta un archivio offline.
7. Verificare il proprietario e un secondo account, accesso Google, codice email se abilitato, callback pubblico, refresh e logout/cambio account. Verificare nuovo pilota, garage vuoto, acquisto e ripresa di una gara. Non dichiarare concluso il passaggio senza questi controlli pubblici.
8. Attivare backup dell'intero PostgreSQL, includendo `auth` e `game`, e provare il ripristino su database isolato. Conservare segreti e backup anche fuori dalla macchina. Il solo dump del gioco non basta per conservare gli account.

Prima di nuove scritture su PostgreSQL si può ripristinare il vecchio codice e rimuovere gli EnvironmentFile account per ripartire dalla copia SQLite finale. Dopo nuove scritture, preservare prima PostgreSQL e recuperare anche quei progressi: tornare semplicemente al vecchio SQLite li perderebbe. Non riavviare container legacy né il vecchio updater con hard reset.

## Verifiche già eseguite

- 81 test del gioco/client e 8 test HTTP su account/gateway passati; lint e build passati.
- PostgreSQL **18.6** reale e GoTrue **2.197.0** reale in ambiente temporaneo, su loopback. Migrazioni Auth e gioco applicate; importazione della copia SQLite verificata per tutte le 26 tabelle.
- Prove reali: utenti verificati, sei creazioni simultanee dello stesso pilota (una sola assegnazione), nickname occupato, garage vuoto, budget, accesso ad altri salvataggi rifiutato, cinque richieste concorrenti di acquisto con stessa operazione (una sola spesa), privilegi separati, vincolo sul saldo, collegamento esplicito del proprietario e strumenti amministrativi.
- Emissione e verifica del codice OTP con account sintetici e API amministrativa locale; **nessuna email inviata**. Consegna SMTP, consenso Google, callback OAuth e refresh via Funnel restano da verificare con i servizi configurati.
- Dump completo e ripristino PostgreSQL in un altro database temporaneo: hash delle righe corrispondenti in tutte le **54 tabelle** Auth e gioco.

`scripts/validate-account-stack.cjs` rende ripetibile la prova reale: richiede `ACCOUNTS_VALIDATION_ENV_FILE`, rifiuta database non locali o nomi che non terminano in `_validation`, e va eseguito su una nuova copia temporanea migrata/importata con ID 1 non ancora collegato. Crea account sintetici e operazioni solo in tale database. Mai puntarlo al salvataggio pubblico.

I database e i container temporanei di collaudo vanno fermati dopo la prova; non sono una seconda istanza di gioco. Non considerare l'importazione temporanea una migrazione del servizio pubblico.
