# Primo percorso di crescita del pilota

La crescita ha tre livelli distinti: esperienza di carriera, pratica dei fondamentali e padronanza delle tecniche. Questo primo percorso copre la frenata. Gli attributi esistenti e le tecniche già conosciute vengono conservati.

## Percorso giocabile

Dal **Garage → Scuola guida**:

1. Leggere la lezione «Frenare con criterio» e confermare la lettura. Non vengono assegnati XP o statistiche per il solo clic.
2. Avviare la prova di quattro esercizi, riprendibile come una gara normale. Si usa un'auto scuola fissa, senza consumare o usurare la vettura del giocatore; è disponibile anche senza un'auto equipaggiata.
3. Seguire le consegne: anticipata, al riferimento, tardiva, poi al riferimento privilegiando l'uscita. Ritmo pulito o conservativo. La prova richiede almeno tre esercizi corretti e almeno uno per ciascun tipo di frenata. Conta la decisione, non la vittoria sull'istruttore o un errore casuale. Non ci sono duelli né guasti nell'esercitazione.
4. La prima promozione assegna 40 XP, fino a 4 punti di pratica per ogni fondamentale e la tecnica «Rilascio progressivo». Viene equipaggiata se c'è spazio, senza sostituire tecniche scelte dal giocatore. Ripetere la prova è gratuito e non dà altre ricompense.

## Pratica in gara

- Contano solo gare tattiche nuove e completate, senza ritiro o abbandono. I progressi si applicano alla gara successiva, senza cambiare il pilota a metà sessione.
- Ogni zona di frenata affrontata assegna 2 punti al tipo di frenata scelto; un errore insegna comunque 1 punto. Un rettilineo senza frenata non assegna pratica. Massimo 6 punti per fondamentale per gara.
- Sul medesimo percorso i primi tre utilizzi utili di ciascun fondamentale valgono 100%, 50%, 25%, arrotondati per difetto; dal quarto non aggiungono punti. Anticipata, riferimento, tardiva e tecnica hanno contatori separati. Cambiare fra circuito e strada sullo stesso percorso non azzera il contatore.
- I punti di ciascun fondamentale si fermano a 120. La tecnica si allena solo se effettivamente scelta in una zona di frenata, con massimo 6 punti per gara e limite di 60 complessivi.
- Il Circuito Scuola dimostrativo assegna pratica limitata, ma nessun XP o denaro. Avversari e percorsi personalizzati non assegnano progressi. Le sessioni precedenti all'introduzione di questo sistema non ricevono pratica retroattiva.
- Una gara ordinaria completata senza una ricompensa XP già prevista assegna 20 XP di partecipazione. Non vale per sandbox, scuola guida, ritiri o abbandoni. I premi di vittoria e campionato restano quelli previsti dall'evento.

La familiarità con una frenata aggiunge al massimo 0,012 all'efficienza di frenata usata dal pilota, riduce al massimo del 15% il rischio relativo di errore e del 12% la perdita d'uscita della staccata tardiva. Gli effetti valgono solo nelle zone di frenata. Non modifica cavalli, aderenza, massa o capacità fisiche dei freni. La staccata tardiva continua a comportare compromessi anche al massimo livello.

## Rilascio progressivo

La tecnica può essere usata solo in una zona di frenata, inclusa quella in fondo a un rettilineo. Le tre padronanze sono:

| Padronanza | Pratica tecnica | Bonus abilità |
|---|---:|---|
| Appresa | 0–19 | +2 frenata, +1 pulizia |
| Consolidata | 20–59 | +3 frenata, +2 pulizia |
| Padroneggiata | 60 | +4 frenata, +3 pulizia |

Si può usare una sola tecnica per settore, con massimo quattro equipaggiate. Le tecniche aiutano a sfruttare l'auto; non ne alzano i limiti meccanici.

## Corsi preesistenti

I vecchi corsi di statistiche restano disponibili con massimo tre completamenti per corso. I guadagni e gli XP valgono 100%, 50%, 25% del valore iniziale, con minimo 1 punto di statistica. Il costo resta quello indicato; l'interfaccia mostra il prossimo beneficio ridotto. I corsi che sbloccano una tecnica restano utilizzabili una sola volta. I guadagni storici vengono conservati; il conteggio delle ripetizioni parte dall'introduzione di questo sistema.

## Protezioni e limiti

Il browser invia soltanto la scelta. Pilota, auto scuola, obiettivi, abilità, probabilità, premi e conteggi vengono costruiti o letti dal server. Non esistono API che accettino punti di pratica, certificati o risultati dichiarati dal client. Snapshot di gara, progressi, inventario e XP vengono salvati nella stessa transazione, con controllo della versione e identificativi di operazione contro retry, replay e invii concorrenti. SQLite impone anche i limiti numerici di pratica.

Questo protegge dall'alterazione dei valori e dal doppio incasso delle operazioni; **non costituisce autenticazione o protezione contro bot**. L'anteprima resta un prototipo con profilo condiviso: l'API usa ancora `userId` senza login e non separa l'identità di persone diverse. Prima di pubblicare una carriera competitiva servono accessi personali, sessioni autenticate, proprietà ricavata dalla sessione, restrizioni agli strumenti di sviluppo e limiti alle richieste. Non dichiarare il gioco inviolabile.

## Prossimi passi

Provare la crescita con un pilota nuovo e arrivare al primo campionato. Valutare ritmo dei guadagni, utilità della tecnica e chiarezza dei consigli. Solo dopo estendere il percorso a traiettoria, rilancio e duelli, aggiungere lezioni avanzate e sostituire gradualmente i corsi acquistabili con prove guidate.
