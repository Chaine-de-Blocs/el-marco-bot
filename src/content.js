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
const renderStartAPICreds = () => {
    return `
Bienvenido Gringos,

Je suis Marco, ou plus connu sous le nom de El Maaarrrco. Avec moi on fait business et je ne suis là que pour ça. Tu as raison de t'aventurer dans la finance Bitcoin avec <a href="https://lnmarkets.com/">LNMarket</a>, y'a de quoi se retrousser les manches pour ramassers quelques pépites ici.

Pour qu'on bosse ensemble tu vas devoir me filer qualques accès à l'API de LNMarket.

Créé ton client API en allant ici <a href="https://testnet.lnmarkets.com/user/api">https://testnet.lnmarkets.com/user/api</a>.

<b>Pense bien à noter ton <code>passphrase</code> tu en auras besoin pour sécuriser l'accès.</b>

Pour qu'on puisse bien collaborer donne moi les accès suivants :
✅ Get user
✅ Deposit
✅ Get open and running positions
✅ Get closed positions
✅ Create positions
✅ Modify positions
✅ Close and cancel positions
✅ Make a new options trade
✅ Get options trades

Tu peux ne pas tout mettre, certaines de mes compétences ne pourront pas être mises à ton service Gringos.

Et enfin transmets les moi par message sous la forme suivante (mets bien un espace entre chaque info) :

<code>&lt;Api Key&gt; &lt;Api Secret&gt; &lt;Passphrase&gt;</code>

<i>Pour ta sécurité je ne vais que sauvegarder tes accès API et les chiffrer avec ton <code>passphrase</code>. Ton <code>passphrase</code> sera gardé en session. A tout moment tu pourras supprimer ta session et tes accès avec la commande <code>/removesession</code></i>
    `;
}

/**
 * 
 * @returns {String}
 */
const renderStartSuccess = () => {
    return `
On est bons ! Tes accès sont bien valides. Aucune inquiétude j'ai en mémoire tes accès mais je les ai chiffré eheh ! Ton <code>passphrase</code> est la clé de chiffrement que je garde en session uniquement.

On peut commencer les choses sérieuses, tape <code>/help</code> pour voir les services que je te propose.
    `;
}

const renderRequireNewsession = () => {
    return `
Ta session est terminée pour ta sécurité, refais en une en tapant <code>/start</code>
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

<code>/balance</code> Pour afficher ta balance sur LNMarket
${renderCloseFutureHelp()}
${renderCreateFutureHelp()}
<code>/futures</code> Pour lister tes Futures ouverts
<code>/help</code> Pour afficher le menu d'aide
<code>/home</code> Pour revenir à l'accueil
<code>/start</code> Pour démarrer ou refaire une session avec de nouveaux accès API LNMarket
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
 * @returns {String}
 */
const renderCreateFutureParamsError = () => {
    return `
Okay tu veux créer un Future voilà comment on fait par chez moi :

${renderCreateFutureHelp()}

Pour t'inspirer voilà quelques commandes pour créer un Future :

<code>/createfuture l q=100 x=50 p=35333 sl=35300</code>

<code>/createfuture s q=100 x=50 sl=36000 tp=38000</code>
    `
}

/**
 * @param {Object} params
 * @param {String} [params.side] 
 * @param {String} [params.type] 
 * @param {Number} [params.margin] 
 * @param {Number} [params.leverage] 
 * @param {Number} [params.quantity] 
 * @param {Number} [params.takeprofit] 
 * @param {Number} [params.stoploss] 
 * @param {Number} [params.price]
 * @returns {String}
 */
const renderFutureReview = (params) => {
    // TODO must know the margin by calculation
    // TODO display market price if Market (ticker)
    return `
On va créer ce Future :

Future ${renderSide(params.side)}
💳 Au prix ${params.price ? params.price+"USD" : "Marché"}
${params.quantity ? "💰 Quantité de " + params.quantity + "USD" : ""}
🚀 Levier x${params.leverage}
${params.margin ? "📏 Marge de " + params.margin + "sat" : ""}

${renderSL(params.stoploss)}
${renderTP(params.takeprofit)}
    `;
}

/**
 * @param {Object} future
 * @param {String} [future.pid]
 * @param {Number} [future.id]
 * @param {String} [future.type]
 * @param {String} [future.takeprofit_wi]
 * @param {Number} [future.takeprofit]
 * @param {String} [future.stoploss_wi]
 * @param {Number} [future.stoploss]
 * @param {String} [future.side]
 * @param {Number} [future.quantity]
 * @param {Number} [future.price]
 * @param {Number} [future.pl]
 * @param {String} [future.market_wi]
 * @param {Number} [future.market_filled_ts]
 * @param {String} [future.margin_wi]
 * @param {Number} [future.margin]
 * @param {Number} [future.liquidation]
 * @param {Number} [future.leverage]
 * @param {String} [future.creation_ts]
 * @returns {String}
 */
const renderFutureCreated = (future) => {
    return `
Le Future <code>${future.pid}</code> a été créé Gringos ! Tu le verras en cherchant <code>/futures</code>
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
const renderCreateFutureHelp = () => {
    return `<code>/createfuture</code> Créer un Future <code>(l ou s) [q=&lt;USD quantity&gt;] x=&lt;levier&gt; [p=&lt;prix d'entrée&gt;] [m=&lt;marge&gt;] [sl=&lt;Stop Loss&gt;] [tp=&lt;Take Profit&gt;]</code>
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
const renderCloseFutureHelp = () => {
    return `
<code>/closefuture</code> Pour clôturer un Future rien de plus simple tape juste <code>/closefuture</code> et je te guide
    `;
}

/**
 * 
 * @returns {String}
 */
const renderNeedMe = () => {
    return "Toujours besoin de moi Gringos ?";
}

/**
 * @param {Error} err
 * @returns {String}
 */
const renderBadAPICreds = (err) => {
    return `
Hum... J'ai eu une erreur en essayant tes accès sur l'API de LNMarket, voilà l'erreur :
${err}

<b>Pour recommencer fais à nouveau <code>/start</code></b>
    `
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
 * @param {String} side 
 * @returns {String}
 */
const renderSide = (side) => {
    if (side === "b") {
        return "📈 Buy";
    }
    return "📉 Sell";
}

/**
 * 
 * @param {Error} e 
 * @returns {String}
 */
const renderError = (e) => {
    return `Oulah y'a une erreur : ${e}`;
}

/**
 * 
 * @returns {String}
 */
const renderCmdNotAvailable = () => {
    return `
Cette fonctionnalité n'est pas encore dispo, c'est pas d'chance.

Laisse un mot sur le Github si tu veux à tout prix ce que tu cherches <a href="https://github.com/Chaine-de-Blocs/el-marco-bot">Aller sur le Github de Elmarco</a>
    `;
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
    renderFutureCreated,
    renderFutureReview,
    renderStartAPICreds,
    renderBadAPICreds,
    renderStartSuccess,
    renderRequireNewsession,
    renderCmdNotAvailable,
};