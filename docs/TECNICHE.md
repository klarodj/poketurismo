# Le 50 tecniche della scuola guida

Catalogo attivo dal 22 ottobre 2026 nella scheda Garage → Scuola guida: 10 percorsi da 5 tecniche, livelli da 1 a 22. Ogni percorso richiede il corso precedente, poi lettura e prova pratica; il solo livello non assegna tecniche. Nuovi piloti con inventario ed equipaggiamento vuoti, guida normale sempre disponibile.

## Apprendimento e benefici

| Difficoltà | Livello di base | Prova | Bonus iniziale specializzato | XP alla prima promozione |
|---|---:|---|---|---:|
| Base | 1 | 3 corretti su 4 | +2/+1 | 40 |
| Intermedia | 4 | 4 su 5 | +3/+1 | 60 |
| Avanzata | 8 | 5 su 6 | +3/+2 | 80 |
| Esperta | 13 | 6 su 7 | +4/+2 | 100 |
| Specialistica | 20 | 7 su 8 | +4/+3 | 120 |

Alcuni percorsi aggiungono 1–2 livelli al requisito. Le tecniche ad ampio impiego hanno un punto in meno sull’abilità primaria. Le prove usano un’auto in prestito, senza costi, carburante o usura sulla vettura propria. Le consegne vengono valutate sulle decisioni eseguite, senza bocciare per errori casuali del motore. Il duello didattico riposiziona il riferimento tra gli esercizi: la promozione non dipende dal distacco.

Una sola tecnica attiva per settore, fino a quattro equipaggiate. I bonus riguardano soltanto le abilità del pilota nel contesto indicato: non sono percentuali sul tempo, cavalli aggiunti o aderenza extra. Non si sommano quattro bonus contemporaneamente e il server rifiuta contesti o scelte non compatibili.

Padronanza a 20 e 60 punti: +1 sull’abilità primaria e poi +1 sulla secondaria, massimo +2 complessivi. Anche Rilascio progressivo è ora entro questo budget, con +3 frenata e +2 pulizia a padronanza massima. I progressi già guadagnati sono conservati; vengono eliminate dall’equipaggiamento soltanto le tre vecchie mosse gratuite. Le vecchie tecniche ottenute realmente con corsi storici restano disponibili per compatibilità, ma quei corsi non concedono nuovi sblocchi istantanei.

La pratica dei nuovi corsi arriva dall’uso effettivo nelle gare completate (fino a 6 punti), con fattori 1 / 0,5 / 0,25 sullo stesso percorso e minimo 1 solo se la tecnica è stata davvero utilizzata. Ripetere con successo un nuovo esame dà al massimo 1 pratica, zero XP e zero denaro. Rilascio progressivo conserva le regole introduttive di pratica della frenata; il suo esame ripetuto non dà ulteriore pratica. Gare personalizzate, ritiri e abbandoni non assegnano pratica.

## Bilanciamento misurato

Comando ripetibile: `node scripts/technique-balance.mjs 128`. Confronto appaiato sugli stessi semi, piloti con abilità 10/30/60 e tecnica padroneggiata, in un esercizio compatibile per ciascun corso. Totale 19.200 coppie di simulazioni. Vantaggio medio sul tempo del settore nei campioni: **0–0.9%**. I test verificano anche potenza e coefficiente di aderenza invariati e beneficio deterministico sotto il 3% sul settore campione.

Questo è un primo bilanciamento del motore, non una garanzia sui risultati di ogni gara: alcune abilità agiscono soprattutto su errori e recupero, non sul tempo ideale. Per ogni settore e contesto resta utile la guida normale.

## Frenata

| Livello | Tecnica | Bonus iniziale | Condizioni | Prova |
|---:|---|---|---|---|
| 1 | **Rilascio progressivo** | +2 Frenata, +1 Pulizia | zone di frenata | 3/4 |
| 4 | **Riferimenti di staccata** | +3 Frenata, +1 Riflessi | zone di frenata · frenata al riferimento | 4/5 |
| 8 | **Staccata in discesa** | +3 Frenata, +2 Pulizia | discesa · frenata anticipata | 5/6 |
| 13 | **Staccata controllata** | +4 Frenata, +2 Coraggio | zone di frenata · staccata tardiva · asciutto | 6/7 |
| 20 | **Ingresso sul freno** | +4 Frenata, +3 Curva | tornanti · frenata al riferimento · asciutto | 7/8 |

