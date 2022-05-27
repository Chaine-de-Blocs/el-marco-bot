const Content = require("../content");

/**
 * 
 * @param {Object} t for translation
 * @param {String} strat 
 * 
 * @returns {String}
 */
const renderStartHeader = (t, strat) => {
    return `${Content.Emoji.BotEmoji} [${t.__(`Stratégie`)} <b>${strat}</b>]`;
}

/**
 * 
 * @param {Object} t for translation
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
const renderCreateFuture = (t, future, strat) => {
    return `
${renderStartHeader(t, strat)} ${t.__(`J'ai créé un Future pour toi`)}

${Content.renderFuture(t, future)}

<i>${t.__(`Tu peux clôturer ce Future si il ne te convient pas avec %s avec l'ID %s`, `<code>/closefuture</code>`, `<code>${future.pid}</code>`)}</i>
    `;
}

/**
 * 
 * @param {Object} t for translation
 * @param {Object} future 
 * @param {String} strat 
 * @returns 
 */
const renderCloseFuture = (t, future, strat) => {
    return `
${renderStartHeader(t, strat)} ${t.__(`J'ai clôturé un Future pour toi`)}

${t.__(`Le Future %s a été clôturé`, `<code>${future.pid}</code>`)} ${Content.renderPL(t, future.pl)}
    `;
}

/**
 * 
 * @param {Object} t for translation
 * @param {String} pid
 * @param {String} strat
 * 
 * @returns {String}
 */
const renderCloseFutureFail = (t, pid, strat) => {
    return `
${renderStartHeader(t, strat)} ${t.__(`Woops j'ai pas réussi à clôturer le Future %s.`, `<code>${pid}</code>`)}

${t.__(`Hey Gringos je vais le retirer de ma stratégie et le laisser de côté, si tu veux le clôturer tape juste %s`, `<code>/closefuture</code>`)}
    `;
}

/**
 * 
 * @param {Object} t for translation
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
const renderCreateFutureFail = (t, params, err, strat) => {
    return `
${renderStartHeader(t, strat)} ${t.__(`J'ai échoué lors de la création d'un Future`)}

👉 ${t.__(`C'est pas forcément un gros soucis, je te laisse voir ce qui va pas si ça se répète :`)}

${t.__(`Future`)} ${Content.renderSide(params.side)}
${Content.Emoji.MarginEmoji} ${t.__(`Marge de`)} <b>${t.__n(`%s sat`, +params.margin)}</b>
${Content.Emoji.LeverageEmoji} ${t.__(`Levier`)} x${params.leverage}

${t.__(`LNMarket m'a retourné cette erreur`)} : ${err}
    `;
};

module.exports = {
    renderCreateFuture,
    renderCloseFuture,
    renderCloseFutureFail,
    renderCreateFutureFail,
}