const TelegramBot = require('node-telegram-bot-api');
const { LNMarketsRest } = require('@ln-markets/api');
const { brotliCompress } = require('zlib');

require('dotenv').config();

const lnKey = process.env.LNM_KEY;
const lnSecret = process.env.LNM_SECRET;
const lnPass = process.env.LNM_PASSPHRASE;

const lnM = new LNMarketsRest({
    network: 'testnet',
    key: lnKey,
    secret: lnSecret,
    passphrase: lnPass,
});

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, async (msg) => {
    const lnmUserInfo = await lnM.getUser();

    const menu = [
        [`🌟 Ta balance est de ${lnmUserInfo.balance} sat`],
        ["Créer un Future", "Créer une option", "Aide"]
    ];

    bot.sendMessage(msg.chat.id, "Bienvenue", {
        reply_markup: {
            keyboard: menu,
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    });
})

bot.onText(/\/balance/, (msg) => {
    lnM.getUser()
        .then((res) =>
            bot.sendMessage(msg.chat.id, `🌟 Ta balance est de ${res.balance} sat`)
        )
        .catch((e) => displayChatError(e, msg.chat.id));
});

bot.onText(/\/options/, (msg) => {
    lnM.optionsGetPositions()
        .then((res) => {
            for(const opt of res) {
                console.log(opt);
                bot.sendMessage(msg.chat.id, "options");
            }
        })
        .catch((e) => displayChatError(e, msg.chat.id));
});

bot.onText(/\/futures/, (msg) => {
    lnM.futuresGetPositions()
        .then((res) => {
            console.log(res);
        })
        .catch((e) => displayChatError(e, msg.chat.id));
});

const displayChatError = (e, chatID) => {
    bot.sendMessage(chatID, `Oulah y'a une erreur : ${e}`);
}