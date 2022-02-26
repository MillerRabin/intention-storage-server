const { IntentionStorage } = require("intention-storage");
const controlMusic = require("./intentions/canControlMusic/main.js");
const solanaWallet = require("./intentions/canManageSolanaWallet/main.js");

const intentionStorage = new IntentionStorage();
controlMusic.init(intentionStorage);
solanaWallet.init(intentionStorage);

intentionStorage.createServer({ address: "10.91.5.4", useSocket: false, useWebRTC: true }).then((storageServer) => {
    const connParams = [];
    if (storageServer.webRTCAnswer != null) connParams.push("webRTC");
    if (storageServer.socketServer != null)
      connParams.push(`websocket port ${storageServer.socketServer.port}`);
    if (connParams.length == 0)
      throw new Error('wrong configuration');
    console.log(`Server listens using ${connParams.join(' and ')}`);
  });


  process.on("unhandledRejection", function (reason, p) {
    console.log("Possibly Unhandled Rejection at: Promise ", p," reason: ", reason);
  });