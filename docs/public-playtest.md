# Playtest pubblico protetto

URL: https://server-klaro.tail6c534c.ts.net:8443/

Il Funnel HTTPS 8443 inoltra al gateway su `127.0.0.1:5184`.
La configurazione Funnel 443 preesistente resta invariata. Non occorrono
port forwarding sul FortiGate o accessi alla tailnet per i visitatori.

Il servizio `poketurismo-public.service` esegue `scripts/public-preview.mjs`:

- HTTP Basic obbligatorio per pagina, asset e API; credenziali in
  `.preview/public-access.json` (permessi 0600, escluso da Git).
- Serve soltanto la build `.preview/public-dist`, non il server Vite pubblico.
- Inoltra solo `/api` all'anteprima locale 5174, che sceglie il proprio backend
  e usa `.preview/game.db`. Non inoltrare al backend 3001/3002.
- Blocca scritture `/api/dev`, sorgenti, dotfile, database e sourcemap.
- Il frontend usa il giocatore 1: visitatori e sviluppatore condividono il
  salvataggio dell'anteprima. Non è autenticazione multiutente del gioco.
- L'API segue la versione di sviluppo; il frontend pubblico è uno snapshot
  e va ripubblicato dopo cambiamenti incompatibili.

## Aggiornare la build pubblica

```sh
VITE_API_BASE_URL=/api npm run build -- --configLoader native
```

Il loader nativo evita scritture nella directory `node_modules` condivisa.
Solo dopo una build riuscita, copiare `dist/` in `.preview/public-dist/`.
Non copiare `.env`, sorgenti o database. Riavviare il servizio pubblico
dopo modifiche al gateway o alle credenziali:

```sh
sudo systemctl restart poketurismo-public
```

## Stato e disattivazione

```sh
systemctl status poketurismo-public poketurismo-dev
tailscale funnel status
sudo tailscale funnel --https=8443 off
```

Non usare `tailscale funnel reset`: cancellerebbe anche l'altro sito.

Se il controllo HTTPS fallisce con `UNEXPECTED_EOF_WHILE_READING`, la connessione TLS si è interrotta prima della risposta HTTP. Non disabilitare la verifica dei certificati. Controllare prima `tailscale funnel status` e la salute locale su `http://127.0.0.1:5174/api/health`; lo script di consolidamento verifica anche password, salute e build direttamente sul gateway 5184 prima di provare HTTPS.

Per ripubblicare la configurazione prevista soltanto sulla 8443, dal terminale del server:

```sh
sudo tailscale funnel --bg --https=8443 http://127.0.0.1:5184
tailscale funnel status
```

Non modificare la 443. `--bg` mantiene il Funnel dopo l'uscita del comando. La ripubblicazione non garantisce la risoluzione di problemi di connettività Tailscale: ripetere il controllo HTTPS prima di consolidare. Se persiste, conservare l'output di `tailscale funnel status` per la diagnosi. Un errore di preflight interrompe il consolidamento prima di modificare updater, Compose o container.

Verifica: senza credenziali pagina/API devono rispondere 401; con credenziali
pagina, bundle e `/api/health` rispondono 200, `/.env` e `/server/index.js` 404,
le scritture `/api/dev` 403. Verificare anche tramite l'URL HTTPS pubblico.
