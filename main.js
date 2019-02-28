const { IntentionStorage } = require('intention-storage');

const intentionStorage = new IntentionStorage();
const storageServer = intentionStorage.createServer({ address: 'localhost' });

console.log(`Server is listening at ${storageServer.port}`);

intentionStorage.createIntention({
    title: {
        en: 'Need possibility to get structurized user input',
        ru: 'Нужна возможность принимать структурированный пользовательский ввод'
    },
    input: 'Recognition',
    output: 'Entities',
    onData: async (status, intention, value) => {
        if (status == 'data')
            console.log(value);
        if (status == 'error')
            console.log(value);
    }
});
