# Autoradio e aula · 29 ottobre 2026

La scheda Tecniche dell'autoscuola usa un'aula italiana1998–2002 con cartelloni dei segnali, banchi, lavagna e computer CRT. Allenamenti conserva il piazzale. Il titolo diventa Autoscuola del club.

## Ascolto

Pulsante autoradio accanto al cellulare nella barra globale. Finestra modale con frontalino CD pixel art, accensione/spegnimento, Play, Pausa, traccia precedente/successiva, volume a passi di5 e cursore0–100. Display con titolo, stato, numero traccia e volume. Escape o X chiudono il frontalino senza interrompere l'ascolto. Navigare nel gioco conserva il lettore; uscire dal gioco lo ferma. Nessun download audio prima del primo Play, nessuna riproduzione automatica al caricamento. Accendere lascia in pausa: Play avvia l'audio. A fine brano continua con il successivo e ripete il CD.

Preferenze locali browser `poketurismo-radio-v1`: accensione, traccia e volume. Nessun dato audio o cambio di saldo/statistiche nel server. Le preferenze non sono legate al pilota; il contenuto è uguale per tutti. Se localStorage è bloccato la radio funziona in memoria. Errori di riproduzione mostrati nel frontalino con riprova esplicita, senza cicli di retry. I controlli HTML reali sono sopra la grafica, con nomi accessibili e focus da tastiera.

Revisione2: tre strumentali originali chiptune / drum and bass: Tangenziale, ore22 (172BPM), Ultimo gettone (176BPM), Passo notturno (168BPM). Durata76–80 secondi, stereo32kHz, MP3 VBR. Intro, due drop, breakdown e coda, basso detunato con sub, lead pulse, arpeggi, accordi, batteria spezzata, ghost note, fill e delay. Sintesi additiva limitata alle armoniche sotto Nyquist e ducking per dare spazio alla cassa. Nessun sample o melodia esterna. Builder NumPy/ffmpeg in `tools/radio-music/build.py`, misure e hash nel manifest. Dipendenze richieste solo per rigenerare gli asset, nessuna dipendenza aggiuntiva nel gioco. WAV e builder precedenti archiviati in `tools/radio-music/archive/v1`. URL versionati per evitare che il browser riproponga le vecchie tracce.

I comandi del frontalino sono pulsanti trasparenti con soli simboli sui tasti disegnati nell'immagine, come ON/OFF: nessun rettangolo applicato sopra. Conservati focus da tastiera e nomi accessibili.

## Immagini

Generazione con `image_gen` integrato: aula `public/images/world/sections/school-classroom.png`320×180 e frontalino `public/images/world/sections/car-radio.png`600×200. Prompt completi, sorgenti e input nativi conservati in `tools/radio-art/records.json` e `inputs`; hash in `manifest.json`. Ricostruzione `node tools/radio-art/build.cjs`, ridimensionamento nearest-neighbour. Vecchi banner conservati.

## Verifica

300 test gioco inclusi5 casi del lettore (preferenze senza autoplay, controlli e riproduzione, fine brano/errori, dati corrotti, promise Play seguita da Pausa), lint e build superati. Browser su320/390/1280px: riproduzione media reale, controlli, cambio percorso senza interruzioni, chiusura/Escape, reload senza autoplay, cambio banner. Collaudo API in sola lettura; nessuna modifica alle partite pubbliche. Rapporti locali in `.preview/car-radio-qa`.

Pubblicato sulla singola istanza5174 con gateway5184, dopo backup completo Auth/gioco e build precedente in `/home/klaro/.backups/poketurismo/car-radio-20261029T162700Z`. Nessuna migrazione o scrittura di gioco. Servizi riavviati e health verificato; file musicali serviti con supporto alle richieste Range.


Verifica revisione2: cinque test lettore, lint e build passati. Riproduzione MP3 reale e comandi trasparenti verificati con browser a320/390/1280px; nessuna scrittura API. Tutti e tre i file decodificati integralmente, durata e stereo confermati, campioni finiti e picco sotto0dBFS anche dopo compressione. Misure tecniche, non una valutazione d'ascolto. Rapporti in `.preview/chiptune-radio-qa`.
