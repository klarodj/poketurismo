# Roadmap: carriera, persone e provincia nel 2002

Data: 30 ottobre 2026. Stato: B01 completato e pubblicato; B02 completato e pubblicato; B03–B10 da iniziare.

Documento operativo per integrare le idee discusse con il giocatore: scoperta e collezione, cultura automobilistica, rivali ricorrenti, incarichi e scelte di ruolo. Si procede nell'ordine indicato, un blocco verificabile alla volta. Il prossimo lavoro è **B03**, dopo il playtest di B02; non l'intera roadmap in un solo rilascio.

## Direzione e vincoli

- Nord Italia, riferimento narrativo 2002; pixel art approvata, finestre Windows 98, forum, SMS e autoradio. Seguire [DIREZIONE_ARTISTICA.md](DIREZIONE_ARTISTICA.md), incluse le eccezioni storiche già documentate.
- Dare valore alle persone e alle auto economiche, anche dopo l'acquisto di una vettura più potente. Collezionare ricordi deve essere possibile senza possedere contemporaneamente 200 auto.
- Storie facoltative e riprendibili: nessun dialogo obbligatorio durante una gara, nessun accesso quotidiano richiesto, nessuna perdita permanente perché non ci si collega.
- Conservare crescita del pilota, IP/IG, tecniche, consumi, economia e bilanciamento appena verificati. Ogni eventuale modifica successiva richiede motivazione e confronto prima/dopo.
- Reputazione e relazioni aprono opportunità: non aggiungono cavalli, abilità o moltiplicatori nascosti. Avversari con progressione per capitoli e griglie esplicite, senza adattamento automatico al giocatore.
- Conservare account, messaggi, amicizie, vetture, record e contratti attivi. Nessun reset. Migrazioni additive e contenuti versionati quando necessari.
- I ciceroni restano consultabili su richiesta; gli incarichi hanno uno stato separato dalle spiegazioni del tutorial. Gli NPC non diventano account fittizi con accesso alle API sociali dei giocatori.
- Immagini nuove solo dove servono: riusare asset approvati; per i nuovi ritratti e scene conservare prompt, fonti e versioni. Verificare sul web i riferimenti storici specifici prima di pubblicare testi o disegni che li descrivono come reali.

## Registro di avanzamento

Stati ammessi: Da iniziare → In corso → In prova → Completato. Un blocco è completato solo con funzionalità verificata, rapporto collegato e pubblicazione annotata. Dipendenze e quantità sotto sono il piano iniziale; eventuali variazioni vanno registrate, non lasciate implicite.

| Blocco | Risultato giocabile | Dipende da | Stato |
|---|---|---|---|
| B01 | Fondamenta narrative e schede dei personaggi | Base attuale | Completato |
| B02 | Prima storia in sei episodi, incarichi e tre rivali | B01 | Completato |
| B03 | Reputazione autodromo, clandestine e raduni | B02 | Da iniziare |
| B04 | Eventi a tema e motivi per usare auto diverse | B03 | Da iniziare |
| B05 | Album del pilota e memoria delle vetture | B02, B04 | Da iniziare |
| B06 | Scelte di ruolo e soluzioni alternative agli incarichi | B03, B04 | Da iniziare |
| B07 | PC di casa con forum, email e annunci | B05, B06 | Da iniziare |
| B08 | Rivista del club e cronaca della carriera | B07 | Da iniziare |
| B09 | Calendario del mondo con eventi recuperabili | B04, B07, B08 | Da iniziare |
| B10 | Dettagli ambientali e prova completa della carriera | B01–B09 | Da iniziare |

Prima tappa di prodotto: B01–B03, un mondo con persone che riconoscono il giocatore. Seconda: B04–B06, più modi per giocare e costruire la propria carriera. Terza: B07–B10, il mondo racconta e ricorda ciò che accade.

## B01 — Fondamenta narrative e personaggi

**Obiettivo:** preparare il minimo necessario per una storia persistente, senza costruire subito un sistema narrativo universale.

