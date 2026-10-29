# Punti abilità del pilota · 29 ottobre 2026

Su richiesta dell’utente, il +3 automatico a tutte le abilità è sostituito da **6 punti distribuibili per ogni livello guadagnato dopo il primo**: un quarto dei precedenti 24 punti totali. Il livello iniziale e il profilo scelto restano invariati. I punti possono essere conservati; le assegnazioni confermate sono definitive.

Ogni abilità può ricevere al massimo **2 × (livello − 1)** punti provenienti dai livelli: non oltre un terzo del budget totale. Per distribuire l’intero budget maturato occorrono almeno tre abilità. Il limite è cumulativo, così accumulare punti o inviare conferme separate non permette di aggirarlo. Esempio: livello2, sei punti totali e massimo due per abilità; livello3, dodici totali e massimo quattro per abilità. Esempi validi: 2/2/2 o 2/1/1/1/1. Sono sempre valide distribuzioni parziali. Tetto assoluto100, anche sommando profilo iniziale e allenamenti. Questi ultimi continuano a migliorare le abilità senza consumare il budget da livello.

Fonte comune shared/pilotPoints.mjs; spesa server POST /api/driver/points, con solo allocations e chiave operazione esistente. Budget e massimali ricalcolati dal server; vietati negativi, decimali, nomi arbitrari, superamento100 e spesa durante una gara. Operazioni serializzabili/idempotenti, snapshot aggiornato dopo conferma e retry. Il browser prepara una bozza con +/−, mostra prima/dopo e punti restanti, e scrive soltanto con Conferma distribuzione. Nessuna assegnazione automatica aprendo il profilo.

Persistenza: DriverDevelopment.trainingCourses.levelAllocationV1.spent conserva i soli punti assegnati per abilità. Disponibilità = 6×(livello−1) meno la somma spesa. Nessuna nuova tabella o migrazione schema. XP e livelli continuano con le soglie precedenti, senza incrementi automatici delle statistiche. Snapshot e gare già avviate restano congelati.

## Passaggio dai vecchi bonus

scripts/migrate-pilot-points.cjs, prima in simulazione poi --apply a servizi fermi dopo backup completo Auth/gioco. Rimuove soltanto il vecchio bonus di 3×(livello−1) per abilità e rende disponibile il budget nuovo. Nel database attuale un solo giocatore al livello2: recuperati sei punti; le statistiche tornano al profilo iniziale più gli allenamenti, inclusa Accelerata15 e la pratica già accumulata. XP1650/livello2 invariati. Nessuna spesa di punti effettuata automaticamente.

Preflight rifiuta bonus non ricostruibili (abilità al tetto100 o sottrazione sotto10), senza scrivere parzialmente. In questa installazione tutti gli utenti hanno superato il controllo. Ricevuta globale GameOperation pilot-allocation-migration-v2 sul conto tecnico -1 impedisce di ripetere il recupero anche se in seguito si registrano altri utenti. Secondo avvio applicativo verificato: report vuoto. Il vecchio repair-pilot-levels.cjs è ritirato e non assegna più bonus. Non eseguire riparazioni manuali +3 o il vecchio script storico da un checkout precedente.

## Verifiche

287 test gioco e 12 account/gateway passati, lint/build. Casi per più soglie XP, nessuna crescita automatica, punti oltre budget, negativi/frazionari, limite cumulativo, tetto100, assegnazione parziale, retry senza duplicazione, pratica conservata e blocco durante gara. Browser a 320/390/1280px: sei punti, +/−, stop a due su una singola abilità, bozza su tre abilità, conferma e disponibilità residua zero, nessun overflow o errore JavaScript. Le spese browser sono simulate con API sostituite localmente: nessuna assegnazione sul salvataggio pubblico. Report/schermate .preview/pilot-points-qa. Unica istanza 5174 e gateway5184 riavviati, backup verificato prima del recupero. Nessun reset gare/record, auto, saldi o account.
