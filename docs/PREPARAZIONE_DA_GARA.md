# Preparazione da gara

Dal 29 ottobre 2026 l’utente ha approvato le 200 immagini e richiesto l’acquisto dal terzo reparto del meccanico. La regola attuale **solo pista** sostituisce la precedente ipotesi di utilizzo anche nelle clandestine.

## Acquisto

Meccanico → Preparazione da gara: confronto della propria auto con la livrea approvata, requisiti, prestazioni attuali e finali, prezzo e due conferme esplicite (trasformazione definitiva e solo pista). Tutte le 16 famiglie canoniche di `shared/raceEquipment.mjs` devono avere il livello 3 effettivamente montato. Possedere i pezzi in magazzino non basta. Il server verifica sempre proprietà, catalogo, componenti, impronta aggiornata, fondi e assenza di una gara attiva.

`POST /api/garage/:garageId/race-preparation` usa operazioni idempotenti e transazioni serializzabili. Non accetta prezzi, statistiche o flag dal client. Due richieste concorrenti con la stessa chiave producono un solo addebito; una seconda conversione con un’altra chiave è rifiutata. Il riepilogo dell’operazione resta nel registro esistente.

Il campo persistente `Garage.racePrepared` non viene mai riportato a false dalle API. L’allestimento rimane sull’esemplare quando viene venduto o riacquistato. Sulle auto convertite i componenti montati sono vincolati: montaggio, sostituzione e smontaggio sono bloccati; rimangono possibili manutenzione e rifornimento. Nessun addebito per una riverniciatura stradale che sarebbe nascosta dalla livrea da gara: carrozziere disabilitato e controllo server.

## Bilanciamento

Regole comuni in `shared/racePreparation.mjs`. Prezzo arrotondato ai 1.000 € superiori: massimo fra 35.000 € e `(25.000 + 60% del prezzo del nuovo) × coefficiente profilo`. Coefficienti club/monomarca/rally/turismo/GT: 1 / 1,05 / 1,10 / 1,20 / 1,35. Sono prezzi dell’economia del gioco, non quotazioni di autentiche vetture storiche. L’allestimento non restituisce integralmente la sua spesa alla rivendita; la formula prudente di permuta esistente impedisce arbitraggio.

Lavoro sulla scocca e integrazione dei pezzi già montati: riduzione aggiuntiva del peso pari al 10–14% del peso di serie, con tetto di 160–220 kg secondo il profilo e limite inferiore del 74% del peso di serie. Non cambia CV, Nm, cilindrata, regime, trazione o potenza effettiva del motore elaborato. Nessun ripristino gratuito di motore/gomme, carburante o chilometri.

La fisica del nuovo flag applica +12% al coefficiente di aderenza sull’asciutto, +4% sul bagnato, nessun bonus di aderenza sulla neve; ulteriore +6% di decelerazione e +6% di resistenza aerodinamica. L’alleggerimento interviene anche nel modello fisico: i guadagni effettivi variano con massa, stato e fondo. Sono benefici dell’allestimento integrato, non una seconda somma dei bonus dei ricambi. L’allungo può diminuire. Il confronto del meccanico usa gli stessi calcoli dell’acquisto e della gara, con l’usura attuale.

Su copia PostgreSQL: 200 modelli con tutti i 16 pezzi reali al livello 3, stesso pilota e percorso dimostrativo. Miglioramento controllato 2,31–5,06% rispetto all’auto già tutta al livello 3; non è un bonus fisso applicato ai tempi. Seicento: 35.000 €, 128 CV invariati, 718→630 kg. Alfa 155 Q4: 61.000 €, 263 CV invariati, 1.428→1.226 kg. M3 E30: 63.000 €, 293 CV invariati, 1.183→1.015 kg. L’aspetto storico non implica il trapianto del vero motore DTM/Kit Car/GT.

## Dove può correre

Il server rifiuta sempre le clandestine, comprese prove personalizzate, prima di creare la gara o addebitare una puntata. Anche un percorso stradale inviato direttamente in modalità track viene rifiutato. Sono ammessi solo circuiti: gare singole, prove a tempo, campionati (con verifica del calendario prima della quota e del percorso alla partenza), sfide Meet/SMS già limitate ai circuiti. Restano validi CV, IP, livello e gli altri regolamenti delle competizioni.

