require("dotenv").config();
const LogLevel = require("loglevel");
const useMdw = require("node-telegram-bot-api-middleware").use;
const QRCode = require("qrcode");

const Auth = require("./auth");
const Client = require("./client");
const Command = require("./command");
const Content = require("./content");
const DB = require("./db");
const KV = require("./kv");
const { StrategyProcess, Strategies } = require("./strats");
const Strat = require("./strats");

const strategy = new StrategyProcess();

DB.Init();

const displayChatError = (t, e, chatId) => {
    LogLevel.warn(`error=[e: ${e}]`);
    Client.ElMarco.sendMessage(chatId, Content.renderError(t, e));
}

const init = async () => {
    const users = await DB.ListUsers();
    let user;
    while((user = await users.next())) {
        const t = Client.GetIntl(user.lang || "");
        Client.ElMarco.sendMessage(
            user._id,
            Content.renderBotRestartMessage(t, process.env.npm_package_version, process.env.CUSTOM_RESTART_MESSAGE),
            {
                parse_mode: "HTML",
            },
        );
    }
}

const authMiddleware = useMdw(Auth.authMiddleware(displayChatError));

Client.ElMarco.onText(new RegExp(`^(\/start)( )*$|^${Content.Emoji.StartEmoji}.*`), async (msg) => {
    const t = Client.GetIntl(msg.from.language_code);
    const msgSent = await Client.ElMarco.sendMessage(
        msg.chat.id,
        Content.renderStartAPICreds(t, process.env.LNM_NETWORK),
        {
            parse_mode: "HTML",
            reply_markup: {
                force_reply: true,
            },
        }
    );

    Client.ElMarco.onReplyToMessage(
        msg.chat.id,
        msgSent.message_id,
        (replyMsg) => {
            const creds = replyMsg.text.split(" ");

            if (creds.length !== 3) {
                Client.ElMarco.sendMessage(
                    msg.chat.id,
                    Content.renderRequireNewsession(t),
                    {
                        parse_mode: "HTML",
                    },
                );
                return;
            }

            const clientId = creds[0];
            const clientSecret = creds[1];
            const passphrase = creds[2];

            Client
                .GetLNMarketClient(clientId, clientSecret, passphrase)
                .getUser()
                .then(async _ => {
                    await DB.SaveAPICreds(msg.chat.id, clientId, clientSecret, passphrase, msg.from.language_code);

                    // TODO allow user to define session expiration
                    await KV.Store(passphrase, msg.chat.id);

                    renderDefaultMenu(t, msg.chat.id, Content.renderStartSuccess(t));
                })
                .catch(e => {
                    Client.ElMarco.sendMessage(
                        msg.chat.id,
                        Content.renderBadAPICreds(t, e),
                        {
                            parse_mode: "HTML",
                        },
                    );
                });
        }
    );
});

Client.ElMarco.onText(/\/removesession( )*/, (msg) => { 
    const t = Client.GetIntl(msg.from.language_code);
    KV.Delete(msg.chat.id);
    DB.DeleteAPICreds(msg.chat.id);
    renderDefaultMenu(t, msg.chat.id, Content.renderRemoveSessionMessage(t));
});

Client.ElMarco.onText(/\/home/, async (msg) => {
    const t = Client.GetIntl(msg.from.language_code);
    renderDefaultMenu(t, msg.chat.id, Content.renderNeedMe(t));
});
Client.ElMarco.onText(new RegExp(`^(\/help)( )*$|^${Content.Emoji.HelpEmoji}.*`), async (msg) => {
    const t = Client.GetIntl(msg.from.language_code);
    renderDefaultMenu(t, msg.chat.id, Content.renderHelp(t));
});
Client.ElMarco.onText(new RegExp(`^${Content.Emoji.PriceEmoji}.*`), (msg) => {
    const t = Client.GetIntl(msg.from.language_code);
    renderDefaultMenu(t, msg.chat.id, t.__("J'actualise le dernier prix du marché"));
});
Client.ElMarco.onText(new RegExp(`^(\/strategystats)( )*|^${Content.Emoji.RefreshEmoji}.*`), (msg) => {
    const t = Client.GetIntl(msg.from.language_code);
    strategy.computeStats(msg.chat.id)
        .then(stats => {
            renderDefaultMenu(
                t,
                msg.chat.id,
                Content.renderStartegyStats(t, stats),
            );
        })
        .catch(e => displayChatError(t, e, msg.chat.id));
});

