# Meet sociale: posta e sfide asincrone

Dal piazzale, aprendo la vettura di un altro pilota, sono disponibili «Scrivi» e «Sfida». La posta usa soltanto nome e livello del pilota scelto nel gioco: nessuna email, identità Google, saldo, inventario o dati account degli altri. Il nuovo contatto deve essere visibile al raduno; una conversazione o un invito esistente resta raggiungibile anche dopo il ritiro dell'esposizione. Non viene pubblicato un elenco di tutti gli account.

## Messaggi e moderazione

Posta interna privata tra due piloti, testo semplice di massimo 800 caratteri, caratteri di controllo esclusi (ammessi a capo e tab). Nessun HTML eseguito, allegato o invio esterno. Conversazioni con ultimo messaggio, conteggio non letti, storico a pagine di 30 e conferma di lettura limitata ai messaggi effettivamente caricati. Aggiornamento manuale e ogni 30 secondi mentre la sezione è aperta e la pagina visibile. Nessuna connessione WebSocket o servizio aggiuntivo.

Limiti server per mittente: 10 messaggi al minuto e 60 all'ora; inviti alle sfide massimo 3 all'ora e 2 inviti/sfide non scaduti aperti per coppia. Le operazioni hanno chiavi per retry sicuri; una risposta persa non duplica il messaggio o l'invito. La transazione serializzabile protegge anche i limiti sotto concorrenza.

Bloccare un pilota impedisce contatti in entrambe le direzioni, annulla inviti e sfide ancora aperti e chiude atomicamente eventuali tentativi Meet in corso. Non annulla gare di carriera e non modifica i risultati già conclusi, compresi quelli maturati alla scadenza. Lo storico rimane privato e consultabile. Solo chi ha creato un blocco può rimuoverlo; un eventuale blocco dell'altro rimane valido.

Segnalazione del comportamento o di un preciso messaggio ricevuto (massimo 5 al giorno). Il messaggio deve appartenere alla conversazione e provenire dal pilota segnalato. La scheda «Segnalazioni» è riservata agli amministratori e mostra solo nomi pilota, motivazione ed eventuale testo segnalato. L'admin può contrassegnare la verifica; non sono state introdotte sospensioni automatiche degli account.

## Contratto della sfida

Il proponente sceglie una propria vettura, un circuito esistente e uno dei regolamenti:

- Stesso modello: stesso Car.id, preparazioni e abilità possono differire e sono visibili prima della partenza.
- Fascia IP: 0–49, 50–59, 60–69, 70–84, 85–120, 121–999. La fascia è quella della vettura proposta, calcolata nelle condizioni del raduno; il destinatario sceglie una propria auto che vi rientra. L'IP non garantisce equivalenza su ogni tracciato.

Condizioni iniziali per tutti: motore e gomme al 100%, 20 litri di normale, chilometraggio/tagliando virtuale azzerato. Nessun incremento artificiale di CV o abilità. La selezione non equipaggia l'auto e non ripara quella reale.

L'invito conserva il circuito completo, geometria, fondo e meteo, regolamento e preparazione del mittente. Il destinatario ha 48 ore per accettare o rifiutare; il mittente può ritirare un invito ancora pendente. Se nel frattempo il mittente cambia vettura, pezzi, abilità o tecniche equipaggiate, serve un nuovo invito. I cambi di usura/carburante della carriera non influenzano la preparazione normalizzata del raduno.

All'accettazione vengono fissate le due preparazioni complete: vetture, pezzi, abilità, pratica e tecniche equipaggiate. Un'impronta server protegge anche la scelta del destinatario da confronti scaduti. Il contratto non cambia più dopo l'accettazione, anche se successivamente si elabora o vende la vettura reale. Entrambi vedono vetture e requisiti prima di iniziare. Dall'accettazione decorrono 48 ore per completare i due tentativi.

## Gara e fantasma

Un solo tentativo per pilota, con RaceSession persistente, versione del settore e identificativo operazione. Un doppio avvio crea una sola sessione; ricaricamento o disconnessione permettono di riprenderla. Rimane il limite generale di una gara attiva per giocatore: occorre prima concludere o abbandonare quella corrente.

La modalità meetTrial usa la fisica tattica esistente ma esclude interazioni con altri veicoli: niente scia, contatti, sorpassi, difese, rallentamenti di posizione, incidenti esterni o guasti meccanici casuali. Restano decisioni di ritmo/frenata/traiettoria, tecniche compatibili, errori del pilota e consumo/usura della sola vettura virtuale durante il tentativo. Il seme è comune ai due tentativi e non viene restituito al browser. Nessun cambiamento alle regole delle gare già esistenti.

Il primo pilota registra il riferimento. Se l'altro ha già completato un giro valido, chi parte dopo vede il suo vero tempo e gli intermedi salvati, con distacco progressivo. Il fantasma è un riferimento cronometrico: non rappresenta un avversario presente in pista e non cambia la fisica del giro. A parità di vettura, pilota, tecniche e decisioni, i due tentativi producono lo stesso tempo. Non si pretende una gara simultanea; conoscere il riferimento fa parte di questa modalità asincrona.

