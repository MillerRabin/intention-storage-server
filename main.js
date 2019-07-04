const { IntentionStorage } = require('intention-storage');
const controlMusic = require('./intentions/canControlMusic/main.js');

const intentionStorage = new IntentionStorage();
controlMusic.init(intentionStorage);

const storageServer = intentionStorage.createServer({ address: 'localhost' });

console.log(`Server listens on port ${storageServer.port}`);