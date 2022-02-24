const { IntentionStorage } = require('intention-storage');
const controlMusic = require('./intentions/canControlMusic/main.js');

const intentionStorage = new IntentionStorage();
controlMusic.init(intentionStorage);

intentionStorage.createServer({ address: 'localhost' }).then((storageServer) => {
    console.log(`Server listens on port ${storageServer.socketServer.port}`);    
});