Il tempo è ricavato solo dallo stato RaceSession calcolato dal server, mai dal client. Vince il minore dei tempi, arrotondati al millisecondo; parità al millisecondo = pareggio. Un ritiro o un tentativo mancante alla scadenza perde contro un tempo valido; doppio ritiro/nessun tempo valido è mostrato come pareggio/doppio ritiro. L'interfaccia mostra i due tempi, il distacco e lo storico delle ultime 100 sfide con conteggio vittorie/sconfitte/pareggi. Non è una classifica globale.

Scadenze effettive calcolate dal server anche senza job in background. Un invito scaduto non può essere accettato; una sfida scaduta non può iniziare nuovi tentativi. Se il pilota aveva lasciato una sessione aperta, riprenderla e avanzare/abbandonare la chiude come scaduta, senza consentire un giro tardivo. Le classificazioni alla scadenza non richiedono che entrambi tornino online.

## Carriera e sicurezza

Nessuna puntata, quota, accredito, XP, reputazione o progresso di scuola guida. Nessun aggiornamento delle condizioni dell'auto reale. Nessuna immissione dei tempi nelle prove personali o nelle classifiche pubbliche esistenti: i tempi appartengono alla sfida tra i due partecipanti. Le tecniche sono quelle già apprese/equipaggiate al congelamento, senza assegnazioni gratuite.

Proprietà, consenso, destinatario e partecipazione sono controllati su ogni endpoint. Solo i due partecipanti leggono la propria conversazione e le proprie sfide; il terzo pilota non può leggere messaggi, segnare quelli altrui come letti, accettare o guidare una sfida altrui. Il destinatario è l'unico ad accettare; i risultati e le condizioni non sono accettati dal browser. I blocchi sono verificati prima dei nuovi invii e delle partenze. Rate limit, cancellazione, avvio e chiusura gara sono transazionali.

## Dati e API

Quattro nuove tabelle: MeetMessage, MeetBlock, MeetReport, MeetChallenge, con riferimenti ai piloti e indici per destinatari/stati/date. MeetChallenge contiene contratto JSON immutabile dopo accettazione, risultati e riferimenti univoci ai due tentativi. Migrazione additiva PostgreSQL 0007 / SQLite 0010; in SQLite si aggiunge anche User.isAdmin per allineare i test al campo già presente in PostgreSQL. Nessuna modifica ai dati preesistenti del gioco pubblico.

- GET /api/meet/social/:userId: propria posta, inviti/sfide e auto normalizzate selezionabili.
- GET /api/meet/conversation/:peerId?userId=...&before=...: storico paginato della propria conversazione.
- POST /api/meet/message, /api/meet/read, /api/meet/block, /api/meet/report.
- POST /api/meet/challenge, /api/meet/challenge/respond, /api/meet/challenge/start.
- GET /api/meet/reports/:userId e POST /api/meet/report/resolve: solo amministratori.
- I turni/ripresa/abbandono usano le RaceSession esistenti, mantenendo il controllo di versione.

## Collaudo

170 test JavaScript e 9 account/gateway passati, lint e build superati. Inclusi isolamento di messaggi/letture/segnalazioni, limiti di invio, blocco reciproco, scadenze, vecchi messaggi dopo ritiro dal piazzale, proprietà/consenso, modello/IP, preparazioni congelate anche dopo vendita, doppio avvio concorrente, due tentativi asincroni con fantasma, uguaglianza del giro a parità di condizioni, assenza di premi/progresso/usura reale e separazione dai record personali. Componenti verificati tramite rendering automatico, senza browser collegato per verifica visiva interattiva.

scripts/validate-meet-social.cjs richiede un file privato ACCOUNTS_VALIDATION_ENV_FILE con database locale *_validation. Eseguito su copia PostgreSQL con tre piloti sintetici: messaggi privati e retry, lettura, segnalazione e verifica admin, invito/accettazione, avvio concorrente, due giri completi ripresi da database, fantasma con veri intermedi e stesso tempo a parità di decisioni, scadenza e blocco durante un tentativo. Verificati carriera e dati precedenti invariati. Nessun messaggio o invito di prova inviato ai giocatori reali.

Aggiornamento pubblicato sull'unica istanza 5174 e sul gateway pubblico. Backup completo Auth + gioco prima e dopo. Migrazione PostgreSQL 0007 applicata; audit delle tabelle game: quattro nuove tabelle inizialmente vuote e ogni riga preesistente invariata. API salute valida, Meet HTTPS pubblico 200, posta senza login 401. Lettura del vero hub e della coda admin verificata senza inviare messaggi/inviti o avviare tentativi sui giocatori reali. Servizi sviluppo e gateway entrambi attivi; database sintetico di collaudo rimosso.

Lo scambio consensuale dei numeri estende ora i contatti raggiungibili alle amicizie accettate. Il blocco interrompe anche questo rapporto. Dettagli in [RADUNO_E_AMICIZIE.md](RADUNO_E_AMICIZIE.md).

Le sfide sono ora proponibili e gestibili anche nel telefono, con le stesse operazioni e regole server: [CELLULARE_GIOCHI_E_SFIDE.md](CELLULARE_GIOCHI_E_SFIDE.md).
