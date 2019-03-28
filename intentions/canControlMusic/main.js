const entityBuilder = require('./entityBuilder.js');

const gEntities = [
    {
        type: 'task',
        name: {
            name: 'Play music',
            en: 'play music',
            ru: 'включи музыку'
        },
        words: {
            ru: 'включи',
            en: 'play'
        },
        parameters: [{
            name: 'Music entity',
            ru: 'Какую музыку вы хотите?',
            en: 'What kind of music do you like?'
        }],
        intentions: [{
            title: 'Can play music',
            input: 'MusicEntry',
            output: 'TaskOperationInfo'
        }]
    }
];


entityBuilder.build();

exports.init = (intentionStorage) => {

};