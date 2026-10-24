# Feedback del playtest · 24 ottobre 2026

- Benzina: indicatore grafico segmentato E/F, litri e riserva nella barra generale; versione mini accanto alla propria auto durante gare singole e campionati. Nessuna seconda barra generale.
- Esperienza: barra XP del profilo Pilota con progresso entro i 1000 XP del livello corrente, XP mancanti e prossimo livello; totale nel suggerimento. Soglie uguali al server, nessuna assegnazione di esperienza.
- Scuola guida: pagina autonoma `/driving-school`, decimo luogo della mappa, senza schede Garage. Il garage ha Pilota e Auto, con invito alla scuola nel profilo. Il vecchio URL è un redirect e i rientri dalle lezioni vanno alla nuova pagina. Catalogo, letture, prove e progressi invariati.
- Autodromo: campionati, gara singola, registro tempi; atlante come piccolo collegamento finale. La richiesta successiva di una scuola autonoma sostituisce il precedente ordine che la collocava nell’autodromo.
- Concessionario: ingresso con i 46 loghi esistenti, scelta marca e ritorno alle marche, ricerca globale per modello e filtro budget. Immagini locali, selezioni da tastiera, scheda e acquisto espliciti.
- Officina: nuova anteprima 400×400 del soccorso, con la stessa classe e dimensioni visuali degli altri interventi. Nessun cambiamento al finanziamento o ai preventivi.
- Tuning: 16 famiglie e tutte le 48 descrizioni originali localizzate in italiano con terminologia automotive. `partLabels.mjs` applica alias solo al rendering, inclusi garage, usato e dettagli sociali; gli ID, i nomi canonici, le famiglie del confronto e le impronte restano intatti. Il filtro famiglia conserva il valore canonico anche se l’etichetta è tradotta.
- Consumi: misto, ritmi, confronto ricambi, anteprima e storico dei settori in km/l quando è nota la distanza. Il confronto usa il reciproco anche per il delta: consumare più carburante riduce i km/l ed è segnalato come peggioramento. Nessun cambio alla formula in litri, alle versioni o alle gare congelate. Litri residui/erogati/usati rimangono quantità fisiche distinte dall’efficienza.
- Clandestine: primo passo con i luoghi e i requisiti; scelta di un luogo accessibile apre la sola vista dell’avversario, cercandolo se non esiste un’offerta. «Cambia luogo» conserva l’offerta; soltanto «Cerca un altro avversario» richiede la sostituzione. Luoghi chiusi mostrano i requisiti, senza inviti o gare. Il server continua a verificare accesso, offerta, puntata e premi.

## Immagine generata

[Soccorso](../public/images/work/soccorso.png) realizzato con image_gen integrato: Iveco Daily dell’epoca, utilitaria sul pianale e officina di provincia. Copia del gioco a 400×400 con palette 96 colori e preparazione nearest-neighbor; originale generato conservato. [Prompt e preparazione](SOCCORSO_IMMAGINE.json). Nessuna foto originale sostituita.

## Verifiche

Browser con API reali su copia PostgreSQL `_validation` e pilota sintetico; nessuna azione sui giocatori pubblici. Viste 320, 390 e 1280 px: dieci destinazioni, scuola autonoma e redirect storico, due schede garage, XP 1350 → livello 2 / 350 di 1000 / 650 mancanti, ordine autodromo, 46 marche con ricerca modello, filtro famiglia tradotto, tutti i 48 testi dei ricambi, immagine soccorso 400×400, unità e delta in km/l. Clandestine verificate con luogo/avversario presenti alternativamente, ritorno senza rigenerazione, sostituzione esplicita e luoghi bloccati. Font pixel caricato, nessun errore JavaScript o overflow della pagina.

Gara su strada e campionato via browser sulla copia: indicatore mini presente su 320 px, stima e log in km/l, avvio/turno/abbandono e classifica coerenti. Artefatti in `.preview/feedback-qa`. Test dedicati a conversione e direzione del confronto, soglie XP, alias senza mutazione, accessibilità degli strumenti. Backend, schema, formule e dati dei giocatori invariati.

Verifica finale: 269 test JavaScript e 12 test account/gateway superati; lint, build e controllo del diff completati. Nessuna modifica a server, shared o schema; le localizzazioni e conversioni restano nello strato di presentazione.
