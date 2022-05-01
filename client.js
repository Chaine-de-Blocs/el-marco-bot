const TelegramBot = require('node-telegram-bot-api');
const { LNMarketsRest } = require('@ln-markets/api');

/**
 * Init LNMarket client
 */
const lnKey = process.env.LNM_KEY;
const lnSecret = process.env.LNM_SECRET;
const lnPass = process.env.LNM_PASSPHRASE;

const LNMarketAPI = new LNMarketsRest({
    network: 'testnet',
    key: lnKey,
    secret: lnSecret,
    passphrase: lnPass,
});

/**
 * Init TelegramBot client
 */
const token = process.env.TELEGRAM_TOKEN;

const ElMarco = new TelegramBot(token, {polling: true});

module.exports = {
    LNMarketAPI,
    ElMarco,
}