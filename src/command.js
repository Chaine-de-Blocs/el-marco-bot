const Client = require('./client');

// Actions
const Actions = {
    ActionCreateFuture: "createfuture",
    ActionCloseFuture: "closefuture",
    ActionCloseAllFutures: "closeallfutures",
    ActionCancel: "cancel",
    ActionStartStrategy: "startstrategy",
};

const Params = {
    ParamLong: {
        index: 1,
        label: "l",
    },
    ParamShort: {
        index: 1,
        label: "s",
    },
    ParamQuantity: {
        index: 2,
        label: "q",
        type: "number",
    },
    ParamLeverage: {
        index: 3,
        label: "x",
        type: "number",
    },
    ParamPrice: {
        index: 4,
        label: "p",
        type: "number",
    },
    ParamMargin: {
        index: 5,
        label: "m",
        type: "number",
    },
    ParamSL: {
        index: 6,
        label: "sl",
        type: "number",
    },
    ParamTP: {
        index: 7,
        label: "tp",
        type: "number",
    },
    ParamUnknown: {
        index: 42,
        label: "unk",
    },
};

const fr = Client.GetIntl("fr");
Client.ElMarco.setMyCommands([{
    command: "start",
    description: fr.__("Démarrer El Marco Bot pour faire fortune (en sat bien évidemment)"),
}, {
    command: "closeallfutures",
    description: fr.__("Fermer tous les Futures en cours"),
}, {
    command: "help",
    description: fr.__("Afficher l'aide pour bosser avec El Marrrco"),
}, {
    command: "home",
    description: fr.__("Retour à la page d'accueil"),
}, {
    command: "balance",
    description: fr.__("Mettre à jour sa balance LNMarket"),
}, {
    command: "options",
    description: fr.__("Consulter ses Options ouvertes"),
}, {
    command: "futures",
    description: fr.__("Consulter ses Futures ouverts"),
}, {
    command: "createfuture",
    description: fr.__("Créer un Future"),
}, {
    command: Actions.ActionCloseFuture,
    description: fr.__("Fermer un Future en cours"),
}, {
    command: "deposit",
    description: fr.__("Déposer des fonds dans ton portefeuille LNMarket"),
}, {
    command: "strategy",
    description: fr.__("Activer mes trades automatiques (je ferais de mon mieux mais je peux rien t'assurer)"),
}, {
    command: "stopstrategy",
    description: fr.__("Stopper les trades automatiques en cours (attention ça ne les clôture pas)"),
}, {
    command: "strategystats",
    description: fr.__("Afficher les stats de la stratégie en cours"),
}, {
    command: "tips",
    description: fr.__("Fais plaisir à mon créateur en lui envoyant des sats"),
}, {
    command: "removesession",
    description: fr.__("Supprime ta session en cours, j'oublie tous tes accès API"),
}], {
    language_code: "fr",
});

const en = Client.GetIntl("en");
Client.ElMarco.setMyCommands([{
    command: "start",
    description: en.__("Démarrer El Marco Bot pour faire fortune (en sat bien évidemment)"),
}, {
    command: "closeallfutures",
    description: en.__("Fermer tous les Futures en cours"),
}, {
    command: "help",
    description: en.__("Afficher l'aide pour bosser avec El Marrrco"),
}, {
    command: "home",
    description: en.__("Retour à la page d'accueil"),
}, {
    command: "balance",
    description: en.__("Mettre à jour sa balance LNMarket"),
}, {
    command: "options",
    description: en.__("Consulter ses Options ouvertes"),
}, {
    command: "futures",
    description: en.__("Consulter ses Futures ouverts"),
}, {
    command: "createfuture",
    description: en.__("Créer un Future"),
}, {
    command: Actions.ActionCloseFuture,
    description: en.__("Fermer un Future en cours"),
}, {
    command: "deposit",
    description: en.__("Déposer des fonds dans ton portefeuille LNMarket"),
}, {
    command: "strategy",
    description: en.__("Activer mes trades automatiques (je ferais de mon mieux mais je peux rien t'assurer)"),
}, {
    command: "stopstrategy",
    description: en.__("Stopper les trades automatiques en cours (attention ça ne les clôture pas)"),
}, {
    command: "strategystats",
    description: en.__("Afficher les stats de la stratégie en cours"),
}, {
    command: "tips",
    description: en.__("Fais plaisir à mon créateur en lui envoyant des sats"),
}, {
    command: "removesession",
    description: en.__("Supprime ta session en cours, j'oublie tous tes accès API"),
}], {
    language_code: "en",
});

/**
 * 
 * @param {String} cmd
 * @param {Number} index
 * @returns {Object}
 */
const parseCommandParam = (cmd, index) => {
    if (typeof cmd === "undefined") {
        switch(index) {
            case Params.ParamQuantity.index:
                return {
                    param: Params.ParamQuantity,
                };
            case Params.ParamLeverage.index:
                return {
                    param: Params.ParamLeverage,
                };
            case Params.ParamPrice.index:
                return {
                    param: Params.ParamPrice,
                };
            case Params.ParamMargin.index:
                return {
                    param: Params.ParamMargin,
                };
            case Params.ParamSL.index:
                return {
                    param: Params.ParamSL,
                }
            case Params.ParamTP.index:
                return {
                    param: Params.ParamTP,
                };
            default:
                return {
                    param: Params.ParamUnknown,
                };
        }
    }

    cmd = cmd.replace(/ /ig, "");

    const paramValue = cmd.split("=");
    if (paramValue.length === 0 || paramValue.length > 2) {
        return {
            param: Params.ParamUnknown,
        };
    }

    if (paramValue.length < 2) {
        switch(paramValue[0].toLowerCase()) {
            case Params.ParamLong.label:
                return {
                    param: Params.ParamLong,
                };
            case Params.ParamShort.label:
                return {
                    param: Params.ParamShort,
                };
        }
    }

    const param = paramValue[0];
    let value = paramValue[1];

    let resParam = Params.ParamUnknown;

    switch(param.toLowerCase()) {
        case Params.ParamQuantity.label:
            resParam = Params.ParamQuantity;
            break;
        case Params.ParamLeverage.label:
            resParam = Params.ParamLeverage;
            break;
        case Params.ParamPrice.label:
            resParam = Params.ParamPrice;
            break;
        case Params.ParamMargin.label:
            resParam = Params.ParamMargin;
            break;
        case Params.ParamSL.label:
            resParam = Params.ParamSL;
            break;
        case Params.ParamTP.label:
            resParam = Params.ParamTP;
            break;
    }

    if (resParam.type === "number") {
        value = +value;
    }

    return {
        param: resParam,
        value,
    }
}

module.exports = {
    Actions,
    Params,
    parseCommandParam,
}