# Classifica durante i campionati

Il pannello in stile Windows 98 mostra posizione su otto, nomi e auto di chi precede e segue, distacchi positivi in secondi, tempo personale e distacco dal primo. La tabella evidenzia il giocatore e distingue distacco dal leader e intervallo dal precedente. I tempi sono cumulati allo stesso fine settore, non distanze fisiche fra auto in tempo reale.

Alla partenza le posizioni non sono ancora assegnate. Primo e ultimo non hanno un vicino inesistente; i ritirati sono indicati esplicitamente. Parità entro 10 ms seguono le regole della classifica ufficiale. Il rivale del confronto tattico è identificato separatamente, con la sua posizione e le immagini delle auto conservate. Minimap e anteprima del tracciato restano disponibili.

`server/gridTiming.js` ricava i rilevamenti dal medesimo simulatore e dagli stessi semi della chiusura gara. La cache privata LRU contiene al massimo 64 simulazioni e non viene pubblicata: al client arriva solo il rilevamento corrente, mai ritiri futuri, semi o tracce complete. Il tempo del rivale tattico usa sempre quello effettivo della gara. Le classifiche finali già congelate conservano ordine e posizioni originali.

La lettura di una gara già aperta proietta la classifica senza riscriverla. Ogni nuovo turno salva nel log soltanto un riepilogo compatto di posizione e vicini; il pulsante «Posizioni e distacchi per settore» apre lo storico. I vecchi log senza rilevamento lo dichiarano, senza ricostruzioni arbitrarie. Abbandoni senza nuovo settore non riscrivono il precedente rilevamento.

Nessuna migrazione, reset o modifica a contratti, fisica, consumi, premi e punti. Il confronto tattico continua a seguire le meccaniche esistenti; gli altri partecipanti hanno prestazioni simulate e non una fisica di traffico condivisa fra otto auto.

Collaudo: test del motore, parità, estremi, ritiri, proiezioni senza scritture, retry, conservazione dei risultati e storico. Gara completa di sei settori nel browser su copia PostgreSQL, con giocatore terzo e rivale tattico ottavo: vicini corretti a ogni settore, classifica finale coerente, ripresa dopo refresh e schermo mobile 390×844 senza overflow. Tutte le righe preesistenti nei 14 modelli di carriera/social verificati sono rimaste identiche nel database di collaudo.

Rilascio del 23 ottobre 2026: 262 test JavaScript e 12 account/gateway superati, lint e build completati. Backup completo prima e dopo. Copia precedente e verifica privata in `/home/klaro/.backups/poketurismo/grid-timing-2026-10-23T17-26-06-488Z`; confronto integrale delle 32 tabelle game con servizi fermi: tutte le righe identiche prima e dopo. Nessuna partita di prova eseguita su account pubblici.
