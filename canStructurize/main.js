const IntensionStorage = require('intension-storage');

function onData(status) {
    if (status !== 'data')
        return {
        protocol: 'unknown',
        fields: [{ field1: 'unknown'}, { field2: 'unknown'}]
    };
}

exports.intensionServer = IntensionStorage.create({
    title: 'can Structurize',
    input: 'SpeechRecognition',
    output: 'Protocol',
    onData: onData
});