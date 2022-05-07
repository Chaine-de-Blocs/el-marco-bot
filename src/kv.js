const uuid = require("uuid");
const LogLevel = require("loglevel");

const Client = require("./client");

/**
 * 
 * @param {*} value 
 * @param {String|undefined} id 
 * @param {Promise<String>} key
 */
const store = async (value, id) => {
    if (typeof id === "undefined") {
        id = uuid.v4();
    }

    try {
        await Client.Etcd
            .put(id)
            .value(Buffer.from(value).toString("base64"))
            
        return id;
    } catch(e) {
        LogLevel.error(`etcd_error=[e:${e}]`);
        throw e;
    }
}

/**
 * 
 * @param {Promise<String>} key 
 */
const get = async (key) => {
    const value = await Client.Etcd
        .get(key)
        .string();

    return Buffer.from(value, "base64").toString("ascii");
}

module.exports = {
    store, get,
}