// Postbuild signal: the development supervisor performs the actual restart.
import { mkdirSync, writeFileSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const directory = fileURLToPath(new URL('../.preview/', import.meta.url));
mkdirSync(directory, { recursive: true });
const file = `${directory}restart.request`;
const temporary = `${file}.${process.pid}.tmp`;
writeFileSync(temporary, `${Date.now()}-${process.pid}\n`);
renameSync(temporary, file);
console.log('Segnale di riavvio sviluppo aggiornato.');
