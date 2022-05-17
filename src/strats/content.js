const Content = require("../content");

/**
 * 
 * @param {String} strat 
 * 
 * @returns {String}
 */
const renderStartHeader = (strat) => {
    return `${Content.Emoji.BotEmoji} [Stratégie <b>${strat}</b>]`;
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
 * 
 * @returns {String}
 */
const renderCreateFuture = (future, strat) => {
    return `
${renderStartHeader(strat)} J'ai créé un Future pour toi

${Content.renderFuture(future)}

<i>Tu peux clôturer ce Future si il ne te convient pas avec <code>/closefuture</code> avec l'ID <code>${future.pid}</code></i>
    `;
}

const renderCloseFuture = (future, strat) => {
    return `
${renderStartHeader(strat)} J'ai clôturé un Future pour toi

Le Future <code>${future.pid}</code> a été clôturé ${Content.renderPL(future.pl)}
    `;
}

/**
 * 
 * @param {String} pid
 * @param {String} strat
 * 
 * @returns {String}
 */
const renderCloseFutureFail = (pid, strat) => {
    return `
${renderStartHeader(strat)} Woops j'ai pas réussi à clôturer le Future <code>${pid}</code>.

Hey Gringos je vais le retirer de ma stratégie et le laisser de côté, si tu veux le clôturer tape juste <code>/closefuture</code>
    `;
}

/**
 * 
 * @param {Object} params
 * @param {Number} [params.margin]
 * @param {Number} [params.leverage]
 * @param {String} [params.side]
 * @param {String} [params.type]
 * @param {Error} err
 * @param {String} strat
 * 
 * @returns {String}
 */
const renderCreateFutureFail = (params, err, strat) => {
    return `
${renderStartHeader(strat)} J'ai échoué lors de la création d'un Future

👉 C'est pas forcément un gros soucis, je te laisse voir ce qui va pas si ça se répète :

Future ${Content.renderSide(params.side)}
${Content.Emoji.MarginEmoji} Marge de <b>${params.margin}</b>
${Content.Emoji.LeverageEmoji} Levier de x${params.leverage}

LNMarket m'a retourné cette erreur : ${err}
    `;
};

module.exports = {
    renderCreateFuture,
    renderCloseFuture,
    renderCloseFutureFail,
    renderCreateFutureFail,
}