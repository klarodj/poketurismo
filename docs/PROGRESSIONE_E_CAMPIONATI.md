# Progressione e campionati · 29 ottobre 2026

**Aggiornamento successivo:** la parte +3 automatico descritta sotto è storica e superata da [PUNTI_ABILITA.md](PUNTI_ABILITA.md): sei punti da distribuire, limiti per abilità e recupero dei vecchi bonus già eseguito. Il bilanciamento delle griglie rimane valido.

Corretto il difetto che aggiornava soltanto livello/XP: ogni livello superato assegna +3 a tutte le otto abilità, fino a 100. La stessa funzione server vale per premi gara e allenamenti, gestisce soglie multiple e conserva gli incrementi specifici dell’allenamento. Nessun punto assegnato semplicemente ricaricando una pagina. La transazione e le ricevute esistenti impediscono doppie assegnazioni.

`scripts/repair-pilot-levels.cjs` visualizza le compensazioni; `--apply` recupera una sola volta tre punti per abilità per ciascun livello già raggiunto dopo il primo. Ricevuta `pilot-level-stats-v1` per pilota in GameOperation, nessuna modifica a XP, saldi, auto, account, tecniche o risultati. Eseguire a servizi fermi dopo backup completo. Un secondo avvio deve restituire elenco vuoto.

Campionati: difficoltà fissa, senza adattamento nascosto alla vettura del giocatore. Fasce base delle abilità rivali 12/15/21/19/26/34, con variazione +0…6 nella griglia. Condizioni rivali uniformi 92% motore/90% gomme: eliminato il salto da motori 82–88% a 96% e pneumatici 76–78% a 94% fra i primi due eventi. Primi Giri sostituisce la Cooper S fuori fascia con A112. Il Trofeo Aspirato sostituisce il gruppo fino a 160 CV con Micra Super S, AX GTI, Yaris TS, Tigra 1.6, 106 Rallye, Swift GTI e Saxo VTS: 75–120 CV. Modelli reali senza potenze artificialmente ridotte. Potenziare la Seicento da 55 a 80 CV consente ancora di dominare il trofeo introduttivo; l’accesso al secondo non garantisce la vittoria.

Verifica deterministica sul circuito dimostrativo, stessa guida standard, vetture reali del database: Seicento del giocatore con punti recuperati 142,81 s; seconda griglia 133,85–147,95 s. Il giocatore ha avversari raggiungibili e altri da affrontare migliorando preparazione/guida, invece di una griglia interamente superiore. È un riferimento controllato, non una promessa di piazzamento su ogni circuito. Nessun cambiamento al simulatore o ai tempi storici.

Il nuovo bilanciamento entra nei contratti delle nuove iscrizioni. Contratti, risultati e gare già iniziate mantengono la griglia congelata; le statistiche aggiornate del giocatore entrano nelle nuove partenze. Nessun reset o rimborso automatico delle iscrizioni esistenti.
