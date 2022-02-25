const iConsole = require('./console.js');
const iBalance = require('./balance.js');
const iTranfer = require('./transferMoney.js');
const gEntities = require('./entities.js');

exports.init = async (intentionStorage) => {
  intentionStorage.createIntention({
    title: {
      en: "Intention types for Solana wallet",
      ru: "Типы для Управления кошельком Солана",
    },
    input: "None",
    output: "EntitiesInfo",
    onData: async function onData(status, intention, data) {
      if (status == "accepted") {
        intention.send("data", this, gEntities);
        return;
      }
      if (status == "error") {
        console.log(data);
      }
    },
  });

  consIntention = await iConsole.init(intentionStorage);
  await iBalance.init(intentionStorage, consIntention);
  await iTranfer.init(intentionStorage, consIntention);
};
