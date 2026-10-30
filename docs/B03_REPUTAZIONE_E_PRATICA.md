# B03 — Reputazione, rapporti e pratica di gara

Stato: completato e pubblicato. Nessuna migrazione, cancellazione o conversione dei progressi precedenti.

## Reputazione e prove storiche

Il riquadro richiudibile in Raduno → Gente del club mostra tre ambiti indipendenti, con barre Win98 e prossimo grado. Gradi comuni: Visitatore (0), Conosciuto (15), Affidabile (40), Punto di riferimento (90), Volto storico (160). I punti non aumentano IP/IG, prestazioni o abilità e non esistono penalità incrociate fra ambienti.

- Autodromo: gare di carriera effettivamente concluse su pista, 5 punti vincendo oppure 3 completando; sullo stesso tracciato fattori 100%, 50%, 25%, poi zero, con arrotondamento per difetto. Cambiare auto non azzera le ripetizioni. Ogni campionato distinto concluso aggiunge 15 punti, una volta sola per ID. Dati letti in ordine cronologico stabile.
- Clandestine: somma della reputazione nativa dei ritrovi, senza modificare streetState, accessi alle zone o premi precedenti.
- Raduni: 8 punti per ciascuno dei sei episodi B02 conclusi, 5 per il prologo B01 concluso. Nessun punto da visite, SMS, amicizie fra utenti, letture o esposizioni.
- Prove a tempo, sandbox, lezioni, sfide virtuali, ritiri, guasti e dati incompleti/ambigui non producono reputazione da gara. I risultati storici affidabili già presenti vengono riconosciuti tramite lettura; non si riscrivono i checkpoint per assegnare punti.

Proiezione privata in server/clubReputation.js e funzione pura shared/clubReputation.mjs: non è un secondo registro da sincronizzare con i risultati. L'apertura di telefono, profili o raduno non scrive progressi. I punteggi sono mostrati insieme alla fonte e alle condizioni degli inviti, senza moltiplicatori nascosti.

## Rapporti e contenuti sbloccati

Conoscenza a 5, Intesa a 20, Fiducia a 40, Amicizia consolidata a 65 punti. Contano i contatti effettivamente conosciuti e gli episodi pertinenti: 12 punti per episodio del personaggio. A Intesa si apre un ricordo personale nella scheda, sia nel raduno sia nel telefono.

Due inviti facoltativi riusano il motore narrativo con contratti separati:

- Rivincita tra amici con Lele: B02 concluso, Intesa e 40 reputazione ai raduni oppure nelle clandestine. Lele mantiene la Cinquecento gialla e le sue abilità fisse; auto propria stradale fino a 120 CV o prestito gratuito.
- I riferimenti di Giada: B02 concluso, Intesa e 40 reputazione in autodromo. Integra bianca e pilota fissi; auto propria fino a 160 CV o prestito gratuito. Tommaso assiste dal paddock.

Tre confronti completabili per ciascuno, senza obbligo di vittoria. Contributi di reputazione e rapporto: +4, +2, +1, poi serie conclusa. Lele conta nei Raduni; Giada nell'Autodromo. Sergio riconosce la partecipazione alle rivincite con Lele (+4 per ciascuna delle tre); Tommaso a quelle con Giada (+5 per ciascuna). Fonte: contatori di completamento persistiti, non azioni di lettura. Questo apre anche i ricordi di Sergio/Tommaso senza richiedere SMS o acquisti ripetuti.

Nessun denaro, XP o pratica abilità in questi confronti. Con il prestito la vettura personale resta invariata; con la propria auto carburante/usura sono reali. Requisiti controllati dal server prima di accettazione e partenza. Ritiro e guasto consentono di riprovare senza consumare un completamento. Premio economico e cap B02 restano invariati. Versione, tentativo e gara associata impediscono doppie conclusioni; SMS e contatori chiudono nella transazione del turno finale.

## Verifica delle abilità allenate in gara

Riscontro: la precedente statTrainingVersion 1 allenava soltanto frenata, curva e acceleratore. Gli allenamenti a scuola coprivano già tutte le otto abilità.

Le nuove gare tattiche di carriera usano statTrainingVersion 2. Situazioni e scelte effettive, in settori senza errore, possono dare pratica a:

| Abilità | Situazione utile |
|---|---|
| Frenata | Curva con frenata al riferimento |
| Curva | Percorrenza privilegiata, ritmo misurato |
| Acceleratore | Uscita privilegiata, ritmo misurato |
| Pulizia | Ritmo pulito, niente staccata tardiva o manovra aggressiva |
| Riflessi | Lettura prudente di visibilità ridotta, notte/nebbia o imprevisto registrato |
| Cambiata | Coordinazione dell'erogazione negli allunghi, ritmo pulito e uscita ordinata; non viene inventato un selettore manuale di marce |
| Controllo vettura | Curve su fondo/meteo difficile o pendenza significativa, guida conservativa e uscita ordinata |
| Coraggio | Attacco eseguito correttamente, frenata al riferimento e traiettoria adatta, senza cercare un sorpasso rischioso |

Non tutte si allenano in ogni gara: servono le situazioni pertinenti. Massimo 6 pratica per singola abilità e 16 complessivi per gara; ripetizioni per abilità/percorso al 100%, 50%, 25%, poi esaurite. Riutilizzate le allowance già consumate: nessun reset dei precedenti. Restano 100 pratica per +1 abilità e tetto 100. Allenamenti specifici a pagamento, sei punti per livello, tecniche e formula IG invariati. Lezioni, prestiti narrativi, Meet e sandbox conservano le rispettive esclusioni. Gare già iniziate con flag 1 conservano il vecchio comportamento.

Il riepilogo finale mostra soltanto le abilità effettivamente allenate e gli eventuali +1 permanenti, ora con cornice Win98 e font più leggibile. Sara aggiornata.

## Collaudo

353 test gioco e 13 account/gateway superati, lint/build validi. Test su: retrocompatibilità pratica1, copertura delle otto abilità, assenza di bonus fuori contesto/settori con errore, tetto complessivo e allowance esaurite; reputazione storica e clandestina preservata, nessun progresso da letture, requisiti degli inviti, tre completamenti massimi, nessun denaro/XP extra.

Su PostgreSQL dedicato con sole copie dei cataloghi: tre confronti con ciascun rivale, accettazioni e turni finali simultanei, contatori una volta sola, quarto invito rifiutato, ricordi di Sergio e Tommaso sbloccati, saldo/XP/garage e reputazione clandestina invariati. Browser reale 320/390/1280: reputazione, tre barre, ricordi, inviti nei luoghi corretti e rivincita completa in prestito. Rapporti in .preview/b03-qa.


Pubblicato il 30 ottobre 2026, commit sorgenti f646263, unica istanza 5174/gateway5184. Backup /home/klaro/.backups/poketurismo/b03-20261030T190714Z e servizio completo Auth+gioco. Confronto delle 32 tabelle: tutte le righe esistenti identiche, nessuna migrazione o reset. Health e servizi attivi; frontend distribuito verificato a 320/390/1280 con tutte le API reindirizzate al database temporaneo, nessuna azione sui giocatori pubblici.
