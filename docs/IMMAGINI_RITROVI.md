# Immagini dei ritrovi clandestini · 29 ottobre 2026

Cinque scene originali generate singolarmente con image_gen built-in per i cinque ID stabili del catalogo. Ambientazione provincia del Nord Italia intorno al 2002, illustrazioni pixel art serali, nessun elemento contemporaneo o cambio a località/regole.

| ID | Scena | File pubblico |
| --- | --- | --- |
| parking | Centro commerciale chiuso, utilitarie e lampioni | public/images/world/street-zones/parking.png |
| industrial | Officine e capannoni della Bassa | public/images/world/street-zones/industrial.png |
| coast | Piazzale sul lago lombardo, bar, motorini e montagne | public/images/world/street-zones/coast.png |
| mountain | Bar del passo, tornante e vetture anni Novanta | public/images/world/street-zones/mountain.png |
| highway | Area di servizio in tangenziale, distributore e ritrovo al caffè | public/images/world/street-zones/highway.png |

Prompt completi e provenienza: tools/street-art/records.json. Originali generati conservati in tools/street-art/inputs, non pubblicati dal gateway. Normalizzazione nel formato nativo 320×180 del mondo tramite campionamento nearest-neighbour, senza ritocchi manuali o conversione delle vecchie immagini. Builder `node tools/street-art/build.cjs`; impronte sorgenti/output in tools/street-art/manifest.json.

shared/streetVisuals.mjs collega gli ID alle immagini senza alterare STREET_ZONES o contratti salvati. Anteprima decorativa in ogni pulsante del selettore, visibile anche per i luoghi bloccati. Entrando in un ritrovo accessibile la singola immagine in cima alla finestra sostituisce il banner generale: nessun secondo banner ridondante. Tornando all’elenco, torna l’immagine generale e nessun luogo resta preselezionato. Nessun cambio a incontri, accessi, puntate, rivali o progressi.

Controlli: lint/build e browser a 320/390/1280px, tutte e cinque le anteprime caricate, cinque banner corretti su ogni larghezza, ritorno senza preselezione, nessun overflow o errore JavaScript. Browser con stato e ritrovi sostituiti localmente e API d’incontro simulate, nessuna scrittura o offerta creata nel database pubblico; letture iniziali della sola proiezione del giocatore. Schermate e report in .preview/street-zones-qa. Istanza unica e gateway riavviati dal postbuild; nessun reset di salvataggi.

Pubblicazione verificata: gateway locale e origini pubbliche 443/8443 restituiscono tutte le cinque PNG; primi 4 KiB confrontati con i file della build tramite richieste Range 206. Gli asset completi sono inclusi nella build e verificati dal caricamento browser locale. Report public-report.json nella cartella QA.
