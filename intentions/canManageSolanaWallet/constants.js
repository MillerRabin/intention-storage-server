const solanaWeb3 = require("@solana/web3.js");
const fs = require('fs');
const path = require('path');
const Base58 = require("base-58");
const pKeyStr = fs.readFileSync(path.resolve(__dirname, '..', '..', '.credentials.json')).toString('utf8');
const pKey = Base58.decode(JSON.parse(pKeyStr).privateKey);
const keypair = solanaWeb3.Keypair.fromSecretKey(pKey);


module.exports = {
    keypair
};