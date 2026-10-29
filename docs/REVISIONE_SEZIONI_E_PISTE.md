# Sezioni e circuiti · 29 ottobre 2026

Schede grandi Win98 con icone condivise: scuola (Tecniche/Allenamenti), officina (Meccanico/Carrozziere/Preparazione da gara/Soccorso essenziale), tuning (Motore/Dinamica). Le schede sono sotto il banner; officina cambia immagine per reparto, la scuola per Allenamenti. I banner originali Meccanico e Tecniche sono conservati. Soccorso e rimborso si trovano nella quarta scheda. Spiegazioni dei ciceroni Sara, Franco, Elena e Lara aggiornate.

Allenamenti: 24 corsi, tre livelli per tutte le otto abilità. Ricerca per testo, specialità e stato come nelle tecniche. Costi300/750/1500€, livelli1/3/6, promozione precedente, quattro esercizi con almeno tre corretti. Pratica20/10/5 per esercizio nelle tre fasce di ripetizione, nove sessioni massime;100 pratica = +1 fino100. Nessun XP, premio o usura della vettura personale. Le nuove cinque specialità includono domande ragionate senza timer, oltre alla decisione di guida; le risposte corrette rimangono sul server. Le vecchie lezioni congelate conservano i criteri precedenti. Nessun cambiamento ai punti per livello o alla pratica naturale di gara.

Campionati: eliminata la scheda Allenamento ridondante. Nei listini viene mostrata la preparazione media IP/IG dei sette avversari, separata fra auto e pilota; i contratti attivi usano i partecipanti congelati. A fine round il pulsante Prossima gara del campionato chiede al server la partenza successiva, con gli stessi controlli su auto, benzina e condizioni. In caso di rifiuto il risultato resta visibile. Le due attività dell'autodromo hanno immagini proprie con coppe e vetture da corsa. Atlante rimosso dal fondo delle clandestine, conservato nell'autodromo.

## Circuiti

Tre aggiunte additive con propri settori nominati, cartoline pixel art e minimappe illustrative: Franciacorta2519m, Imola4933m (1995–2006, Variante Bassa), Mugello5245m. Franciacorta, nato nel2006, è un'eccezione cronologica esplicita al riferimento2002; Mugello è l'estensione toscana richiesta dall'utente. Non vengono sostituiti i precedenti circuiti del club.

Monza riceve titolo completo, descrizione, luogo, difficoltà4/5 e disegno più riconoscibile. L'esistente sessione club16km, ID, settori, calendari, record e contratti restano invariati: la distanza storica del gioco non viene presentata come lunghezza omologata di un giro. Tutte le mappe sono schemi illustrativi, non dati GPS né geometrie fisiche del simulatore.

Fonti: [Monza](https://www.monzanet.it/tracciato-pista-monza/), [Mugello](https://www.mugellocircuit.it/it/pista/descrizione-pista), [Imola storia](https://www.autodromoimola.it/storia/), [Imola2006 Toyota](https://toyotagazooracing.com/archive/ms/public/jp/gp/04_sanmarino/index.html), [Franciacorta F2 Trophy](https://www.f2trophy.it/autodromo-franciacorta/), [Franciacorta Porsche](https://newsroom.porsche.com/en/2021/company/porsche-experience-center-pec-italy-franciacorta-opening-25701.html). Riferimento apertura2006: ACI Sport, presentazione round Franciacorta2025.

## Immagini e riproduzione

Nove generazioni con strumento integrato `image_gen`: quattro banner320×180, due icone128×128 e tre cartoline320×180. Prompt completi e provenienza in `tools/section-art/records.json`, input nativi conservati in `tools/section-art/inputs`, hash nel manifest. Ricostruzione `node tools/section-art/build.cjs`, solo ridimensionamento nearest-neighbour. Output in `public/images/world/sections` e `public/images/world/tracks/{franciacorta,imola-real,mugello-real}.png`. Nessuna auto approvata o vecchia illustrazione modificata.

## Verifica

295 test gioco e12 account/gateway passati; lint e build. Su clone PostgreSQL:24 corsi completati, otto specialità, gare complete sui tre nuovi circuiti, primo round campionato. Seed ripetuto senza duplicati, confronto dei precedenti Track/TrackBuild/User invariato. Prove browser320/390/1280px e partenza diretta del round successivo; rapporti e schermate nella cartella privata ignorata `.preview/interface-zones-qa` dopo il rilascio. Nessuna migrazione di schema, reset o acquisto sui salvataggi pubblici.

Rilascio: backup completo Auth+gioco verificato prima della pubblicazione; copia della build precedente e audit in `/home/klaro/.backups/poketurismo/interface-zones-20261029T150721Z`. Sul database effettivo il confronto di tutte le righe esistenti è identico: aggiunti soltanto3 Track,39 TrackBuild e39 TrackSection. Seconda esecuzione seed senza creazioni. Servizi5174 e gateway5184 riavviati, health locale positivo; vecchie porte5173/3001 spente. Nessuna modifica ai saldi, piloti, auto o risultati esistenti.
