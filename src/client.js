const TelegramBot = require("node-telegram-bot-api");
const { LNMarketsRest, LNMarketsWebsocket } = require("@ln-markets/api");
const { Etcd3 } = require("etcd3");
const MongoClient = require("mongodb").MongoClient;

/**
 * Init LNMarket client
 */

const GetLNMarketClient = (lnKey, lnSecret, lnPass) => {
    return new LNMarketsRest({
        network: process.env.LNM_NETWORK,
        key: lnKey,
        secret: lnSecret,
        passphrase: lnPass,
    });
}

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
    hosts: "elmarco_kv:2379",
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
const Mongo = new MongoClient("mongodb://root:elmaaarrco@elmarco_db:27017");

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
}