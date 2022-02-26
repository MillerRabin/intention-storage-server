const constants = require('./constants.js');
const solanaWeb3 = require("@solana/web3.js");
const iBalance = require('./balance.js');

function getParameters(value) {
  const contact = value.parameters.find(p => p.name == 'SolanaContact');
  const cAmount = value.parameters.find(p => p.name == 'SolanaAmount');
  const amount = Number(cAmount.value) * solanaWeb3.LAMPORTS_PER_SOL;
  return { contact: contact.value, amount, name: contact.words[0].en };
}

async function showNotEnoughMoneyError(consIntention, amount) {
  const cAmount = amount / solanaWeb3.LAMPORTS_PER_SOL;
  await consIntention.accepted.send({
    context: "Transfer money",
    text: {
      en: `You tried to send ${cAmount} sol<br/>. You have Not enough money`,
      ru: `Вы пытались перевести ${cAmount} сол.<br/> У вас недостаточно средств`
    },
  });
}

async function showBalance(consIntention, connection) {
  const amount = await iBalance.getBalance(connection);
  const cAmount = amount / solanaWeb3.LAMPORTS_PER_SOL;
  await consIntention.accepted.send({
    context: "Transfer money",
    text: {
      en: `Your balance is ${cAmount} sol`,
      ru: `Ваш баланс ${cAmount} sol`
    },
  });
}

async function showSuccessTransfer(consIntention, contact, name, amount) {
  const cAmount = amount / solanaWeb3.LAMPORTS_PER_SOL;
  await consIntention.accepted.send({
    context: "Transfer money",
    text: {
      en: `Transferred ${cAmount} sol to<br/>${name}<br/>${contact}`,
      ru: `Переведено ${cAmount} sol для<br/>${name}<br/>${contact}`
    },
  });
}

async function transferMoney(consIntention, params) {
  try {
    const connection = new solanaWeb3.Connection(
      solanaWeb3.clusterApiUrl("mainnet-beta"),
      "confirmed"
    );

    const sBalance = await iBalance.getBalance(connection);
    const lamports =  Number(params.amount);
    if (sBalance <= lamports) {
      await showNotEnoughMoneyError(consIntention, lamports);
      await showBalance(consIntention, connection);
      return;
    }
      
    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: constants.keypair.publicKey,
        toPubkey: new solanaWeb3.PublicKey(params.contact),
        lamports
      }),
    );
  
    await solanaWeb3.sendAndConfirmTransaction(
      connection,
      transaction,
      [constants.keypair]
    );

    await showSuccessTransfer(consIntention, params.contact, params.name, params.amount);
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