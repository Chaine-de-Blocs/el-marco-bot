const Crypto = require("node:crypto");

const EncryptAlgo = "aes-256-cbc";

/**
 * 
 * @param {String} value 
 * @returns encryptedValue
 */
const Encrypt = (value, passphrase) => {
    const cipher = Crypto.createCipheriv(EncryptAlgo, generateKey(passphrase), process.env.ENCRYPT_IV);
    let encryptedData = cipher.update(value, "utf8", "base64");
    encryptedData += cipher.final("base64");
    return encryptedData;
}

/**
 * 
 * @param {String} encryptedValue 
 * @returns decryptedValue
 */
const Decrypt = (encryptedValue, passphrase) => {
    const decipher = Crypto.createDecipheriv(EncryptAlgo, generateKey(passphrase), process.env.ENCRYPT_IV);
    let decrypted = decipher.update(encryptedValue, "base64", "utf8");
    return (decrypted + decipher.final("utf8"));
}

/**
 * Generate a constant length key base on passphrase
 * @param {String} passphrase 
 * @returns key
 */
const generateKey = (passphrase) => {
    return Crypto.createHash("sha256")
        .update(String(passphrase))
        .digest("base64")
        .substring(0, 32);
}

module.exports = {
    Encrypt, Decrypt,
}