Client.ElMarco.onText(new RegExp(`^(\/strategy)( )*$|^${Content.Emoji.BotEmoji}.*`), (msg) => {
    const t = Client.GetIntl(msg.from.language_code);
    if (strategy.hasRunningStrategy(msg.chat.id)) {
        Client.ElMarco.sendMessage(
            msg.chat.id,
            Content.renderAlreadyRunningStrat(t),
            {
                parse_mode: "HTML",
            }
        );
        return;
    }

    Client.ElMarco.sendMessage(
        msg.chat.id,
        Content.renderStartStrategy(t),
        {
            parse_mode: "HTML",
            reply_markup: {
                force_reply: true,
            },
        },
    ).then(sendMsg => {
        Client.ElMarco.onReplyToMessage(
            msg.chat.id,
            sendMsg.message_id,
            async (replyMsg) => {
                const matchParams = /(random) ?(\d*)? ?(\d*)? ?(\d*)/ig.exec(replyMsg.text);

                let strat;
                let options = {
                    max_openned_positions: 3,
                    max_leverage: 25,
                    max_margin: 10000,
                    logs_for: Strat.StrategyActions, // logs everything for now
                };

                if (matchParams && matchParams.length >= 5) {
                    strat = matchParams[1];
                    options.max_openned_positions = matchParams[2]
                        ? +matchParams[2].replace(" ", "")
                        : options.max_openned_positions;
                    options.max_leverage = matchParams[3]
                        ? +matchParams[3].replace(" ", "")
                        : options.max_leverage;
                    options.max_margin = matchParams[4]
                        ? +matchParams[4].replace(" ", "")
                        : options.max_margin;
                }

                if (!Strategies.includes(strat)) {
                    displayChatError(
                        t,
                        new Error(t.__(`La stratégie %s n'existe pas`, strat || "")),
                        msg.chat.id,
                    );
                    return;
                }

                if (options.max_openned_positions > 6) {
                    displayChatError(t, new Error(t.__(`%s ne peut pas être supérieur à %s`, `[max_openned_positions]`, 6)), msg.chat.id);
                    return;
                }

                if (options.max_leverage > 100) {
                    displayChatError(t, new Error(t.__(`%s ne peut pas être supérieur à %s`, `[max_leverage]`, 100)), msg.chat.id);
                    return;
                }

                if (options.max_margin < 776 || options.max_margin > 1000000) {
                    displayChatError(t, new Error(t.__(`%s ne peut pas inférieur à %s et supérieur à %s`, `[max_margin]`, 776, 1000000)), msg.chat.id);
                    return;
                }

                const payload = JSON.stringify({
                    strat,
                    options,
                });

                let id = "";
                try {
                    id = await KV.Store(payload);
                } catch(e) {
                    displayChatError(t, new Error(t.__(`Prob serveur meh`)), msg.chat.id)
                    return
                }
                
                Client.ElMarco.sendMessage(
                    msg.chat.id,
                    Content.renderStartegyPreview(t, strat, options),
                    {
                        parse_mode: "HTML",
                        reply_markup: {
                            remove_keyboard: true,
                            inline_keyboard: [[{
                                text: t.__(`Lance la stratégie`),
                                callback_data: `${Command.Actions.ActionStartStrategy};${id}`,
                            }, {
                                text: t.__(`Nope, on annule`),
                                callback_data: `${Command.Actions.ActionCreateFuture};${Command.Actions.ActionCancel}`,
                            }]],
                            one_time_keyboard: true,
                        }
                    }
                );
            }
        );
    }).catch(e => displayChatError(t, e, msg.chat.id));
});

Client.ElMarco.onText(/\/stopstrategy.*/, async (msg) => {
    const t = Client.GetIntl(msg.from.language_code);
    try {
        const stats = await strategy.computeStats(msg.chat.id);

        strategy.stopUserStrategy(msg.chat.id);
        
        renderDefaultMenu(
            t,
            msg.chat.id,
            Content.renderStategyStop(t, stats),
        );
    } catch (e) {
        displayChatError(t, e, msg.chat.id);
    }
});