- [x] Censire ciceroni, 40 rivali clandestini, reputazione esistente, avvisi e messaggi. Definire chi può tornare nella storia e chi resta solo una guida.
- [x] Preparare una breve scheda per tre rivali ricorrenti: identità, voce, auto, luogo, motivazione e progressione in tre capitoli. Su indicazione dell’utente, creare nuovi rivali con avatar dedicati e vetture riconoscibili; mantenere separati i ciceroni e i rivali esistenti.
- [x] Definire ID stabili e versioni di episodi, obiettivi, dialoghi e ricompense. Stati minimi: disponibile, accettato, in corso, concluso, rinunciato/riprendibile.
- [x] Collegare gli obiettivi soltanto ad azioni e risultati validati dal server. Ricompensa e completamento atomici, una volta sola anche dopo retry o richieste concorrenti.
- [x] Definire gli SMS narrativi come comunicazioni di NPC riconoscibili, con lettura e notifiche coerenti con il telefono attuale, senza duplicare o alterare gli SMS fra utenti.
- [x] Prevedere una piccola vista «Incarichi» nel telefono, con mittente, obiettivo corrente e luogo dove proseguire. Nessuna nuova barra globale.

**Completamento:** un incarico di prova su database di collaudo sopravvive al logout, non avanza per eventi non validi e non paga due volte; due account restano isolati. Cast e flusso dei sei episodi di B02 documentati. Testo e eventuali ritratti nuovi verificabili prima dell'integrazione finale.

## B02 — Prima storia: «Un posto nel club»

**Obiettivo:** pubblicare una storia breve che accompagni il pilota fra luoghi già esistenti. Titolo e scene sono una bozza editoriale.

| Episodio | Luogo | Attività e senso della scena |
|---|---|---|
| 1. Il primo numero | Raduno | Presentazione di un rivale e invito al club, senza obbligo di amicizia con utenti reali |
| 2. Prima la precisione | Scuola guida | Sara propone una prova di costanza con vettura in prestito |
| 3. Giro di collaudo | Meccanico | Provare un'auto del cliente senza superare i limiti dichiarati di usura/errore |
| 4. Una mano in officina | Officina/raduno | Aiutare un conoscente: tempo di gioco o ricambio adatto, senza spesa obbligatoria |
| 5. La rivincita | Ritrovo clandestino | Incontro con un rivale noto, senza puntata obbligatoria e con limiti della vettura verificati |
| 6. La domenica del club | Autodromo | Concludere una prova accessibile; prima accoglienza nel club, non vittoria obbligatoria |

- [x] Introdurre i tre rivali gradualmente: uno preparatore di utilitarie, una specialista della pista e un veterano. Assegnare auto e identità nel cast B01.
- [x] Variare dialoghi e incontri successivi secondo risultati e aiuti precedenti. La sconfitta apre una risposta o una rivincita; non blocca l'intera storia.
- [x] Distribuire ricompense soprattutto in contatti NPC, inviti, servizi o ricambi limitati. Preventivare soldi e XP per l'intero arco prima di assegnarli.
- [x] Le prove su auto in prestito non consumano carburante o ricambi della vettura personale. Nessuna modifica alle sfide virtuali esistenti.
- [x] Riconoscere soltanto progressi storici affidabili per i piloti già avviati; offrire una prova equivalente quando manca una registrazione verificabile. Nessun risultato inventato o pagamento retroattivo indiscriminato.

**Completamento:** tutti e sei gli episodi percorribili da un nuovo pilota e da uno già avviato; percorso praticabile con budget basso; chi perde o rinuncia può riprendere. Notifiche discrete, nessuna interruzione della guida e nessun blocco delle gare normali.

## B03 — Reputazione e relazioni

- [ ] Introdurre tre ambiti leggibili: autodromo, clandestine e raduni. Mostrare pochi gradi nominati, con avanzamento e prossima opportunità consultabili nei dettagli.
- [ ] Riutilizzare la reputazione clandestina già salvata: definire una proiezione compatibile o una conversione versionata che non cancelli né riattribuisca i punti storici.
- [ ] Separare reputazione pubblica e relazione con i tre rivali: conosciuto, fidato, rivale sportivo sono stati narrativi, non nuove abilità da massimizzare.
- [ ] Definire una prima tabella di sblocchi: incarichi, inviti e servizi con condizioni esplicite. Nessun malus automatico in autodromo per aver partecipato alle clandestine.
- [ ] Impedire accumulo illimitato con lo stesso incarico o avversario; nessuna reputazione guadagnata inviando SMS o richieste di amicizia ripetute.

