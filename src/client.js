const TelegramBot = require("node-telegram-bot-api");
const { LNMarketsRest } = require("@ln-markets/api");
const { Etcd3 } = require("etcd3");
const MongoClient = require("mongodb").MongoClient;

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
const mongoClient = new MongoClient("mongodb://root:elmaaarrco@elmarco_db:27017");

mongoClient.connect()
    .catch((e) => {
        console.error("Can't load MongoDB");
        throw e;
    });

module.exports = {
    LNMarketAPI,
    ElMarco,
    Etcd,
}