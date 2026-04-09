# 🏁 PokeTurismo - Racing Game Dashboard

Benvenuto in **PokeTurismo**, un'applicazione web gestionale e sim-racing ispirata all'estetica "nostalgiacore" (Windows 98/Nokia era). Il progetto è composto da un frontend React moderno e un backend Node.js con database SQLite gestito tramite Prisma.

---

## 🛠️ Prerequisiti Tecnici

Per eseguire l'applicazione o configurare un nuovo server di sviluppo, assicurati di avere installato:

1.  **Node.js**: Versione **18.x** o superiore (LTS raccomandata).
2.  **npm**: Solitamente incluso con Node.js.
3.  **Git**: Per la clonazione del repository.
4.  **SQLite**: (Opzionale per debug diretto) Il database è file-based e gestito da Prisma.
5.  **Test browser**: Chrome, Edge o Firefox (l'estetica è ottimizzata per browser moderni).

---

## 🚀 Setup Locale (Sviluppo)

Segui questi passaggi per far partire l'intero ambiente sul tuo computer.

### 1. Clonazione del Progetto
```bash
git clone <url-del-repo>
cd PokeTurismo
```

### 2. Configurazione Backend (API)
Il backend gestisce i dati dei piloti, le auto nel garage e il mercato dell'usato.

1.  Spostati nella directory del server:
    ```bash
    cd server
    ```
2.  Installa le dipendenze:
    ```bash
    npm install
    ```
3.  Configura l'ambiente:
    Crea un file `.env` nella cartella `server/` (se non esiste già):
    ```env
    DATABASE_URL="file:./dev.db"
    PORT=3001
    ```
4.  Inizializza il database (Prisma):
    ```bash
    npx prisma generate
    npx prisma db push
    ```
5.  **Importazione Dati (Seed)**:
    Se hai bisogno di caricare i dati iniziali dal file `db_old.sql`:
    ```bash
    node import-sql.js
    ```
6.  Avvia il server in modalità sviluppo:
    ```bash
    npm run dev
    ```
    *Il server sarà attivo su: `http://localhost:3001`*

### 3. Configurazione Frontend (App)
1.  Torna nella root del progetto:
    ```bash
    cd ..
    ```
2.  Installa le dipendenze:
    ```bash
    npm install
    ```
3.  Avvia il frontend (Vite):
    ```bash
    npm run dev
    ```
    *L'app sarà disponibile su: `http://localhost:5173`*

---

## 📦 Migrazione su un Nuovo Server

Se devi spostare il progetto su un nuovo server di sviluppo/produzione, segui questa checklist:

1.  **Installazione Runtime**: Installa Node.js LTS sul server.
2.  **Installazione Process Manager**: Si consiglia **PM2** per mantenere il server attivo in background:
    ```bash
    npm install -g pm2
    ```
3.  **Setup Progetto**:
    *   Copia i file o usa `git clone`.
    *   Esegui `npm install` sia nella root che in `server/`.
4.  **Produzione**:
    *   **Backend**: Avvia con PM2:
        ```bash
        cd server
        pm2 start index.js --name "poketurismo-api"
        ```
    *   **Frontend**: Genera la build statica:
        ```bash
        npm run build
        ```
    *   Configura un reverse proxy (come **Nginx**) per servire la cartella `dist/` e reindirizzare le chiamate `/api` verso la porta 3001.

---

## 🧬 Tecnologie Utilizzate

-   **Frontend**: React 19, Vite, Tailwind CSS, Zustand (State Management), React Router.
-   **Backend**: Node.js, Express.
-   **Database**: SQLite via Prisma ORM.
-   **Design**: Custom CSS per "Windows 98 Style" & "Nokia UI".

---

## 📂 Struttura Cartelle
-   `/src`: Codice sorgente React (Pagine, Componenti, Store).
-   `/server`: Backend Express e Prisma Schema.
-   `/public`: Asset statici (immagini auto, icone).
-   `db_old.sql`: Dump SQL originale per importazione dati.
