# Logo e griglie coerenti con la crescita del pilota

## Marchio

Nuovo emblema originale pixel art: monogramma PT rosso/blu, piccola utilitaria anni Novanta e bandiera a scacchi. Appare nella schermata di accesso e nella creazione del pilota, accanto al nome del gioco; non sostituisce la scena del paese fornita e non cambia l’autenticazione.

Logo trasparente256×256 in `public/images/brand/poketurismo-mark.png`; favicon PNG16/32/48 e icona Apple180 nella stessa cartella. `index.html` seleziona le dimensioni corrette, titolo Poketurismo e lingua italiana; il vecchio favicon.svg resta conservato. Scala pixel senza sfocature. Generato con **image_gen integrato**, trasparenza reale verificata. Originale e prompt completo in `tools/brand-art/inputs` e `records.json`, riproduzione con `build.cjs`, hash/alpha in `manifest.json`.

## Diagnosi della difficoltà

Dopo il passaggio da +3 a tutte le otto abilità a sei punti totali distribuibili, le griglie conservavano abilità troppo alte. Un profilo iniziale equilibrato ha IG32; con i soli punti livello distribuiti arriva circa a34 al livello2 e36 al livello3. Il Trofeo Aspirato aveva media46 (abilità18), vicina al profilo senza allenamenti del livello10. Il divario esisteva davvero, pur senza rendere l’IG una misura completa del risultato.

Corretto il catalogo degli **avversari**, non la crescita. Restano sei punti per livello, massimo cumulativo due per abilità per livello guadagnato, allenamenti e tetto100. Nessuna compensazione, punto gratuito, modifica ai profili o incremento delle abilità esistenti. Con i soli punti dei livelli, portare tutte le otto abilità iniziali al100 richiede un budget equivalente almeno al livello120; gli allenamenti costituiscono una via distinta. Non serve accelerare ulteriormente la crescita per correggere queste griglie.

`shared/championshipDifficulty.mjs` contiene sette valori fissi per ogni serie, con differenze moderate nella stessa griglia. Nessun adattamento al giocatore, all’auto, alle vittorie o alle sconfitte. Il catalogo congela questi valori nei nuovi contratti come già faceva; server e UI usano le stesse abilità. I campionati più impegnativi mantengono margine per allenamenti e scelte della vettura.

| Campionato | Livello minimo invariato | IG medio prima | IG medio nuovo |
|---|---:|---:|---:|
| Primi Giri | 1 | 40 | 31 |
| Aspirato | 2 | 46 | 34 |
| GT280 | 3 | 55 | 37 |
| Italiane | 3 | 52 | 36 |
| Trazione Posteriore | 4 | 61 | 38 |
| Gran Turismo del club | 6 | 69 | 44 |
| ACI Piccole Turismo | 3 | 59 | 40 |
| ACI Turismo1600 | 4 | 64 | 42 |
| ACI Superproduzione2000 | 5 | 69 | 44 |
| ACI Superturismo | 6 | 74 | 48 |
| ACI Gran Turismo | 8 | 78 | 52 |

Nessun cambiamento a sblocco, quota, CV/IP, cilindrata, trazione, calendario, premi o XP. Audit strutturale delle undici definizioni contro il catalogo precedente: cambiano soltanto le abilità dei piloti rivali. Auto, condizioni, nomi e identità dei concorrenti sono identici. Elena chiarisce che livello di accesso e possibilità di podio sono concetti distinti.

## Simulazioni e limiti

`scripts/championship-progression-balance.mjs 16` è di sola lettura: costruisce griglie effettive con il motore dinamico, geometrie reali del catalogo e confronta prima/dopo con gli stessi semi. Undici campionati ×16stagioni ×due regolazioni:1376round; ulteriori128round confrontano la vettura del tester, con output anonimizzato. Nessun invio di risultati, usura, premi o altra scrittura al database. Prove su ritmo pulito senza tecniche o allenamenti; manutenzione e45L a ogni appuntamento sono assunzioni esplicite del confronto, non gratuità aggiunte al gioco.

Il calo dell’IG rende il confronto più accessibile ma non annulla la differenza fra auto. Nel campione del Trofeo Aspirato, una Saxo120CV con pilota da livello2 passa da5/16 a15/16stagioni a podio e media3,63→2,44. Una Seicento80CV/IG36 passa da media6,69 a5,94, senza podi: resta una preparazione minima contro vetture fino a120CV, e non basta premere sempre Avanti per vincere il campionato. Tigra e Yaris meno favorevoli rimangono più difficili; i calendari e l’auto possono pesare più dei pochi punti d’IG di differenza. Non c’è un moltiplicatore nascosto per garantire un piazzamento.

## Compatibilità e verifiche

Iscrizioni e gare già salvate mantengono integralmente i contratti congelati, i piloti e le classifiche; il nuovo assetto riguarda le nuove iscrizioni. Nessuna migrazione, seed o riscrittura di risultati. Un test modifica il catalogo dopo l’iscrizione e verifica che proiezione, partenza e piloti salvati conservino le vecchie abilità.

330 test gioco e12account/gateway passati, lint/build riusciti. Controllati i quattro profili del livello2 con il budget attuale, PNG/favicon, trasparenza, compatibilità dei contratti e tutti i controlli esistenti. Browser a320/390/1280: logo, Google ancora disponibile, tre favicon caricate, lista campionati con mediaIG34 nel secondo, nessun errore JavaScript/asset o overflow. Richieste browser soltanto in lettura e intercettate con dati sintetici. Report in `.preview/brand-balance-qa`.
