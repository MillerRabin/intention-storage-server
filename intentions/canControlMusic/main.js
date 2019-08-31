const entityBuilder = require('./entityBuilder.js');
const musicConfig = {
    directories: [
        '\\\\192.168.0.110\\music\\mp3'
    ]
};

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

async function getEntities() {
    let res = await entityBuilder.getEntitiesData();
    if (res.taskKey == null) {
        await entityBuilder.build(musicConfig);
        return await entityBuilder.getEntitiesData();
    }
    return res;
}

exports.init = async (intentionStorage) => {
    const { taskKey, entities} = await getEntities();
    gEntities[0].key = taskKey;
    gEntities.push(...entities);
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