# B02 — Un posto nel club: impostazione del lavoro

Stato: completato e pubblicato. Il prologo B01 e i suoi premi restano invariati.

## Sei episodi e condizioni

1. Il primo numero: incontro esplicito con Lele dal raduno, disponibile anche quando la sua presenza casuale non è attiva. Nessun obbligo di attendere una finestra o di aggiungere utenti reali. Sblocca il contatto della storia.
2. Prima la precisione: Sara e Giada, prova gratuita con auto scuola in prestito; valutazione di costanza e pulizia, tentativi ripetibili. Nessuna usura della vettura personale.
3. Giro di collaudo: Franco e Sergio, auto del cliente in prestito; consegne esplicite prima dei settori. Si supera con un collaudo completato rispettando i limiti indicati, senza obbligo di vittoria.
4. Una mano in officina: aiutare Lele svolgendo una prova di lavoro; alternativa con ricambio da inventario solo dopo conferma del pezzo consumato. Percorso senza spesa sempre disponibile.
5. La rivincita: Lele con la Cinquecento gialla, rivale fisso, nessuna puntata obbligatoria. Anche una sconfitta completata permette di proseguire; ritiro/guasto consentono un nuovo tentativo. Dialogo diverso in base all’esito.
6. La domenica del club: Elena, Giada e Sergio; concludere una prova accessibile in circuito, nessun obbligo di podio. Tommaso compare come conoscenza facoltativa, senza richiedere una supercar.

## Budget iniziale di progetto

Proposta da verificare prima della pubblicazione: nessuna quota narrativa, nessun XP aggiuntivo ai livelli, nessun punto abilità o tecnica regalato. Contatti e inviti costituiscono la ricompensa principale. Tetto di 500 euro complessivi una tantum sull’intero arco B02, distinto dai 100 euro già previsti dal prologo B01; assegnazione finale dopo la chiusura dell’arco e normale rimborso a Franco. Nessun denaro per ripetizioni, ritiri o dialoghi. Prove con prestito senza premi ordinari del club, per evitare doppio accredito.

## Compatibilità e verifica

Nuovi ID e contratti versionati; preservare prologo, gare attive e ricevute. Progressione narrativa privata nel namespace esistente. Solo azioni server validate completano le prove; dialoghi consultati e presenze casuali non completano incontri. Stato episodio, consumi del ricambio scelto e ricompensa atomici/idempotenti. Nessun recupero retroattivo senza una prova storica attendibile.

Verificare nuovo pilota senza auto, veterano con auto da gara, portafoglio vuoto, cambio account, ripresa dopo ritiro, scelte alternative e concorrenza sul turno finale. Conservare interfaccia di gara unificata e spiegazioni facoltative, con obiettivo corrente leggibile nel telefono e nel luogo pertinente.

## Decisione richiesta

Scelta confermata dal giocatore: auto propria con alternativa gratuita in prestito nelle due gare narrative. Contratti versione 1; le prove scuola/collaudo restano in prestito in entrambi i casi. Requisiti di potenza, preparazione e griglie saranno definiti sul formato scelto, senza adattamento automatico delle statistiche al pilota.


## Implementazione e collaudo

Sei episodi versionati in shared/clubStory.mjs, gestione autorevole in server/clubStory.js e namespace campaign dentro narrativeState esistente. Prologo B01 conservato e indipendente; nessuna migrazione o recupero retroattivo inventato. L’episodio corrente è accessibile dal telefono e da un riquadro nel luogo pertinente; presentazione a Lele sempre disponibile, indipendentemente dalle presenze casuali.

Le prove sono percorsi brevi illustrati dal roadbook dei quattro esercizi effettivi, senza inventare minimappe di circuiti reali. Prove di precisione, collaudo e aiuto usano solo vetture in prestito e almeno tre scelte corrette su quattro. Rivincita con Lele: Cinquecento gialla, pilota fisso a 11 per abilità, stradale propria fino a 120 CV o prestito. Finale con Giada e Integra bianca, pilota fisso a 13, propria vettura fino a 160 CV o prestito; conta completare anche perdendo. Le auto proprie richiedono motore/gomme almeno 50% e 8 L; hanno consumi/usura reali, si ritirano dal raduno se esposte. Le auto in prestito non toccano garage, esposizione o sviluppo del pilota.

Alternativa al lavoro gratuito: consegna esplicita di un ricambio canonico Brake livello 1 già posseduto, consumato una volta sola. Risposte di Lele diverse per aiuto con pezzo/prove e per vittoria/sconfitta. Incontri, SMS, pausa/ripresa e completamenti persistono per account. I personaggi nel piazzale commentano l’incarico attuale.

Il premio finale unico è 500 euro lordi, con normale trattenuta per Franco; 0 XP e nessun punto pratica/tecnica aggiuntivo. Le prove narrative non assegnano premi ordinari e non entrano nei tempi. Il turno finale chiude episodio, messaggio e accredito nella stessa transazione serializzabile; i retry restituiscono lo stato attuale.

345 test di gioco e 13 account/gateway superati, lint/build validi. Test specifici: intero arco senza auto e con saldo zero, nessuna crescita o usura in prestito, episodio fuori ordine/luogo errato, ritiri e prove fallite recuperabili, ricambio consegnato esattamente una volta, limiti e consumi dell’auto propria. Su PostgreSQL dedicato con soli cataloghi copiati: arco intero, accettazioni e turni finali simultanei, saldo finale 500 euro, abilità e XP invariati. Browser reale: sei episodi su 390 px con API reali di collaudo e controlli desktop 1280, senza auto o soldi iniziali. Rapporti e catture .preview/b02-qa.


## Pubblicazione

Pubblicato il 30 ottobre 2026 sull’unica istanza 5174 tramite gateway 5184, commit sorgenti 6ee26c9. Backup /home/klaro/.backups/poketurismo/b02-20261030T174027Z, oltre al backup completo Auth+gioco eseguito dal servizio dedicato. Confronto integrale delle 32 tabelle prima/dopo: tutte le righe esistenti identiche. Nessuna migrazione, seed o azione di prova sui salvataggi pubblici.

Health positivo e servizi attivi; POST attività senza sessione restituisce 401. Frontend effettivamente distribuito verificato a 320/390/1280 px con API reindirizzate esclusivamente al database di collaudo e zero scritture durante il controllo. Verificato anche che l’auto propria conservi chilometri preesistenti, condizioni, tinta e carburante effettivi prima di applicare consumi/usura. Giada mantiene l’Integra bianca.

Playtest: Raduno → riquadro «Il primo numero» → Accetta → Presentati a Lele. Gli episodi seguenti indicano il luogo nel telefono; il riquadro del luogo permette accettazione, prestito gratuito, eventuale auto propria e consegna volontaria del ricambio. Il prologo precedente «Un giro per conoscerci» rimane indipendente e conserva il proprio premio unico di 100 euro. B03 reputazione non attivato.
