const fs = require('fs');
const path = require('path');

const configJson = fs.readFileSync(path.resolve(__dirname, 'config.json'));
module.exports = JSON.parse(configJson.toString());