## Curve e traiettorie

| Livello | Tecnica | Bonus iniziale | Condizioni | Prova |
|---:|---|---|---|---|
| 1 | **Uscita preparata** | +2 Curva, +1 Accelerata | curve · uscita privilegiata | 3/4 |
| 4 | **Tornante rotondo** | +3 Curva, +1 Pulizia | tornanti · percorrenza privilegiata | 4/5 |
| 8 | **Curve concatenate** | +3 Curva, +2 Riflessi | esse e varianti | 5/6 |
| 13 | **Appoggio veloce** | +4 Curva, +2 Coraggio | curve veloci · percorrenza privilegiata · asciutto | 6/7 |
| 20 | **Traiettoria da qualifica** | +4 Curva, +3 Pulizia | curve · circuito · percorrenza privilegiata · asciutto | 7/8 |

## Accelerazione e trazione

| Livello | Tecnica | Bonus iniziale | Condizioni | Prova |
|---:|---|---|---|---|
| 1 | **Gas progressivo** | +2 Accelerata, +1 Pulizia | curve · uscita privilegiata | 3/4 |
| 4 | **Ripresa pulita** | +3 Accelerata, +1 Cambiata | rettilinei · ritmo pulito | 4/5 |
| 8 | **Rilancio in salita** | +3 Accelerata, +2 Cambiata | salita | 5/6 |
| 13 | **Trazione sul bagnato** | +4 Accelerata, +2 Riflessi | curve · pioggia · uscita privilegiata | 6/7 |
| 20 | **Rilancio concatenato** | +4 Accelerata, +3 Curva | esse e varianti · uscita privilegiata · asciutto | 7/8 |

## Cambio e coordinazione

| Livello | Tecnica | Bonus iniziale | Condizioni | Prova |
|---:|---|---|---|---|
| 2 | **Cambiata precisa** | +2 Cambiata, +1 Pulizia | rettilinei | 3/4 |
| 5 | **Scalata coordinata** | +3 Cambiata, +1 Frenata | zone di frenata · frenata al riferimento | 4/5 |
| 9 | **Punta-tacco** | +3 Cambiata, +2 Frenata | tornanti · frenata al riferimento · asciutto | 5/6 |
| 14 | **Cambiata in salita** | +4 Cambiata, +2 Accelerata | salita | 6/7 |
| 21 | **Sequenza di cambiate** | +4 Cambiata, +3 Riflessi | esse e varianti · circuito | 7/8 |

## Controllo della vettura

| Livello | Tecnica | Bonus iniziale | Condizioni | Prova |
|---:|---|---|---|---|
| 2 | **Assetto composto** | +2 Acrobazia, +1 Pulizia | curve · ritmo pulito | 3/4 |
| 5 | **Correzione nel tornante** | +3 Acrobazia, +1 Riflessi | tornanti | 4/5 |
| 9 | **Cambio di appoggio** | +3 Acrobazia, +2 Curva | esse e varianti | 5/6 |
| 14 | **Recupero su fondo mobile** | +4 Acrobazia, +2 Riflessi | terra o ghiaia · curve | 6/7 |
| 21 | **Controllo in appoggio** | +4 Acrobazia, +3 Curva | curve veloci · asciutto | 7/8 |

## Lettura e riflessi

| Livello | Tecnica | Bonus iniziale | Condizioni | Prova |
|---:|---|---|---|---|
| 2 | **Sguardo lontano** | +1 Riflessi, +1 Pulizia | strada · ritmo pulito | 3/4 |
| 5 | **Approccio a visibilità ridotta** | +2 Riflessi, +1 Frenata | visibilità ridotta · frenata anticipata | 4/5 |
| 9 | **Riferimenti notturni** | +3 Riflessi, +2 Pulizia | notte o nebbia · ritmo conservativo | 5/6 |
| 14 | **Lettura del misto urbano** | +4 Riflessi, +2 Curva | strada · esse e varianti | 6/7 |
| 21 | **Anticipo sul passo** | +4 Riflessi, +3 Frenata | strada · discesa | 7/8 |

## Duelli e decisione

