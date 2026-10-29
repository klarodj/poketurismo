# CD del club · revisione2

Composizioni originali proceduralmente sintetizzate, senza campioni o melodie esterne.
Chiptune e drum and bass168–176BPM:56 battute, intro8, primo drop16,
pausa8, secondo drop20, coda4. Stereo32kHz, MP3 VBR qualità4.

Rigenera con `/usr/bin/python3 tools/radio-music/build.py`.
Dipendenze di sola produzione asset: NumPy e ffmpeg con libmp3lame
(Ubuntu: `python3-numpy ffmpeg`). Nessuna dipendenza aggiuntiva per il gioco.

Partiture, synth additivi band-limited, basso detunato con sub, batteria
spezzata con ghost note e fill, arpeggi, accordi, delay e mix ducking sono
nel builder. Seed deterministici, picco massimo prima della compressione−1dBFS.
`manifest.json` registra BPM, durata, hash e misure audio; non è un ascolto
qualitativo né una misura di loudness integrato LUFS.

Le prime tre tracce WAV e il loro builder restano nell'archivio `archive/v1`.
Il runtime usa solo i nuovi URL versionati per evitare vecchie copie in cache.