L’esposizione statica al raduno resta disponibile. Le schermate garage/usato indicano “Da gara · solo pista”; il nuovo proprietario eredita restrizioni e livrea. Le sfide e i checkpoint congelano il flag e le immagini. Le gare e i contratti preesistenti privi del flag conservano la fisica e l’aspetto precedenti; nessuno storico viene ricalcolato. La trasformazione entra nelle impronte delle nuove preparazioni e prove a tempo, a differenza della sola tinta.

## Arte, persistenza e verifiche

Nessuna immagine è stata rigenerata o modificata. `shared/racePreparationCatalog.mjs` contiene i 200 riferimenti approvati e le loro revisioni, inclusi Saxo/Mégane selezionati dall’utente; si ricostruisce con `node tools/race-conversions/build-runtime.mjs`. `carArtwork` sceglie la PNG racing solo per esemplari e snapshot convertiti; i nuovi acquisti di serie conservano le sette tinte. L’album nascosto resta consultabile e rimanda al servizio reale; i suoi confronti su base di serie sono solo illustrativi, il preventivo effettivo è in officina. `proposal.mjs` resta un esperimento storico precedente, non importato dal gioco o dal builder attuale.

Migrazioni additive PostgreSQL `0010_race_preparation` e SQLite `0013_race_preparation`: nuovo booleano non nullo con default false, nessuna trasformazione automatica. Nessun reset di auto, saldi, ricambi, gare o account.

Collaudo: 281 test JavaScript, controlli account/gateway, lint e build. Nuovi casi per requisiti incompleti, proprietà, conferme, preventivo scaduto, fondi insufficienti, gara attiva, idempotenza, impossibilità di riconversione/downgrade, strada inviata come pista e permanenza dopo vendita/riacquisto. Aggiornate due asserzioni obsolete dei test tracciati, ancora riferite alle cartoline fotografiche ritirate: ora verificano i PNG pixel approvati 320×180 sotto world/tracks, senza alterare asset o geometrie.

`scripts/validate-race-preparation.cjs` accetta soltanto un database locale *_validation. Sulla copia: tutti i modelli bilanciati, 16 montaggi reali, acquisto concorrente con un solo addebito, anteprima identica alle statistiche salvate e tutte le righe precedenti invariate. Browser sulla copia a 320/390/1280 px: tre reparti, anteprime corrette, conferme obbligatorie, acquisto e persistenza al ricaricamento, blocco carrozziere e avviso nelle clandestine; nessun errore JavaScript o asset mancante. Le prove non acquistano nulla sui salvataggi pubblici.

## Pubblicazione verificata

Rilasciata sull’istanza unica il 29 ottobre 2026 dal commit `a4ad7a6`. Prima dell’intervento: backup completo Auth/gioco `poketurismo-20261029T064053218242563Z.dump` e copia di build/client PostgreSQL in `/home/klaro/.backups/poketurismo/race-preparation-2026-10-29T06-40-51-983Z`. Migrazione PostgreSQL 0010 completata a servizi fermi: impronte identiche per tutti i campi preesistenti delle 31 tabelle di gioco; 32 auto conservate, tutte con il nuovo flag false. Nessuna conversione o spesa effettuata sul database pubblico.

Servizi sviluppo e gateway riavviati e attivi sulle porte 5174/5184; nessuna istanza 5173 o server QA 5197 lasciata attiva. Copia temporanea PostgreSQL di validazione eliminata dopo il collaudo. Tutte le 200 immagini approvate sono identiche al rilascio precedente. Report di migrazione, collaudo e schermate in `.preview/race-preparation-qa` (non pubblici).

Gateway locale: 208 risorse confrontate con la build completa, inclusi tutti gli sprite. Entrambi gli indirizzi pubblici 443/8443: home/officina, quattro immagini campione e primi 4 KiB degli asset JS/CSS confrontati con la build, health 200, API privata e nuova conversione anonima 401. Il primo controllo esteso ha incontrato timeout Tailscale scaricando l’intero bundle JS; il successivo controllo con richieste parziali è riuscito su entrambi gli indirizzi. Non è stata allentata l’autenticazione per le prove.
