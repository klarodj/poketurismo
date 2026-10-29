# Garage: leggibilità e banco illustrativo · 29 ottobre 2026

Scheda Pilota: riusa /images/world/setting.png, la stessa immagine degli strumenti di sviluppo, come richiesto. Scheda Auto e dettaglio conservano /images/world/garage.png. Rimossa la prima didascalia ripetuta sotto Abilità Pilota: le regole rimangono nel riquadro punti abilità.

GarageCarDetail usa garage-detail.css con telemetria a18px, sfondo bianco/testo nero e intestazione blu. Pannelli banco/telemetria disposti in sequenza per evitare colonne strette; numeri localizzati e massimo due decimali. Nomi dei pezzi a20px, descrizioni a18px, livelli/bonus almeno16px, pulsanti a18px e minimo40px. Nomi e descrizioni non vengono troncati; azioni e titoli possono andare a capo. Gli stessi criteri valgono per Pezzi montati e Magazzino. Grafica Win98 e immagini dei ricambi conservate. Il peso esposto è indicato come peso a secco, coerente con Garage.kg.

## Curva stimata

DynoChart dentro Dati banco prova e telemetria: grafico SVG con griglia, coppia blu tratteggiata, potenza rossa continua, legenda e giri leggibili in HTML (non rimpiccioliti insieme al disegno SVG su mobile). Scale verticali distinte CV/Nm dichiarate esplicitamente, curve interamente indicative: non una rilevazione reale né la riproduzione 1:1 di uno specifico motore.

shared/dynoEstimate.mjs costruisce una curva stilizzata di coppia normalizzata con massimo pari ai Nm della preparazione; la potenza deriva dalla relazione CV = Nm×giri/min÷7023,5. La scala indicativa del regime viene calibrata perché il picco coincida con i CV forniti. La coppia raggiunge il picco prima della potenza. I regimi non provengono da dati reali del modello; il grafico non aggiunge realismo meccanico al simulatore. Nessuna modifica a parametri, usura, tuning, IP, fisica o salvataggi. Dati assenti/non validi mostrano un messaggio, senza inventare una misura.

Andrea aggiornato: distingue casa/profilo e garage/auto; spiega sei punti distribuibili e limite cumulativo, IP/IG, allenamenti e tecniche, montaggio/magazzino e banco indicativo. Ricorda anche carrozziere, preparazione da gara definitiva con16L3/solo pista e ripartenza economica. Tutorial sempre facoltativo e apribile dal ritratto.

## Verifica

291 test gioco passati, lint/build. Due casi per il grafico: conservazione dei picchi, relazione coppia/potenza, ordine dei picchi e assenza di mutazioni; gestione di picchi mancanti o non validi. Browser a320/390/1280px: banner distinti e cambio scheda, didascalia rimossa, grafico caricato, font della telemetria/descrizioni almeno18px, liste montati/magazzino e tutorial aggiornato, nessuno scorrimento orizzontale o errore JavaScript. Per il magazzino la QA usa tre ricambi reali in una copia locale dello stato mostrato, senza comprarli. Tutte le scritture intercettate/bloccate: zero chiamate di modifica pubbliche. Schermate/report .preview/garage-readability-qa. Istanza unica5174/gateway5184 riavviati dal postbuild, health verificata; nessuna migrazione o reset.

Aggiornamento successivo: Consumo stimato spostato in fondo all’intero dettaglio auto, sotto banco/telemetria e gestione dei ricambi, a larghezza completa.
