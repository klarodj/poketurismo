# Poketurismo: istruzioni di lavoro

- Lavorare in questa copia; preservare il gioco attivo in `/home/klaro/docker-server/webapp/app`.
- Preferenza esplicita dell’utente: tenere il gioco di sviluppo sempre attivo sulla porta 5174, accessibile a tutti, e riavviarlo a ogni ricompilazione.
- Il servizio preparato è `poketurismo-dev.service`. Il supervisore riavvia l’anteprima quando cambiano sorgenti o build; `npm run build` invia un segnale tramite `postbuild`.
- Dopo modifiche, verificare il servizio e il riavvio quando l’ambiente permette systemd e rete. Se tali operazioni sono bloccate, dirlo: non dichiarare il servizio attivo o il firewall aperto senza verificarlo.
- Il comando di attivazione è `bash scripts/enable-dev.sh`; richiede privilegi sudo e installa un servizio di sistema eseguito come klaro. Non sostituire l’app attiva con l’anteprima.
