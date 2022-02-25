const constants = require("./constants.js");
const solanaWeb3 = require("@solana/web3.js");

async function getBalance() {
  const connection = new solanaWeb3.Connection(
    solanaWeb3.clusterApiUrl("mainnet-beta"),
    "confirmed"
  );
  const balance = await connection.getBalance(constants.keypair.publicKey);
  return balance / constants.SOL_DIV;
}

exports.init = async (intentionStorage, consIntention) => {
  return await intentionStorage.createIntention({
    title: {
      en: "Can show solana balance",
      ru: "Могу показывать баланс Соланы",
    },
    input: "SolanaBalance",
    output: "TaskOperationInfo",
    onData: async function onData(status, intention, value) {
      if (status != "data") return;
      try {
        const balance = await getBalance();
        await consIntention.accepted.send({
          context: "Solana balance",
          text: {
            en: `Your balance is ${balance} Sol`,
            ru: `Ваш баланс ${balance} Sol`,
          },
        });
        intention.send("completed", this, { success: true, data: value });
      } catch (e) {
        console.log(e);
        intention.send("error", this, e);
      }
    },
  });
};
