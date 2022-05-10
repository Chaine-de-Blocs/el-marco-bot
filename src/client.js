const TelegramBot = require("node-telegram-bot-api");
const { LNMarketsRest } = require("@ln-markets/api");
const { Etcd3 } = require("etcd3");
const MongoClient = require("mongodb").MongoClient;

/**
 * Init LNMarket client
 */

const GetLNMarketClient = (lnKey, lnSecret, lnPass) => {
    return new LNMarketsRest({
        network: 'testnet',
        key: lnKey,
        secret: lnSecret,
        passphrase: lnPass,
    });
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
    ElMarco,
    Etcd,
    Mongo,
}