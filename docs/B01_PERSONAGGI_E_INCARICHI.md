# B01 — Nuovi volti e fondamenta degli incarichi

30 ottobre 2026. Ambito: primo blocco della [roadmap carriera e immersione](ROADMAP_CARRIERA_E_IMMERSIONE.md). Non è ancora l'arco completo di sei episodi B02 e non aggiunge gare contro i nuovi rivali.

## Cast nuovo

L'utente ha richiesto nuove identità, caratterizzazione coerente, avatar dedicati e vetture riconoscibili. Tre rivali principali e una conoscenza futura, tutti immaginari:

| Personaggio | Identità | Vettura costante | Ruolo nella storia |
|---|---|---|---|
| Emanuele «Lele_900» Riva, 23 anni | Apprendista elettricista della Bassa bergamasca; giacca da lavoro e quaderno dei ricambi | Fiat Cinquecento Sporting gialla | Entusiasta delle piccole: imparare e preparare senza cambiare sempre auto |
| Giada «G_Bellini» Bellini, 28 anni | Disegnatrice tecnica bresciana; cartellina dei tempi e sottotuta bordeaux | Honda Integra bianca | Precisione, costanza e attività in circuito; non partecipa alle clandestine |
| Sergio «Sergio75» Brambilla, 47 anni | Manutentore di fabbrica brianzolo; esperienza nell'assistenza agli slalom degli amici | Alfa Romeo 75 Quadrifoglio argento | Colloqui pratici, aiuto reciproco e cura del budget |
| Tommaso «Tom_GT» Villa, 31 anni | Lavora nel mobilificio di famiglia nel Comasco; appassionato, inizialmente un po' distante | Ferrari F355 rossa | Conoscenza delle fasi successive, senza imporre una sfida da supercar ai principianti |

`shared/storyCatalog.mjs` conserva descrizione, motivazione, tono di voce, frase caratteristica e tre capitoli futuri per ciascuno. I capitoli sono materiale editoriale: non concedono bonus e non generano avversari adattivi. I dati pubblici non includono i futuri capitoli. Modello e colore costituiscono l'identità visiva; qualunque evoluzione della preparazione deve essere esplicita, rispettare tuning/conversioni e conservare i vecchi contratti. Non aumentare di nascosto le abilità perché cresce il giocatore.

Le quattro auto riusano gli sprite approvati e sono state controllate contro il catalogo reale. Nessuna nuova auto o copia nel mercato/garage. I nomi non sostituiscono i 40 rivali clandestini o i dieci ciceroni.

## Censimento e riuso

- Dieci ciceroni in `shared/locationGuides.mjs`: Andrea/casa, Sara/scuola, Elena/autodromo, Dade/clandestine, Franco/officina, Lara/ricambi, Paolo/concessionario, Roby/usati, Teo/raduno, Marina/distributore. Restano tutorial facoltativi; Sara, Franco e Teo possono comparire come supporto nei capitoli futuri.
- Cinque ritrovi e 40 avversari fissi in `shared/streetCatalog.mjs`. Omonimie fra ruoli precedenti non vengono fuse; gli ID nuovi hanno prefissi e cognomi distinti.
- Reputazione, precedenti e offerte in `PlayerProgress.streetState`: intatti. La reputazione estesa appartiene a B03.
- SMS fra giocatori in `MeetMessage`, con amicizie, blocchi, rate limit e letture esistenti: intatti. Nessun utente NPC creato, numero reale, messaggio esterno o invio a giocatori reali.
- Avvisi del gioco restano nella propria voce del telefono. Gli SMS dei personaggi entrano come «SMS del club» e gli obiettivi nella voce «Incarichi» dello stesso telefono.

## Piccolo incarico pubblicabile

«Un giro per conoscerci», ID `club-first-finish`, versione 1, è un prologo tecnico e giocabile di B01. È distinto dai sei episodi B02: prepara il contatto con Lele senza dichiarare già avvenute rivalità o vittorie.

