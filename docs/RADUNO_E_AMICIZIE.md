# Piazzale persistente e scambio dei numeri

## Auto nel piazzale

L'esposizione è una scelta persistente del giocatore: cambiare sezione, ricaricare, disconnettersi o uscire dall'account non ritira la vettura. Nessuna scadenza per inattività in questa fase di test. La scheda distingue l'auto parcheggiata dalla presenza del pilota: «il pilota può essere assente». Niente indicazione online ricavata dalla sola esposizione.

La partenza di una gara, prova a tempo, prova dimostrativa o tentativo di sfida con la vettura esposta ritira soltanto quella vettura, nella stessa transazione che crea la gara. Se la partenza fallisce, l'esposizione resta. Guidare un'altra auto lascia la prima al piazzale. Le lezioni con vettura prestata dalla scuola (garageId 0) non coinvolgono l'auto personale. Consultare una gara, iscriversi a un campionato o accettare una sfida non usa ancora la vettura. Le sessioni teoriche/statistiche senza uso di un'auto non ritirano l'esposizione.

Un'auto già in gara non può essere esposta nuovamente; si può invece parcheggiare un'altra auto posseduta. Conclusione, ritiro o annullamento non riportano automaticamente l'auto al piazzale. Ritiro manuale, cambio esposizione e vendita mantengono le regole precedenti. Un retry di una vecchia esposizione restituisce lo stato attuale e non rimette in piazzale un'auto già partita. I record personali restano conservati; la loro condivisione segue la presenza dell'esposizione.

Il piazzale si aggiorna ogni 20 secondi mentre la scheda browser è visibile e al ritorno sulla finestra, senza ritirare le esposizioni all'uscita dalla pagina.

## Amicizia come numero in rubrica

Dal dettaglio di una vettura al raduno, «Scambia il numero con …» apre il contatto nel cellulare. «Chiedi il numero» invia una richiesta privata. Una notifica discreta e il contatore sul cellulare indicano al destinatario la richiesta; nel telefono, «Richieste» permette di accettare o rifiutare. Il mittente può ritirarla. Le richieste incrociate rimangono in attesa di una risposta esplicita, senza accettazione automatica.

Accettare salva il contatto in entrambe le rubriche con identificativo fittizio PT-00000 derivato dall'ID pilota. Non è un numero telefonico reale: non si raccolgono dati telefonici, non si usa l'email e non si inviano SMS esterni. «Numeri salvati» contiene gli amici accettati; «Piloti incontrati» distingue gli altri contatti pubblici o già noti, che non vengono aggiunti automaticamente agli amici.

Il numero resta disponibile quando entrambi ritirano l'auto o escono dal gioco. Un'amicizia accettata permette di scriversi e sfidarsi senza necessità di esposizione o messaggi precedenti, mantenendo i normali controlli su blocchi, auto e regolamenti. Non crea automaticamente SMS né altera la carriera. Il risultato dell'accettazione è visibile nelle rubriche aggiornate; le richieste ricevute non si confondono con gli SMS non letti.

«Elimina numero» chiede conferma e interrompe l'amicizia in entrambe le rubriche. Le conversazioni e le sfide esistenti conservano i loro normali accessi e lo storico non si cancella. Per impedire nuovi messaggi, usare «Blocca pilota». Il blocco rimuove anche l'amicizia e le richieste pendenti, oltre a mantenere le precedenti regole di annullamento delle sfide. Sbloccare non ripristina l'amicizia.

## Integrità e privacy

Una sola riga MeetFriendship per coppia ordinata lowId/highId, con richiedente, stato e date. Relazioni FK ai piloti, vincoli sull'ordine, sul richiedente e sugli stati. Transazioni serializzabili, chiavi operazione per retry e cursore della richiesta per impedire a una vecchia risposta di accettare una richiesta successiva. Solo il destinatario risponde, solo il mittente ritira, ciascun amico può rimuovere il rapporto. L'API non accetta stati, mittenti o numeri scelti dal browser.

