# Bilanciamento della gara tattica

Report riproducibile con `npm run balance`: 1.000 semi per ciascuno di undici scenari, 11.000 gare complessive. Le vittorie includono mezzo punto per un pareggio; il distacco positivo indica vantaggio della vettura del giocatore. I numeri descrivono queste fixture di progetto, non tutte le combinazioni del catalogo né prestazioni reali.

## Categorie di prova

| Vettura di progetto | CV | kg a secco | CV/t | Velocità nominale km/h |
|---|---:|---:|---:|---:|
| Compatta 120 | 120 | 1000 | 120 | 190 |
| Sportiva 150 | 150 | 1100 | 136 | 210 |
| GT 300 | 300 | 1450 | 207 | 260 |
| Supercar 500 | 500 | 1450 | 345 | 310 |

Abilità uguali per tutti gli attributi: principiante 5, intermedio 30, esperto 100. Il modello usa una curva con rendimento decrescente: raddoppiare un attributo non raddoppia le prestazioni. Il giocatore simulato usa decisioni adattive equivalenti a quelle dell'avversario, senza tecniche aggiuntive.

## Risultati

| Scenario | Vittorie del giocatore | Distacco medio | Criterio rispettato |
|---|---:|---:|---|
| Stessa auto, piloti equivalenti | 50.4% | -0.02 s | Sì |
| Stessa auto, pratica e tecnica massime contro pilota senza pratica | 61.2% | +0.12 s | Sì |
| Stessa auto, esperto contro principiante | 100% | 8.99 s | Sì |
| Auto più potente, piloti equivalenti | 0.4% | -2.45 s | Sì |
| Compatta esperta contro sportiva principiante sul misto | 100% | 7.29 s | Sì |
| Compatta esperta contro sportiva principiante sul tecnico | 100% | 8.67 s | Sì |
| Compatta esperta contro GT principiante sul veloce | 0.1% | -6.49 s | Sì |
| Compatta esperta contro supercar preparata | 0% | -13.91 s | Sì |
| Padronanza massima in compatta contro GT sul veloce | 0.1% | -6.48 s | Sì |
| Padronanza massima in compatta contro supercar preparata | 0% | -13.87 s | Sì |
| Equivalenti sul bagnato | 49.8% | -0.02 s | Sì |

## Criteri prima della calibrazione

- Pratica e tecnica massime, stessa auto e attributi generali: 50–75% di vittorie contro un pilota senza pratica; il progresso deve aiutare senza garantire la vittoria.
- Anche con pratica massima restano i limiti del 5% contro GT sul veloce e del 3% contro supercar preparata.
- Stessa auto e stesso pilota: 35–65% di vittorie equivalenti; nessun vantaggio sistematico per un lato.
- Stessa auto, esperto contro principiante: almeno 85%.
- Auto più potente con piloti equivalenti: l'auto inferiore vince al massimo il 15%.
- Esperto in compatta contro principiante in sportiva moderatamente superiore: almeno 55% sul misto e 70% sul tecnico.
- Compatta esperta contro GT sul veloce: al massimo 5%; contro supercar preparata sul misto, al massimo 3%.
- Sul bagnato, mezzi e piloti equivalenti restano comparabili; i tempi peggiorano.

Queste soglie sono obiettivi di gioco espliciti. Non costituiscono una validazione fisica e non devono essere adattate automaticamente ai risultati di una formula nuova.

## Come funziona il modello

Il motore integra la velocità su passi di distanza di 5 m. La forza disponibile dipende dalla potenza alle ruote e dalla velocità; resistenza al rotolamento, resistenza aerodinamica, massa, trazione e pendenza limitano l'accelerazione. La velocità nominale del catalogo calibra la resistenza della vettura di serie; i CV modificati mantengono quel riferimento. In curva la velocità limite deriva da aderenza e raggio.

Il pilota sfrutta una frazione di accelerazione, percorrenza e frenata: le abilità hanno un limite superiore. Cambiata e piccoli errori aggiungono tempo. La casualità determina errori contenuti e guasti legati a stato/distanza, senza aggiungere metri gratuiti al distacco. Le due vetture subiscono consumo e usura.

