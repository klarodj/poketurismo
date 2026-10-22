# Corse clandestine: ritrovi e rivali

Cinque ritrovi con otto piloti ricorrenti ciascuno. Auto, abilità, stile e stato delle vetture sono fissi: nessun adeguamento alle modifiche del giocatore. Catalogo in `shared/streetCatalog.mjs`, regole e persistenza in `server/streetRacing.js`, schermata in `StreetMeetups.jsx`.

Pubblicato nell'istanza condivisa il 22 ottobre 2026. Verifica successiva: cinque ritrovi con quaranta rivali risolti, tre percorsi aggiunti e dati precedenti di utenti, garage, progressi, gare e tracciati invariati. Backup completo prima e dopo la pubblicazione; API pubblica disponibile e ritrovi protetti dall'accesso personale.

| Ritrovo | Livello | IP attuale minimo | Reputazione richiesta | Puntata massima di zona |
|---|---:|---:|---|---:|
| Parcheggio del centro commerciale | 1 | 0 | Nessuna | €100 |
| Zona industriale | 2 | 38 | 12 al parcheggio | €300 |
| Ritrovo del lungomare | 3 | 42 | 20 in zona industriale | €600 |
| Passo di montagna | 4 | 45 | 30 al lungomare + Rilascio progressivo | €1000 |
| Raduno della tangenziale | 6 | 48 | 40 al passo | €2000 |

L'indice condiviso con garage e campionati considera potenza/peso, velocità raggiungibile e tenuta attuale, includendo usura, modifiche e carburante. La formula è in shared/vehiclePerformance.mjs. Serve un'auto equipaggiata. Le vecchie zone rimangono accessibili con auto migliori. I requisiti sono verificati sia all'incontro sia alla partenza dal server.

## Incontri

Entrare genera un'offerta persistente con identificativo casuale, rivale, percorso e impronta dell'auto equipaggiata. La ricerca è gratuita e segue una lista mescolata salvata per ritrovo: tutti gli otto rivali prima delle ripetizioni, evitando anche lo stesso nome al confine tra due liste. Aggiornare la pagina conserva l'incontro. Una nuova ricerca invalida la vecchia proposta; cambiare auto o condizioni della vettura richiede un nuovo incontro.

Il giocatore vede foto, potenza, peso, IP, stato della vettura, abilità indicativa e stile del rivale, percorso, meteo, settori, precedenti, possibili premi e puntate. La valutazione favorito/equilibrato/impegnativo confronta tempi stimati sul percorso con auto e piloti reali, senza garantire l'esito. I quattro stili cambiano abilità e alcune scelte dell'IA: prudenza nelle curve, precisione, attacco periodico o ricerca dell'apice nei settori tecnici.

Tre percorsi originali aggiuntivi per i ritrovi: anello dei magazzini (2,4 km), viale delle officine (4,3 km, notte) e tangenziale svincolo nord–porto (11,5 km, notte). Gli altri ritrovi usano le interpretazioni di strade già presenti nel catalogo. `scripts/seed-street.cjs --apply` verifica le quaranta auto richieste e i percorsi, poi aggiunge soltanto i tre mancanti, in una transazione. Non modifica calendari, gare o tracciati esistenti.

## Puntate e ricompense

Sempre possibile correre senza puntata. Le altre tre opzioni derivano dal massimo accettato dal rivale, limitato dal ritrovo, dai precedenti, dal confronto e dal saldo. Nessuna puntata può superare il 15% del saldo o lasciare meno di €1000. Cifre intere in euro; il denaro del giocatore resta contabilizzato in centesimi.

Una puntata viene addebitata una sola volta alla partenza. Vincere accredita il doppio della cifra versata (guadagno netto pari alla puntata); pareggiare la restituisce; perdere, terminare carburante/motore o abbandonare la perde. Nessun premio monetario fisso nelle nuove clandestine. Una sfida senza puntata non assegna denaro. Consumi e usura rimangono reali in ogni caso.

Vittoria: base 100 XP e 10 reputazione; pareggio: 40 XP e 3 reputazione; sconfitta completata: 20 XP e 1 reputazione. Ripetizioni: fattori 100%, 60%, 30%, 10%, poi zero. Per una vittoria si contano le vittorie precedenti sul rivale, così le sconfitte non consumano i premi futuri. Per la partecipazione si contano tutti i tentativi. Avversario nettamente inferiore (tempo stimato oltre il 25% più lento): ricompense al 20% e limite puntata al 25%. Il massimo della puntata diminuisce anche con le vittorie: dopo quattro vittorie sullo stesso rivale rimangono solo confronti senza puntata e senza altri premi di vittoria. Non esiste reset cambiando vettura, ritrovo, percorso o ricaricando.

Abbandoni e guasti non assegnano XP o reputazione. Non si applica il vecchio premio generico di partecipazione quando un confronto è già assimilato. La pratica tecnica segue i limiti già esistenti della scuola guida. Reputazione, risultati e precedenti vengono salvati atomicamente con la gara e il pagamento.

## Persistenza e compatibilità

Migrazione additiva `PlayerProgress.streetState` (JSON in TEXT, default `{}`) per SQLite e PostgreSQL. Dentro: reputazione e risultati di ogni ritrovo, precedenti per rivale, ordine degli incontri e offerta corrente. Solo il server può modificarli.

Le vecchie gare già attive terminano col loro contratto originario. Le nuove clandestine standard richiedono un incontro: non è possibile inviare direttamente un tracciato o un avversario e ottenere premi. Le prove personalizzate restano allenamenti senza premi, reputazione o scommesse. Campionati e gare in autodromo mantengono le regole precedenti.

## Verifiche

- 115 test JavaScript superati, inclusi rotazione, offerte obsolete, requisiti, manomissione delle puntate, riserva economica, finali ripetuti e ricompense esaurite.
- Copia PostgreSQL: migrazione, seed ripetibile, 40 auto risolte dal catalogo, accesso ai cinque ritrovi, ripresa della sessione e due partenze simultanee con un solo addebito. Nessuna modifica ai dati precedenti della copia.
- 2304 simulazioni sul primo percorso (6 auto da ingresso × 8 rivali × 48 semi): anche le due Fiat da 55 CV hanno almeno due rivali affrontabili con un pilota base e auto al 90% motore / 82% gomme. I rivali più impegnativi restano tali. Script `scripts/street-balance.mjs`, sola lettura del catalogo.
- Lint e build superati. Controllo visivo interattivo non disponibile nell'ambiente: nessun browser collegato.

Collaudo PostgreSQL ripetibile: `ACCOUNTS_VALIDATION_ENV_FILE=<file privato> node scripts/validate-street.cjs`; rifiuta database esterni o non terminanti con `_validation`.