Client.ElMarco.onText(/\/balance.*/, (msg) => {
    const t = Client.GetIntl(msg.from.language_code);
    renderDefaultMenu(t, msg.chat.id, t.__("Je mets ta balance à jour"));
});

Client.ElMarco.onText(/\/deposit.*/, authMiddleware(function (msg) {
    const t = Client.GetIntl(msg.from.language_code);

    const apiCreds = this.getAPICreds();
    Client.ElMarco.sendMessage(
        msg.chat.id,
        Content.renderDepositRequest(t),
        {
            parse_mode: "HTML",
            reply_markup: {
                force_reply: true,
            }
        }   
    ).then(msgSent => {
        Client.ElMarco.onReplyToMessage(
            msg.chat.id,
            msgSent.message_id,
            async (replyMsg) => {
                const value = +replyMsg.text;
                if (typeof value !== "number") {
                    displayChatError(new Error(t.__(`La valeur fournie est pas un nombre. Donne moi une valeur numérique pour représenter une valeur en sats.`)), msg.chat.id);
                    return
                }

                try {
                    const res = 
                        await Client.GetLNMarketClient(
                            apiCreds.api_client,
                            apiCreds.api_secret,
                            apiCreds.passphrase,
                        ).deposit({ amount: value });
                    
                    const qrcodeBuffer = await QRCode.toBuffer(res.paymentRequest);

                    // TODO replace buffer usage for sendPhoto which require
                    // stream
                    Client.ElMarco.sendPhoto(
                        msg.chat.id,
                        qrcodeBuffer,
                        {
                            caption: res.paymentRequest
                        }
                    );
                } catch (e) {
                    displayChatError(t, e, msg.chat.id);
                }
            }
        );
    }).catch(e => displayChatError(t, e, msg.chat.id));

}));

Client.ElMarco.onText(/\/options/, authMiddleware(function(msg) {
    const t = Client.GetIntl(msg.from.language_code);
    const apiCreds = this.getAPICreds();
    Client.GetLNMarketClient(apiCreds.api_client, apiCreds.api_secret, apiCreds.passphrase).optionsGetPositions()
        .then((res) => {
            if (res.length === 0) {
                Client.ElMarco.sendMessage(
                    msg.chat.id,
                    Content.renderNoOptions(t),
                    { parse_mode: "HTML" }
                );
                return;
            }
            for(const opt of res) {
                const contentMsg = Content.renderOption(t, {
                    id: opt.id,
                    strike: opt.strike,
                    margin: opt.margin,
                    quantity: opt.quantity,
                    created_at: new Date(opt.creation_ts),
                    expire_at: new Date(opt.expiry_ts),
                });
                Client.ElMarco.sendMessage(msg.chat.id, contentMsg, { parse_mode: "HTML"});
            }
        })
        .catch((e) => displayChatError(t, e, msg.chat.id));
}));

Client.ElMarco.onText(/\/futures/, authMiddleware(function (msg) {
    const t = Client.GetIntl(msg.from.language_code);
    const apiCreds = this.getAPICreds();
    Client.GetLNMarketClient(apiCreds.api_client, apiCreds.api_secret, apiCreds.passphrase).futuresGetPositions()
        .then(async (res) => {
            if (res.length === 0) {
                Client.ElMarco.sendMessage(
                    msg.chat.id,
                    Content.renderNoFutures(t),
                    { parse_mode: "HTML" }
                );
                return;
            }
            for(const future of res) {
                const stratFuture = await DB.FindStrategyPositionByPID(msg.chat.id, future.pid);
                Client.ElMarco.sendMessage(
                    msg.chat.id,
                    Content.renderFuture(t, future, stratFuture !== null),
                    { parse_mode: "HTML" },
                );
            }
        })
        .catch((e) => displayChatError(t, e, msg.chat.id));
}));

Client.ElMarco.onText(new RegExp(`^(\/createfuture)( )*$|^${Content.Emoji.FutureEmoji}.*`), (msg) => {
    const t = Client.GetIntl(msg.from.language_code);
    renderDefaultMenu(t, msg.chat.id, Content.renderCreateFutureParamsError(t));
});
Client.ElMarco.onText(new RegExp(`^${Content.Emoji.OptionEmoji}.*`), (msg) => {
    const t = Client.GetIntl(msg.from.language_code);
    renderDefaultMenu(t, msg.chat.id, Content.renderCmdNotAvailable(t));
})

