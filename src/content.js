const BalanceEmoji = "🌟";
const BotEmoji = "🤖";
const BuyEmoji = "📈";
const CheckEmoji = "✅";
const ExpEmoji = "🕐";
const FutureEmoji = "📜";
const HelpEmoji = "🙋";
const LeverageEmoji = "🚀";
const LiquidationEmoji = "🔫";
const LossEmoji = "🔴";
const MarginEmoji = "📏";
const OptionEmoji = "🪙";
const PriceEmoji = "💳";
const ProfitEmoji = "🟢";
const QtyEmoji = "💰";
const RefreshEmoji = "🔄";
const SellEmoji = "📉";
const StartEmoji = "🎬";
const WarningEmoji = "⚠️";

/**
 * @param {String} version
 * @param {String} message
 * 
 * @returns {String}
 */
const renderBotRestartMessage = (version, message) => {
    let innerMessage = "";
    if (message) {
        innerMessage = `
J'ai un message de mon créateur à te passer :

<i>${message}</i>
        `
    }
    return `
📣 Hey t'es là ? Je veux pas te déranger chef, juste je veux t'informer que j'ai été mis à jour en <code>v${version}</code>

Tu trouveras une liste des modifications ici <a href="https://github.com/Chaine-de-Blocs/el-marco-bot#changelogs">https://github.com/Chaine-de-Blocs/el-marco-bot#changelogs</a>
${innerMessage}
⚠️ J'ai pas une énorme mémoire, quand je suis mis à jour j'oublie toutes les stratégies. <b>Si tu avais une stratégie en cours relance là</b>
    `;
}

/**
 * @param {String} network
 * 
 * @returns {String}
 */
const renderStartAPICreds = (network) => {
    const lnMarketURL = network === 'testnet'
        ? 'https://testnet.lnmarkets.com/user/api'
        : 'https://lnmarkets.com/user/api'

    return `
Bienvenido Gringos,

Je suis Marco, ou plus connu sous le nom de El Maaarrrco. Avec moi on fait business et je ne suis là que pour ça. Tu as raison de t'aventurer dans la finance Bitcoin avec <a href="https://lnmarkets.com/">LNMarket</a>, y'a de quoi se retrousser les manches pour ramassers quelques pépites ici.

Pour qu'on bosse ensemble tu vas devoir me filer qualques accès à l'API de LNMarket.

⚡ On est sur le réseau <b>${network}</b> ⚡

Créé ton client API en allant ici <a href="${lnMarketURL}">${lnMarketURL}</a>.

<b>Pense bien à noter ton <code>passphrase</code> tu en auras besoin pour sécuriser l'accès.</b>

Pour qu'on puisse bien collaborer donne moi les accès suivants :
${CheckEmoji} Get user
${CheckEmoji} Deposit
${CheckEmoji} Get open and running positions
${CheckEmoji} Get closed positions
${CheckEmoji} Create positions
${CheckEmoji} Modify positions
${CheckEmoji} Close and cancel positions
${CheckEmoji} Make a new options trade
${CheckEmoji} Get options trades

Tu peux ne pas tout mettre, certaines de mes compétences ne pourront pas être mises à ton service Gringos.

Et enfin transmets les moi par message sous la forme suivante (mets bien un espace entre chaque info) :

<code>&lt;Api Key&gt; &lt;Api Secret&gt; &lt;Passphrase&gt;</code>

<i>Pour ta sécurité je ne vais que sauvegarder tes accès API et les chiffrer avec ton <code>passphrase</code>. Ton <code>passphrase</code> sera gardé en session. A tout moment tu pourras supprimer ta session et tes accès avec la commande <code>/removesession</code></i>
    `;
}

/**
 * @returns {String}
 */
const renderStartStrategy = () => {
    return `
Ah voilà je vais pouvoir bosser, pour tout te dire je m'ennuyais par ici !

Bon j'ai quelques stratégies dans ma besace, je vais te les dire.

${WarningEmoji} <b>Mais avant tout Gringos tu dois savoir un truc. Moi je ferais mon max pour que tu fasses du pognon, mais sache que je suis pas un génie ni un alchimiste qui va te faire de l'or <i>out of nowhere</i>. Tu risques de perdre un peu, mais tu peux aussi gagner si je me débrouille bien eh !</b>

Bon voilà mes stratégies :

<code>random</code> <code>[max_openned_positions]</code> <code>[max_leverage]</code> <code>[max_margin]</code> Je fais tout au hasard comme les analyseurs techniques 💪 Je mets pas de StopLoss ni TakeProfit.

Sépare les options entre [] par des valeurs :

<code>[max_openned_positions]</code> Chiffre qui représente le quantité max de positions que je peux ouvrir en même temps
<code>[max_leverage]</code> Levier maximum que je pourrais mettre
<code>[max_margin]</code> La marge maximum que je pourrais créer en sats

<i>Ecris moi la stratégie que tu veux que j'active et je m'y mets</i>
    `;
}

