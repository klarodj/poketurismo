# Le persone del paese e la ripartenza al club

Dieci personaggi immaginari, nel Nord Italia del 2002. Il ritratto «Chiedi a…» è integrato nella barra del titolo della finestra, oppure nella testata del forum degli usati. Nessun messaggio automatico, indicatore insistente o barra aggiunta. Durante la gara il ritratto scompare per lasciare spazio alla guida.

| Zona | Persona | Ruolo |
| --- | --- | --- |
| Garage / Casa | Andrea Bassi, 28 | Vicino di box, appassionato di utilitarie preparate |
| Concessionario | Paolo Riva, 44 | Venditore concreto, camicia e cravatta allentata |
| Autodromo | Elena Ferri, 38 | Segreteria del club, calendario e cronometro |
| Meccanico | Franco Colombo, 56 | Meccanico del paese, tuta vissuta e consigli pratici |
| Negozio tuning | Lara Sartori, 30 | Ex apprendista di Franco, ora al banco ricambi |
| Mercatino usato | Roberto «Roby_16v» Galli, 36 | Appassionato e moderatore del forum |
| Benzinaio | Marina Valli, 45 | Gestisce la pompa di famiglia |
| Raduno | Matteo «Teo» Moretti, 25 | Organizza il venerdì sera con quelli del forum |
| Scuola guida | Sara Pellegrini, 34 | Istruttrice ed ex pilota di slalom provinciale |
| Corse clandestine | Dario «Dade» Bernasconi, 30 | Barista, passa al ritrovo dopo il turno |

Un clic apre una finestra Windows con ritratto, presentazione e circa un minuto di lettura. «Spiegami meglio» approfondisce le operazioni effettive della zona; eventuali indicazioni sono link alle sezioni già esistenti. Chiusura con X, Esc, sfondo o «Ho capito», focus restituito al pulsante. Nessuna scrittura di salvataggi o preferenze all’apertura e nessun tutorial obbligatorio.

Catalogo e dialoghi: `shared/locationGuides.mjs`. Componente: `src/components/LocationGuide.jsx`. I personaggi non sono nuovi giocatori né avatar selezionabili e non entrano in statistiche, incontri o contratti.

Dieci ritratti dedicati in `public/images/guides`, PNG 64×64 a palette limitata, ingranditi con nearest-neighbor. Generati uno per richiesta con **image_gen integrato**. Prompt completi, originali e percorsi del gioco in [CICERONI_PROMPTS.json](CICERONI_PROMPTS.json); tavola di controllo in `.preview/guides-qa/portraits.png`. Nessun asset precedente sostituito.

## Non rimanere bloccati senza denaro

La gara singola in autodromo era già senza quota, ma apriva di default il Circuito Scuola senza premi. Ora la scelta iniziale è una gara reale del club, con circuito disponibile e premi espliciti; il laboratorio resta selezionabile e chiaramente senza premi.

Per le nuove gare singole standard:

- ingresso gratuito, nessuna puntata o saldo minimo;
- vittoria: **500 € complessivi e 100 XP**;
- altro arrivo completo al traguardo: **100 € e 20 XP**;
- ritiri, guasti, carburante esaurito e sessioni incomplete: nessun premio d’arrivo;
- eventuali XP di sviluppo del pilota si aggiungono come prima;
- carburante e usura restano reali; il 50% del premio ripaga eventuali anticipi dell’officina.

Il premio è assegnato solo dal server nella transazione finale, con versione e identificativo operazione per impedire duplicazioni. La regola è fissata alla partenza con `clubRewardVersion:1`, esclusa per demo, prove a tempo, lezioni e sfide del raduno. Gare già salvate, campionati e clandestine conservano i loro contratti. Nessun accredito manuale agli utenti, nessun nuovo prestito in denaro e nessuna modifica ai prezzi o al budget iniziale.

Un promemoria compare sotto 500 € in garage/auto e tuning; in autodromo solo sotto la quota minima del catalogo campionati (attualmente 300 €), con collegamenti alla gara gratuita e al soccorso. Il soccorso esistente permette di ripartire anche a saldo zero quando non c’è nessuna vettura pronta, finanziando solo auto/intervento/carburante, mai contanti. In questo modo si può tornare a guadagnare senza rischiare una puntata né pagare l’iscrizione a un campionato.

## Collaudo

273 test di gioco e 12 account/gateway superati, inclusi saldo 42 €/zero, partenza senza addebito, premio con sconfitta, vittoria a 500 € totali, vecchi contratti invariati, retry senza doppio premio o usura, rimborso del meccanico, ritiro senza premio, rifiuto partenza senza carburante, demo e prove a tempo escluse anche con campi falsificati dal browser.

Browser headless con copia PostgreSQL e pilota sintetico: 30 verifiche delle dieci zone a 320, 390 e 1280 pixel, più una gara completa tramite interfaccia. Ritratti caricati a 64×64, font VT323 disponibile, nessun popup automatico, approfondimento a richiesta, focus/Esc, collegamenti, assenza di scritture all’apertura e di scorrimento orizzontale. Nessun luogo clandestino preselezionato. Durante la gara il cicerone non ingombra il cruscotto.

Prova reale sulla copia: pilota livello 1, Seicento Sporting, saldo 42 €, dieci settori conclusi con sconfitta e senza guasti; premio 100 €, saldo finale 142 €. Nessuna quota alla partenza. Report e catture in `.preview/guides-qa`. Nessun account reale modificato durante il collaudo.

Verificata anche la build finale servita come anteprima: il circuito avviato coincide con quello mostrato nella selezione iniziale (ID esplicitamente inviato, senza dipendere dall’ordine dei circuiti nel server). Seconda gara completata da interfaccia, venti settori: sconfitta, 100 € di premio, saldo 42 → 142 €. Ritratti e finestra nella build finale corretti; rapporto `.preview/guides-qa/report-built.json`.

## Rilascio

Pubblicato il 24 ottobre 2026 sull’unica istanza 5174, tramite il gateway 5184 e gli stessi indirizzi Funnel 443/8443. Backup completo Auth + gioco prima e dopo; build precedente e confronto privato in `/home/klaro/.backups/poketurismo/guides-club-2026-10-24T10-28-01-816Z`. Tutte le 32 tabelle del gioco identiche durante il rilascio: nessuna migrazione, nessun saldo o gara in corso ritoccato.

Servizi attivi, salute HTTP 200, pagina autodromo HTTP 200, API personali anonime HTTP 401. Verificati gateway locale ed entrambi gli indirizzi pubblici: bundle corretto e dieci ritratti identici ai file collaudati su ciascun endpoint. Backup finale completato con successo. Anteprime e database temporaneo di collaudo rimossi; report e catture conservati in `.preview/guides-qa`.
