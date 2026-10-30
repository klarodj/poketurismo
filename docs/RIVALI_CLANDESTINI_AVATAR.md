# Volti dei rivali clandestini

Trenta nuovi ritratti originali NPC, quindici uomini e quindici donne, ambientati nel Nord Italia 1998–2002: barista, elettricista, rappresentante, studenti ITIS, portiere di notte, corriere, DJ, ciclista, escursionista, papà del kartodromo, camionista, collezionista, ferroviere, benzinaio, saldatore, turnista, informatica, soccorritrice, tassista, commessa, skater, fotografa dei rally, ricercatrice, tecnica diesel, restauratrice, studentessa d’arte, commissaria e architetta, cuoca del bar.

`shared/streetAvatarCatalog.mjs` assegna esplicitamente i ritratti ai quaranta ID dei rivali esistenti. Tutti trenta vengono utilizzati; dieci archetipi ricorrono in zone diverse. Nessuna estrazione casuale del volto a ogni incontro: stesso ID, stesso ritratto. Nessuna sovrapposizione per nome con giocatori, ciceroni o personaggi della storia.

Il ritratto compare accanto al nome nella scelta dell’avversario e, più compatto, nel cruscotto di gara. Le foto delle auto conservano apertura e dettaglio. I vecchi checkpoint ricevono il volto soltanto nella proiezione pubblica, senza riscrittura. Nuove gare salvano anche l’ID cosmetico. Nessuna modifica a estrazioni, abilità, auto, requisiti, soldi, premi, reputazione o fisica. Nessuna migrazione o pulizia database. I venti avatar giocatore e i quattro ritratti narrativi restano invariati.

Immagini create con image_gen integrato, una generazione distinta per soggetto. Originali, descrizioni e prompt in `tools/street-avatars`, PNG finali 64×64 con ridimensionamento nearest-neighbour in `public/images/street-avatars`. Builder e manifest con hash conservati. Cornici incassate Win98, pixel netti, nessuna interfaccia moderna.

Verifica: 355 test di gioco, lint e build; catalogo completo, trenta hash distinti, assegnazioni stabili, validazione identificativi e compatibilità checkpoint. Test API verifica che il volto pubblicizzato rimanga quello della gara. Verifica browser a 320, 390 e 1280 pixel per incontro, cruscotto e apertura dettaglio auto; solo fixture sintetiche, nessuna azione sui salvataggi pubblici.

Pubblicato il 30 ottobre 2026 sulla sola istanza di sviluppo/test. Backup `/home/klaro/.backups/poketurismo/street-avatars-20261030T215520Z`; confronto integrale delle 32 tabelle superato, nessuna riga modificata dal rilascio. Servizi attivi, health positivo e trenta asset verificati dal gateway 5184.