/**
 * 
 * @returns {String}
 */
const renderRemoveSessionMessage = () => {
    return `
No problemo, j'ai supprimé tes informations secrètes de ma mémoire. Fais attention si tu as une stratégie en cours, cela ne va pas l'arrêter.

Fais <code>/stopstrategy</code> pour l'arrêter
    `;
}

/**
 * 
 * @returns {String}
 */
const renderAlreadyRunningStrat = () => {
    return `
Ah ! Tu as déjà une stratégie en cours, fais d'abord la commande <code>/stopstrategy</code> pour arrêter la stratégie en cours et en lancer une nouvelle.
    `;
}

/**
 * 
 * @param {Object} stats
 * @param {Number} [stats.total_pl]
 * @param {Number} [stats.total_closed]
 * @param {Number} [stats.avg_margin]
 * @param {Number} [stats.avg_price]
 * @param {Number} [stats.avg_leverage]
 * @param {Number} [stats.avg_pl]
 * @param {Number} [stats.avg_exit_price]

 * @returns {String}
 */
const renderStategyStop = (stats) => {
    return `
La stratégie automatique a été arrêtée, voilà ses résultats :

${renderStartegyStats(stats)}
    `;
}

/**
 * 
 * @param {String} strat 
 * @param {Object} options 
 * @param {Number} [options.max_openned_positions]
 * @param {Number} [options.max_leverage]
 * @param {Number} [options.max_margin]
 * 
 * @returns {String}
 */
const renderStartegyPreview = (strat, options) => {
    return `
Tu veux lancer la stratégie ${strat} ? C'est une bonne idée.

Avant de lancer la machine de guerre jette un oeil sur les configurations c'est important :

${FutureEmoji} Je laisserai ouvert un maximum de <b>${options.max_openned_positions}</b> Future
${LeverageEmoji} Je ferai des leviers qui ne dépasseront pas <u>x${options.max_leverage}</u>
${MarginEmoji} Je ferai des marges au maximum de <b>${options.max_margin} sats</b>

Ca te va Gringos ?
    `;
}

/**
 * 
 * @param {String} strat 
 * 
 * @returns {String}
 */
const renderStrategyStarted = (strat) => {
    return `
🔥 OH ! Du job pour El Marrrco ! Allez je m'y mets, je lance la stratégie <b>${strat}</b>. Je vais te notifier de mes actions au fil du temps.
    `;
}

/**
 * @param {Object} stats
 * @param {Number} [stats.total_pl]
 * @param {Number} [stats.total_closed]
 * @param {Number} [stats.total_closed_by_user]
 * @param {Number} [stats.total_oppened]
 * @param {Number} [stats.avg_margin]
 * @param {Number} [stats.avg_price]
 * @param {Number} [stats.avg_leverage]
 * @param {Number} [stats.avg_pl]
 * @param {Number} [stats.avg_exit_price]
 * @returns {String}
 */
const renderStartegyStats = (stats) => {
    return `
PL Total ${renderPL(stats.total_pl)} pour un PL moyen de <b>${stats.avg_pl.toFixed(2)} sat</b>
${MarginEmoji} Moyenne de margin <b>${stats.avg_margin.toFixed(2)} sat</b>
${PriceEmoji} Moyenne de prix d'entré <b>${stats.avg_price.toFixed(2)} USD</b>
${LeverageEmoji} Moyenne de levier <u>x${stats.avg_leverage.toFixed(0)}</u>

J'ai ouvert ${stats.total_oppened} positions.
J'ai clôturé ${stats.total_closed} positions.
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

🌀 <b>Général</b> 🌀 

<code>/start</code> Pour démarrer ou refaire une session avec de nouveaux accès API LNMarket
<code>/removesession</code> Pour mettre fin à ta session El Marco, j'oublie tes accès API LNMarket
<code>/home</code> Pour revenir à l'accueil
<code>/help</code> Pour afficher le menu d'aide


🌀 <b>Gestion de compte LNMarket</b> 🌀 

<code>/balance</code> Pour afficher ta balance sur LNMarket
<code>/deposit</code> Pour déposer des fonds dans ton wallet LNMarket


🌀 <b>Trading manuel</b> 🌀 

<code>/futures</code> Pour lister tes Futures ouverts

${renderCloseFutureHelp()}
${renderCloseAllFutureHelp()}

${renderCreateFutureHelp()}


🌀 <b>Trading automatique (stratégies)</b> 🌀

<code>/strategy</code> Pour démarrer une stratégie automatique. Lance la commande et je te guide.
<code>/stopstrategy</code> Pour stopper la stratégie en cours, je te ferais un résumé des résultats.
<code>/strategystats</code> Pour afficher les stats de la stratégie en cours.
    `;
}