1. Un invito consultabile nel telefono, leggibile senza modificare saldi o stato della missione.
2. Risposta esplicita «ci sto», possibile fuori gara. Lele diventa contatto narrativo conosciuto, senza creare un'amicizia sociale fittizia.
3. Completare una **nuova gara singola del club**, iniziata dopo l'accettazione. È sufficiente arrivare in fondo, anche perdendo. La gara è quella esistente, con condizioni, premi e costi d'uso esistenti.
4. Premio narrativo aggiuntivo **100 € una sola volta, 0 XP extra**, contato nel premio finale complessivo. Il rimborso a Franco si applica all'importo totale, nella stessa transazione.
5. SMS finale di Lele e incarico concluso. Nessuna ripetizione del bonus nelle gare seguenti.

L'incarico non scade. Si può mettere in pausa e riprendere fuori gara. Dopo un ritiro o guasto resta riprendibile con una nuova gara. Prove a tempo, scuola, laboratori, gare clandestine, campionati, sfide virtuali e sessioni pregresse non contano. L'accesso agli incarichi non impone di possedere già un'auto; per svolgere questo incarico occorre una vettura pronta, con le vie di recupero economico già presenti. B02 introdurrà le prove narrative con auto in prestito.

Il premio unico è deliberatamente piccolo: è un quinto del premio attuale di vittoria nel club, senza esperienza aggiuntiva o miglioramenti delle abilità. Le griglie appena bilanciate non cambiano.

## Persistenza e garanzie

- Nuovo campo `PlayerProgress.narrativeState`, TEXT JSON con default `{}`, tramite migrazioni additive PostgreSQL `0011_narrative_foundations` e SQLite `0014_narrative_foundations`.
- Namespace versione 1: missioni, contatti conosciuti, SMS narrativi e letture. Non riusare `streetState`, pratica o inventario per la storia.
- Stati: disponibile (proiezione senza scritture), accettato, in corso, in pausa, concluso. Accettazione/ripresa produce un identificativo tentativo; ogni nuova gara valida congela versione e tentativo e viene associata dal server all'incarico.
- Solo il completamento autorevole della gara può concludere l'obiettivo. La verifica richiede gara, tentativo, versione, modalità, arrivo e assenza di guasto/ritiro coerenti. Nessun endpoint accetta eventi narrativi o premi dichiarati dal browser.
- Risultato, chiusura dell'incarico, SMS finale, premio ed eventuale rimborso condividono la transazione serializzabile del turno finale. Retry e concorrenza non duplicano la ricompensa.
- API GET `/api/story/:userId`; azioni idempotenti `/api/story/respond` e `/api/story/read`, protette dalla stessa identità verificata delle altre funzioni. Le letture sono consentite durante la gara; accettazione/pausa/ripresa richiedono assenza di gara attiva.
- Ricevute delle azioni narrative conservano solo un riferimento: un retry restituisce lo stato corrente dell'incarico, non riporta la UI a uno stato precedente.
- Le gare iniziate prima del rilascio non hanno obiettivo congelato e restano invariate. Non si ricostruiscono retroattivamente avanzamenti o premi.

## Telefono e immagini

Incarichi → SMS del club oppure Gente del club. La scheda del personaggio mostra ritratto, auto nel colore fisso, identità e descrizione; motivazione approfondibile. I personaggi ancora sconosciuti sono indicati come «Da incontrare»: consultare la scheda non simula un incontro o sblocca una sfida.

Il contatore del cellulare somma gli SMS sociali e narrativi senza confonderne le conversazioni. Il riepilogo delle notifiche non contiene i testi; l'elenco non marca gli SMS come letti. Solo l'apertura visibile di un singolo messaggio invia la lettura. Il suono segue l'impostazione esistente; una notifica non apre automaticamente la finestra. Alla disconnessione o al cambio account lo stato del telefono viene azzerato e le risposte precedenti ignorate.

