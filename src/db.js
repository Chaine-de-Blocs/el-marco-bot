const { Mongo } = require("./client");
const Utils = require("./utils");

const CollectionCreds = "api_creds";

const Init = () => {
    getDB().listCollections(undefined, {
        nameOnly: true,
    }).toArray().then(
        d => {
            const names = d.map(d => d.name);
            if (!names.includes(CollectionCreds)) {
                getDB().createCollection(CollectionCreds);
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
 * @returns {Promise<any>}
 */
const SaveAPICreds = async (chatId, clientId, clientSecret, passphrase) => {
    const value = Utils.Encrypt(`${clientId}:${clientSecret}`, passphrase);

    return getDB()
        .collection(CollectionCreds)
        .updateOne({
            _id: chatId,
        }, {
            $set: {
                _id: chatId,
                encrypted_creds: value,
            },
        }, {
            upsert: true,
        });
}

const getDB = () => {
    return Mongo.db("elmarco");
}

module.exports = {
    Init, SaveAPICreds,
};