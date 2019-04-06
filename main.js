const { IntentionStorage } = require('intention-storage');
const controlMusic = require('./intentions/canControlMusic/main.js');


const intentionStorage = new IntentionStorage();
controlMusic.init(intentionStorage);

const storageServer = intentionStorage.createServer({ address: 'localhost' });


console.log(`Server is listening at ${storageServer.port}`);

/*intentionStorage.createIntention({
    title: {
        en: 'Accept tasks',
        ru: 'Принимаю задачи'
    },
    input: 'TaskInfo',
    output: 'TaskOperationInfo',
    onData: async (status, intention, value) => {
        if (status == 'data')
            console.log(value);
        if (status == 'error')
            console.log(value);
    }
});*/
