# Autodromo e campionati

Ingresso dalla mappa: `/autodrome`, con Gara singola, Campionati, Prove a tempo e Scuola guida. La gara in corso e il campionato attivo sono raggiungibili anche dall'ingresso. `/racing` resta il centro dei campionati e degli allenamenti a pagamento.

Pubblicato nell'istanza condivisa il 22 ottobre 2026. Verificati dopo l'applicazione: sei nuovi eventi, 23 round su dieci circuiti e rimozione di 87 soli settori duplicati. Conservati utenti, garage, progressi, iscrizioni, gare e calendari storici. Backup completo prima e dopo l'aggiornamento; Autodromo e API disponibili, tempi personali protetti dal login.

## Sei calendari nuovi

| Campionato | Requisiti | Round | Quota | Premio primo posto | XP titolo |
|---|---|---:|---:|---:|---:|
| Coppa Primi Giri | Liv. 1, 40–85 CV | 3 | €300 | €1800 | 350 |
| Trofeo Aspirato · Club | Liv. 2, 80–180 CV, IP 38, motore NA | 4 | €800 | €4500 | 550 |
| GT 280 · Serie Internazionale | Liv. 3, 150–280 CV, IP 44 | 4 | €1800 | €9000 | 750 |
| Coppa Italiane · Passione | Liv. 3, 80–250 CV, IP 40, marchio italiano | 3 | €1200 | €6500 | 650 |
| Trofeo Trazione Posteriore | Liv. 4, 100–350 CV, IP 45, FR/MR/RR | 4 | €2200 | €11000 | 900 |
| Supercar · Masters | Liv. 6, almeno 350 CV, IP 50 | 5 | €5000 | €24000 | 1300 |

23 appuntamenti sui dieci circuiti del catalogo moderno. Ogni evento comprende il giocatore e sette rivali, con auto realmente presenti nel catalogo e compatibili con i requisiti della competizione. Nessun ripiego silenzioso per i nuovi eventi se manca una vettura. La prima coppa usa principalmente auto da 55 CV per permettere anche alle Fiat iniziali di competere per il podio; i livelli successivi richiedono preparazione e vetture adatte.

A ogni settore il cronometraggio mostra posizione su otto partecipanti, pilota immediatamente davanti e dietro con distacchi, e classifica completa al medesimo rilevamento. La cronologia conserva i nuovi rilevamenti. Il confronto tattico con un rivale in evidenza è separato dalla classifica: quel rivale non è necessariamente vicino al giocatore. Vedi `docs/CLASSIFICA_IN_GARA.md`. Il server simula i tempi degli altri partecipanti usando lo stesso motore fisico, con scelte regolari, incidenti condivisi e semi deterministici. Non si tratta di una simulazione contemporanea del traffico di otto auto: la classifica combina il duello effettivo e le altre prestazioni simulate. Il ritiro del rivale in evidenza non conclude prematuramente il round del giocatore.

Punti: 10–8–6–5–4–3–2–1; ritiri zero. Tempi entro 10 ms dall'ancora del gruppo condividono posizione e punti. La generale ordina per punti, vittorie, poi tempo cumulato (penalità per i ritiri). Premi finali in denaro: 100%, 60%, 35% ai primi tre; 15% agli altri. XP finali: 100%, 75%, 50%, poi 25%. Nessun premio monetario intermedio; rimane la modesta esperienza di partecipazione per i round realmente completati. Abbandonare tutti i round non assegna premi o XP finali.

Calendario e avversari vengono congelati all'iscrizione in `ChampionshipEntry.contract`: regolamento, premi, nome del pilota, auto e abilità dei sette rivali, round e settori dei circuiti. Cambiare il catalogo successivamente non cambia la stagione iniziata. Rimangono possibili riparazioni e modifiche tra i round; auto e pilota devono rispettare il regolamento prima di ogni partenza. Classifiche finali accessibili nella sezione Campionati conclusi (ultimi 20).

## Indice prestazioni unico

`shared/vehiclePerformance.mjs` è l'autorità per garage, campionati e ritrovi. L'indice unisce potenza effettiva per massa, velocità raggiungibile e quattro valori attuali di tenuta/frenata, usando il modello fisico e lo stato reale della vettura. Tiene conto di modifiche, carburante, salute del motore e gomme. Non è una percentuale, può superare 100 e non garantisce l'esito su un particolare circuito. Il vecchio confronto a media di otto statistiche resta solo per riprendere campionati storici già iscritti.

## Prove a tempo

Un giro senza quota o premi, con consumo e usura reali, nessuna azione di duello. Viene salvato soltanto un tempo completato valido; ritiri e tentativi incompleti non sostituiscono il record. Il miglior tempo personale per circuito include vettura, CV e IP iniziale. È un record assoluto personale: auto e preparazioni differenti non sono normalizzate né considerate equivalenti. La condivisione tra iscritti è ora disponibile nel Car Meet, soltanto per chi sceglie di esporre un’auto: vedi docs/CAR_MEET.md. I record derivano dalle sessioni già salvate, non da tempi inviati dal browser.

## Aggiornamento dei dati e compatibilità

Migrazioni additive SQLite 0007 e PostgreSQL 0004: colonna `ChampionshipEntry.contract`, default `{}`. Nessun azzeramento delle iscrizioni precedenti. I campionati storici mantengono calendari, regole e premi per chi è già iscritto; con il nuovo catalogo attivo non accettano nuove iscrizioni.

`scripts/seed-championships.cjs` mostra il piano; `--apply` crea i sei nuovi eventi in una transazione serializzabile. Non cancella i vecchi campionati. Rimuove solo duplicati esatti di TrackBuild (stesso circuito, ordine, settore e livello), conservando la prima riga. Se un circuito è usato da un campionato attivo, rinvia la pulizia. Le gare in corso conservano comunque i propri settori nello stato salvato. Ripetere lo script non duplica eventi o settori.

## Collaudo

126 test JavaScript, test account/gateway, lint e build. Test su copia PostgreSQL: seed ripetibile, sei eventi completati integralmente, 23 round su dieci circuiti, 42 assegnazioni di auto conformi, classifiche a otto, retry senza doppie iscrizioni o premi, record personali e protezione dei calendari storici attivi. Script protetto: `ACCOUNTS_VALIDATION_ENV_FILE=<file privato> node scripts/validate-championships.cjs`, soltanto database locali `_validation`.

Simulazioni della prima coppa: sei auto da ingresso, 16 semi e tre round (288 round di campionato, 2304 prestazioni simulate), pilota base a 11 e auto al 90% motore / 82% gomme. Le Fiat da 55 CV hanno ottenuto il podio in 10/16 e 11/16 stagioni; le auto iniziali più costose hanno un vantaggio coerente. Nessuna garanzia di vittoria per una singola partita. Script di sola lettura `scripts/championship-balance.mjs`.

Nessun browser collegato disponibile per un controllo visivo interattivo; build e rendering dei componenti di gara coperti dai controlli automatici.

Aggiornamento 24 ottobre 2026: le nuove gare singole standard del club restano senza quota e premiano anche gli arrivi senza vittoria (100 €; vittoria 500 € totali). Le gare già in corso e tutti i campionati mantengono le regole precedenti. Dettagli in [CICERONI_E_RIPARTENZA.md](CICERONI_E_RIPARTENZA.md).
