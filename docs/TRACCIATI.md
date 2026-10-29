Aggiornamento: vedere [Sezioni e circuiti](REVISIONE_SEZIONI_E_PISTE.md), che estende il catalogo senza modificare lezioni o gare congelate.

# Catalogo tracciati

20 nuovi percorsi: 10 circuiti e 10 strade punto a punto. Catalogo in `shared/trackCatalog.mjs`, importazione additiva in `scripts/seed-tracks.cjs` (anteprima senza argomenti, applicazione con `--apply`). Lo script non modifica i tracciati precedenti, i calendari dei campionati o i salvataggi e non duplica un percorso già presente con lo stesso nome. Transazione serializzabile per l'intero lotto.

Le località sono reali; sequenze, distanze delle prove stradali, dislivelli e condizioni sono interpretazioni per il gioco, senza rilievi GPS. La variante innevata del Grossglockner è uno scenario virtuale. I circuiti impiegano un giro, le strade una sola traversata. Il motore raggruppa i settori in otto decisioni: i chilometri totali restano quelli del percorso. `Track.lenght` contiene metri per questo catalogo, compatibili con la conversione già presente nel motore e nell'anteprima. La mappa è schematica, non una riproduzione della planimetria reale.

La difficoltà 1–5 è un'indicazione editoriale: la difficoltà effettiva dipende da geometria, meteo, auto e pilota; non è un requisito di livello. Circuiti nuovi disponibili in Autodromo, strade nuove nelle corse su strada. I tracciati precedenti restano accessibili per compatibilità. Nessun campionato o premio nuovo è creato automaticamente.

| Circuito | Location | Difficoltà | Condizioni |
|---|---|---:|---|
| Mugello | Toscana, Italia | 3 | Sereno |
| Imola | Emilia-Romagna, Italia | 3 | Sereno |
| Vallelunga | Lazio, Italia | 2 | Sereno |
| Tsukuba | Ibaraki, Giappone | 1 | Sereno |
| Suzuka | Mie, Giappone | 4 | Pioggia |
| Brands Hatch | Kent, Regno Unito | 3 | Nebbia |
| Spa | Ardenne, Belgio | 5 | Pioggia |
| Laguna Seca | California, Stati Uniti | 3 | Sereno |
| Interlagos | San Paolo, Brasile | 4 | Pioggia |
| Estoril | Cascais, Portogallo | 2 | Sereno |

| Punto a punto | Distanza di gioco | Difficoltà | Condizioni |
|---|---:|---:|---|
| Stelvio: Prato → passo, Italia | 12 km | 4 | Sereno |
| Futa: Barberino → passo, Italia | 9,5 km | 2 | Sereno |
| Amalfitana: Maiori → Minori, Italia | 3,2 km | 1 | Sereno |
| Turini: La Bollène → colle, Francia | 12,5 km | 4 | Notte |
| Grossglockner: Ferleiten → Fuscher Törl, Austria | 13 km | 5 | Neve |
| Irohazaka: Nikko → Akechidaira, Giappone | 8,5 km | 4 | Nebbia |
| Hakone: lago Ashi → crinale, Giappone | 7 km | 3 | Pioggia |
| Transfăgărășan: Bâlea cascata → lago, Romania | 11 km | 4 | Sereno |
| Great Ocean Road: Lorne → Wye River, Australia | 16 km | 2 | Sereno |
| Trollstigen: altopiano → valle, Norvegia | 7,5 km | 5 | Pioggia |

Riferimenti consultati per l'ambientazione: [Mugello, descrizione ufficiale della pista](https://ww2.mugellocircuit.it/it/pista/descrizione-pista), [JNTO, Irohazaka](https://www.japan.travel/en/spot/301/), [Grossglockner, sito ufficiale](https://www.grossglockner.at/). Non viene dichiarata accuratezza cartografica delle interpretazioni.

Verifiche: importazione su copia PostgreSQL, seconda esecuzione senza duplicati, conservazione dei tracciati precedenti; tutti e 20 i percorsi completati con il motore tattico, lunghezze geometriche coerenti e tempi finiti. Lint e build superati.
