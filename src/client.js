const TelegramBot = require("node-telegram-bot-api");
const { LNMarketsRest, LNMarketsWebsocket } = require("@ln-markets/api");
const { Etcd3 } = require("etcd3");
const MongoClient = require("mongodb").MongoClient;
const i18n = require("i18n");
const path = require("node:path");

/**
 * Init LNMarket client
 * 
 * @param {String} lnKey
 * @param {String} lnSecret
 * @param {String} lnPass
 * 
 * @returns {Object}
 */
const GetLNMarketClient = (lnKey, lnSecret, lnPass) => {
    return new LNMarketsRest({
        network: process.env.LNM_NETWORK,
        key: lnKey,
        secret: lnSecret,
        passphrase: lnPass,
    });
}

/**
 * 
 * @param {String} lnKey 
 * @param {String} lnSecret 
 * @param {String} lnPass 
 * @returns {Object}
 */
const GetLNMarketWSClient = (lnKey, lnSecret, lnPass) => {
    return new LNMarketsWebsocket({
        network: process.env.LNM_NETWORK,
        key: lnKey,
        secret: lnSecret,
        passphrase: lnPass,
    })
}

/**
 * Init TelegramBot client
 */
const token = process.env.TELEGRAM_TOKEN;
const ElMarco = new TelegramBot(token, {polling: true});

/**
 * KV
 */
const Etcd = new Etcd3({
    hosts: process.env.KV_HOST,
    dialTimeout: 3000,
});

Etcd.get("healtcheck")
    .catch((e) => {
        console.error("Can't authenticate ETCD")
        throw e;
    });

/**
 * DB
 */
const Mongo = new MongoClient(process.env.DB_HOST);

/**
 * Internationalization
 * 
 * @param {String} locale
 * @returns {Object}
 */
const GetIntl = (locale) => {
    let t = {};
    i18n.configure({
        locales: ["fr", "en"], // TODO es, pt
        defaultLocale: "fr",
        directory: path.resolve("./locales"),
        register: t,
    });

    // t.setLocale(locale);
    t.setLocale("en");// TEMP

    return t;
}

Mongo.connect()
    .catch((e) => {
        console.error("Can't load MongoDB");
        throw e;
    });

module.exports = {
    GetLNMarketClient,
    GetLNMarketWSClient,
    ElMarco,
    Etcd,
    Mongo,
    GetIntl,
}