Client.ElMarco.onText(/\/createfuture .*/gi, authMiddleware(async function(msg, match) {
    const t = Client.GetIntl(msg.from.language_code);

    const paramsRgx = new RegExp(/\/createfuture (l|s)( +q=\d+[,|\.]?\d*)? (x=\d+)( +p=\d+[,|\.]?\d*)?( +m=\d+[,|\.]?\d*)?( +sl=\d+[,|\.]?\d*)?( +tp=\d+[,|\.]?\d*)?/gi);

    const matchParams = paramsRgx.exec(match[0]);
     
    if (!matchParams || matchParams.length < 8) {
        Client.ElMarco.sendMessage(
            msg.chat.id,
            Content.renderCreateFutureParamsError(t),
            {
                parse_mode: "HTML",
            },
        );
        return;
    }

    let side, type, margin, leverage, quantity, takeprofit, stoploss, price;

    for(let i = 1; i <= 7; i++) {
        const p = Command.parseCommandParam(matchParams[i], i);

        switch(p.param.label) {
            case Command.Params.ParamLong.label:
                side = "b";
                break;
            case Command.Params.ParamShort.label:
                side = "s";
                break;
            case Command.Params.ParamQuantity.label:
                quantity = p.value;
                break;
            case Command.Params.ParamLeverage.label:
                leverage = p.value;
                break;
            case Command.Params.ParamPrice.label:
                price = p.value;
                break;
            case Command.Params.ParamMargin.label:
                margin = p.value;
                break;
            case Command.Params.ParamSL.label:
                stoploss = p.value;
                break;
            case Command.Params.ParamTP.label:
                takeprofit = p.value;
                break;
            case Command.Params.ParamUnknown.label:
            default:
                LogLevel.warn(`/createfuture=[unknow_param, param:${p.param.label}]`);
                break;
        }
    }

    type = price ? "l" : "m";

    const futureParam = {
        side, type, margin, leverage, quantity, takeprofit, stoploss, price,
    };

    const payload = JSON.stringify(futureParam);

    let id = "";
    try {
        id = await KV.Store(payload);
    } catch(e) {
        displayChatError(t, new Error(t.__("Prob serveur meh")), msg.chat.id)
        return
    }

    let displayPrice = futureParam.price;

    if (type === "m") {
        try {
            const apiCreds = this.getAPICreds();

            const ticker = await Client.GetLNMarketClient(apiCreds.api_client, apiCreds.api_secret, apiCreds.passphrase)
                .futuresGetTicker();
            
            displayPrice = ticker.offer;
        } catch(e) {
            LogLevel.trace("fetch ticker err", `[err=${e}]`)
            displayPrice = undefined;
        }
    }

    Client.ElMarco.sendMessage(
        msg.chat.id,
        Content.renderFutureReview(t, futureParam, displayPrice),
        {
            parse_mode: "HTML",
            reply_markup: {
                remove_keyboard: true,
                inline_keyboard: [[{
                    text: t.__("Créé le Future"),
                    callback_data: `${Command.Actions.ActionCreateFuture};${id}`,
                }, {
                    text: t.__("Nope, on annule"),
                    callback_data: `${Command.Actions.ActionCreateFuture};${Command.Actions.ActionCancel}`,
                }]],
                one_time_keyboard: true,
            }
        }
    );
}));

Client.ElMarco.onText(/\/tips( )*(\d*)/, async (msg, match) => {
    const t = Client.GetIntl(msg.from.language_code);

    let sats = 5000;
    if (match.length >= 3 && match[2]) {
        sats = +match[2];
    }

    const lnmClient = Client.GetLNMarketClient(
        process.env.LNM_KEY,
        process.env.LNM_SECRET,
        process.env.LNM_PASSPHRASE,
    );

    const res = await lnmClient.deposit({ amount: sats });

    Client.ElMarco.sendMessage(
        msg.chat.id,
        Content.renderTipsMessage(t, sats),
        {
            parse_mode: "HTML",
        },
    );

    setTimeout(() => {
        // TODO replace buffer usage for sendPhoto which require
        // stream
        QRCode.toBuffer(res.paymentRequest)
            .then(qrcodeBuffer /* Buffer */ => {
                Client.ElMarco.sendPhoto(
                    msg.chat.id,
                    qrcodeBuffer,
                    {
                        caption: res.paymentRequest
                    }
                )
            })
            .catch(e => displayChatError(t, msg.chat.id, e));
    }, 7500);
});

