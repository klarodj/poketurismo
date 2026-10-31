# B04 — Eventi del club

Stato: completato e pubblicato il31ottobre2026. Cinque eventi sempre disponibili, nuova voce autonoma dell’Autodromo, scelta sul modello dei campionati. Nessuna nuova destinazione nella mappa. Banner dedicato e cinque copertine pixel art 320×180, descrizioni narrative leggibili, filtri per attività, dettagli richiudibili con regolamento/percorso, scelta diretta della vettura posseduta, media IP/IG del rivale reale e storico privato dei risultati. Tutorial Elena aggiornato.

## Attività

- Piccole pesti: livello1, stradali fino100CV,1400cm³,peso di serie1100kg; San Rocco, Cinquecento Sporting, pilota fisso8.
- Come mamma l’ha fatta: livello1, fino160CV, nessun Mod montato. Manutenzione e verniciatura lecite; Ticino, Seicento Sporting, pilota10.
- Pochi soldi, tanto manico: livello2, fino120CV, valore convenzionale<=12000€. San Rocco, Cinquecento, pilota12.
- Domenica italiana: livello2, marchi italiani, stradali fino160CV. Il raduno narrativo è sul lago; la prova contro la Punto GT, pilota12, è al pistino San Rocco. Nessuna falsa gara aperta al traffico.
- Il cronometro del navigatore: livello1, stradali fino160CV; percorso Sebino riservato al club, senza rivale reale. Tempo imposto per settore,72s/km (media convenzionale50km/h), congelato nel contratto. Attesa dichiarata0–60s, passo0,1, aggiunta al tempo effettivo senza simulare tempo reale di connessione. Scarti assoluti medi<=3s per superare la prova, anticipo/ritardo uguali. Tempi separati dai record di velocità. Il riferimento interno del motore non può troncare questa prova se si ritira.

Valore budget: maggiore fra fascia minima usato e60% del listino nuovo, arrotondato a50€, più prezzo pieno dei pezzi montati. Non usa prezzo effettivo d’acquisto, rivendita, chilometri o usura. Il limite non scende usurando un’auto o vendendola a un amico.

Ogni prova è gratuita. Vittoria/obiettivo300€+60XP, altri arrivi100€+20XP. Prime tre conclusioni per evento:100%/50%/25%, poi zero premi/XP. Nessun premio per guasti o abbandoni. Conteggi da RaceSession complete e valide; nessun nuovo ledger modificabile dal browser. Niente pratica aggiuntiva in B04, nessuna modifica ai sei punti/livello o ai normali allenamenti. Premi sottoposti al rimborso officina esistente. Massimo525€ per evento con tre vittorie, prima delle riparazioni e rimborsi. Eventi non accreditano automaticamente B01, reputazione B03 o record personali di velocità.

## Contratti e compatibilità

Catalogo e regole condivise in shared/clubEvents.mjs; hub privato server/clubEvents.js e GET /club-events/:userId. Partenza via normale POST /races, soltanto mode/eventId/garageId. Autorizzazione e proprietà sul server, regole e condizioni ricontrollate alla partenza. Non serve cambiare carDrive: si usa l’auto scelta, si ritira soltanto quella eventualmente esposta al raduno. Attività in corso bloccano acquisti/modifiche come le altre gare.

Nuovo marker clubEvent versione1 congela regole, budget, premi, rendimento e tempi obiettivo. Il motore conserva consumi v3 e usura reale della vettura scelta, snapshot normale e API idempotenti; risultati salvati in RaceSession. Nessuna migrazione, seed, reset, modifica ai vecchi checkpoint o contratti dei campionati. Nessuna modifica alle200auto. Nessun costo o lettura narrativa registrata aprendo la selezione.

Originali/prompt/build/hash delle sei immagini in tools/club-events-art, asset in public/images/world/events. Generazione image_gen integrata, preparazione nearest-neighbour320×180.

## Verifiche

362 test di gioco,13 accessi/account, lint/build. Regole, budget immune ai prezzi di vendita/usura, scelta auto/proprietà, preview read-only, impostazioni forgiate, tuning prima della partenza, attesa idempotente, premi decrescenti e limite dei tre completamenti, storico privato e assenza nei record di velocità. Copia PostgreSQL dedicata con soli cataloghi e utenti sintetici: tutte5prove completate con Cinquecento Sporting, primo evento vinto e regolarità superata, richieste simultanee ripetute senza doppie gare/premi, nessun progresso DriverDevelopment extra. Browser a320/390/1280: nuova voce, cinque immagini caricate, filtri, regolamento e nessun overflow; avvio regolarità, attesa4,1s registrata, ripresa e abbandono, ritorno agli eventi verificati. Verifiche ripetute anche sul frontend pubblicato con tutte le API indirizzate al solo database di collaudo.

## Pubblicazione

Sorgenti `7d2b138`, rilascio sulla sola istanza di sviluppo/test5174, gateway5184. Backup completo prima del rilascio in `/home/klaro/.backups/poketurismo/b04-20261031T034227Z`. Confronto integrale delle32tabelle: tutte le righe identiche, nessuna migrazione o seed. Servizi attivi e health positivo, sei immagini controllate dal gateway e API personali senza sessione401. Fonte e documentazione salvate su Git. Database PostgreSQL di collaudo rimosso dopo le verifiche.

Playtest: Autodromo → Eventi del club; prova Piccole pesti con un’utilitaria, esplora le altre locandine e la regolarità. Nei dettagli di ogni evento sono dichiarati vincoli, premi ridotti e valore della vettura. Prossimo blocco B05 dopo il feedback di gioco.
