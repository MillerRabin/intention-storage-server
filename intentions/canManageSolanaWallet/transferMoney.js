const constants = require('./constants.js');
const solanaWeb3 = require("@solana/web3.js");

function getParameters(value) {
  const contact = value.parameters.find(p => p.name == 'SolanaContact');
  const amount = 0.01 * constants.SOL_DIV;
  return { contact: contact.value, amount };
}

async function transferMoney(consIntention, params) {
  try {
    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("mainnet-beta"),
      "confirmed"
    );
    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: constants.keypair.publicKey,
        toPubkey: new solanaWeb3.PublicKey(params.contact),
        lamports: solanaWeb3.LAMPORTS_PER_SOL / 100,
      }),
    );
  
    await solanaWeb3.sendAndConfirmTransaction(
      connection,
      transaction,
      [constants.keypair]
    );
  
    await consIntention.accepted.send({
      context: "Transfer money",
      text: {
        en: `Transfered ${params.amount} sol to ${params.contact}`,
        ru: `Переведено ${params.amount} sol на ${params.contact}`
      },
    });
  } catch (e) {
    console.log(e);
    await consIntention.accepted.send({
      context: "Transfer money",
      text: {
        en: `Transfer error`,
        ru: `Ошибка перевода`
      },
    });
  }
}

exports.init = async (intentionStorage, consIntention) => {
    return await intentionStorage.createIntention({
        title: {
          en: "Can transfer sol",
          ru: "Могу перевести деньги в Солана",
        },
        input: "SolanaResult",
        output: "TaskOperationInfo",
        onData: async function onData(status, intention, value) {
          if (status != "data") return;
          try {
            const pars = getParameters(value);
            transferMoney(consIntention, pars, value);
            await intention.send("completed", this, { success: true, data: value });
          } catch (e) {
            console.log(e);
            intention.send("error", this, e);
          }
        },
    });
}