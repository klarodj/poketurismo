# Mercato usato e prezzi del nuovo

Budget iniziale confermato: **€10.000**, senza modificare i saldi dei giocatori esistenti. Prima fornitura: **32 auto**, di cui **8 da ingresso**. Prezzi virtuali progettati per la progressione del gioco.

## Fasce e protezione del budget

La classe dipende congiuntamente da CV, CV/tonnellata, accelerazione 0–100 e velocità massima; si considera anche la potenza/peso modificata. Una vettura usurata mantiene la propria fascia.

| Fascia | Nuovo minimo | Usato minimo |
|---|---:|---:|
| Primi passi | €8000 | €3800 |
| Compatte sportive | €15000 | €11000 |
| Sportive | €24000 | €16000 |
| Gran turismo | €42000 | €26000 |
| Alte prestazioni | €70000 | €44000 |
| Supercar | €120000 | €75000 |

Primi passi: massimo 85 CV, 110 CV/t, 0–100 non inferiore a 10,5 s e velocità massima non oltre 175 km/h. Tutte le altre fasce hanno prezzi nuovi e usati superiori al budget iniziale, anche con motore o gomme a zero. I prezzi storici più alti restano rispettati; gli altri vengono portati al minimo della fascia e arrotondati a €100.

Il catalogo precedente permetteva di comprare Corsa GSi, 106 Rallye e Rover 114 GTi con il budget iniziale. Il nuovo listino lo impedisce. Adeguati 142 prezzi sotto la soglia prestazionale e arrotondati altri 40; 18 prezzi erano già compatibili. Non vengono riscritti CV, prestazioni, garage posseduti o denaro dei piloti.

## Offerte da ingresso

| Auto | CV | Km | Motore / gomme | Prezzo | Residuo da €10.000 |
|---|---:|---:|---|---:|---:|
| Fiat Seicento Sporting | 55 | 45000 | 94% / 88% | €5800 | €4200 |
| Fiat Cinquecento Sporting | 55 | 56000 | 92% / 85% | €5950 | €4050 |
| Mini Cooper S | 63 | 67000 | 90% / 82% | €5850 | €4150 |
| De Tomaso Mini Turbo | 68 | 78000 | 88% / 79% | €5800 | €4200 |
| Autobianchi A112 Abarth | 70 | 89000 | 94% / 88% | €6500 | €3500 |
| Nissan Micra Super S | 75 | 100000 | 92% / 85% | €7750 | €2250 |
| Fiat Seicento Sporting | 55 | 111000 | 90% / 82% | €5500 | €4500 |
| Fiat Cinquecento Sporting | 55 | 122000 | 88% / 79% | €5600 | €4400 |

Sono inclusi 10–16 litri di carburante e manutenzione recente. Tutte le offerte da ingresso rispettano i requisiti auto della Coppa Kei Car (40–85 CV, ingresso €500). Il margine minimo di €2.250 permette ingresso, carburante e interventi ordinari; non è necessario acquistare immediatamente modifiche o il tagliando completo. La scuola guida rimane gratuita con auto in prestito.

## Tutta la fornitura

| Fascia | Auto | Prezzo |
|---|---|---:|
| Primi passi | Seicento Sporting | €5800 |
| Primi passi | Cinquecento Sporting | €5950 |
| Primi passi | Cooper S | €5850 |
| Primi passi | Mini Turbo | €5800 |
| Primi passi | A112 Abarth | €6500 |
| Primi passi | Micra Super S | €7750 |
| Primi passi | Seicento Sporting | €5500 |
| Primi passi | Cinquecento Sporting | €5600 |
| Compatte sportive | Y10 Turbo | €12400 |
| Compatte sportive | Visa Gti | €12250 |
| Compatte sportive | Corsa Gsi mk2 | €12050 |
| Compatte sportive | 106 Rallye 1.3 | €12050 |
| Compatte sportive | Swift GTI | €12200 |
| Compatte sportive | Golf GTI mk1 | €12250 |
| Sportive | 145 Quadrifoglio | €17850 |
| Sportive | Tipo 16v | €17650 |
| Sportive | Mx-5 NA | €17400 |
| Sportive | 106 Gti 16v | €17850 |
| Sportive | Cordoba Gt | €17900 |
| Sportive | 5 Maxi Turbo | €29900 |
| Gran turismo | 155 Q4 | €29000 |
| Gran turismo | Delta HPE | €28600 |
| Gran turismo | Calibra Turbo | €29400 |
| Gran turismo | Celica Carlos Sainz | €29450 |
| Gran turismo | S60 T5 | €34300 |
| Alte prestazioni | 80 RS2 | €48300 |
| Alte prestazioni | 3000GT | €47700 |
| Alte prestazioni | Speedster | €52500 |
| Alte prestazioni | Continental R | €167700 |
| Supercar | Super 7 | €81750 |
| Supercar | Diablo | €108800 |
| Supercar | F1 | €320800 |

## Valutazioni, transazioni e rigenerazione

La quotazione usata varia con modello, condizioni, chilometraggio e modifiche. Un valore minimo per fascia impedisce che una sportiva distrutta venga comprata con il budget iniziale e riparata a poco. Il ritiro paga al massimo il 72% del valore di vendita, con recupero limitato del costo dei componenti: il salto di fascia tramite una modifica economica non moltiplica il valore di ritiro. Il prezzo esposto e quello addebitato usano la stessa funzione server. Anche la quotazione mostrata nel garage arriva dal server.

`node scripts/seed-used-market.cjs` mostra il piano, `--apply` lo applica in una singola transazione serializzabile. Il marcatore `used-market-opening-v1` impedisce di duplicare il lotto, ricreare annunci venduti o sovrascrivere un’auto acquistata. Non esiste rifornimento automatico: occorre una nuova fornitura esplicitamente progettata. Il mercato è condiviso tra i giocatori.

Test: soglie multi-parametro, riserva per principianti, sei fasce, prezzi di annunci sottocosto, modifiche e rivendita, assenza di arbitraggio immediato, seed idempotente e acquisti con retry. Su copia PostgreSQL: 32 annunci, otto offerte da ingresso, acquisto simultaneo della stessa auto con un solo vincitore, impossibilità di comprare sportive con €10.000, accesso al primo campionato e conservazione di giocatori e auto esistenti.
