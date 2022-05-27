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
 * 
 * @param {Object} t for translation
 * @param {String} version
 * @param {String} message
 * 
 * @returns {String}
 */
const renderBotRestartMessage = (t, version, message) => {
    let innerMessage = "";
    if (message) {
        innerMessage = `
${t.__(`J'ai un message de mon créateur à te passer :`)}

<i>${message}</i>
        `
    }
    return `
📣 ${t.__(`Hey t'es là ? Je veux pas te déranger chef, juste je veux t'informer que j'ai été mis à jour en %s`, `<code>v${version}</code>`)}

${t.__(`Partage moi à tes camaradas`)} <code>https://t.me/ElmarcoBot</code>

${t.__(`Tu trouveras une liste des modifications ici`)} <a href="https://github.com/Chaine-de-Blocs/el-marco-bot#changelogs">https://github.com/Chaine-de-Blocs/el-marco-bot#changelogs</a>
${innerMessage}
⚠️ ${t.__(`J'ai pas une énorme mémoire, quand je suis mis à jour j'oublie toutes les stratégies. <b>Si tu avais une stratégie en cours relance là</b></b>`)}
    `;
}

/**
 * @param {Object} t for translation
 * @param {String} network
 * 
 * @returns {String}
 */
const renderStartAPICreds = (t, network) => {
    const lnMarketURL = network === 'testnet'
        ? 'https://testnet.lnmarkets.com/user/api'
        : 'https://lnmarkets.com/user/api'

    return `
${t.__("Bienvenido Gringos")},

${t.__(`Je suis Marco, ou plus connu sous le nom de El Maaarrrco.`)} ${t.__(`Avec moi on fait business et je ne suis là que pour ça.`)} ${t.__(`Tu as raison de t'aventurer dans la finance Bitcoin avec <a href="https://lnmarkets.com/">LNMarket</a>, y'a de quoi se retrousser les manches pour ramassers quelques pépites ici.`)}

${t.__(`Pour qu'on bosse ensemble tu vas devoir me filer qualques accès à l'API de LNMarket.`)}

⚡ ${t.__(`On est sur le réseau <b>%s</b>`, network)} ⚡

${t.__(`Créé ton client API en allant ici %s.`, `<a href="${lnMarketURL}">${lnMarketURL}</a>`)}

<b>${t.__(`Pense bien à noter ton %s tu en auras besoin pour sécuriser l'accès.`, `<code>passphrase</code>`)}</b>

${t.__(`Pour qu'on puisse bien collaborer donne moi les accès suivants :`)}
${CheckEmoji} Get user
${CheckEmoji} Deposit
${CheckEmoji} Get open and running positions
${CheckEmoji} Get closed positions
${CheckEmoji} Create positions
${CheckEmoji} Modify positions
${CheckEmoji} Close and cancel positions
${CheckEmoji} Make a new options trade
${CheckEmoji} Get options trades

${t.__(`Tu peux ne pas tout mettre, certaines de mes compétences ne pourront pas être mises à ton service Gringos.`)}

${t.__(`Et enfin transmets les moi par message sous la forme suivante (mets bien un espace entre chaque info) :`)}

<code>&lt;Api Key&gt; &lt;Api Secret&gt; &lt;Passphrase&gt;</code>

<i>${t.__(`Pour ta sécurité je ne vais que sauvegarder tes accès API et les chiffrer avec ton %s. Ton %s sera gardé en session. A tout moment tu pourras supprimer ta session et tes accès avec la commande %s`, `<code>passphrase</code>`, `<code>passphrase</code>`, `<code>/removesession</code>`)}</i>
    `;
}

/**
 * @param {Object} t for translation
 * @returns {String}
 */
const renderStartStrategy = (t) => {
    return `
${t.__(`Ah voilà je vais pouvoir bosser, pour tout te dire je m'ennuyais par ici !`)}

${t.__(`Bon j'ai quelques stratégies dans ma besace, je vais te les dire.`)}

<b>${WarningEmoji} ${t.__(`Mais avant tout Gringos tu dois savoir un truc. Moi je ferais mon max pour que tu fasses du pognon, mais sache que je suis pas un génie ni un alchimiste qui va te faire de l'or <i>out of nowhere</i>. Tu risques de perdre un peu, mais tu peux aussi gagner si je me débrouille bien eh !`)}</b>

${t.__(`Bon voilà mes stratégies :`)}

<code>random</code> <code>[max_openned_positions]</code> <code>[max_leverage]</code> <code>[max_margin]</code> ${t.__(`Je fais tout au hasard comme les analyseurs techniques 💪 Je mets pas de StopLoss ni TakeProfit.`)}

${t.__(`Remplace les options entre [] par des valeurs :`)}

<code>[max_openned_positions]</code> ${t.__(`Chiffre qui représente le quantité max de positions que je peux ouvrir en même temps`)}
<code>[max_leverage]</code> ${t.__(`Levier maximum que je pourrais mettre`)}
<code>[max_margin]</code> ${t.__(`La marge maximum que je pourrais créer en sats`)}

<i>${t.__(`Ecris moi la stratégie que tu veux que j'active et je m'y mets`)}</i>
    `;
}

/**
 * @param {Object} t for translation
 * 
 * @returns {String}
 */
const renderRemoveSessionMessage = (t) => {
    return `
${t.__(`No problemo, j'ai supprimé tes informations secrètes de ma mémoire. Fais attention si tu as une stratégie en cours, cela ne va pas l'arrêter.`)}

${t.__(`Fais %s pour l'arrêter`, `<code>/stopstrategy</code>`)}
    `;
}

/**
 * @param {Object} t for translation
 * 
 * @returns {String}
 */
const renderAlreadyRunningStrat = (t) => {
    return `
${t.__(`Ah ! Tu as déjà une stratégie en cours, fais d'abord la commande %s pour arrêter la stratégie en cours et en lancer une nouvelle.`, `<code>/stopstrategy</code>`)}
    `;
}

/**
 * 
 * @param {Object} t for translation
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
const renderStategyStop = (t, stats) => {
    return `
${t.__(`La stratégie automatique a été arrêtée, voilà ses résultats :`)}

${renderStartegyStats(t, stats)}
    `;
}

/**
 * 
 * @param {Object} t for translation
 * @param {String} strat 
 * @param {Object} options 
 * @param {Number} [options.max_openned_positions]
 * @param {Number} [options.max_leverage]
 * @param {Number} [options.max_margin]
 * 
 * @returns {String}
 */
const renderStartegyPreview = (t, strat, options) => {
    return `
${t.__(`Tu veux lancer la stratégie %s ? C'est une bonne idée.`, strat)}

${t.__(`Avant de lancer la machine de guerre jette un oeil sur les configurations c'est important :`)}

${FutureEmoji} ${t.__(`Je laisserai ouvert un maximum de <b>%s</b> Future`, options.max_openned_positions)}
${LeverageEmoji} ${t.__(`Je ferai des leviers qui ne dépasseront pas <u>x%s</u>`, options.max_leverage)}
${MarginEmoji} ${t.__(`Je ferai des marges au maximum de`)} <b>${t.__n(`%s sat`, options.max_margin)}</b>

${t.__(`Ca te va Gringos ?`)}
    `;
}

/**
 * 
 * @param {Object} t for translation
 * @param {String} strat 
 * 
 * @returns {String}
 */
const renderStrategyStarted = (t, strat) => {
    return `
🔥 ${t.__(`OH ! Du job pour El Marrrco ! Allez je m'y mets, je lance la stratégie <b>%s</b>.`, strat)} ${t.__(`Je vais te notifier de mes actions au fil du temps.`)}
    `;
}

/**
 * @param {Object} t for translation
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
const renderStartegyStats = (t, stats) => {
    return `
${t.__(`PL Total`)} ${renderPL(t, stats.total_pl)} ${t.__(`pour un PL moyen de`)} <b>${t.__n(`%s sat`, stats.avg_pl.toFixed(2))}</b>
${MarginEmoji} ${t.__(`Moyenne de margin`)} <b>${t.__n(`%s sat`, stats.avg_margin.toFixed(2))}</b>
${PriceEmoji} ${t.__(`Moyenne de prix d'entré`)} <b>${t.__n(`%s USD`, stats.avg_price.toFixed(2))}</b>
${LeverageEmoji} ${t.__(`Moyenne de levier`)} <u>x${stats.avg_leverage.toFixed(0)}</u>

${t.__(`J'ai ouvert <b>%s</b> positions et on en a clôturé <b>%s</b>.`, stats.total_oppened, stats.total_closed)}
    `;
}

/**
 * @param {Object} t for translation
 * 
 * @returns {String}
 */
const renderStartSuccess = (t) => {
    return `
${t.__(`On est bons ! Tes accès sont bien valides. Aucune inquiétude j'ai en mémoire tes accès mais je les ai chiffré eheh ! Ton <code>passphrase</code> est la clé de chiffrement que je garde en session uniquement.`)}

${t.__(`On peut commencer les choses sérieuses, tape %s pour voir les services que je te propose.`, `<code>/help</code>`)}
    `;
}

/**
 * 
 * @param {Object} t for translation
 * 
 * @returns {String}
 */
const renderRequireNewsession = (t) => {
    return `
${t.__(`Ta session est terminée pour ta sécurité, refais en une en tapant %s`, `<code>/start</code>`)}
    `;
}

/**
 * @param {Object} t for translation
 * 
 * @returns {String}
 */
const renderHelp = (t) => {
    return `
${t.__(`Si tu veux bosser avec moi on va devoir s'accorder, no problemo je suis un partenaire facile et efficace.`)}

${t.__(`Je te dis comment tu vas pouvoir bosser avec moi avec cette <b>liste de commandes</b>.`)}

${t.__(`Tout ce qui est entre des [] sont des paramètres optionnels.`)}

${t.__(`Pour chaque commande je te donne des précisions en italique, je suis simple et efficace mais on fait de la finance sur LN ! Pas un truc de rigolo`)}

🌀 <b>${t.__(`Général`)}</b> 🌀 

<code>/start</code> ${t.__(`Pour démarrer ou refaire une session avec de nouveaux accès API LNMarket`)}
<code>/removesession</code> ${t.__(`Pour mettre fin à ta session El Marco, j'oublie tes accès API LNMarket`)}
<code>/home</code> ${t.__(`Pour revenir à l'accueil`)}
<code>/help</code> ${t.__(`Pour afficher le menu d'aide`)}


🌀 <b>${t.__(`Gestion de compte LNMarket`)}</b> 🌀 

<code>/balance</code> ${t.__(`Pour afficher ta balance sur LNMarket`)}
<code>/deposit</code> ${t.__(`Pour déposer des fonds dans ton wallet LNMarket`)}


🌀 <b>${t.__(`Trading manuel`)}</b> 🌀 

<code>/futures</code> ${t.__(`Pour lister tes Futures ouverts`)}

${renderCloseFutureHelp(t)}
${renderCloseAllFutureHelp(t)}

${renderCreateFutureHelp(t)}


🌀 <b>${t.__(`Trading automatique (stratégies)`)}</b> 🌀

<code>/strategy</code> ${t.__(`Pour démarrer une stratégie automatique. Lance la commande et je te guide.`)}
<code>/stopstrategy</code> ${t.__(`Pour stopper la stratégie en cours, je te ferais un résumé des résultats.`)}
<code>/strategystats</code> ${t.__(`Pour afficher les stats de la stratégie en cours.`)}
    `;
}

/**
 * 
 * @param {Object} t for translation
 * @param {Number} sats
 * 
 * @returns {String}
 */
const renderTipsMessage = (t, sats) => {
    return `
🌮 ${t.__(`C'est vraiment sympa de penser au créateur de El Marrrco, je te prépare l'invoice de`)} <b>${t.__n(`%s sat`, sats)}</b> ${t.__(`pour le tips !`)}
    `;
}

/**
 * 
 * @param {Object} t for translation
 * @returns {String}
 */
const renderDepositRequest = (t) => {
    return `
${t.__(`Tu veux renflouer les caisses de satoshis ? Très bien dis moi combien tu veux envoyer en <i>sats</i>`)}
    `
}

/**
 * 
 * @param {Object} t for translation
 * @param {Object} option
 * @param {String} [option.id]
 * @param {Number} [option.strike]
 * @param {Number} [option.quantity]
 * @param {Number} [option.margin]
 * @param {Date} [option.created_at]
 * @param {Date} [option.expire_at]
 * @returns {String}
 */
const renderOption = (t, option) => {
    return `
${t.__(`Option`)} <code>${option.id}</code>
<i>${t.__(`Créée le`)} ${option.created_at.toLocaleDateString()} ${t.__(`à`)} ${option.created_at.toLocaleTimeString()}</i>

${ExpEmoji} ${t.__(`Expire le`)} ${option.expire_at.toLocaleDateString()} ${t.__(`à`)} ${option.created_at.toLocaleTimeString()}

⚡ ${t.__(`Strike à`)} <b>${option.strike} USD</b>
${QtyEmoji} ${t.__(`Quantité`)} <b>${option.quantity} USD</b>
${MarginEmoji} ${t.__(`La marge est de`)} <b>${option.margin} USD</b>
${renderHr}
    `;
}

/**
 * 
 * @param {Object} t for translation
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
const renderFuture = (t, future, isStratPosition) => {
    const createdAt = new Date(future.creation_ts);
    return `
${t.__(`Future`)} ${renderSide(future.side)} <code>${future.pid}</code>
<i>${t.__(`Créé le`)} ${createdAt.toLocaleDateString()} ${t.__(`à`)} ${createdAt.toLocaleTimeString()}${isStratPosition ? ` ${t.__(`par la Stratégie de Marco`)} ${BotEmoji}` : ''}</i> 

${QtyEmoji} ${t.__(`Quantité`)} <b>${future.quantity} USD</b>
${LeverageEmoji} ${t.__(`Le levier est de`)} <u>x${future.leverage}</u>

${PriceEmoji} ${t.__(`Prix d'entré`)} <b>${future.price} USD</b>
${MarginEmoji} ${t.__(`Margin de`)} <b>${t.__n(`%s sat`, margin)}</b>
${LiquidationEmoji} ${t.__(`Liquidation à`)} <b>${future.liquidation} USD</b>

${renderSL(t, future.stoploss)}
${renderTP(t, future.takeprofit)}

${renderPL(t, future.pl)}
    `;
}

/**
 * 
 * @param {Object} t for translation
 * 
 * @returns {String}
 */
const renderNoFutures = (t) => {
    return t.__(`Tu n'as aucun Future d'ouvert`);
}

/**
 * 
 * @param {Object} t for translation
 * 
 * @returns {String}
 */
const renderNoOptions = () => {
    return t.__(`Tu n'a aucune Option d'ouverte`);
}

/**
 * 
 * @param {Object} t for translation
 * @param {Array.<{pid: String, margin: Number, pl: Number}>} futures
 * 
 * @returns {String}
 */
const renderClosingFuture = (t, futures) => {
    let futuresMsg = "";
    for(const f of futures) {
        const plEmoji = f.pl >= 0 ? `${ProfitEmoji} +` : `${LossEmoji} `;
        futuresMsg += `\n${FutureEmoji} ${t.__(`Future`)} <code>${f.pid}</code> ${plEmoji}<b>${f.pl} USD</b> - ${t.__(`Margin`)} <b>${f.margin} USD</b>`
    }
    return `
${t.__(`Oy Gringos, tu veux qu'on clôture un Future ? Pas de problème, tiens voilà tes Futures ouverts :`)}

<i>(${t.__(`Clique sur l'ID du Future que tu veux clôturer et envoie le en réponse à ce message`)})</i>
${futuresMsg}
    `
}

/**
 * 
 * @param {Object} t for translation
 * @param {Number|undefined} lastOffer
 * 
 * @returns {String}
 */
const renderCreateFutureParamsError = (t) => {
    return `
${t.__(`Okay tu veux créer un Future voilà comment on fait par chez moi :`)}

${renderCreateFutureHelp(t)}

${t.__(`Pour t'inspirer voilà quelques commandes pour créer un Future :`)}

<code>/createfuture l q=100 x=50 p=35333 sl=35300</code>

<code>/createfuture s q=100 x=50 sl=36000 tp=38000</code>
    `;
}

/**
 * 
 * @param {Object} t for translation
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
const renderFutureReview = (t, params, displayPrice) => {
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
${t.__(`On va créer ce Future :`)}

${t.__(`Future`)} ${renderSide(params.side)}
${PriceEmoji} ${t.__(`Au prix`)} <b>${params.price ? params.price+" USD" : `${t.__(`Marché`)} (${displayPrice} USD)`}</b>
${QtyEmoji} ${t.__(`Quantité de`)} <b>${quantity} USD</b>
${LeverageEmoji} ${t.__(`Levier`)} <u>x${params.leverage}</u>
${MarginEmoji} ${t.__(`Marge de`)} <b>${t.__n(`%s sat`, margin)}</b>

${renderSL(t, params.stoploss)}
${renderTP(t, params.takeprofit)}
    `;
}

/**
 * 
 * @param {Object} t for translation
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
const renderFutureCreated = (t, future) => {
    return `
${t.__(`Le Future %s a été créé Gringos ! Tu le verras en cherchant %s`, `<code>${future.pid}</code>`, `<code>/futures</code>`)}
    `
}

/**
 * 
 * @param {Object} t for translation
 * @param {String} futureID 
 * 
 * @returns {String}
 */
const renderCloseFuture = (t, futureID) => {
    return t.__(`Le Future %s a été clôturé`, futureID);
}

/**
 * 
 * @param {Object} t for translation
 * 
 * @returns {String}
 */
const renderCloseAllFuture = (t) => {
    return t.__(`Tous les Futures ont été fermés !`);
}

/**
 * 
 * @param {Object} t for translation
 * @param {Number} agregatedPL
 * 
 * @returns {String}
 */
const renderCloseAllFutureConfirm = (t, agregatedPL) => {
    return `
${t.__(`Bon t'es sûr de toi ? On est sur un P/L cumulatif de`)} ${agregatedPL < 0 ? LossEmoji : ProfitEmoji } ${t.__n(`%s sat`, agregatedPL)}.
    `;
}

/**
 * @param {Object} t for translation
 * 
 * @returns {String}
 */
const renderCreateFutureHelp = (t) => {
    return `<code>/createfuture</code> ${t.__(`Créer un Future`)} <code>(l ou s) [q=&lt;USD quantity&gt;] x=&lt;levier&gt; [p=&lt;prix d'entrée&gt;] [m=&lt;marge&gt;] [sl=&lt;StopLoss&gt;] [tp=&lt;TakeProfit&gt;]</code>
<i>${t.__(`Mets %s pour faire un Long (Buy) et %s pour faire un Short (Sell)`, `<code>l</code>`, `<code>s</code>`)}</i>

<code>q</code> ${t.__(`c'est pour la quantité`)}
<code>m</code> ${t.__(`c'est pour la margin`)}
<b>${t.__(`Tu dois au moins préciser %s ou %s pour créer le Future`, `<code>q</code>`, `<code>m</code>`)}</b>

<code>p</code> ${t.__(`c'est pour préciser le limit price, si tu ne le mets pas alors je vais créer un order au prix de marché.`)}`; 
}

/**
 * 
 * @param {Object} t for translation
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
const renderCloseFuturePreview = (t, future, isStratPosition) => {
   return `
${t.__(`Perfecto ! Je te montre à quoi il ressemble et tu me confirmes si on le clôture ou non`)}

${renderFuture(t, future, isStratPosition)}
${isStratPosition ? `<i>${t.__(`C'est une position créée par la stratégie, tu peux la fermer manuellement elle sera prise en compte dans les statistiques de la stratégie`)}</i>` : ''}`;
}

/**
 * @param {Object} t for translation
 * 
 * @returns {String}
 */
const renderCloseFutureHelp = (t) => {
    return `<code>/closefuture</code> ${t.__(`Pour clôturer un Future rien de plus simple je te guide`)}`;
}

/**
 * @param {Object} t for translation
 * 
 * @returns {String}
 */
const renderCloseAllFutureHelp = (t) => {
    return `<code>/closeallfutures</code> ${t.__(`Pour clôturer tous les Futures ouverts.`)}`;
}

/**
 * @param {Object} t for translation
 * 
 * @returns {String}
 */
const renderNeedMe = (t) => {
    return t.__("Toujours besoin de moi Gringos ?");
}

/**
 * 
 * @param {Object} t for translation
 * @param {Error} err
 * @returns {String}
 */
const renderBadAPICreds = (t, err) => {
    return `
${t.__(`Hum... J'ai eu une erreur en essayant tes accès sur l'API de LNMarket, voilà l'erreur :`)}
${err}

<b>${t.__(`Pour recommencer fais à nouveau %s`, `<code>/start</code>`)}</b>
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
 * @param {Object} t for translation
 * @param {String} sl 
 * @returns {String}
 */
const renderSL = (t, sl) => {
    if (!sl) {
        return `${WarningEmoji} ${t.__(`Pas de StopLoss`)}`;
    }
    return `${t.__(`StopLoss à`)} <b>${sl} USD</b>`;
}
/**
 * 
 * @param {Object} t for translation
 * @param {String} tp 
 * @returns {String}
 */
const renderTP = (t, tp) => {
    if (!tp) {
        return `${WarningEmoji} ${t.__(`Pas de TakeProfit`)}`;
    }
    return `${t.__(`TakeProfit à`)} <b>${tp} USD</b>`;
}
/**
 * @param {Object} t for translation
 * @param {String} pl 
 * 
 * @returns {String}
 */
const renderPL = (t, pl) => {
    if (pl <= 0) {
        return `${LossEmoji} ${t.__(`P/L à`)} <b>${t.__n(`%s sat`, pl)}</b>`;
    }
    return `${ProfitEmoji} ${t.__(`P/L à`)} +<b>${t.__n(`%s sat`, pl)}</b>`;
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
 * @param {Object} t for translation
 * @param {Error} e 
 * 
 * @returns {String}
 */
const renderError = (t, e) => {
    return t.__(`Oulah y'a une erreur`) + `> ${e}`;
}

/**
 * 
 * @param {Object} t for translation
 * 
 * @returns {String}
 */
const renderCmdNotAvailable = (t) => {
    return `
${t.__(`Cette fonctionnalité n'est pas encore dispo, c'est pas d'chance.`)}

${t.__(`Laisse un mot sur le Github si tu veux à tout prix ce que tu cherches`)} <a href="https://github.com/Chaine-de-Blocs/el-marco-bot">${t.__(`Aller sur le Github de Elmarco`)}</a>
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
    renderCloseFuturePreview,
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