**Completamento:** B02 alimenta reputazione e relazioni senza doppioni; ogni sblocco ha una fonte consultabile, IG/IP e fisica invariati. Primo playtest dell'arco B01–B03 prima di ampliare i contenuti.

## B04 — Eventi speciali e cultura dell'auto

- [ ] Pubblicare un primo evento per ciascuna delle cinque famiglie: utilitarie, vetture originali, budget limitato, raduno nazionale con prova e regolarità.
- [ ] Riutilizzare gare, cruscotto e contratti esistenti. Aggiungere soltanto le regole mancanti, condivise fra anteprima, iscrizione e partenza.
- [ ] Per «originale» definire chiaramente ricambi ammessi e conversione esclusa; per «budget» usare un costo convenzionale dichiarato di auto e pezzi, non un prezzo storico mancante o manipolabile tramite rivendita.
- [ ] Raduni e prove stradali escludono le conversioni da corsa; eventi pista possono prevedere una classe dedicata. La nazionalità tematica delle auto non cambia la collocazione italiana degli eventi.
- [ ] Regolarità valutata su tempo obiettivo e scostamenti dichiarati, non sulla sola velocità. Risultati separati dai record di velocità esistenti.
- [ ] Esporre requisiti, auto compatibili possedute, preparazione rivali, costi e premi. Nessun obbligo di acquistare una rara vettura disponibile un solo giorno.

**Completamento:** cinque eventi verificati, incluso almeno uno interessante con un'auto iniziale; nessun guadagno sproporzionato rispetto alle attività esistenti e nessuna aggirabilità dei requisiti cambiando auto dopo l'iscrizione.

## B05 — Album del pilota

- [ ] Aggiungere a casa un raccoglitore con vetture possedute/incontrate, luoghi visitati, personaggi conosciuti e trofei.
- [ ] Distinguere scheda modello e ricordi della singola vettura: prima vittoria, campionato, foto e chilometraggio soltanto quando registrati in modo attendibile.
- [ ] Conservare i ricordi dopo vendita o conversione senza conservare la proprietà del mezzo. Nessuna collezione subordinata all'avere 200 auto insieme.
- [ ] Definire cosa conta come «incontrata»: presenza effettiva in una gara o visita volontaria al dettaglio di un'esposizione, non semplice scorrimento del catalogo.
- [ ] Compilare progressivamente schede storiche brevi e documentate, con fonti in archivio editoriale. Asset delle auto approvate invariati.
- [ ] Recuperare i dati storici disponibili senza ricostruire chilometri o vittorie mancanti; indicare quando un ricordo viene seguito dall'introduzione della funzione.

**Completamento:** vendita, cambio colore e conversione non duplicano modelli né cancellano ricordi. Album privato, eventuale condivisione volontaria e limitata ai dati selezionati.

## B06 — Scelte di ruolo

- [ ] Ampliare almeno tre incarichi con alternative: studiare il percorso, parlare con un pilota, controllare l'auto; aiutare con una prova oppure con un ricambio.
- [ ] Mostrare prima della scelta costi, abilità pertinenti, informazioni ottenibili e conseguenze conosciute. Nessun costo reale perché il giocatore ha soltanto aperto un dialogo.
- [ ] Usare le abilità per aprire opzioni e rendere più affidabile un'informazione, senza obbligare a una specializzazione per continuare la storia.
- [ ] Prima versione senza tiri casuali nascosti nei dialoghi. Le gare mantengono il loro motore; nessun tiro narrativo annulla un risultato sportivo valido.
- [ ] Esiti differenti con opportunità successive equivalenti: vantaggi di preparazione o informazioni, non bonus invisibili ai tempi.

**Completamento:** almeno due soluzioni per ciascun incarico ampliato, conseguenze persistenti e comprensibili; nessun ramo rende irrecuperabile la carriera.

## B07 — PC di casa