Quattro ritratti originali prodotti con **image_gen integrato**, singolarmente, poi ridotti a 64×64 con nearest-neighbour. Asset finali: `public/images/story/{lele,giada,sergio,tommaso}.png`. Input nativi conservati in `tools/story-art/inputs`; prompt completi, provenienza e revisioni in `tools/story-art/records.json`; hash e dimensioni in `manifest.json`. Ricostruzione: `node tools/story-art/build.cjs`. Nessuna immagine approvata preesistente sovrascritta. Gli avatar narrativi non entrano nel selettore dell'avatar del giocatore.

## Preparazione dei sei episodi B02

| Episodio | Cast e contenuto previsto | Esito che deve permettere di proseguire |
|---|---|---|
| Il primo numero | Teo presenta Lele al raduno; Giada passa a salutare | Accettare il contatto narrativo, senza amicizie obbligatorie con altri utenti |
| Prima la precisione | Sara e Giada: costanza con una vettura in prestito | Completare la prova oppure ripeterla con spiegazioni utili |
| Giro di collaudo | Franco e Sergio: collaudo, condizioni e guida misurata | Restituire una prova valida, non battere un tempo impossibile |
| Una mano in officina | Lele e Sergio: aiutare nella preparazione | Una soluzione senza spesa obbligatoria e una con ricambio adeguato |
| La rivincita | Lele e Dade: primo confronto ricorrente, Cinquecento gialla | Vittoria o sconfitta completata con risposta differente e possibilità di rivincita |
| La domenica del club | Elena, Giada e Sergio; Tommaso come incontro facoltativo nel paddock | Concludere una prova accessibile, senza obbligo di podio o di supercar |

Prima di implementare B02 fissare griglie, prove e budget complessivo dei premi; non usare questo documento per considerare implementati prestiti, dialoghi ramificati, reputazione estesa o sfide con i nuovi personaggi.

## Collaudo e pubblicazione

Verificati 338 test di gioco, 13 test account/gateway, 5 test migrazioni SQLite, lint e build. Su PostgreSQL isolato: undici migrazioni applicate, quattro modelli/immagini validati sul catalogo, accettazioni simultanee con la stessa chiave e con chiavi diverse, turno finale simultaneo e singolo premio anche perdendo. Browser reale a 320/390/1280 px: quattro ritratti e quattro auto corretti, letture esplicite, pausa/ripresa, ricaricamento e completamento da mobile. Verificata anche una risposta GET ritardata: non riporta un incarico accettato allo stato disponibile. I test usano database temporanei e un PostgreSQL locale dedicato con soli cataloghi copiati, senza account reali. Non completare l'incarico sui salvataggi pubblici per collaudarlo.


Pubblicato il 30 ottobre 2026 sull’unica istanza 5174 tramite gateway 5184. Commit sorgenti `b8fe6fe`. Backup prima della migrazione: `/home/klaro/.backups/poketurismo/b01-20261030T133610Z`, oltre al backup completo Auth+gioco del servizio dedicato. Confronto di tutte le 32 tabelle prima/dopo: tutte le righe precedenti identiche escludendo la nuova colonna `narrativeState` con valore `{}` e la sola nuova ricevuta di migrazione. Nessun account, vettura, SMS sociale, gara o record ricreato o cancellato.

Servizi attivi, health positivo e API narrativa senza sessione HTTP 401. Ventidue controlli su entrambi gli indirizzi Funnel verificano health, quattro ritratti, logo/favicon e bundle pubblicati; il frontend effettivamente distribuito è stato provato a 390/1280 px usando esclusivamente le API del database di collaudo. Rapporti e catture locali in `.preview/b01-qa`, senza partite o messaggi di prova nei salvataggi pubblici.

Percorso di playtest: **Cellulare → Incarichi → SMS del club** per leggere l’invito; **Gente del club** per i quattro personaggi e le vetture. Accetta, completa una nuova gara singola del club e riapri il telefono per il messaggio finale. Pausa/ripresa disponibili fuori gara. B02 resta da iniziare.
