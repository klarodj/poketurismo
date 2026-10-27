if(!require('node:fs').existsSync(require('node:path').resolve(__dirname,'../../public/images/car')))throw Error('Vernici fotografiche archiviate. Usa build-pixel-catalog.cjs per gli asset attivi.');
// Compatibility entry point: preserve the reviewed Seicento mask and seven-colour palette.
// The first prototype's draft and protected regions remain archived alongside this script.
require('./build-catalog.cjs');
