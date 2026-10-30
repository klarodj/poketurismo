# Cruscotto campionati ordinato · 29 ottobre 2026

Aggiornamento successivo: il layout è ora condiviso da tutte le modalità, descritto in [CRUSCOTTO_GARA_UNIFICATO.md](CRUSCOTTO_GARA_UNIFICATO.md).

Ordine richiesto: titolo, cartolina e minimappa; due anteprime auto affiancate (giocatore a sinistra, rivale tattico attuale a destra); classifica con posizione e vicini; settore da affrontare; comandi di guida e comportamento tattico; approfondimenti finali. Tema Win98 e immagini pixel art approvate conservati.

Le due schede auto sono pulsanti con immagine, modello, IP/IG e sintesi essenziale. La propria vettura conserva benzina con indicatore grafico, gomme e motore; il rivale mostra nome del pilota, posizione e lato del confronto. I distacchi si leggono nel riepilogo sottostante. Foto e scheda aprono i dettagli completi già esistenti di veicolo e pilota. Se non ci sono rivali attivi la destra indica Pista libera, senza foto di un avversario ritirato.

Il settore ha un riquadro dedicato: nome, metri, carattere delle curve, frenata, spazio per attaccare e tratto successivo. Il link Dati tecnici apre geometrie e statistiche approfondite. I vecchi settori privi di geometria non vengono descritti con distanze o curve inventate. Avvisi carburante/usura/imprevisti sono prima dei comandi e compaiono solo quando presenti.

Le manovre tattiche sono visibili direttamente dentro Guida il settore: ritmo, staccata, traiettoria, tecnica eventuale, confronto col rivale e conferma. Rimossa la seconda foto del rivale nei comandi, il suo pulsante finale duplicato e il riepilogo del settore subito sotto la minimappa. Dettagli strategia spostati dopo la conferma; in fondo rimangono classifica/settori, cronaca, pista/meteo e opzioni. I popup conservano Escape, focus e ritorno alla gara.

Sono cambiati soltanto componenti e CSS: nessuna modifica a motore, bersaglio dinamico, API, premi, consumi, checkpoint o database. Le altre modalità continuano a usare il proprio cruscotto.

## Verifica

Lint e build passati. Browser a320/390/1280px: ordine dei blocchi, foto affiancate, dettagli delle due auto e del settore, attacco e difesa visibili, invio manovra e reset al settore successivo, nessun rivale, risultato con Prossima gara, avvisi critici e nome lungo. Nessuno scorrimento orizzontale o errore JavaScript. Collaudo con rilevamenti sintetici catturati nel precedente test isolato, API intercettate; nessuna partita pubblica modificata. Rapporti e schermate in `.preview/race-layout-qa`.

Pubblicato sull'istanza5174/gateway5184 dopo backup completo Auth/gioco e della build precedente in `/home/klaro/.backups/poketurismo/race-layout-20261029T192929Z`. Nessuna migrazione o scrittura al database. Servizi riavviati e health locale verificato.
