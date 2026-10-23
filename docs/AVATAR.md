# Avatar dei piloti

20 personaggi in pixel art, 10 maschili e 10 femminili, nel Nord Italia tra fine anni Novanta e primi Duemila. Coppie di rallisti, meccanici, figli di papà, tamarri, navigatori, carrozzieri, pistaioli, gommisti, installatori hi-fi e veterani del club. Tutti sono disponibili a chiunque e non attribuiscono bonus, statistiche o vantaggi economici.

## Dove scegliere e modificare

Alla creazione del pilota, dopo il nome, appare il selettore con anteprima, nome e breve descrizione. Filtri Tutti/Uomini/Donne e radio selezionabili anche da tastiera; elenco a scorrimento in stile Windows 98. Si conferma insieme al normale profilo iniziale e al budget del server.

Dopo la creazione: Garage → Pilota → Cambia avatar → Salva avatar. Il cambio è gratuito, annullabile prima di salvare e consentito anche durante una gara, perché puramente estetico. La barra del giocatore mostra il ritratto e permette di tornare al profilo. I ritratti compaiono anche nel piazzale del raduno, nei dettagli, nelle classifiche, nelle conversazioni e nelle schede delle sfide. Le foto dei contratti già congelati rimangono quelle della loro creazione; l’identità corrente nelle viste del raduno e della posta usa la scelta attuale.

I vecchi valori blue/red/green/yellow e i profili senza ritratto rimangono leggibili come casco neutro «Avatar da scegliere»: non viene assegnato automaticamente un volto o un genere ai vecchi piloti. Possono scegliere uno dei venti personaggi dal garage. Non si usa più un servizio esterno che ricava il volto dal livello.

## Asset

public/images/avatars/*.png: 20 immagini native 64×64, circa 240 KB complessivi, ingrandite con image-rendering: pixelated. Generazione con lo strumento integrato image_gen, un ritratto per richiesta; tutti i prompt e i percorsi dei file sono in [AVATAR_PROMPTS.json](AVATAR_PROMPTS.json). Gli originali sono conservati nella raccolta privata di Codex; l’esportazione PNG del gioco usa nearest-neighbor. Nessun file originale di luoghi, lavorazioni o automobili è stato sostituito.

Stile del prompt: ritratto adulto di testa e spalle da selezione personaggio PC/console anni Novanta, pixel art a 64×64, contorni scuri, palette limitata, sfondo grigio, abiti da officina/rally/raduno del 1998–2002, senza testi, loghi, persone reali o accessori contemporanei.

## Dati e controlli

shared/avatarCatalog.mjs è il catalogo comune di ID, nomi, descrizioni e file; il server accetta soltanto gli ID previsti. La vecchia registrazione con uno dei quattro colori resta compatibile, mentre la nuova interfaccia propone i venti volti. Nessun percorso o URL arbitrario fornito dal browser viene usato come immagine.

Il campo User.avatar esiste già: nessuna migrazione o aggiornamento dei profili esistenti al rilascio. POST /api/player/:id/avatar usa autenticazione, verifica del proprietario del corpo e del percorso, transazione e deduplicazione delle operazioni. Sono ammessi soltanto i dati dell’avatar: non nome, statistiche, saldo o privilegi. La risposta aggiorna il giocatore corrente; un vecchio tentativo ripetuto ritorna lo stato attuale e non ripristina un ritratto precedente.

Le proiezioni pubbliche aggiungono soltanto l’ID dell’avatar, senza dati account. L’avatar è escluso dall’impronta della preparazione di una sfida: cambiarlo non invalida un invito né modifica i contratti di gara, auto o abilità. Conservare questa esclusione anche per futuri interventi estetici.

## Collaudo

193 test di gioco e 10 account/gateway passati, lint e build superati. Casi specifici: 20 asset 64×64, selezione maschile/femminile, compatibilità dei vecchi colori, rifiuto di URL e ID arbitrari, autenticazione e proprietà, esclusione dei campi economici/amministrativi, cambio con gara attiva, retry senza ripristinare un vecchio avatar, impronta e contratto di sfida invariati.

Browser reale headless su copia PostgreSQL e autenticazione sintetica locale: creazione con ritratto femminile e budget €10.000 senza auto, modifica dal garage, persistenza al ricaricamento, scelta di un vecchio profilo con gara attiva e controllo che tutti gli altri dati di pilota/garage/gara restino identici, ritratto nel raduno e nella barra. Otto verifiche desktop 1280×960 e telefono 390×844 senza errori JavaScript o scorrimenti orizzontali. Catture, tavola dei venti ritratti e report in .preview/avatar-qa. Nessun account reale usato per il collaudo e nessuna email inviata.
