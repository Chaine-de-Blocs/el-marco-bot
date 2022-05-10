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
                getDB().creatjeCollection(CollectionCreds);
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

/**
 * 
 * @param {String} chatId 
 * @param {String} passphrase 
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
    Init, SaveAPICreds, GetAPICreds,
};