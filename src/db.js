const { Mongo } = require("./client");
const Utils = require("./utils");

const CollectionCreds = "api_creds";
const CollectionStrategyPositions = "strategy_positions";

const Init = () => {
    getDB().listCollections(undefined, {
        nameOnly: true,
    }).toArray().then(
        d => {
            const names = d.map(d => d.name);
            if (!names.includes(CollectionCreds)) {
                getDB().createCollection(CollectionCreds);
            }
            if (!names.includes(CollectionStrategyPositions)) {
                getDB().createCollection(CollectionStrategyPositions);
            }
        }
    )
}

/**
 *
 * @param {String} chatId 
 * @param {String} clientId 
 * @param {String} clientSecret 
 * @param {String} passphrase 
 * 
 * @returns {Promise<any>}
 */
const SaveAPICreds = async (chatID, clientId, clientSecret, passphrase) => {
    const value = Utils.Encrypt(`${clientId}:${clientSecret}`, passphrase);

    return getDB()
        .collection(CollectionCreds)
        .updateOne({
            _id: chatID,
        }, {
            $set: {
                _id: chatID,
                encrypted_creds: value,
            },
        }, {
            upsert: true,
        });
}

/**
 * 
 * @param {String} chatID
 * @param {Object} position
 * @param {String} [position.id]
 * @param {String} [position.pid]
 * @param {String} [position.side]
 * @param {String} [position.sign]
 * @param {String} [position.type]
 * @param {Number} [position.price]
 * @param {Number} [position.exit_price]
 * @param {Number} [position.quantity]
 * @param {Number} [position.margin]
 * @param {Number} [position.takeprofit]
 * @param {Number} [position.liquidation]
 * @param {Number} [position.pl]
 * @param {Number} [position.leverage]
 * @param {Number|Null} [position.market_wi]
 * @param {Number|Null} [position.margin_wi]
 * @param {Number|Null} [position.takeprofit_wi]
 * @param {Boolean} [position.canceled]
 * @param {Boolean} [position.closed]
 * @param {String} [position.creation_ts]
 * @param {String|Null} [position.market_filled_ts]
 * @param {String|Null} [position.closed_ts]
 * @param {Number|Null} [position.stoploss]
 * @param {Number|Null} [position.stoploss_wi]
 * @param {String} [position.uid]
 * @param {Number} [position.sum_carry_fees]
 * @param {String|Null} [position.parent]
 * @param {String|Null} [position.parent_type]
 * @param {String|Null} [position.option_trade]
 * @param {String} strat
 * 
 * @returns {Promise<any>}
 */
const InsertStrategyBotPosition = async (chatID, position, strat) => {
    return getDB()
        .collection(CollectionStrategyPositions)
        .insertOne({
            _id: position.pid,
            userID: chatID,
            pl: position.pl,
            strat,
            closed: false,
            price: position.price,
            margin: position.margin,
            leverage: position.leverage,
            exit_price: 0,
        });
}

/**
 * 
 * @param {Object} position
 * @param {String} [position.pid]
 * @param {Boolean} [position.closed]
 * @param {String} [position.closed_ts]	
 * @param {Number} [position.exit_price]	
 * @param {Number} [position.pl]
 */
const UpdateCloseStrategyBotPosition = async (position) => {
    return getDB()
        .collection(CollectionStrategyPositions)
        .updateOne({
            _id: position.pid,
        }, {
            $set: {
                closed: position.closed,
                exit_price: position.exit_price,
                pl: position.pl,
            }
        });
}

/**
 * 
 * @param {String} chatId 
 * @param {String} passphrase 
 * 
 * @returns {Object}
 */
const GetAPICreds = async (chatId, passphrase) => {
    if (typeof chatId === "undefined") {
        throw new Error("chatId is undefined");
    }
    if (typeof passphrase === "undefined") {
        throw new Error("passphrase is undefined");
    }

    const data = await getDB()
        .collection(CollectionCreds)
        .findOne({
            _id: chatId,
        });
    
    const decryptedData = Utils.Decrypt(data.encrypted_creds, passphrase);

    const creds = decryptedData.split(":");
    if (!creds || creds.length !== 2) {
        throw new Error("decrypted data is invalid");
    }

    return {
        api_client: creds[0],
        api_secret: creds[1],
    }
}

const getDB = () => {
    return Mongo.db("elmarco");
}

module.exports = {
    Init,
    SaveAPICreds,
    GetAPICreds,
    InsertStrategyBotPosition,
    UpdateCloseStrategyBotPosition,
};