# SMS del club e cellulare

I messaggi privati del raduno si inviano e si leggono nel cellulare POKETEL: scocca blu, display verde, rubrica, elenco SMS ricevuti/inviati e singolo messaggio. Dal raduno «Invia SMS» apre la composizione con il pilota già selezionato; la scheda «SMS» apre il telefono. Il pulsante del cellulare nella barra è disponibile nelle altre sezioni, anche durante una gara.

Una notifica discreta mostra il mittente e i pulsanti «Leggi SMS» / «Dopo», senza interrompere la gara o aprire automaticamente finestre. Il contatore resta nella barra e sul display. Il suono a due toni è facoltativo, inizialmente spento e attivabile sul telefono; all'accesso lo storico non provoca suoni. Nessuna richiesta di notifiche del browser, numero di telefono o servizio SMS esterno.

## Conservazione, lettura e invio

Stesse tabelle MeetMessage/MeetBlock/MeetReport e stesse operazioni sociali: nessuna migrazione, duplicazione o cancellazione dei messaggi esistenti. Gli SMS lunghi conservano il limite di 800 caratteri; ogni 160 caratteri il display conta una parte virtuale, fino a cinque. L'invio resta una singola operazione idempotente, senza costi o modifiche ai saldi.

Il riepilogo e l'elenco non segnano come letto. Soltanto il singolo SMS ricevuto effettivamente aperto e visibile invia `throughId`: i messaggi successivi dello stesso mittente rimangono non letti. Restano disponibili paginazione e vecchi testi completi. L'arrivo di un messaggio non sostituisce quello che si sta leggendo o scrivendo. Bozze separate per destinatario in memoria, conservate chiudendo il telefono; dopo errore di rete il testo e l'identificativo idempotente dell'invio restano disponibili.

Le notifiche vengono controllate ogni 10 secondi con pagina visibile e al ritorno sulla finestra; dopo errore si riprova dopo 30 secondi. Nessun polling in background sulla scheda nascosta. Memoria degli ID e watermark impediscono di segnalare come nuovi vecchi SMS riemersi dopo la lettura. Cambio account/uscita azzerano telefono, rubrica, bozze, contatori e richieste pendenti; le risposte appartenenti alla sessione precedente vengono ignorate.

## Privacy e controlli

GET /api/phone/:userId/notifications restituisce soltanto conteggio e ultimi cinque mittenti/ID/date non letti del proprietario, senza testo. GET /api/phone/:userId restituisce soltanto conversazioni proprie e contatti già noti (messaggi, sfide, blocchi), più piloti con esposizione volontaria ancora valida al raduno. Nessun elenco generale di account, email, saldo o credenziali. Autenticazione e proprietà controllate prima delle query; invii, letture, blocchi e segnalazioni riusano i controlli server esistenti e i rate limit.

Blocco e segnalazione accessibili dalle opzioni del contatto; lo storico resta consultabile. Le sfide rimangono nella sezione dedicata del raduno. Gli avvisi e lo storico del gioco sono conservati nel telefono, separati dagli SMS; gli errori restano nelle finestre Windows esistenti.

## Verifica

203 test di gioco/client e 11 account/gateway, lint e build superati. Casi dedicati: privacy e proprietà, riepilogo senza lettura, cursore di lettura, deduplicazione notifiche e invii, paginazione, bozze e risposte tardive dopo cambio account.

Query eseguite anche su copia completa PostgreSQL temporanea: ricezione, conversazione, notifica senza corpo e nessuna lettura implicita; tutti i campi pilota invariati. Nessun messaggio di prova inviato ad account reali. Collaudo del telefono nel browser con due piloti e HTTP isolato, desktop e telefono; dettagli e catture in .preview/phone-qa. La schermata di gara nel collaudo browser è simulata: la non interferenza deriva anche dal montaggio globale del telefono esterno ai controlli di gara, senza chiamate alle operazioni di gara.

## Rilascio verificato

Pubblicato il 23 ottobre 2026 sulla sola istanza 5174 tramite gateway 5184. Backup completo Auth + gioco prima e dopo; build precedente, dati e confronto delle 31 tabelle di gioco in /home/klaro/.backups/poketurismo/phone-sms-2026-10-23T11-30-37.820Z (privato). Tutte le righe e i campi di gioco invariati al rilascio: nessuna migrazione, reset o modifica ai messaggi preesistenti.

Servizi attivi, health positivo, raduno pubblico HTTP 200 e API notifiche senza sessione HTTP 401. L'anteprima di collaudo e la copia PostgreSQL temporanea vengono rimosse dopo le verifiche; rimangono le catture e i rapporti senza dati reali in .preview/phone-qa.

## Rubrica e amicizie

La rubrica distingue ora «Numeri salvati» (amicizie accettate) da «Piloti incontrati» (contatti noti e presenti al raduno). Richieste e avvisi di scambio numero sono separati dai messaggi SMS. Regole, consenso, blocchi e conservazione sono descritti in [RADUNO_E_AMICIZIE.md](RADUNO_E_AMICIZIE.md).
