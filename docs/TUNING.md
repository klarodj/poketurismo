# Negozio tuning e preparazione

Il negozio permette di scegliere una propria auto senza cambiarne l'equipaggiamento. Le 48 varianti sono raggruppate nelle 16 famiglie già presenti, con categorie motore/trasmissione e assetto/ciclistica. Ogni scheda mostra livello, costo, quantità in magazzino, IP prima/dopo e stato già montato.

Aprendo il confronto si vedono CV, Nm, peso, IP, velocità potenziale, curve lente/veloci, freni e trazione. L'anteprima sottrae il componente sostituito, considera gli altri pezzi e mantiene motore, gomme, chilometraggio e carburante attuali. CV, Nm e kg rispettano l'arrotondamento effettivo del montaggio; per esempio 2,5 CV diventano 3, quindi passare a una variante da 5 CV produce +2 CV, non +5.

Il pezzo sostituito torna in magazzino. Acquisto e montaggio sono separati: si può comprare senza montare o montare una variante già posseduta senza comprarla nuovamente. Anche il garage apre il confronto prima del montaggio. La scheda auto riporta ora l'IP reale al posto del precedente testo fisso «S1».

## Benefici e limiti

I consigli derivano dalle differenze nel modello fisico di gara: rapporto potenza/peso e allungo, aderenza in curva e decelerazione. Non assegnano secondi garantiti o bonus specifici al bagnato non presenti nel motore. Le caratteristiche di freni/curve/trazione sono indici effettivi; la velocità potenziale è stimata sull'asciutto, non una promessa di raggiungerla su qualsiasi tracciato. L'IP è arrotondato e può restare uguale per piccoli miglioramenti.

Limite emerso nel controllo: le sei varianti Gearbox / Clutch and Flywheel cambiano indici salvati ma non hanno un effetto cronometrico autonomo nel modello tattico attuale. Il confronto segnala «Nessun beneficio di gara misurabile» quando applicabile, anziché promettere un miglioramento. Non sono stati cambiati il motore di gara o i record precedenti in questo intervento. Il comportamento fisico di cambio/frizione resta un lavoro successivo, da versionare con attenzione per le classifiche.

## Accesso alle gare

L'anteprima usa i medesimi controlli di ammissione del server per i sei campionati correnti e i cinque ritrovi clandestini. Mostra auto che entrano/escono dai limiti CV/IP/trazione/motore/marca, e segnala esplicitamente un campionato attivo se coinvolto. Livello/abilità del pilota rimangono distinti dai requisiti della vettura. Le clandestine usano gli stessi controlli per livello, IP attuale, reputazione nella zona precedente e scuola guida.

Un avviso non impedisce di preparare l'auto: il giocatore può scegliere di superare una categoria. L'iscrizione e la partenza ricontrollano comunque tutti i requisiti e le risorse necessarie. Carburante, usura o progressione possono cambiare l'accesso dopo l'anteprima. Non vengono promessi accessi basati sul solo IP.

## API e calcoli

GET /api/tuning/:userId?garageId=... richiede il proprio giocatore e una propria vettura; senza selezione usa l'equipaggiata o la prima posseduta, senza auto restituisce il catalogo senza anteprime. Non restituisce dati account o saldi altrui.

shared/tuning.mjs contiene i delta dei ricambi condivisi con il montaggio server, il ripristino degli indici storici, la sostituzione pura e i calcoli di anteprima. La lettura e il confronto non cambiano il database. Le nuove conferme inviano un'impronta di vettura, modifiche e ricambio/prezzo: se cambia la preparazione, l'usura o il prezzo, il server richiede un confronto aggiornato, senza addebiti o consumo dell'inventario. Restano supportate le operazioni esistenti senza impronta, sempre con prezzo e bonus letti dal database e proprietà verificata. Le operazioni durante una gara attiva restano bloccate.

Nessuna migrazione e nessuna modifica a prezzi, bonus o pezzi precedentemente posseduti: il controllo del catalogo ha confermato prezzi crescenti e una progressione iniziale sostenibile.

## Verifica del bilanciamento

scripts/tuning-balance.mjs confronta condizioni, pilota e percorso identici, senza casualità o usura. Eseguito sul catalogo PostgreSQL copiato: tutti i 48 prezzi sono positivi, crescenti per livello nella propria famiglia. Seicento Sporting in condizioni 100/100, 20 L normale, pilota 30:

| Preparazione | Spesa ricambi | CV | Peso | IP | Velocità potenziale | Percorso di controllo |
|---|---:|---:|---:|---:|---:|---:|
| Serie | €0 | 55 | 735 kg | 45 | 152,85 km/h | 127,896 s |
| ECU, freni e alleggerimento livello 1 | €850 | 61 | 732 kg | 48 | 158,76 km/h | 124,978 s |
| Tutte le 16 famiglie livello 3 | €31.350 | 128 | 718 kg | 76 | 206,89 km/h | 107,224 s |

Il pacchetto iniziale migliora il riferimento di circa 2,9 s, restando una piccola auto. La preparazione completa costa oltre tre budget iniziali e non raggiunge potenza o velocità da supercar. Questo è un esperimento controllato sul percorso dimostrativo: una gara reale comprende errori, decisioni, fondo e usura; non promette gli stessi secondi su ogni circuito.

## Collaudo

155 test JavaScript, 9 test account/gateway, lint e build superati. Test specifici per sostituzione netta, arrotondamenti, conservazione usura/altre modifiche, downgrade, componenti senza benefici fisici, confronto cronometrico controllato, proprietà, preventivi scaduti/prezzi cambiati, retry e limiti campionati/clandestine.

scripts/validate-tuning.cjs obbliga ACCOUNTS_VALIDATION_ENV_FILE a puntare a un database locale *_validation. Su copia PostgreSQL: 48 acquisti e 64 montaggi/sostituzioni, ciascuno ripetuto con la stessa chiave operazione, passando anche a livelli inferiori. Anteprime confrontate con le effettive statistiche salvate dopo ogni montaggio. Verificati saldo esatto, inventario senza duplicazioni o perdite, usura/carburante conservati, preventivi scaduti respinti e tutte le righe precedenti invariate. Nessuna operazione di prova sul database pubblico.

Nessun browser collegato disponibile: il componente di confronto è verificato tramite rendering automatico, senza collaudo visivo interattivo.
