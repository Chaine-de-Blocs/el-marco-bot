const uuid = require("uuid");
const LogLevel = require("loglevel");

const Client = require("./client");

/**
 * 
 * @param {*} value 
 * @param {String|undefined} key 
 * @param {Promise<String>} key
 */
const Store = async (value, key) => {
    if (typeof key === "undefined") {
        key = uuid.v4();
    }

    try {
        await Client.Etcd
            .put(key)
            .value(Buffer.from(value).toString("base64"))
            
        return key;
    } catch(e) {
        LogLevel.error(`etcd_error=[e:${e}]`);
        throw e;
    }
}

/**
 * 
 * @param {String} key 
 * @returns {Promise<String>} value
 */
const Get = async (key) => {
    if (typeof key === "undefined") {
        throw new Error("key is undefined");
    }

    const value = await Client.Etcd
        .get(key)
        .string();

    if (value === null) {
        return "";
    }

    return Buffer.from(value, "base64").toString("ascii");
}

/**
 * @param {String} key
 */
const Delete = async (key) => {
    return await Client.Etcd.delete().key(key);
}

module.exports = {
    Store, Get, Delete,
}