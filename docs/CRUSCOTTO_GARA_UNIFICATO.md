# Cruscotto unico per tutte le gare

Il layout approvato dei campionati viene ora usato anche da gare singole, clandestine, prove a tempo, sfide asincrone Meet/SMS, allenamenti e prove della scuola guida, prove personalizzate e gare storiche. `RaceDashboard` espone un unico `RaceCockpit`, ottenuto dal precedente `ChampionshipCockpit`; ordine e dimensioni delle immagini del campionato conservati.

Ordine: titolo e condizioni → ambientazione/minimappa → propria auto a sinistra e rivale/sessione a destra → rilevamento → settore da affrontare → avvisi pertinenti → guida e confronto tattico → tre pulsanti per tempi, cronaca e pista → opzioni. Foto delle vetture cliccabili per tutti i dati; benzina con indicatore grafico, IP/IG e condizioni sempre presenti. Eliminati il vecchio confronto a tre colonne, il pannello strumenti intermedio, il riepilogo ripetuto sotto la mappa e la seconda descrizione del settore nei comandi storici.

## Adattamento alla modalità

- Campionati: classifica e vicini al rilevamento, rivale dinamico e tre strumenti finali come prima. La cronaca conserva gli avversari dei settori passati anche se nel frattempo tutti si sono ritirati.
- Duelli singoli e clandestini: due foto, posizione su due e distacco in secondi. Gare storiche ancora in metri, senza inventare tempi. Il rivale ritirato è indicato come tale, senza suggerire nuovi attacchi.
- Prova a tempo: solo la propria auto, con scheda Contro il cronometro sulla destra; tempo cumulato e ultimo settore, nessun riferimento fittizio o comando di sorpasso.
- Meet/SMS: scheda Fantasma cronometrico con nome dell’altro pilota e riferimento totale, se disponibile. Il distacco confronta soltanto i tempi cumulati dei settori già completati, in millisecondi, con vantaggio/ritardo espliciti. Se l’altro non ha ancora corso, l’interfaccia lo indica. La vettura interna di riferimento del motore non viene presentata come auto dell’altro giocatore. Opzioni corrette: tentativo unico, scadenza, nessun denaro/XP/usura di carriera e nessun record personale.
- Scuola guida: vettura in prestito, esercizi, consegna dell’istruttore, domande e feedback conservati. I corsi di duello mantengono il vero riferimento didattico e i comandi ammessi. Per allenamenti mirati il testo delle opzioni indica pratica e nessun XP.
- Percorsi personalizzati e scuola senza cartografia: scena pixel art già esistente e sequenza numerata dei veri settori/esercizi, con evidenza gialla. Non viene inventata una minimappa geografica o riciclato il layout del Circuito Scuola per esercizi diversi.

Comandi uniformi: Guida il settore, ritmo, staccata/traiettoria pertinenti, tecnica, confronto quando applicabile, stime e conferma. Strategia approfondita sotto la conferma in tutte le modalità. Stesse decisioni disponibili e stesse richieste API; cambiata solo la presentazione. A ogni settore i controlli ripartono dalle selezioni normali come prima. Su mobile il rilevamento riceve focus dopo l’avanzamento e il risultato alla conclusione, rispettando movimento ridotto. Popup con Escape e ritorno del focus; HUD e margini compatti anche fuori dai campionati.

## Verifica

326 test gioco e 12 account/gateway, lint e build superati. Aggiornate le aspettative dei vecchi test di presentazione per etichette e pulsanti spostati; aggiunti controlli dell’ordine e dell’assenza di rivali fittizi, più segno/unità/limiti dei rilevamenti fantasma.

Browser isolato a 320/390/1280 px su snapshot sintetici generati dal motore locale: gara singola, strada, cronometro, fantasma disponibile/in attesa, allenamento gratuito, personalizzata, scuola tecnica, scuola di duello, allenamento con domande, campionato attivo/concluso, storico, rivale ritirato e avvisi critici con nomi lunghi. Verificati ordine, foto affiancate, tutti i popup, Escape/focus, assenza di overflow, comandi inviati e reset a settore successivo, risultati finali e compatibilità del cruscotto campionato. Report e schermate in `.preview/all-races-qa`; le API del browser sono intercettate e nessuna partita pubblica viene giocata nel collaudo.

Nessun nuovo asset: tutte le immagini approvate riutilizzate, incluso il piazzale della scuola. Nessuna modifica a server, motore, regolamenti, premi, consumi, checkpoint, database o salvataggi. Nessuna migrazione o seed da applicare.

## Pubblicazione verificata

Rilasciato da `88c2058` sull’unica istanza 5174 e gateway 5184. Backup completo Auth/gioco e build precedente in `/home/klaro/.backups/poketurismo/all-races-20261030T001645Z`. Audit a servizi fermi: tutte le righe delle 32 tabelle identiche prima e dopo; nessuna scrittura, migrazione o azzeramento.

Controllate sulla build pubblicata sei modalità a 390/1280 px con sole risposte sintetiche intercettate in lettura. Health, immagine esistente del piazzale e primi 4 KiB JS/CSS confrontati con successo su entrambi i Funnel 443/8443. Servizi attivi, anteprima 5197 fermata e nessun listener legacy 5173/3001. Test esteso isolato: 15 scenari, 18 invii di comandi, tutti i popup e focus, nessun errore JavaScript o overflow.