Client.ElMarco.onText(/\/closefuture/, authMiddleware(function(msg) {
    const t = Client.GetIntl(msg.from.language_code);
    const apiCreds = this.getAPICreds();
    Client.GetLNMarketClient(apiCreds.api_client, apiCreds.api_secret, apiCreds.passphrase).futuresGetPositions()
        .then(async (res) => {
            const msgSent = await Client.ElMarco.sendMessage(
                msg.chat.id,
                Content.renderClosingFuture(t, res),
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        force_reply: true,
                    }
                }
            );

            Client.ElMarco.onReplyToMessage(msg.chat.id, msgSent.message_id, async (replyMsg) => {
                let closingFuture = null;
                const pid = replyMsg.text.replace(" ", "");
                for(const f of res) {
                    if (f.pid === pid) {
                        closingFuture = f;
                        break;
                    }
                }

                if (closingFuture === null) {
                    Client.ElMarco.sendMessage(
                        msg.chat.id,
                        t.__(`C'est quoi cet identifiant %s ? Concentre toi je ne le trouve`, replyMsg.text),
                    );
                    return;
                }

                const isStrategyPosition = await strategy.isStrategyPosition(msg.chat.id, closingFuture.pid);
                Client.ElMarco.sendMessage(
                    msg.chat.id,
                    Content.renderCloseFuturePreview(t, closingFuture, isStrategyPosition),
                    {
                        parse_mode: "HTML",
                        reply_markup: {
                            remove_keyboard: true,
                            inline_keyboard: [[{
                                text: t.__("Go on le clôture"),
                                callback_data: `${Command.Actions.ActionCloseFuture};${closingFuture.pid}`,
                            }, {
                                text: t.__("Nope, on annule"),
                                callback_data: `${Command.Actions.ActionCloseFuture};${Command.Actions.ActionCancel}`,
                            }]],
                            one_time_keyboard: true,
                            force_reply: true,
                        }
                    }  
                )
            });
        })
        .catch((e) => displayChatError(t, e, msg.chat.id))
}));

Client.ElMarco.onText(/\/closeallfutures/, authMiddleware(function(msg) {
    const t = Client.GetIntl(msg.from.language_code);
    const apiCreds = this.getAPICreds();
    Client.GetLNMarketClient(apiCreds.api_client, apiCreds.api_secret, apiCreds.passphrase).futuresGetPositions()
        .then(res => {
            if (res.length === 0) {
                renderDefaultMenu(t, msg.chat.id, Content.renderNoFutures(t))
                return;
            }

            let agregatedPL = 0;

            for(const future of res) {
                agregatedPL += +future.pl;
                Client.ElMarco.sendMessage(msg.chat.id, Content.renderFuture(t, future), { parse_mode: "HTML" });
            }
            Client.ElMarco.sendMessage(
                msg.chat.id,
                Content.renderCloseAllFutureConfirm(t, agregatedPL),
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        remove_keyboard: true,
                        inline_keyboard: [[{
                            text: t.__(`On les clôture tous`),
                            callback_data: `${Command.Actions.ActionCloseAllFutures}`,
                        }, {
                            text: t.__(`Nope, on annule`),
                            callback_data: `${Command.Actions.ActionCloseAllFutures};${Command.Actions.ActionCancel}`,
                        }]],
                        one_time_keyboard: true,
                        force_reply: true,
                    }
                }  
            )
        })
        .catch(e => displayChatError(t, e, msg.chat.id));
}));

// Special case for Balance button in keyboard markup
Client.ElMarco.onText(new RegExp(`${Content.Emoji.BalanceEmoji}.*`), (msg) => {
    const t = Client.GetIntl(msg.from.language_code);
    renderDefaultMenu(t, msg.chat.id, Content.renderNeedMe(t));
})

