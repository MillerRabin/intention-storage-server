const entityBuilder = require('./entityBuilder.js');

const gEntities = [
    {
        type: 'task',
        name: {
            general: 'Play music',
            en: 'play music',
            ru: 'включи музыку'
        },
        words: {
            ru: 'включить',
            en: 'play'
        },
        parameters: [{
            general: 'music',
            ru: 'Какую музыку вы хотите?',
            en: 'What kind of music do you like?'
        }],
        intentions: [{
            title: 'Need play music',
            input: 'TaskOperationInfo',
            output: 'Music'
        }]
    }
];


entityBuilder.build();

exports.init = async (intentionStorage) => {
    const res = await entityBuilder.load();
    gEntities[0].key = res.taskKey;
    const entities = res.entities;
    gEntities.push(...Object.values(entities));
    intentionStorage.createIntention({
        title: {
            en: 'Music types for music control',
            ru: 'Типы и намерения для управления музыкой'
        },
        input: 'None',
        output: 'EntitiesInfo',
        onData: async function onData(status, intention, data) {
            if (status == 'accept') {
                intention.send('data', this, gEntities);
                return;
            }
            if (status == 'error') {
                console.log(data);
            }
        }
    });

    intentionStorage.createIntention({
        title: {
            en: 'Can play music',
            ru: 'Могу играть музыку'
        },
        input: 'Music',
        output: 'TaskOperationInfo',
        onData: async function onData(status, intention, value) {
            if (status != 'data') return;
            try {
                console.log(intention.parameters);
                //intention.send('completed', this, { success: true, data: value });
            } catch (e) {
                console.log(e);
                intention.send('error', this, e);
            }
        }
    });

};