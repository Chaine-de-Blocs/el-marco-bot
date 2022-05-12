const KV = require("./kv");
const DB = require("./db");

const authMiddleware = function(displayErrFn) {
    return function* () {
        try {
            const passphrase = yield KV.get(this.chatId);

            if (!passphrase) {
                throw new Error("session expired");
            }

            const apiCreds = yield DB.GetAPICreds(this.chatId, passphrase);
            
            this.getAPICreds = () => ({
                ...apiCreds,
                passphrase,
            });
        } catch(e) {
            displayErrFn(e, this.chatId);
        }
    }
}

/**
 * 
 * @param {String} chatID 
 * @returns {Promise<Object>}
 * 
 * @throws Error
 */
const fetchAPICreds = async (chatID) => {
    const passphrase = await KV.get(chatID);

    if (!passphrase) {
        throw new Error("session expired");
    }

    const apiCreds = await DB.GetAPICreds(chatID, passphrase);

    return {
        ...apiCreds,
        passphrase,
    }
}

module.exports = {
    authMiddleware,
    fetchAPICreds,
};