Client.ElMarco.on("callback_query", async (query) => {
    const t = Client.GetIntl(query.from.language_code);

    const data = query.data.split(";");
    if (!data[0]) {
        Client.ElMarco.answerInlineQuery(query.id);
        Client.ElMarco.sendMessage(
            query.message.chat.id,
            t.__("J'ai pas bien compris ta réponse") + " 🤨"
        );
        return;
    }

    let api_client, api_secret, passphrase;
    let isAuth = false;
    try {
        const apiCreds = await Auth.fetchAPICreds(query.message.chat.id);
        api_client = apiCreds.api_client;
        api_secret = apiCreds.api_secret;
        passphrase = apiCreds.passphrase;
        isAuth = true;
    } catch(e) {
        LogLevel.trace("dont have API creds", `[err=${e},chat_id=${query.message.chat.id}]`);
    }

    if (!isAuth) {
        Client.ElMarco.answerCallbackQuery(query.id);
        Client.ElMarco.sendMessage(
            query.message.chat.id,
            Content.renderRequireNewsession(t),
            {
                parse_mode: "HTML",
            },
        );
        return;
    }

    const lnClient = Client.GetLNMarketClient(api_client, api_secret, passphrase);

    switch(data[0]) {
        case Command.Actions.ActionCloseFuture:
            if (data[1] === Command.Actions.ActionCancel) {
                Client.ElMarco.answerCallbackQuery(query.id, {
                    text: t.__("No problemo, on ne le clôture pas !"),
                });
                Client.ElMarco.deleteMessage(query.message.chat.id, query.message.message_id);
                renderDefaultMenu(t. query.message.chat.id, Content.renderNeedMe(t))
                break;
            }

            lnClient.futuresClosePosition({ pid: data[1] })
                .then((position) => {
                    strategy.closePositionManually(query.message.chat.id, position);
                    Client.ElMarco.answerCallbackQuery(query.id);
                    Client.ElMarco.deleteMessage(query.message.chat.id, query.message.message_id);
                    Client.ElMarco.sendMessage(query.message.chat.id, Content.renderCloseFuture(t, data[1]));
                })
                .catch((e) => {
                    Client.ElMarco.answerCallbackQuery(query.id, {
                        text: Content.renderError(t, e),
                    });
                })
                .finally(() => 
                    renderDefaultMenu(t, query.message.chat.id, Content.renderNeedMe(t))
                );
            break;
        case Command.Actions.ActionCloseAllFutures:
            if (data[1] === Command.Actions.ActionCancel) {
                Client.ElMarco.answerCallbackQuery(query.id, {
                    text: t.__("No problemo, on ne les clôture pas !"),
                });
                Client.ElMarco.deleteMessage(query.message.chat.id, query.message.message_id);
                renderDefaultMenu(t, query.message.chat.id, Content.renderNeedMe(t))
                break;
            }

            lnClient.futuresCloseAllPositions()
                .then((_) => {
                    Client.ElMarco.answerCallbackQuery(query.id);
                    Client.ElMarco.deleteMessage(query.message.chat.id, query.message.message_id);
                    Client.ElMarco.sendMessage(query.message.chat.id, Content.renderCloseAllFuture(t));
                })
                .catch((e) => {
                    Client.ElMarco.answerCallbackQuery(query.id, {
                        text: Content.renderError(t, e),
                    });
                })
                .finally(() => 
                    renderDefaultMenu(t, query.message.chat.id, Content.renderNeedMe(t))
                );

            break;
        case Command.Actions.ActionCreateFuture:
            if (data[1] === Command.Actions.ActionCancel) {
                Client.ElMarco.answerCallbackQuery(query.id, {
                    text: t.__("No problemo, on va pas créer le Future"),
                });
                Client.ElMarco.deleteMessage(query.message.chat.id, query.message.message_id);
                renderDefaultMenu(t ,query.message.chat.id, Content.renderNeedMe(t))
                break;
            }

            KV.Get(data[1])
                .then(async value => {
                    const params = JSON.parse(value);
                    const res = await lnClient.futuresNewPosition(params);

                    Client.ElMarco.answerCallbackQuery(query.id);
                    Client.ElMarco.deleteMessage(query.message.chat.id, query.message.message_id);
                    Client.ElMarco.sendMessage(
                        query.message.chat.id,
                        Content.renderFutureCreated(t, res.position),
                        {
                            parse_mode: "HTML",
                        }
                    );
                })
                .catch((e) => displayChatError(t, `Error futuresNewPosition ${e}`, query.message.chat.id))
                .finally(() =>
                    renderDefaultMenu(t, query.message.chat.id, Content.renderNeedMe(t))
                );
            break;
        case Command.Actions.ActionStartStrategy:
            if (data[1] === Command.Actions.ActionCancel) {
                Client.ElMarco.answerCallbackQuery(query.id, {
                    text: t.__("Pas de jobs pour moi, ye compris..."),
                });
                Client.ElMarco.deleteMessage(query.message.chat.id, query.message.message_id);
                renderDefaultMenu(t, query.message.chat.id, Content.renderNeedMe(t))
                break;
            }

            KV.Get(data[1])
                .then(async value => {
                    const params = JSON.parse(value);

                    await strategy.createUserStrategy(
                        query.message.chat.id,
                        params.strat,
                        params.options,
                        lnClient,
                    );

                    Client.ElMarco.answerCallbackQuery(query.id);
                    Client.ElMarco.deleteMessage(query.message.chat.id, query.message.message_id);
                    Client.ElMarco.sendMessage(
                        query.message.chat.id,
                        Content.renderStrategyStarted(t, params.strat),
                        {
                            parse_mode: "HTML",
                        }
                    );
                })
                .catch((e) => displayChatError(t, t.__(`J'ai pas réussi à initier la stratégie %s`, e), query.message.chat.id))
                .finally(() =>
                    renderDefaultMenu(t, query.message.chat.id, Content.renderNeedMe(t))
                );
                break;
        default:
            LogLevel.warn(`unknown_cb_action: [${data[0]}]`);
            Client.ElMarco.answerCallbackQuery(query.id, {
                text: t.__("Ye connais pas ça !"),
            });
            renderDefaultMenu(t, query.message.chat.id, Content.renderNeedMe(t))
    }
});

