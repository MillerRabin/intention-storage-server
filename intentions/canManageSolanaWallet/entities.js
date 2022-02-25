const IntentionStorage = require("intention-storage");

module.exports = [
    {
      type: "task",
      key: IntentionStorage.generateUUID(),
      name: {
        general: "Manage Solana Wallet",
        en: "give me balance solana",
        ru: "Покажи мне баланс солана",
      },
      words: {
        ru: "показать баланс",
        en: "give balance",
      },
      parameters: [],
      intentions: [
        {
          title: "Need to show solana balance",
          input: "TaskOperationInfo",
          output: "SolanaBalance",
        },
      ],
    },
    {
      type: 'task',
      key: IntentionStorage.generateUUID(),
      name: {
          general: 'Transfer money',
          en: 'Transfer money',
          ru: 'Перевести деньги'
      },
      words: {
          ru: 'Перевести деньга',
          en: 'Transfer money'
      },
      parameters: [{
          general: ['SolanaContact'],
          ru: 'Кому?',
          en: 'Where?'
      }],
      intentions: [{
          title: 'Tranfer money to recipient',
          input: 'TaskOperationInfo',
          output: 'SolanaResult',
          value: 'send'
      }]
    }, {
        type: 'type',
        name: {
            general: 'SolanaContact',
            en: 'Solana contact',
            ru: 'Контакт Солана'
        },
        words: [{
            ru: 'Алихан',
            en: 'Alihan'
        }],
        value: '8EkUrtaweNaB4u7sDYRhNf8bstZYShxnxGxuUTmmGUfp'
    },
  ];