- [ ] Integrare a casa un PC con browser dell'epoca: forum del club, posta elettronica e annunci. Mantenere le dieci destinazioni attuali della mappa.
- [ ] Forum inizialmente editoriale, con personaggi NPC e discussioni che reagiscono alla carriera. Scrittura libera fra giocatori fuori da questa prima versione: richiederebbe moderazione dedicata.
- [ ] Email lunghe per regolamenti e inviti, SMS per avvisi brevi. Un solo incarico sottostante: lettura e accettazione da un canale non duplicano attività o premi.
- [ ] Annunci collegati al mercato esistente, conservando rotazione giornaliera e inserzioni dei giocatori; nessuna seconda economia o doppio inventario.
- [ ] Indizi concreti su eventi e preparazioni coerenti con il modello fisico. Nessun consiglio editoriale che prometta bonus inesistenti.

**Completamento:** forum, posta e annunci funzionano su desktop e telefono, senza scritte microscopiche o finestre sovrapposte obbligatorie; ripresa coerente fra PC e cellulare.

## B08 — Rivista automobilistica del club

- [ ] Creare una testata immaginaria con copertina, prova vettura, pagina eventi e trafiletto sportivo.
- [ ] Pubblicare articoli basati su risultati già conclusi e validati: prima citazione, intervista, eventuale copertina come traguardo narrativo.
- [ ] Prima versione personalizzata e privata: non pubblicare automaticamente nomi o risultati di altri giocatori. Distinguere sempre cronaca locale del proprio pilota e classifiche pubbliche reali.
- [ ] Integrare le uscite con album e forum senza tre notifiche per lo stesso episodio. Archivio delle edizioni già sbloccate.
- [ ] Generare la grafica necessaria in pixel art; testi variabili leggibili in HTML, senza affidare notizie e nomi a testo disegnato nell'immagine.

**Completamento:** nuova vittoria aggiorna il trafiletto una volta sola; rivista precedente conservata, nessuna vittoria o notorietà inventata per riempire una pagina.

## B09 — Calendario del mondo

- [ ] Mostrare raduni del venerdì, domeniche in pista, fiere dei ricambi e serate in officina mediante calendario/volantino del club.
- [ ] Separare cronologia narrativa e tempo reale: niente anno contemporaneo nella cornice del 2002; finestre reali calcolate dal server in Europe/Rome, incluse transizioni dell'ora legale.
- [ ] Eventi ricorrenti con finestre ampie e repliche; incarichi principali senza scadenza. Il giocatore vede quando potrà recuperare un evento perso.
- [ ] Un'iscrizione iniziata conserva il contratto e può concludersi dopo la chiusura delle nuove iscrizioni. Non modificare scadenze delle sfide sociali già esistenti.
- [ ] Nessun premio per il solo accesso, serie quotidiana obbligatoria o ricompensa unica persa per assenza. Prima edizione: un ciclo semplice di quattro settimane, senza simulare un anno intero.

**Completamento:** orologio simulato nei test per apertura, chiusura, ripresa, repliche e cambio ora; nessun duplicato di premi passando da un ciclo all'altro e nessuna regressione del mercato giornaliero.

## B10 — Dettagli ambientali e consolidamento

- [ ] Aggiungere ricevute delle nuove lavorazioni, volantini, foto ricordo e oggetti del garage consultabili. Le ricevute estetiche derivano dalle operazioni vere, senza sostituire la contabilità server.
- [ ] Aggiungere brevi intermezzi dell'autoradio del club, con volume e disattivazione; mai partire automaticamente prima del consenso alla riproduzione e mai rendere obbligatorio ascoltare un'informazione.
- [ ] Aggiornare i ciceroni soltanto nelle sezioni interessate, mantenendo le spiegazioni facoltative e le voci dei personaggi coerenti.
- [ ] Verificare tutto il percorso con pilota nuovo, pilota avanzato, budget basso e auto convertita da gara; controllare che un mezzo stradale o una prova in prestito restino accessibili quando servono.
- [ ] Rivedere notifiche e testi ripetuti: un riepilogo utile, dettagli su richiesta, immagini visibili e nessuna nuova interfaccia moderna.
- [ ] Confrontare ritmo economico, progressione e interesse delle auto economiche con la base precedente. Correggere gli squilibri prima di ampliare il numero di storie.