/**
 * 
 * @param {Object} t for translation
 * @param {String} chatID 
 * @param {String} message 
 */
const renderDefaultMenu = async (t, chatID, message) => {
    let balance, lastOffer;
    try {
        const apiCreds = await Auth.fetchAPICreds(chatID);
        const lnClient = Client.GetLNMarketClient(apiCreds.api_client, apiCreds.api_secret, apiCreds.passphrase);
        const lnmUserInfo = await lnClient.getUser();
        const futureTicker = await lnClient.futuresGetTicker();

        balance = lnmUserInfo.balance;
        lastOffer = futureTicker.offer;
    } catch(e) {
        LogLevel.trace("failed to fetch balance");
    }

    const menu = [[]];

    const topMenu = [];
    if (typeof lastOffer !== "undefined") {
        topMenu.push(`${Content.Emoji.PriceEmoji} ${t.__(`Dernier prix à`)} ${lastOffer}USD`);
    }

    const balanceBtn = typeof balance !== "undefined"
        ? `${Content.Emoji.BalanceEmoji} ${t.__(`Ta balance est de`)} ${t.__n(`%s sat`, balance)}` 
        : `${Content.Emoji.StartEmoji} ${t.__(`Créer une session pour commencer`)}`;

    topMenu.push(balanceBtn);

    menu.push(topMenu);
    menu.push([`${Content.Emoji.FutureEmoji} ${t.__(`Créer un Future`)}`, `${Content.Emoji.OptionEmoji} ${t.__(`Créer une Option`)}`, `${Content.Emoji.HelpEmoji} ${t.__(`Aide`)}`]);

    try {
        const runningStrat = await strategy.getRunningStrategy(chatID);

        const stats = await strategy.computeStats(chatID);

        menu.push([
            `${Content.Emoji.RefreshEmoji} ${t.__(`Je travaille la stratégie`)} ${runningStrat.strategy} | PL ${t.__n(`%s sat`, stats.total_pl)}`
        ]);
    } catch(_) {
        menu.push([
            `${Content.Emoji.BotEmoji} ${t.__(`Lancer une Stratégie`)}`
        ]);
    }

    Client.ElMarco.sendMessage(chatID, message, {
        parse_mode: "HTML",
        reply_markup: {
            keyboard: menu,
            resize_keyboard: true,
            one_time_keyboard: false,
        },
    });
}

init();