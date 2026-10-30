# Campionati ACI CSAI

L’autodromo ora distingue **Campionati Settentrionali** (i sei eventi già esistenti) e **Campionati ACI CSAI** (`/racing?series=aci-csai`). Una sola iscrizione attiva complessiva; il campionato in corso resta raggiungibile da entrambe le pagine. Storia separata per serie, regolamento e sette avversari congelati all’iscrizione come prima. Elena descrive le nuove possibilità.

## Calendari aggiunti

| Serie | Auto da gara ammesse | Livello | Gare | Quota | Premio titolo | XP titolo |
|---|---|---:|---:|---:|---:|---:|
| Piccole Turismo | 100–200 CV | 3 | 3 | 1.800 € | 9.000 € | 650 |
| Turismo 1600 | 160–240 CV, aspirate, FF, massimo 1600 cm³ | 4 | 4 | 2.800 € | 14.000 € | 900 |
| Superproduzione 2000 | 200–310 CV, aspirate, FF/FR/RR, massimo 2000 cm³ | 5 | 4 | 4.000 € | 20.000 € | 1100 |
| Superturismo | 220–400 CV | 6 | 4 | 6.000 € | 30.000 € | 1400 |
| Gran Turismo | 380–750 CV, FR/MR/RR | 8 | 5 | 9.000 € | 45.000 € | 1800 |

Calendari e regolamenti sono di gioco, ispirati alle categorie dell’epoca: non repliche di stagioni ufficiali né verifiche di omologazione storica. Il [palmarès della Scuderia del Portello](https://www.scuderiadelportello.org/wp-content/uploads/2024/12/ANNUARIO-2024.pdf) documenta Turismo, Superproduzione, Superturismo e Coppa CSAI nell’attività 1998–2001. Niente categorie moderne TCR/GT3. Circuiti del club più Imola e Mugello già presenti, senza aggiungere o alterare tracciati.

## Allestimento e confronti

`championshipRules` salva nei nuovi contratti `racePrepared:true` e l’eventuale `maxCc`. `championshipCarErrors` è comune a schermata, iscrizione e partenza: il flag deve essere quello persistente della vettura equipaggiata. Il client non può dichiarare una trasformazione. Prima della quota si verificano anche gli altri requisiti; cambiando auto tra due round i controlli vengono ripetuti. I contratti precedenti senza questa regola mantengono le proprie condizioni.

`championshipVehicle` applica ai sette avversari tutti i sedici pezzi reali livello 3 mediante `replacePart`, poi la stessa `prepareRaceCar` usata in officina. Nessun CV aggiuntivo inventato e nessun aggiustamento alla preparazione del giocatore. IP del listino e contratto usano la stessa costruzione; i rivali hanno le livree approvate e le condizioni congelate 96/96, 45 litri. Le abilità iniziali delle griglie (24/29/34/39/45, variazione +0…6) sono state successivamente ritarate insieme ai Settentrionali sui sei punti livello: valori attuali in [LOGO_E_BILANCIAMENTO_PILOTI.md](LOGO_E_BILANCIAMENTO_PILOTI.md). Fisica, punti e ripartizione dei premi rimangono invariati.

I filtri del concessionario applicano anche i nuovi regolamenti: nessuna vettura nuova di serie è già ammessa; il messaggio indica di completare la trasformazione dal meccanico.

## Inserimento e compatibilità

`scripts/seed-aci-csai.cjs` mostra le sole serie mancanti; `--apply` aggiunge cinque campionati e venti round in un’unica transazione serializzabile. Ripeterlo non duplica nulla. Non modifica righe preesistenti, non pulisce duplicati di settori e non rigenera piste. Prima dell’inserimento controlla disponibilità di ogni auto/pezzo, ammissione dei 35 rivali preparati e calendario solo su circuiti. Nessuna migrazione di schema o reset.

Il seed generale accetta opzioni esplicite per serie e pulizia. Il validatore precedente continua a verificare solo i Settentrionali. `scripts/validate-aci-csai.cjs` accetta esclusivamente un database locale `_validation`, verifica conservazione delle tabelle prima/dopo seed, ripetibilità, ammissioni, rifiuto delle stradali, un’unica iscrizione fra le serie, concorrenti preparati, quote concorrenti idempotenti, venti round completi e premi unici.

## Grafica e verifica

Nuova icona podio con tre piloti, tute e caschi di fine anni Novanta/primi Duemila, pixel art 128×128: `public/images/world/sections/autodrome-aci.png`. Creata con **image_gen integrato**, originale conservato in `tools/section-art/inputs/autodrome-aci.png`; prompt completo e provenienza in `tools/section-art/aci-prompt.json` e `records.json`. Riduzione nearest-neighbour tramite `tools/section-art/build.cjs`, hash in manifest. Le nove immagini precedenti restano identiche. L’icona è contenuta senza tagliare testa o piedi dei piloti.

324 test gioco e 12 account/gateway superati; lint e build riusciti. Collaudo PostgreSQL isolato di tutti e cinque gli eventi, 35 avversari e 20 gare, senza ritiri nella prova completa. Le posizioni cambiano fra vetture e circuiti; nessuna vittoria automatica garantita dall’iscrizione. Browser a 320, 390 e 1280 px: menu di quattro attività, elenchi separati 6/5, requisiti, pulsanti, rifiuto delle stradali, podio intero, nessuno scorrimento orizzontale o errore JavaScript/asset. Report e schermate privati in `.preview/aci-qa`.

## Rilascio verificato · 30 ottobre

Funzionalità pubblicata da `f083998` sull’istanza unica 5174, gateway 5184. Backup completo prima del rilascio e copia di build/dati in `/home/klaro/.backups/poketurismo/aci-csai-20261029T235503Z`. Audit delle 32 tabelle: aggiunti soltanto cinque campionati e venti round; tutte le righe precedenti identiche. Secondo seed senza modifiche. Nessuna stagione o partita azzerata.

Browser sulla build pubblicata, con soli dati sintetici intercettati in lettura, a 390/1280 px: navigazione e nuove voci riuscite. Health, icona e primi 4 KiB JS/CSS confrontati su entrambi i Funnel 443/8443. API campionati anonima 401 come previsto. Servizi attivi; nessun listener 5173/3001/5197. Database temporaneo eliminato dopo il collaudo, report in `.preview/aci-qa`.
