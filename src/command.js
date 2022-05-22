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

Client.ElMarco.setMyCommands([{
    command: "start",
    description: "Démarrer El Marco Bot pour faire fortune (en sat bien évidemment)",
}, {
    command: "closeallfutures",
    description: "Fermer tous les Futures en cours",
}, {
    command: "help",
    description: "Afficher l'aide pour bosser avec El Marrrco",
}, {
    command: "home",
    description: "Retour à la page d'accueil"
}, {
    command: "balance",
    description: "Mettre à jour sa balance LNMarket",
}, {
    command: "options",
    description: "Consulter ses Options ouvertes",
}, {
    command: "futures",
    description: "Consulter ses Futures ouverts",
}, {
    command: "createfuture",
    description: "Créer un Future",
}, {
    command: Actions.ActionCloseFuture,
    description: "Fermer un Future en cours",
}, {
    command: "deposit",
    description: "Déposer des fonds dans ton portefeuille LNMarket",
}, {
    command: "strategy",
    description: "Activer mes trades automatiques (je ferais de mon mieux mais je peux rien t'assurer)",
}, {
    command: "stopstrategy",
    description: "Stopper les trades automatiques en cours (attention ça ne les clôture pas)",
}, {
    command: "strategystats",
    description: "Afficher les stats de la stratégie en cours",
}, {
    command: "tips",
    description: "Fais plaisir à mon créateur en lui envoyant des sats",
}, {
    command: "removesession",
    description: "Supprime ta session en cours, j'oublie tous tes accès API",
}]);

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