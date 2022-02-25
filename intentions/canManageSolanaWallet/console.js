exports.init = async (intentionStorage) => {
    return await intentionStorage.createIntention({
        title: {
          en: "Need console",
          ru: "Нужна консоль",
        },
        input: "None",
        output: "ContextText",
        onData: async function onData() {},
      });
}