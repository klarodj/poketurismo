# Autodromo: copertine, banner e notifica dei punti

Tre nuove scene pixel art **320×180**, uguali al formato del Registro tempi: Campionati Settentrionali, Campionati ACI CSAI e Gara singola. Sono usate sia nei pulsanti dell’autodromo sia come banner della corrispondente sottosezione. Il Registro tempi conserva la propria immagine; anche la preparazione di una prova a tempo la riutilizza. Le gare attive mantengono il cruscotto approvato con ambiente e minimappa del percorso, senza aggiungere un ulteriore banner.

Undici immagini distinte, una per campionato corrente, sostituiscono la foto generica della prima pista nell’elenco delle iscrizioni. Copertina a larghezza della scheda, rapporto 16:9, titolo e requisiti HTML leggibili; le mappe dei singoli round rimangono nel calendario dettagliato. `shared/championshipVisuals.mjs` associa immagini a nomi canonici e alias storici senza modificare ID o contratti.

## Immagini

Serie del club: piccole Fiat per Primi Giri, compatte aspirate, sportive GT280, marchi italiani, trazione posteriore e supercar Gran Turismo. ACI CSAI: piccole turismo da corsa, 1600, Superproduzione 2000, berline Superturismo e GT. Le immagini rappresentano il tema delle competizioni, non modificano le vetture del catalogo o le relative preparazioni approvate.

Tutte le quattordici scene sono state generate singolarmente con **image_gen integrato** in stile pixel art, Nord Italia circa2002, abiti/box/auto di fine anni Novanta e primi Duemila. Scene nuove in:

- `public/images/world/sections/autodrome-cups-v2.png`
- `public/images/world/sections/autodrome-aci-v2.png`
- `public/images/world/sections/autodrome-race-v2.png`
- `public/images/world/championships/*.png` (undici copertine)

Originali nativi conservati in `tools/autodrome-art/inputs`; richieste di scena in `subjects.json`, prompt completi/strumento/provenienza/percorsi finali in `records.json`. `node tools/autodrome-art/build.cjs` applica soltanto l’eventuale ritaglio centrale al rapporto e il ridimensionamento nearest-neighbour, senza deformazioni o ricolorazione. Impronte SHA256 in `manifest.json`. Le tre vecchie icone quadrate, il Registro tempi, le immagini delle auto e tutti gli altri asset rimangono invariati.

## Badge dell’avatar

`HUD` legge `development.pilotPoints.available`, il budget già calcolato dal server. Se è maggiore di zero, un piccolo **1** blu squadrato compare nell’angolo superiore destro dell’avatar, nello stile della notifica del telefono. Cliccare l’avatar porta al profilo dove distribuire i punti. Etichetta accessibile e tooltip indicano il numero effettivo dei punti disponibili; una regione live annuncia l’arrivo del budget.

Il badge compare immediatamente quando lo snapshot di una gara assegna il nuovo livello. Resta visibile se conservi o distribuisci solo parte dei punti e scompare con la spesa completa; al ricaricamento riflette ancora il valore server. Vale anche per punti già disponibili prima del rilascio. Nessun contatore o flag locale che possa confondere utenti diversi, nessuna nuova tabella, assegnazione automatica o scrittura all’apertura del profilo. Andrea spiega il simbolo nel tutorial.

## Verifica

327 test gioco e 12 account/gateway passati, lint e build riusciti. Test di copertura per undici immagini distinte, alias storici e formato PNG320×180 di copertine e banner. Browser isolato a320/390/1280px: menu e banner coerenti, undici copertine caricate, nessun errore JavaScript/asset o overflow; badge assente al livello iniziale, presente dopo un avanzamento ricevuto dalla gara, posizione nell’angolo dell’avatar, apertura profilo, spesa parziale/completa e persistenza al ricaricamento. Spese e gare intercettate su dati sintetici: nessuna partita pubblica modificata. Rapporti e schermate in `.preview/autodrome-art-qa`.

Nessuna modifica a motore, premi, progressione, economia, campionati, database o salvataggi. Nessun seed o migrazione.