Si può chiedere il numero solo a un pilota raggiungibile secondo le regole del raduno (esposizione valida o relazione sociale già nota), mai enumerando account nascosti. Massimo 10 richieste nuove l'ora e 30 richieste proprie in attesa; dopo rifiuto, ritiro, rimozione o blocco occorrono 24 ore prima di una nuova richiesta nella stessa coppia. Le risposte restano possibili anche dopo il ritiro dell'auto del mittente. Nessun dato account nelle proiezioni; ogni elenco e notifica è privato al proprietario. Cambio account cancella immediatamente cache, richieste, bozze e notifiche, ignorando risposte tardive.

POST /api/meet/friendship usa peerId, action (request/accept/decline/cancel/remove), requestKey per risposte/rimozioni e la normale operationId. Non richiede assenza di una gara attiva. Le letture avvengono sulle API private del telefono già esistenti.

## Migrazione e collaudo

Migrazione additiva PostgreSQL 0008 / SQLite 0011: nuova tabella MeetFriendship, inizialmente vuota. Nessuna amicizia automatica tra interlocutori precedenti. Il solo riallineamento dei dati esistenti ritira un'eventuale esposizione della stessa vettura già presente in una gara attiva (garageId positivo); nessuna modifica ad altre esposizioni, messaggi, risultati, auto, saldi o progressi.

219 test di gioco/client e 12 account/gateway superati, lint e build validi. Copertura specifica: permanenza, uso di una seconda vettura, errore di partenza senza ritiro, divieto di esposizione della vettura in gara, lezioni con auto della scuola, retry senza ritorno al piazzale, consenso, richieste incrociate concorrenti, cursore scaduto, limiti orari e richieste pendenti, rifiuto/cancellazione, rimozione reciproca, blocco anche dopo ritiro dell'esposizione, isolamento tra account e conservazione degli SMS.

Migrazioni complete SQLite e PostgreSQL verificate. Su copia PostgreSQL, scripts/validate-meet-friends.cjs verifica le nuove operazioni via HTTP con tre piloti sintetici; anche i collaudi aggiornati validate-meet-social.cjs e validate-car-meet.cjs superano i controlli, incluse sfide asincrone, fantasma, record e conservazione dei dati preesistenti. Questi script rifiutano database non locali o non terminanti in _validation.

Browser reale con due sessioni, API effettiva e copia PostgreSQL: richiesta dal dettaglio dell'auto, notifica sul telefono, accettazione, numeri salvati, permanenza fuori sezione e al ricaricamento, uso di un'altra auto, ritiro alla partenza, nessun ritorno automatico, primo SMS con piazzale vuoto, rimozione e rifiuto. Verifica separata del blocco/sblocco di una richiesta dopo la partenza del mittente dal raduno. Desktop 1280×960 e telefono 390×844, nessun errore JavaScript o scorrimento orizzontale nelle viste verificate. Catture e rapporti in .preview/friends-qa; nessun SMS, richiesta o sfida di collaudo inviato ai giocatori reali.

## Rilascio verificato

Pubblicato il 23 ottobre 2026 sull'istanza unica 5174, gateway 5184 e URL pubblici 443/8443. Backup completo Auth + gioco prima e dopo; build e client Prisma precedenti, dati e rapporto di confronto in /home/klaro/.backups/poketurismo/meet-friends-2026-10-23T12-10-17.837Z (privato).

Audit delle 31 tabelle precedenti e della nuova tabella (32 totali nello schema game, inclusi i metadati Prisma): MeetFriendship inizialmente vuota, una nuova ricevuta di migrazione e tutte le righe di gioco preesistenti invariate. Nessuna esposizione corrispondeva a un'auto già in gara, quindi il riallineamento non ha ritirato alcuna vettura. Nessun reset, amicizia automatica o messaggio di collaudo sul database pubblico.

Servizi attivi e health valido; raduno pubblico HTTP 200 su entrambe le porte HTTPS, API notifiche e scritture amicizia senza sessione HTTP 401. Verificato anche il bundle effettivamente servito dal Funnel. Anteprima, browser e database temporaneo vengono rimossi dopo il collaudo.
