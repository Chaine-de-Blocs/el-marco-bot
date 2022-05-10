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

module.exports = {
    authMiddleware,
};