**Completamento:** una carriera attraversa i sei episodi, almeno un evento speciale, album, scelte alternative, forum, rivista e calendario senza interventi manuali sui salvataggi. Verifiche desktop/mobile e regressioni documentate.

## Procedura per ogni blocco

1. Leggere questa roadmap e il rapporto del blocco precedente. Segnare il blocco «In corso», indicare scope e dipendenze effettive.
2. Definire contenuti, costi, ricompense e schermate prima di implementarli; annotare le decisioni ancora aperte. Nessuna promessa di tempi finché non si esamina il codice coinvolto.
3. Sviluppare una porzione giocabile completa. Provare persistenza, isolamento account, retry, concorrenza e compatibilità solo dove pertinenti alla modifica; usare database temporanei o copie di collaudo.
4. Passare a «In prova» con istruzioni di playtest e risultati attesi. Verificare mobile e desktop, testi e grafica dell'epoca, accessibilità dei controlli e percorsi con pochi soldi.
5. Prima di migrazioni o pubblicazione del codice: backup e verifica di conservazione dati; mantenere la sola istanza pubblica esistente. Controlli adeguati alla modifica, nessuna gara di prova sui salvataggi reali.
6. Registrare commit, rapporto, pubblicazione e problemi residui. Un blocco con lavoro obbligatorio aperto resta «In prova». Passare al successivo dopo aver raccolto il feedback utile sul blocco rilasciato.

## Scheda da compilare a ogni avanzamento

```text
Blocco:
Stato:
Data:
Contenuti consegnati:
Decisioni di design e variazioni rispetto al piano:
Verifiche e percorso di playtest:
Compatibilità/migrazioni e backup, se necessari:
Commit e rapporto:
Pubblicazione:
Feedback e problemi da chiudere:
Prossima azione concreta:
```

## Diario

- 30 ottobre 2026: roadmap iniziale salvata su richiesta dell'utente. Tutti i blocchi ancora da iniziare. Prossima azione: B01, censimento dei personaggi e definizione del cast e del flusso dei sei episodi; nessuna nuova funzione attivata da questo documento.

- 30 ottobre 2026, B01 in prova: quattro nuovi personaggi con ritratti dedicati e auto fisse, telefono con Incarichi/SMS del club e prologo a premio unico. Rapporto: [B01_PERSONAGGI_E_INCARICHI.md](B01_PERSONAGGI_E_INCARICHI.md). I tre rivali principali e Tommaso come conoscenza futura rispettano la nuova indicazione dell’utente; nessun episodio B02 dichiarato implementato.

- 30 ottobre 2026, B01 completato e pubblicato: commit sorgenti `b8fe6fe`; 338 test gioco, 13 account/gateway, 5 migrazioni SQLite, lint/build, concorrenza PostgreSQL e browser desktop/mobile superati. Verificate risposte lente e frontend pubblicato con sole API di collaudo. Backup prima del rilascio; confronto delle 32 tabelle: righe esistenti intatte, solo nuova colonna narrativa vuota e registrazione della migrazione. Servizi unici attivi e 22 controlli HTTP sui due Funnel superati. Prossima azione: playtest del prologo da Cellulare → Incarichi; poi B02 con il cast e il flusso definiti nel rapporto.

- Avvio B02: impostazione dei sei episodi e budget di progetto in [B02_PRIMA_STORIA.md](B02_PRIMA_STORIA.md). In attesa della preferenza sulle auto delle gare narrative prima di congelare i contratti. Nessun episodio nuovo pubblicato.

- B02 in prova: sei episodi implementati con auto propria/prestito come scelto dall’utente. 345 test gioco, 13 accessi, arco completo SQLite/browser e PostgreSQL con richieste simultanee; vedi rapporto B02. Pubblicazione ancora da verificare.

- B02 completato e pubblicato il 30 ottobre 2026: sorgenti 6ee26c9. Intero arco verificato con API reali in SQLite e PostgreSQL dedicati, incluso saldo zero/garage vuoto e richieste simultanee; frontend distribuito a 320/390/1280 su API di collaudo. 345 test gioco, 13 account, lint/build superati. Backup e confronto delle 32 tabelle: tutte le righe esistenti identiche. Prossimo blocco B03 dopo il playtest; non ancora iniziato.
