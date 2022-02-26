const IntentionStorage = require("intention-storage");

module.exports = [
    {
        type: 'type',
        key: IntentionStorage.generateUUID(),
        name: {
            general: 'SolanaContact',
            en: 'Solana contact',
            ru: 'Контакт Солана'
        },
        words: [{
            ru: 'Алихать',
            en: 'Alihan'
        }, {
            ru: 'Алихануть'
        }],
        value: '8EkUrtaweNaB4u7sDYRhNf8bstZYShxnxGxuUTmmGUfp'
    },
    {
        type: 'type',
        key: IntentionStorage.generateUUID(),
        name: {
            general: 'SolanaAmount',
            en: 'Solana amount',
            ru: 'Количество денег в sol'
        },
        words: [{
            ru: 'на еда',
            en: 'for food'
        }],
        value: '0.01'
    }, {
        type: 'type',
        key: IntentionStorage.generateUUID(),
        name: {
            general: 'SolanaAmount',
            en: 'Solana amount',
            ru: 'Количество денег в sol'
        },
        words: [{
            ru: 'один сол',
            en: 'one sol'
        }],
        value: '1'
    }, {
        type: 'type',
        key: IntentionStorage.generateUUID(),
        name: {
            general: 'SolanaAmount',
            en: 'Solana amount',
            ru: 'Количество денег в sol'
        },
        words: [{
            ru: 'два сола',
            en: 'two sols'
        }],
        value: '2'
    }, {
        type: 'type',
        key: IntentionStorage.generateUUID(),
        name: {
            general: 'SolanaAmount',
            en: 'Solana amount',
            ru: 'Количество денег в sol'
        },
        words: [{
            ru: '5 сол',
            en: 'five sols'
        }],
        value: '5'
    }, 
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
          general: 'SolanaContact',
          ru: 'Кому?',
          en: 'Where?'
      }, {
        general: 'SolanaAmount',
        ru: 'Сколько?',
        en: 'How much?'
    }],
      intentions: [{
          title: 'Tranfer money to recipient',
          input: 'TaskOperationInfo',
          output: 'SolanaResult',
          value: 'send'
      }]
    }
  ];