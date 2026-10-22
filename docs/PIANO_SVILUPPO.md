# Poketurismo: stato e prossime priorità

Aggiornamento del 21 ottobre 2026: il playtest coinvolge un amico, quindi **identità personale e isolamento dei salvataggi precedono l'espansione della carriera**. Prima consolidare sviluppo/test sulla 5174 e salvare il lavoro in Git; poi migrare a un solo PostgreSQL per Auth e gioco. Procedura, limiti operativi e criteri di verifica sono in [AMBIENTE_UNICO.md](AMBIENTE_UNICO.md). Gli account e la migrazione non sono ancora implementati.

## Direzione

Carriera automobilistica individuale con collezione, tuning e gare tattiche a turni. Conservare l'identità Windows 98/Nokia/forum. Primo traguardo di prodotto: prima auto → prima gara → primo potenziamento → primo campionato.

## Punto 1: salvataggi e ambiente — implementato nella copia di sviluppo

- Saldo in centesimi interi; carburante, tipo di benzina e usura frazionaria persistenti.
- Inventario ricambi con quantità; pezzi smontati e sostituiti restituiti al magazzino.
- Mosse apprese ed equipaggiate salvate nel database.
- Acquisti, tuning, rifornimenti, allenamenti, premi e perdite gestiti dal server con transazioni e identificativi contro i doppi invii.
- Richieste fallite recuperabili con nuovo tentativo; checkpoint aggiornato anche se la risposta originale è andata persa.
- Migrazioni SQL versionate, backup SQLite coerenti e ripristino verificato dai test.
- File runtime rimossi dal versionamento nel branch di lavoro e ignorati da Git/Docker.
- Anteprima indipendente, Compose con volume dati esterno, aggiornamento codice senza hard reset preparati.

Resta il passaggio operativo della versione pubblica al volume esterno e al nuovo aggiornamento: non viene effettuato durante lo sviluppo. Prima provare l'anteprima. La procedura è in [TESTING.md](TESTING.md).

## Punto 2: gara tattica coerente — implementato nella copia di sviluppo

- Un motore puro condiviso, eseguito dal server per entrambe le modalità; interfaccia comune per circuito e clandestine.
- Il browser invia decisioni tattiche, tecnica e versione del checkpoint. Tempi, consumi, usura, distacco, esito e premi vengono decisi sul server.
- Gara riprendibile settore per settore e protezione dai turni duplicati o fuori ordine.
- Potenza e aderenza definiscono il potenziale; abilità e tecniche determinano quanto il pilota riesce a sfruttarlo. Non vengono aggiunti cavalli alle mosse.
- Peso dinamico, premium, pioggia/neve/fondo e visibilità hanno effetti; consumi e usura usano la stessa distanza normalizzata in entrambe le modalità.
- Avversari con vetture reali del catalogo e abilità definite; matchmaking simile sceglie una vettura, senza scalarne le statistiche su quelle del giocatore.
- Dettaglio di tempi, velocità, margine rispetto al potenziale, errori, traffico e consumi dopo ogni settore. Prima della scelta: stima di tempo, rischio e consumi.
- Sessioni personalizzate del sandbox senza premi, per evitare di trasformare gli strumenti di prova in una fonte di denaro.
- La stessa sequenza di mosse e lo stesso seme producono lo stesso risultato nei test.

Il nuovo Circuito Scuola ha otto decisioni e geometria esplicita; i tracciati storici vengono accorpati in massimo otto blocchi con geometria stimata. Undici scenari di bilanciamento ripetibili verificano vantaggio meccanico e abilità del pilota; i risultati sono in BILANCIAMENTO.md. Il bilanciamento resta da valutare anche giocando. Il meteo è quello del tracciato scelto; non è un sistema meteorologico dinamico.

## Primo percorso del pilota — implementato nella copia di sviluppo

Lezione sulla frenata, prova guidata su auto scuola in prestito, ricompensa unica di prima promozione e tecnica Rilascio progressivo. Pratica distinta per frenata anticipata, al riferimento e tardiva, con rendimenti decrescenti per percorso e limiti persistenti. Tecnica appresa/consolidata/padroneggiata, riepilogo dopo la gara e benefici meccanicamente limitati. Corsi preesistenti limitati a tre ripetizioni con benefici ridotti. La pratica si assegna sul server, a gara completata; replay e concorrenza non duplicano i premi.

La descrizione completa e il limite attuale del profilo condiviso senza login sono in [PROGRESSIONE_PILOTA.md](PROGRESSIONE_PILOTA.md). Questo è il primo percorso, non l'intera carriera.

## Punto 3: prima carriera completa — prossima priorità

1. Definire soldi iniziali, prima auto e obiettivi guidati.
2. Costruire tre campionati progressivi con avversari e premi riconoscibili.
3. Bilanciare costo dei ricambi, usura, rischio motore, consumi e ricompense usando partite reali.
4. Prevedere una via di recupero quando si resta senza soldi e con motore guasto.
5. Aggiungere abbandono del campionato e storico risultati; oggi l'abbandono della singola gara registra una sconfitta del round.
6. Rifinire navigazione, leggibilità su telefono e prima esperienza.

Completamento: un giocatore nuovo arriva al primo campionato vinto e a un potenziamento utile senza interventi manuali sul database.

## Punto 4: identità e accesso personale

Anticipato su richiesta dell'utente: Google e codice email con Supabase Auth, PostgreSQL unico per identità e gioco, proprietà dei dati ricavata dall'identità verificata e strumenti amministrativi protetti. Codice integrato e Google attivo sull’istanza pubblica dal 22 ottobre 2026, con collaudo di migrazione, reset e isolamento. Il primo login interattivo dell’utente resta da verificare; email OTP disabilitato finché SMTP non è configurato. Nuovi piloti con €10.000 e nessuna auto; salvataggio storico azzerato su richiesta e ruolo amministratore assegnato all’email verificata configurata privatamente. Stato, prove e procedura in [ACCOUNT_E_POSTGRES.md](ACCOUNT_E_POSTGRES.md).

## Punto 5: funzioni sociali

Dopo salvataggi, bilanciamento e identità: vetrine dei garage, classifiche, rivali asincroni e mercato fra giocatori, mantenendo transazioni e premi assegnati una volta sola.

## Prima decisione dopo la prova

Valutare se il ritmo delle gare e l'effetto delle mosse sono divertenti. La proposta è rifinire una carriera individuale corta prima di moltiplicare contenuti o aggiungere multiplayer. Se il test coinvolge persone esterne, anticipare il punto 4.