Ritmo, staccata, traiettoria e manovra cambiano il modo di percorrere il settore. La difesa può conservare la posizione in un duello ravvicinato in curva ma costa tempo; non blocca una macchina nettamente più veloce su un lungo rettilineo. Preparare il sorpasso costa 0,12 s ora e migliora l'efficienza del prossimo rilancio, restando entro la potenza disponibile. Una staccata tardiva può guadagnare tempo in approccio ma aumenta rischio e perdite d'uscita, soprattutto per un pilota poco preciso.

## Limiti da valutare giocando

Il Circuito Scuola ha lunghezze e raggi progettati, non deriva da rilievi. Per gli altri tracciati lunghezza e geometria dei singoli tratti sono inferite dal catalogo legacy, e vengono accorpate in massimo otto punti decisionali. Aderenza, usura, aerodinamica e abilità sono approssimazioni di gioco. Mancano temperature, rapporti del cambio dettagliati, modello completo delle gomme e contatti fra vetture.

Le nuove classifiche usano millisecondi come differenza cumulata; il distacco è mostrato in secondi. Un ritiro assegna una penalità di almeno 30 s per lo spareggio del campionato. Gare e campionati già avviati con risultati nelle vecchie unità conservano le vecchie regole fino alla conclusione, senza mescolare metri e millisecondi.

## Contesto, strada e imprevisti esterni

Le opportunità vengono calcolate dal medesimo modulo per UI, giocatore e avversario. Senza curva né curva imminente, la staccata torna al riferimento; senza un rivale vicino davanti non sono disponibili scia o tentativo di sorpasso. La preparazione richiede un rivale davanti entro 3 s e un rettilineo nel prossimo settore. La difesa richiede di essere davanti entro 1,2 s: linea interna nelle curve, manovra di difesa sui rettilinei. Scelte note diventate irrilevanti tornano al valore normale; tentativi di sorpasso impossibili vengono rifiutati dal server.

La traiettoria di percorrenza favorisce leggermente la velocità in curva, sacrificando velocità di uscita. La scia riduce del 5% la resistenza aerodinamica sui segmenti rettilinei, mantenendo il limite superiore del modello e senza aumentare la potenza.

Le nuove corse clandestine usano un profilo strada da punto a punto: carreggiata inferita di massimo 7,5 m, visibilità di base 160 m, oppure 65 m nei settori indicati come ciechi. La velocità sostenibile dipende anche dallo spazio di arresto visibile e dai riflessi. Con visibilità sotto 120 m non viene proposto un sorpasso. Sono parametri di progetto da affinare, non misure reali. Il traffico civile è disattivato di base; solo percorsi che indicano esplicitamente «traffico»/«traffic» nel nome abilitano il raro evento veicolo lento. Il profilo è salvato nella sessione, separato dalle quote e dai premi.

Un flusso casuale deterministico separato assegna un imprevisto esterno al 5% delle gare nuove, con massimo uno per gara indipendentemente dal numero di settori e dalla posizione. In circuito è sporco al bordo; su strada è asfalto irregolare o, dove previsto, un veicolo lento. Il settore interessato presenta un avviso prima della scelta. Il rallentamento interessa entrambe le auto: 0,12 s conservando, 0,30 s con ritmo pulito, 0,65 s attaccando. Non causa ritiri né modifica direttamente il risultato. Errori di guida e guasti restano sistemi distinti. Il piano degli eventi futuri rimane sul server; checkpoint e retry non ripetono un evento.

Le sessioni già avviate senza un piano di imprevisti proseguono senza aggiungerne uno a metà gara. La mappa del Circuito Scuola è uno schema disegnato appositamente, non in scala; per i percorsi legacy viene mostrato l'ordine dei settori, senza inventare la forma del percorso.

## Progressione e decisioni dell'avversario

La progressione della frenata e la nuova tecnica sono descritte in [PROGRESSIONE_PILOTA.md](PROGRESSIONE_PILOTA.md). I test includono pratica e tecnica al massimo: il vantaggio medio resta contenuto e non annulla una differenza meccanica importante. I criteri meccanici preesistenti non sono stati allargati.

Il pilota automatico difende l'interno nelle curve lente adatte, ma conserva il passo nelle esse e nei tratti di rilancio. La difesa sistematica su ogni curva faceva perdere troppo tempo e poteva rendere controproducente il piccolo vantaggio della progressione. La stessa politica viene usata dal giocatore simulato e dal rivale; il giocatore umano mantiene la libertà di scegliere.