| Livello | Tecnica | Bonus iniziale | Condizioni | Prova |
|---:|---|---|---|---|
| 3 | **Inseguimento paziente** | +1 Coraggio, +1 Pulizia | in recupero · ritmo pulito | 3/4 |
| 6 | **Sorpasso preparato** | +3 Coraggio, +1 Accelerata | preparazione sorpasso | 4/5 |
| 10 | **Attacco con margine** | +3 Coraggio, +2 Riflessi | sorpasso · asciutto | 5/6 |
| 15 | **Difesa ordinata** | +4 Coraggio, +2 Curva | difesa | 6/7 |
| 22 | **Duello sul bagnato** | +4 Coraggio, +3 Pulizia | in recupero · pioggia · ritmo pulito | 7/8 |

## Pioggia e bassa aderenza

| Livello | Tecnica | Bonus iniziale | Condizioni | Prova |
|---:|---|---|---|---|
| 3 | **Margine sul bagnato** | +2 Pulizia, +1 Frenata | pioggia · zone di frenata · frenata anticipata | 3/4 |
| 6 | **Riferimenti sul bagnato** | +3 Frenata, +1 Riflessi | pioggia · zone di frenata · frenata al riferimento | 4/5 |
| 10 | **Linea sul bagnato** | +3 Curva, +2 Pulizia | pioggia · curve · uscita privilegiata | 5/6 |
| 15 | **Controllo sulla neve** | +4 Acrobazia, +2 Accelerata | neve · ritmo conservativo | 6/7 |
| 22 | **Tornante innevato** | +4 Curva, +3 Frenata | neve · tornanti · frenata anticipata | 7/8 |

## Sterrato e percorsi difficili

| Livello | Tecnica | Bonus iniziale | Condizioni | Prova |
|---:|---|---|---|---|
| 3 | **Fondo letto** | +2 Riflessi, +1 Pulizia | terra o ghiaia · ritmo conservativo | 3/4 |
| 6 | **Ingresso su sterrato** | +3 Frenata, +1 Curva | terra o ghiaia · curve · frenata anticipata | 4/5 |
| 10 | **Rilancio su ghiaia** | +3 Accelerata, +2 Acrobazia | terra o ghiaia · curve · uscita privilegiata | 5/6 |
| 15 | **Tornante di montagna** | +4 Curva, +2 Frenata | strada · tornanti | 6/7 |
| 22 | **Discesa su sterrato** | +4 Acrobazia, +3 Frenata | terra o ghiaia · discesa · strada | 7/8 |

## Costanza e gestione

| Livello | Tecnica | Bonus iniziale | Condizioni | Prova |
|---:|---|---|---|---|
| 1 | **Guida regolare** | +1 Pulizia, +1 Riflessi | ritmo pulito | 3/4 |
| 4 | **Gas misurato** | +3 Accelerata, +1 Cambiata | ritmo conservativo · rettilinei | 4/5 |
| 8 | **Costanza sul circuito** | +2 Pulizia, +2 Cambiata | circuito · ritmo pulito | 5/6 |
| 13 | **Regolarità stradale** | +3 Pulizia, +2 Riflessi | strada · ritmo conservativo | 6/7 |
| 20 | **Costanza nel misto** | +4 Pulizia, +3 Curva | esse e varianti · circuito · ritmo pulito | 7/8 |

## Verifica e migrazione

Migrazioni versionate SQLite 0005 e PostgreSQL 0002: nuovo campo JSON dei progressi, equipaggiamento iniziale vuoto, rimozione dei soli ID gratuiti m1/m2/m3. Il percorso della frenata già superato resta valido.

Test: struttura dei 50 corsi, istruzioni tutte eseguibili, copertura delle otto abilità e dei contesti, prerequisiti, limiti dei benefici, rifiuto di progressi forgiati, fallimenti, persistenza e ripetizioni senza premi duplicati. Tutte le 50 prove sono state completate anche su una copia PostgreSQL del database reale, con invii finali concorrenti e un solo premio. Verificata la conservazione delle lezioni e della pratica precedenti; nessun test modifica la partita pubblica.

La migrazione sul servizio definitivo è stata applicata dopo backup completo: piloti, soldi, auto, lezioni e pratica preesistenti verificati invariati. La build pubblica contiene il catalogo e le API di apprendimento rifiutano accessi anonimi.
