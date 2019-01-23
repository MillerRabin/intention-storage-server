const IntensionStorage = require('intension-storage');

const http2 = require('http2');
const fs = require('fs');

const server = http2.createSecureServer({
    key: fs.readFileSync('keys/localhost-key.pem'),
    cert: fs.readFileSync('keys/localhost-cert.pem')
});
server.on('error', (err) => console.error(err));

server.on('stream', (stream, headers) => {
    stream.respond({
        'content-type': 'text/html',
        ':status': 200
    });
    stream.end('<h1>Hello World</h1>');
});

server.listen(10010);



function onData() {

}

exports.intensionServer = IntensionStorage.create({
    title: 'can be Storage Server',
    input: 'Intension',
    output: 'Intension',
    onData: onData
});


function send(intension) {
    const client = http2.connect(intension.origin, {
        ca: fs.readFileSync('keys/localhost-cert.pem')
    });
    client.on('error', (err) => console.error(err));

    const req = client.request({ ':path': '/' });

    req.on('response', (headers, flags) => {
        for (const name in headers) {
            console.log(`${name}: ${headers[name]}`);
        }
    });

    req.setEncoding('utf8');
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
        console.log(`\n${data}`);
        client.close();
    });
    req.end();
}