/**
 * @param {Number} sats
 * 
 * @returns {String}
 */
const renderTipsMessage = (sats) => {
    return `
🌮 C'est vraiment sympa de penser au créateur de El Marrrco, je te prépare l'invoice de <b>${sats} sat</b> pour le tips !
    `;
}

/**
 * @returns {String}
 */
const renderDepositRequest = () => {
    return `
Tu veux renflouer les caisses de satoshis ? Très bien dis moi combien tu veux envoyer en <i>sats</i>
    `
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

${ExpEmoji} Expire le ${option.expire_at.toLocaleDateString()} à ${option.created_at.toLocaleTimeString()}

⚡ Strike à <b>${option.strike} USD</b>
${QtyEmoji} Quantité <b>${option.quantity} USD</b>
${MarginEmoji} La marge est de <b>${option.margin} USD</b>
${renderHr}
    `;
}

/**
 * @param {Object} future
 * @param {String} [future.pid]
 * @param {String} [future.side]
 * @param {Number} [future.creation_ts]
 * @param {Number} [future.quantity]
 * @param {Number} [future.price]
 * @param {Number} [future.margin]
 * @param {Number} [future.liquidation]
 * @param {Number} [future.stoploss]
 * @param {Number} [future.takeprofit]
 * @param {Number} [future.pl]
 * @param {Number} [future.leverage]
 * @param {Boolean} isStratPosition
 * @returns {String}
 */
const renderFuture = (future, isStratPosition) => {
    const createdAt = new Date(future.creation_ts);
    return `
Future ${renderSide(future.side)} <code>${future.pid}</code>
<i>Créé le ${createdAt.toLocaleDateString()} à ${createdAt.toLocaleTimeString()}${isStratPosition ? ` par la Stratégie de Marco ${BotEmoji}` : ''}</i> 

${QtyEmoji} Quantité <b>${future.quantity} USD</b>
${LeverageEmoji} Le levier est de <u>x${future.leverage}</u>

${PriceEmoji} Prix d'entré <b>${future.price} USD</b>
${MarginEmoji} Margin de <b>${future.margin} sat</b>
${LiquidationEmoji} Liquidation à <b>${future.liquidation} USD</b>

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
 * 
 * @returns {String}
 */
const renderNoOptions = () => {
    return `Tu n'a aucune Option d'ouverte`;
}

/**
 * @param {Array.<{pid: String, margin: Number, pl: Number}>} futures
 * @returns {String}
 */
const renderClosingFuture = (futures) => {
    let futuresMsg = "";
    for(const f of futures) {
        const plEmoji = f.pl >= 0 ? `${ProfitEmoji} +` : `${LossEmoji} `;
        futuresMsg += `\n${FutureEmoji} Future <code>${f.pid}</code> ${plEmoji}<b>${f.pl} USD</b> - Margin <b>${f.margin} USD</b>`
    }
    return `
Oy Gringos, tu veux qu'on clôture un Future ? Pas de problème, tiens voilà tes Futures ouverts :

<i>(Clique sur l'ID du Future que tu veux clôturer et envoie le en réponse à ce message)</i>
${futuresMsg}
    `
}

/**
 * @param {Number|undefined} lastOffer
 * 
 * @returns {String}
 */
const renderCreateFutureParamsError = () => {
    return `
Okay tu veux créer un Future voilà comment on fait par chez moi :

${renderCreateFutureHelp()}

Pour t'inspirer voilà quelques commandes pour créer un Future :

<code>/createfuture l q=100 x=50 p=35333 sl=35300</code>

<code>/createfuture s q=100 x=50 sl=36000 tp=38000</code>
    `;
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
 * @param {Number} displayPrice price to display if market
 * @returns {String}
 */
const renderFutureReview = (params, displayPrice) => {
    const price = params.price || displayPrice;
    const margin = (params.margin
        ? params.margin
        : (params.quantity / (price * params.leverage)) * 1e8
    ).toFixed(2);
    const quantity = (params.quantity
        ? params.quantity
        : (params.margin * price * params.leverage) / 1e8
    ).toFixed(2);

    return `
On va créer ce Future :

Future ${renderSide(params.side)}
${PriceEmoji} Au prix <b>${params.price ? params.price+" USD" : `Marché (${displayPrice} USD)`}</b>
${QtyEmoji} Quantité de <b>${quantity} USD</b>
${LeverageEmoji} Levier <u>x${params.leverage}</u>
${MarginEmoji} Marge de <b>${margin} sat</b>

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
 * 
 * @returns {String}
 */
const renderCloseFuture = (futureID) => {
    return `Le Future ${futureID} a été clôturé`;
}

/**
 * 
 * @returns {String}
 */
const renderCloseAllFuture = () => {
    return `Tous les Futures ont été fermés !`
}

/**
 * @param {Number} agregatedPL
 * 
 * @returns {String}
 */
const renderCloseAllFutureConfirm = (agregatedPL) => {
    return `
Bon t'es sûr de toi ? On est sur un P/L cumulatif de ${agregatedPL < 0 ? LossEmoji : ProfitEmoji } ${agregatedPL} sats.
    `;
}

/**
 * @returns {String}
 */
const renderCreateFutureHelp = () => {
    return `<code>/createfuture</code> Créer un Future <code>(l ou s) [q=&lt;USD quantity&gt;] x=&lt;levier&gt; [p=&lt;prix d'entrée&gt;] [m=&lt;marge&gt;] [sl=&lt;StopLoss&gt;] [tp=&lt;TakeProfit&gt;]</code>
<i>Mets <code>l</code> pour faire un Long (Buy) et <code>s</code> pour faire un Short (Sell)

<code>q</code> c'est pour la quantité
<code>m</code> c'est pour la margin
<b>Tu dois au moins préciser <code>q</code> ou <code>m</code> pour créer le Future</b>

<code>p</code> c'est pour préciser le limit price, si tu ne le mets pas alors je vais créer un order au prix de marché.</i>`; 
}

/**
 * 
 * @returns {String}
 */
const renderCloseFutureHelp = () => {
    return `<code>/closefuture</code> Pour clôturer un Future rien de plus simple je te guide`;
}

/**
 * 
 * @returns {String}
 */
const renderCloseAllFutureHelp = () => {
    return `<code>/closeallfutures</code> Pour clôturer tous les Futures ouverts.`;
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
        return `${WarningEmoji} Pas de StopLoss`;
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
        return `${WarningEmoji} Pas de TakeProfit`;
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
        return `${LossEmoji} P/L à <b>${pl} sat</b>`;
    }
    return `${ProfitEmoji} P/L à +<b>${pl} sat</b>`;
}

/**
 * @param {String} side 
 * @returns {String}
 */
const renderSide = (side) => {
    if (side === "b") {
        return `${BuyEmoji} Buy`;
    }
    return `${SellEmoji} Sell`;
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
    renderHelp,
    renderOption,
    renderFuture,
    renderClosingFuture,
    renderNeedMe,
    renderError,
    renderCloseFuture,
    renderNoFutures,
    renderNoOptions,
    renderHr,
    renderCreateFutureParamsError,
    renderFutureCreated,
    renderFutureReview,
    renderStartAPICreds,
    renderBadAPICreds,
    renderStartSuccess,
    renderRequireNewsession,
    renderCmdNotAvailable,
    renderCloseAllFutureConfirm,
    renderCloseAllFuture,
    renderDepositRequest,
    renderStartStrategy,
    renderAlreadyRunningStrat,
    renderPL,
    renderSide,
    renderStategyStop,
    renderStartegyStats,
    renderStartegyPreview,
    renderStrategyStarted,
    renderTipsMessage,
    renderRemoveSessionMessage,
    renderBotRestartMessage,
    Emoji: {
        FutureEmoji,
        OptionEmoji,
        CheckEmoji,
        ExpEmoji,
        QtyEmoji,
        MarginEmoji,
        LeverageEmoji,
        PriceEmoji,
        LiquidationEmoji,
        BuyEmoji,
        SellEmoji,
        BalanceEmoji,
        ProfitEmoji,
        LossEmoji,
        BotEmoji,
        HelpEmoji,
        StartEmoji,
        WarningEmoji,
        RefreshEmoji,
    },
};