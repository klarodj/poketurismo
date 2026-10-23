# Giochi e sfide nel POKETEL

Il pulsante del cellulare apre il menu con messaggi, rubrica, richieste, sfide, giochi e avvisi del gioco. I collegamenti dagli SMS e dalle notifiche continuano ad aprire il contenuto pertinente. Il tasto fisico «Menu» torna al menu principale; «Indietro» rispetta la sezione corrente. Display verde, scocca blu, caratteri VT323 e pulsanti in stile telefonino dell'epoca.

## Snake

Cellulare → Giochi → Snake. Campo monocromatico 18×14, serpente iniziale di tre celle, cibo nelle celle libere. Ogni alimento dà 10 punti e allunga il serpente; urtare muri o corpo termina la partita. Non si può invertire direzione di 180° né accodare più di una svolta nello stesso passo. Entrare nella coda che si sta spostando resta lecito. Riempire il campo conclude la partita con una vittoria, senza cercare all'infinito una nuova posizione per il cibo.

Comandi: frecce, WASD o tastierino 2/4/6/8; P mette in pausa/riprende. I tasti direzionali touch sono sul corpo del telefono, fuori dal display: su 390×844 campo, punteggio e tastierino rimangono visibili insieme senza scorrimento del campo. La velocità aumenta di 15 ms ogni 50 punti, da 220 ms a un minimo di 85 ms per passo.

Chiudere il telefono, cambiare sezione, mettere la scheda in background o cambiare finestra mette in pausa. Per proseguire occorre premere «Riprendi». La partita resta in memoria durante la sessione; il record è salvato sul browser per il singolo pilota (chiave poketurismo-snake-v1:<playerId>). Ricaricare la pagina avvia una partita nuova ma conserva il record; cambio account cancella la partita in memoria e carica soltanto il record del nuovo pilota. Se lo storage non è disponibile si può giocare comunque.

src/logic/snake.mjs contiene il motore puro e deterministico; snakeStore gestisce partita, pausa e record. Nessuna chiamata di scrittura al server per giocare, nessun denaro/XP, alterazione delle statistiche o classifica globale. Il disegno usa SVG con celle a pixel netti, senza scaricare asset o sostituire immagini esistenti. I tasti del minigioco sono ascoltati solo mentre la sua schermata è aperta.

## Sfide dal cellulare

Dal menu «Sfide» si vedono inviti e risultati. Da un contatto in rubrica o da un SMS, «Proponi sfida» apre invece la composizione con il pilota preselezionato. Aprire la schermata non invia nulla: occorre scegliere la propria auto, il circuito e il regolamento (stesso modello oppure fascia IP), esaminare preparazione/condizioni e premere «Invia invito».

Dopo l'invio compare la conferma e si torna all'elenco. Lo stesso modulo non ripropone un invio identico già confermato finché non si cambia la configurazione; un errore di rete mantiene le scelte e la stessa operationId per il retry. Si può usare «Nuovo invito» per un confronto differente, sempre entro i limiti server esistenti.

Il destinatario può scegliere un'auto compatibile e accettare o rifiutare dal telefono; il mittente può ritirare l'invito. Dopo l'accettazione ciascuno può iniziare il proprio unico tentativo o riprendere/rivedere quello salvato. L'avvio chiude il telefono e apre la gara normale con il raceId restituito dal server. Se esiste già una gara attiva, l'avvio di un nuovo tentativo è disabilitato e resta protetto dal server. Non viene iniziata una gara solo inviando o accettando un invito.

Restano immutati il contratto asincrono di 48 ore, le condizioni virtuali 100/100 e 20 L normale, le regole sui consumi congelate nel contratto, il fantasma cronometrico, blocchi, proprietà, limiti e assenza di premi/usura reale. src/logic/meetChallenges.mjs condivide i controlli di compatibilità tra telefono e scheda del raduno; l'autorità rimane server/meetSocial.js. Si riusano le stesse API, senza nuove tabelle o copie delle sfide.

La schermata aggiorna le letture ogni 30 secondi quando è aperta e visibile, al ritorno sulla finestra e dopo le proprie operazioni. Scelte di auto/circuito/regolamento restano durante gli aggiornamenti. Risposte tardive dopo chiusura o cambio account non cambiano la schermata né avviano una navigazione per il nuovo account.

## Avvisi degli inviti

Il polling privato del telefono include ora il conteggio degli inviti pendenti ricevuti e un riepilogo degli ultimi cinque: ID, data e pilota mittente. Solo il destinatario li riceve; inviti scaduti o già risposti sono esclusi. Nessun contratto, dato account o testo privato nel riepilogo. La tabella resta inalterata durante la lettura.

Un avviso discreto permette di aprire le sfide; il contatore compare sul telefono e sulla barra. Si distingue da SMS non letti e richieste di scambio numero. Non apre automaticamente una finestra né interrompe Snake: se il telefono è già aperto aggiorna il contatore. ID e watermark evitano avvisi ripetuti per vecchi inviti riemersi. Nessuna notifica esterna o SMS reale.

## Collaudo

249 test JavaScript e 12 account/gateway superati, lint e build validi. Snake: movimenti deterministici, crescita, cibo libero, collisioni e coda mobile, inversioni/accodamento dei comandi, campo pieno, pausa, limite di velocità, record per pilota e storage indisponibile. Telefono/sfide: destinatario preselezionato senza invio automatico, bozze SMS conservate, cambio account, ammissione modello/IP condivisa, controlli di accettazione e gara attiva, notifiche private degli inviti e scadenza.

Browser reale su copia PostgreSQL con due amici sintetici: raccolta del cibo tramite tastiera, pausa e ripresa, record dopo reload, tasti touch, invito dal contatto, risposta di rete persa dopo creazione e retry con un solo invito, accettazione e avvio dei due tentativi con navigazione nella gara reale. Un altro invito ricevuto mentre Snake era aperto ha aggiornato il contatore senza cambiare schermata o interrompere la partita. Controllo aggiuntivo che un modulo già inviato non replichi lo stesso invito.

Desktop 1280×960 e telefono 390×844: campo, punteggio e tastierino visibili insieme, nessuno scorrimento orizzontale o errore JavaScript nelle viste verificate. Stato server identico prima/dopo Snake; dati dei piloti e auto sintetici invariati anche dopo gli avvii Meet. Verificata conservazione dei dati preesistenti in 14 modelli della copia PostgreSQL. Catture e rapporti in .preview/phone-games-qa; nessun invito, messaggio o gara di collaudo sui giocatori reali. Nessuna migrazione di schema.
