# Concessionario, usati giornalieri e pompa · 29 ottobre 2026

## Cercare l'auto per un campionato

Nel concessionario restano loghi delle marche, ricerca per modello, colore incluso e filtro budget. Il pannello Filtri campionato e caratteristiche aggiunge campionato, prezzo massimo, potenza minima/massima, trazione, motore e IP minimo. I filtri si combinano; Azzera li rimuove tutti.

La selezione del campionato usa `championshipCarErrors`, la stessa funzione delle iscrizioni: CV, IP, trazione, aspirazione e marchi ammessi. Si valuta l'auto nuova di serie nelle condizioni effettive della consegna (20L, motore/gomme100). Per un campionato già attivo si usano i requisiti del contratto congelato. Compatibilità auto e requisiti del pilota restano distinti: il filtro non promette iscrizione senza livello, quota o abilità. Il nome canonico del campionato non viene modificato dal suffisso di presentazione In corso.

## Ricambio giornaliero degli usati

`server/dailyMarket.js` genera un lotto globale di32 auto (8 Primi passi,6 compatte,6 sportive,5GT,4 alte prestazioni,3 supercar) dal catalogo approvato. Giorno civile in Europe/Rome, con ora legale; dopo mezzanotte il primo accesso rinnova il lotto, e il processo controlla anche ogni minuto. Non è un reset a ogni apertura o riavvio: esiste una sola fornitura per giorno; le auto comprate non ricompaiono nello stesso giorno. Giorni senza accessi vengono saltati, senza accumulare forniture.

Selezione deterministica per giorno, preferenza per modelli assenti nel lotto precedente quando disponibili; colori, chilometri, benzina e condizioni variano. I piccoli cataloghi possono riproporre un modello con condizioni diverse. Nessuna modifica al nuovo o ai budget. Soglie di prezzo prestazionali esistenti conservate: auto forti non diventano economiche perché usurate. Almeno due posizioni iniziali preferiscono modelli nuovi entro12000€, quando presenti; nel catalogo attuale ci sono diverse offerte acquistabili coi10000€ iniziali, con margine per giocare.

La ricevuta privata `GameOperation(-1, used-market-daily-v1)` registra giorno e ID degli annunci automatici. Il rinnovo rimuove solo gli ID di quel lotto ancora posseduti dal mercato, senza pezzi montati e senza provenienza giocatore. Una vendita crea nella stessa transazione il marcatore `market-player-{garageId}`: una vettura comprata dal lotto e poi rivenduta non viene cancellata alla rotazione, conservando colore, condizioni, elaborazioni e preparazione da gara. Auto già acquistate, saldi e garage personali sono esclusi dal rinnovo.

Prima transizione: gli ID della vecchia fornitura sono letti dalla ricevuta originale. Le vendite storiche vengono riconosciute dall'impronta canonica delle operazioni Sell-car (garageId/params) e protette. Se una vecchia vendita non può essere ricostruita con certezza, il lotto storico resta; gli annunci di origine sconosciuta non vengono eliminati. Non si tenta di dedurre la provenienza da colore o modello.

GET mercato e acquisti usati controllano il giorno nella transazione serializzabile con retry; anche il timer usa la stessa funzione. Un acquisto in gara con il rinnovo può ottenere la vettura oppure ricevere Annuncio non più disponibile, senza perdere denaro. Retry degli acquisti già completati conservati. Il client aggiorna il mercato ogni minuto quando visibile e al ritorno sulla scheda, scartando risposte precedenti a un acquisto; distingue usati del giorno e auto ritirate dai giocatori senza pubblicare identità personali. La data visibile non riporta un anno contemporaneo nella cornice2002.

Nessuna migrazione di schema. `node scripts/refresh-used-market.cjs` mostra il piano senza scrivere; `--apply` applica il rinnovo idempotente. Non rilanciare il vecchio seed di apertura per il ricambio quotidiano.

## Pompa AGIP

Nuova pompa pixel art con pistole, tubi e display integrati: importo, litri e prezzo al litro. Selettori Normale/Premium, tagli5/10/20L, pieno e quantità personalizzata; indicatore del serbatoio, vettura equipaggiata e consumi in km/l. Su desktop pompa e comandi affiancati, su telefono in colonna. Prezzi esistenti1,50/2,50€/L e serbatoio45L invariati.

Il display distingue Preselezione da Erogato; dopo conferma mostra la ricevuta reale del server e richiede Nuovo rifornimento prima di un altro acquisto. `shared/refuelling.mjs` condivide arrotondamenti e limite serbatoio tra anteprima e server. Nessuna animazione che accrediti benzina prima della risposta. Gara attiva, fondi insufficienti, serbatoio pieno e quantità invalida bloccano la conferma; i controlli server rimangono autoritativi e idempotenti.

Immagine generata con `image_gen` integrato: `public/images/world/sections/fuel-pump.png`,480×640 con trasparenza. Prompt completo, sorgente e input nativo in `tools/pump-art/records.json` e `inputs`; hash nel manifest. Builder `node tools/pump-art/build.cjs`, sola normalizzazione nearest-neighbour con alpha. Banner originale del benzinaio conservato.

## Verifica

321 test gioco e12 account/gateway passati, lint e build. Test specifici per filtri/requisiti, soglie, giorno italiano e ora legale, rotazione deterministica, protezione vendite storiche e sconosciute, acquisti/rivendite con elaborazioni, prezzo e arrotondamenti benzina.

Su clone PostgreSQL:32 annunci nuovi, cinque richieste contemporanee convergono allo stesso lotto, auto comprata e annuncio personale con ricambi conservati, acquisto scaduto rifiutato, nessun cambio ai precedenti utenti/garage personali. Rifornimento parziale di0,02L correttamente addebitato e retry senza doppio pagamento.

Browser320/390/1280px: loghi e filtri del concessionario, ricerca e dettagli, annunci dei giocatori, display della pompa senza overflow, tre rifornimenti reali sul pilota sintetico con ricevuta, fondi insufficienti, gara attiva e garage vuoto. Nessun errore JavaScript o scorrimento orizzontale nelle viste verificate. Rapporti e immagini nella cartella privata ignorata `.preview/shops-qa`; nessun acquisto di prova su salvataggi pubblici.
