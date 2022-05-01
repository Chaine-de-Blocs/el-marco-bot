/**
 * @returns {String}
 */
const renderWelcome = () => {
    return `
Bienvenido

C'est El Marco
    `;
}

/**
 * 
 * @param {Object} option
 * @param {String} [option.id]
 * @param {Number} [option.strike]
 * @param {Number} [option.quantity]
 * @param {Number} [option.margin]
 * @param {Date} [option.created_at]
 * @param {Date} [option.expire_at]
 * @returns {String}
 */
const renderOption = (option) => {
    return `
Option <code>${option.id}</code>
<i>Créée le ${option.created_at.toLocaleDateString()} à ${option.created_at.toLocaleTimeString()}</i>

🕐 Expire le ${option.expire_at.toLocaleDateString()} à ${option.created_at.toLocaleTimeString()}

⚡ Strike à <b>${option.strike} USD</b>
💰 Quantité <b>${option.quantity} USD</b>
📈 La marge est de <b>${option.margin} USD</b>
----------------------------------------------
    `;
}

/**
 * @param {Object} future
 * @param {String} [future.pid]
 * @param {Number} [future.creation_ts]
 * @param {Number} [future.quantity]
 * @param {Number} [future.price]
 * @param {Number} [future.margin]
 * @param {Number} [future.liquidation]
 * @param {Number} [future.stoploss]
 * @param {Number} [future.takeprofit]
 * @param {Number} [future.pl]
 * @param {Number} [future.leverage]
 * @returns {String}
 */
const renderFuture = (future) => {
    const renderSL = () => {
        if (!future.stoploss) {
            return "⚠️ Pas de StopLoss";
        }
        return `StopLoss à <b>${future.stoploss} USD</b>`;
    }
    const renderTP = () => {
        if (!future.takeprofit) {
            return "⚠️ Pas de TakeProfit";
        }
        return `TakeProfit à <b>${future.takeprofit} USD</b>`;
    }
    const renderPL = () => {
        if (future.pl <= 0) {
            return `🔴 P/L à -<b>${future.pl} sat</b>`;
        }
        return `🟢 P/L à +<b>${future.pl} sat</b>`;
    }

    const createdAt = new Date(future.creation_ts);
    return `
Future <code>${future.pid}</code>
<i>Créé le ${createdAt.toLocaleDateString()} à ${createdAt.toLocaleTimeString()}</i>

💰 Quantité <b>${future.quantity} USD</b>
🚀 Le levier est de <u>x${future.leverage}</u>

💸 Prix d'entré <b>${future.price} USD</b>
📈 Margin de <b>${future.margin} sat</b>
🔫 Liquidation à <b>${future.liquidation} USD</b>

${renderSL()}
${renderTP()}

${renderPL()}
----------------------------------------------
    `;
}

/**
 * @returns {String}
 */
const renderNoFutures = () => {
    return `Tu n'as aucun Future d'ouvert`;
}

/**
 * @param {Array.<{pid: String, margin: Number, pl: Number}>} futures
 * @returns {String}
 */
const renderClosingFuture = (futures) => {
    let futuresMsg = "";
    for(const f of futures) {
        const plEmoji = f.pl >= 0 ? "🟢 +" : "🔴 -";
        futuresMsg += `\n🏷️ Future <code>${f.pid}</code> ${plEmoji}<b>${f.pl} USD</b> - Margin <b>${f.margin} USD</b>`
    }
    return `
Oy Gringos, tu veux qu'on clôture un Future ? Pas de problème, tiens voilà tes Futures ouverts :

<i>(Clique sur l'ID du Future que tu veux clôturer et envoie le en réponse à ce message)</i>
${futuresMsg}
    `
}

/**
 * 
 * @param {String} futureID 
 * @returns {String}
 */
const renderCloseFuture = (futureID) => {
    return `Le Future ${futureID} a été clôturé`;
}

/**
 * 
 * @returns {String}
 */
const renderNeedMe = () => {
    return "Toujours besoin de moi Gringos ?";
}

/**
 * 
 * @param {Error} e 
 * @returns {String}
 */
const renderError = (e) => {
    return `Oulah y'a une erreur : ${e}`;
}

module.exports = {
    renderWelcome,
    renderOption,
    renderFuture,
    renderClosingFuture,
    renderNeedMe,
    renderError,
    renderCloseFuture,
    renderNoFutures,
};