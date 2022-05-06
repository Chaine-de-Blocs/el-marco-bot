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
 * @returns {String}
 */
const renderHelp = () => {
    return `
Si tu veux bosser avec moi on va devoir s'accorder, no problemo je suis un partenaire facile et efficace.

Je te dis comment tu vas pouvoir bosser avec moi avec cette <b>liste de commandes</b>.

Tout ce qui est entre des [] sont des paramètres optionnels.

Pour chaque commande je te donne des précisions en italique, je suis simple et efficace mais on fait de la finance sur LN ! Pas un truc de rigolo

${renderCreateFutureHelp()}
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
    const createdAt = new Date(future.creation_ts);
    return `
Future <code>${future.pid}</code>
<i>Créé le ${createdAt.toLocaleDateString()} à ${createdAt.toLocaleTimeString()}</i>

💰 Quantité <b>${future.quantity} USD</b>
🚀 Le levier est de <u>x${future.leverage}</u>

💸 Prix d'entré <b>${future.price} USD</b>
📈 Margin de <b>${future.margin} sat</b>
🔫 Liquidation à <b>${future.liquidation} USD</b>

${renderSL(future.stoploss)}
${renderTP(future.takeprofit)}

${renderPL(future.pl)}
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
        const plEmoji = f.pl >= 0 ? "🟢 +" : "🔴 ";
        futuresMsg += `\n🏷️ Future <code>${f.pid}</code> ${plEmoji}<b>${f.pl} USD</b> - Margin <b>${f.margin} USD</b>`
    }
    return `
Oy Gringos, tu veux qu'on clôture un Future ? Pas de problème, tiens voilà tes Futures ouverts :

<i>(Clique sur l'ID du Future que tu veux clôturer et envoie le en réponse à ce message)</i>
${futuresMsg}
    `
}

/**
 * @param {Object} future
 * @param {String} [future.type]
 * @param {String} [future.side]
 * @param {String} [future.margin]
 * @param {String} [future.leverage]
 * @param {String} [future.quantity]
 * @param {String} [future.takeprofit]
 * @param {String} [future.stoploss]
 * @param {String} [future.price]
 * @returns {String}
 */
const renderCreateFuture = (future) => {
    return `
Créé future
    `
}

/**
 * @returns {String}
 */
const renderCreateFutureParamsError = () => {
    return `
Wooops je ne vois pas comment tu veux créer ce Future 🤔

Pour rappel :

${renderCreateFutureHelp()}

Pour t'inspirer voilà quelques commandes pour créer un Future :

<code>/createfuture l q=100.02 x=50 p=35333.41 sl=35300</code>

<code>/createfuture s q=100.02 x=50 sl=36000 tp=38000</code>
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
 * @returns {String}
 */
const renderCreateFutureHelp = () => { //&lt;&gt;
    return `/createfuture Créer un Future <code>(l ou s) [q=&lt;USD quantity&gt;] x=&lt;levier&gt; [p=&lt;prix d'entrée&gt;] [m=&lt;marge&gt;] [sl=&lt;Stop Loss&gt;] [tp=&lt;Take Profit&gt;]</code>
<i>Mets <code>l</code> pour faire un Long (Buy) et <code>s</code> pour faire un Short (Sell)

<code>q</code> c'est pour la quantité
<code>m</code> c'est pour la margin
<b>Tu dois au moins préciser <code>q</code> ou <code>m</code> pour créer le Future</b>

<code>p</code> c'est pour préciser le limit price, si tu ne le mets pas alors je vais créer un order au prix de marché.
</i>`; 
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
 * @returns {String}
 */
const renderHr = () => {
    return "----------------------------------------------";
}

/**
 * 
 * @param {String} sl 
 * @returns {String}
 */
const renderSL = (sl) => {
    if (!sl) {
        return "⚠️ Pas de StopLoss";
    }
    return `StopLoss à <b>${sl} USD</b>`;
}
/**
 * 
 * @param {String} tp 
 * @returns {String}
 */
const renderTP = (tp) => {
    if (!tp) {
        return "⚠️ Pas de TakeProfit";
    }
    return `TakeProfit à <b>${tp} USD</b>`;
}
/**
 * 
 * @param {String} pl 
 * @returns {String}
 */
const renderPL = (pl) => {
    if (pl <= 0) {
        return `🔴 P/L à <b>${pl} sat</b>`;
    }
    return `🟢 P/L à +<b>${pl} sat</b>`;
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
    renderHelp,
    renderOption,
    renderFuture,
    renderClosingFuture,
    renderNeedMe,
    renderError,
    renderCloseFuture,
    renderNoFutures,
    renderHr,
    renderCreateFutureParamsError,
};