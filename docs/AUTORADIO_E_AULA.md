# Autoradio e aula · 29 ottobre 2026

La scheda Tecniche dell'autoscuola usa un'aula italiana1998–2002 con cartelloni dei segnali, banchi, lavagna e computer CRT. Allenamenti conserva il piazzale. Il titolo diventa Autoscuola del club.

## Ascolto

Pulsante autoradio accanto al cellulare nella barra globale. Finestra modale con frontalino CD pixel art, accensione/spegnimento, Play, Pausa, traccia precedente/successiva, volume a passi di5 e cursore0–100. Display con titolo, stato, numero traccia e volume. Escape o X chiudono il frontalino senza interrompere l'ascolto. Navigare nel gioco conserva il lettore; uscire dal gioco lo ferma. Nessun download audio prima del primo Play, nessuna riproduzione automatica al caricamento. Accendere lascia in pausa: Play avvia l'audio. A fine brano continua con il successivo e ripete il CD.

Preferenze locali browser `poketurismo-radio-v1`: accensione, traccia e volume. Nessun dato audio o cambio di saldo/statistiche nel server. Le preferenze non sono legate al pilota; il contenuto è uguale per tutti. Se localStorage è bloccato la radio funziona in memoria. Errori di riproduzione mostrati nel frontalino con riprova esplicita, senza cicli di retry. I controlli HTML reali sono sopra la grafica, con nomi accessibili e focus da tastiera.

Tre strumentali originali brevi composti proceduralmente per il gioco, senza sample o registrazioni esterne: Tangenziale, ore22 (122BPM), Ultimo gettone (110BPM), Passo notturno (130BPM). Partiture e sintesi riproducibili in `tools/radio-music/build.py`, eseguibile con Python standard; WAV mono22050Hz in `public/audio/radio`, playlist `shared/radioTracks.mjs`. Nessun servizio esterno o streaming. Le tracce durano circa44–52 secondi e formano un primo CD espandibile. Nessuna pretesa di registrazioni storiche o brani commerciali.

## Immagini

Generazione con `image_gen` integrato: aula `public/images/world/sections/school-classroom.png`320×180 e frontalino `public/images/world/sections/car-radio.png`600×200. Prompt completi, sorgenti e input nativi conservati in `tools/radio-art/records.json` e `inputs`; hash in `manifest.json`. Ricostruzione `node tools/radio-art/build.cjs`, ridimensionamento nearest-neighbour. Vecchi banner conservati.

## Verifica

300 test gioco inclusi5 casi del lettore (preferenze senza autoplay, controlli e riproduzione, fine brano/errori, dati corrotti, promise Play seguita da Pausa), lint e build superati. Browser su320/390/1280px: riproduzione media reale, controlli, cambio percorso senza interruzioni, chiusura/Escape, reload senza autoplay, cambio banner. Collaudo API in sola lettura; nessuna modifica alle partite pubbliche. Rapporti locali in `.preview/car-radio-qa`.
