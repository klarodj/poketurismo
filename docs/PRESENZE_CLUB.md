# Presenze del club nel piazzale

I personaggi narrativi espongono occasionalmente le loro auto nel riquadro «Oggi al piazzale», distinto dalle auto dei giocatori. Rotazione pseudo-casuale condivisa a finestre di trenta minuti: zero, uno o due personaggi, senza duplicati o rimescolamento al refresh. I quattro modelli e colori approvati restano fissi.

Cliccando si vede auto, ritratto e una chiacchierata. Lele usa lo stato reale dell’incarico letto dalla stessa API narrativa: disponibile, accettato, in corso, in pausa o concluso. Gli altri raccontano aneddoti personali alternati. Il collegamento all’incarico apre il telefono; parlare non accetta missioni, non legge SMS, non assegna premi o reputazione e non registra un incontro.

Solo presentazione e GET privati esistenti: nessun NPC creato come account, esposizione persistita, migrazione o modifica ai salvataggi. Nessuna falsa indicazione online. Aggiornamento ogni minuto con pagina visibile e al ritorno sul browser/chiusura telefono; dialogo aperto conservato anche al cambio turno.

340 test di gioco, lint e build superati; test specifici su stabilità/varietà delle presenze e dialoghi per stato. Verifiche browser in .preview/club-visitors-qa.
