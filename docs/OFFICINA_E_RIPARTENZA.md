# Officina e ripartenza

L'officina mostra preventivi server per ciascuna vettura posseduta, senza cambiare quella equipaggiata. Ogni preventivo indica costo, motore/gomme prima e dopo e IP risultante. Un'auto perfetta non può acquistare interventi inutili. Durante una gara si possono leggere i preventivi, ma non eseguire interventi o rimborsi.

## Interventi

- Tagliando: olio, filtri, recupero massimo 10 punti motore e serviceKm aggiornato. Non disponibile sotto il 30% motore.
- Cambio gomme: aderenza al 100%.
- Revisione: motore al 100%, incluso motore fuso; costo proporzionale al danno.
- Ripristino completo: comprende solo motore e gomme necessari, con sconto del 5% se servono entrambi.

shared/maintenance.mjs definisce i prezzi. Coefficienti per fascia starter/compact/sport/gt/performance/super: 1 / 1,25 / 1,6 / 2 / 3 / 4. Basi: tagliando €150; gomme €80 + €4 per punto mancante; revisione €120 + €14 per punto mancante + €250 se fuso. Il preventivo viene arrotondato ai €5 superiori e non scende sotto l'aumento della valutazione di rivendita più €25 × coefficiente: acquistare, riparare e rivendere subito non genera denaro.

Ogni conferma usa l'impronta della vettura e dell'intervento. Se usura, chilometri, modifiche o condizioni cambiano, il server richiede un nuovo preventivo. Prezzi e benefici non sono accettati dal browser. Restano validi controllo proprietà, transazioni serializzabili e identificativi operazione per retry sicuri.

## Soccorso essenziale

Il piano è disponibile solo se non esiste una vettura posseduta con almeno 50% motore, 50% gomme e 5 litri. Se un'altra auto è pronta, occorre equipaggiarla.

Con auto ferme, il server sceglie il ripristino essenziale meno costoso: almeno 60% motore, 60% gomme e 8 litri, tagliando aggiornato; mantiene condizioni migliori già presenti, parti e statistiche. Senza auto, può fornire il modello starter meno costoso del catalogo, di serie, con motore 85%, gomme 80% e 8 litri. Se il giocatore può già comprare un'auto al mercato o una starter nuova, questa assistenza non è disponibile.

Se il saldo copre il piano, si paga per intero. Altrimenti si contribuisce con il saldo sopra €300 e il meccanico anticipa il resto. Nessun accredito libero, XP o interesse. Il debito può crescere solo per un nuovo soccorso necessario; non si impone un limite che creerebbe un altro blocco della partita.

Il 50% dei successivi premi in denaro rimborsa automaticamente l'anticipo. Nelle scommesse è esclusa la restituzione della propria puntata: conta solo la vincita effettiva. Premi senza denaro non rimborsano. Arrotondamento al centesimo inferiore e massimo pari al debito residuo. Il riepilogo gara mostra rimborso, residuo e accredito netto. È possibile un rimborso manuale parziale o totale con il proprio saldo.

Tutte le vetture finanziate restano invendibili fino all'estinzione del debito complessivo. Il blocco è verificato dal server anche per richieste dirette. Ripartenza, addebito, auto equipaggiata e debito sono atomici; rimborso automatico e premio sono nella stessa transazione della chiusura gara.

## Persistenza e collaudo

PlayerProgress.recoveryState JSON testuale, default {}: debtCents e carIds. Migrazione SQLite 0009, PostgreSQL 0006, solo additiva. Nessuna modifica iniziale ad auto, saldi o sessioni.

146 test JavaScript e 9 test account/gateway passati, lint e build superati. Casi coperti: prezzi autoritativi, preventivi scaduti, interventi inutili, varie fasce/usure senza arbitraggio, soccorso e ripartenza senza auto, richieste simultanee e retry, auto alternativa già pronta, blocco vendita, rimborsi automatici/manuali, puntate restituite e gara attiva.

scripts/validate-workshop.cjs richiede un file privato ACCOUNTS_VALIDATION_ENV_FILE con database locale *_validation. Eseguito su copia PostgreSQL: migrazione, preventivi, intervento, soccorso concorrente, idempotenza, debito e vendita, rimborso con puntate escluse e starter finanziata. Verificati tutti i dati precedenti invariati. Nessuna azione di prova nel database pubblico. Componenti verificati tramite rendering automatico; nessun browser collegato disponibile per collaudo visivo interattivo.
