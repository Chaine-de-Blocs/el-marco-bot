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

const displayChatError = (e, chatId) => {
    LogLevel.warn(`error=[e: ${e}]`);
    Client.ElMarco.sendMessage(chatId, Content.renderError(e));
}

const authMiddleware = useMdw(Auth.authMiddleware(displayChatError));

Client.ElMarco.onText(new RegExp(`^(\/start)( )*$|^${Content.Emoji.StartEmoji}.*`), async (msg) => {
    const msgSent = await Client.ElMarco.sendMessage(
        msg.chat.id,
        Content.renderStartAPICreds(),
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
                    Content.renderRequireNewsession(),
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
                    await DB.SaveAPICreds(msg.chat.id, clientId, clientSecret, passphrase);

                    // TODO allow user to define session expiration
                    await KV.store(passphrase, msg.chat.id);

                    Client.ElMarco.sendMessage(
                        msg.chat.id,
                        Content.renderStartSuccess(),
                        {
                            parse_mode: "HTML",
                        },
                    );
                })
                .catch(e => {
                    Client.ElMarco.sendMessage(
                        msg.chat.id,
                        Content.renderBadAPICreds(e),
                        {
                            parse_mode: "HTML",
                        },
                    );
                });
        }
    );
});
Client.ElMarco.onText(/\/home/, async (msg) => {
    renderDefaultMenu(msg.chat.id, "Back to basico on fait quoi ?");
});
Client.ElMarco.onText(new RegExp(`^(\/help)( )*$|^${Content.Emoji.HelpEmoji}.*`), async (msg) => {
    renderDefaultMenu(msg.chat.id, Content.renderHelp());
});
Client.ElMarco.onText(new RegExp(`^${Content.Emoji.PriceEmoji}.*`), (msg) => {
    renderDefaultMenu(msg.chat.id, "J'actualise le dernier prix du marché");
});

Client.ElMarco.onText(/\/strategy( )*$/, function (msg) {
    if (strategy.hasStrategy(msg.chat.id)) {
        Client.ElMarco.sendMessage(
            msg.chat.id,
            Content.renderAlreadyRunningStrat(),
            {
                parse_mode: "HTML",
            }
        );
        return;
    }

    Client.ElMarco.sendMessage(
        msg.chat.id,
        Content.renderStartStrategy(),
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

                if (matchParams.length >= 5) {
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
                    displayChatError(new Error(`Strategy ${strat} doesn't exist`), msg.chat.id);
                    return;
                }

                if (options.max_openned_positions > 6) {
                    displayChatError(new Error("[max_openned_positions] can't be greater than 6"), msg.chat.id);
                    return;
                }

                if (options.max_leverage > 100) {
                    displayChatError(new Error("[max_leverage] can't be greater than 100"), msg.chat.id);
                    return;
                }

                if (options.max_margin < 776 || options.max_margin > 1000000) {
                    displayChatError(new Error("[max_margin] can't be smaller than 776 and greater than 1000000"), msg.chat.id);
                    return;
                }

                const payload = JSON.stringify({
                    strat,
                    options,
                });

                let id = "";
                try {
                    id = await KV.store(payload);
                } catch(e) {
                    displayChatError(new Error("Server prob yiks"), msg.chat.id)
                    return
                }
                
                Client.ElMarco.sendMessage(
                    msg.chat.id,
                    Content.renderStartegyPreview(strat, options),
                    {
                        parse_mode: "HTML",
                        reply_markup: {
                            remove_keyboard: true,
                            inline_keyboard: [[{
                                text: "Lance la stratégie",
                                callback_data: `${Command.Actions.ActionStartStrategy};${id}`,
                            }, {
                                text: "Nope, on annule",
                                callback_data: `${Command.Actions.ActionCreateFuture};${Command.Actions.ActionCancel}`,
                            }]],
                            one_time_keyboard: true,
                        }
                    }
                );
            }
        );
    }).catch(e => displayChatError(e, msg.chat.id));
});

Client.ElMarco.onText(/\/strategystats.*/, (msg) => {
    strategy.computeStats(msg.chat.id)
        .then(stats => {
            renderDefaultMenu(
                msg.chat.id,
                Content.renderStartegyStats(stats),
            );
        })
        .catch(e => displayChatError(e, msg.chat.id));
});

Client.ElMarco.onText(/\/stopstrategy.*/, async (msg) => {
    try {
        const stats = strategy.computeStats(msg.chat.id);

        strategy.stopUserStrategy(msg.chat.id);
        
        renderDefaultMenu(
            msg.chat.id,
            Content.renderStategyStop(stats),
        );
    } catch (e) {
        displayChatError(e, msg.chat.id);
    }
});

Client.ElMarco.onText(/\/balance.*/, (msg) => {
    renderDefaultMenu(msg.chat.id, "Je mets ta balance à jour")
});

Client.ElMarco.onText(/\/deposit.*/, authMiddleware(function (msg) {
    const apiCreds = this.getAPICreds();
    Client.ElMarco.sendMessage(
        msg.chat.id,
        Content.renderDepositRequest(),
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
                    displayChatError(new Error("provided value is not a number. Please give a number representing sats"), msg.chat.id);
                    return
                }

                const res = 
                    await Client.GetLNMarketClient(
                        apiCreds.api_client,
                        apiCreds.api_secret,
                        apiCreds.passphrase,
                    ).deposit({ amount: value });
                
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
                    .catch(e => displayChatError(msg.chat.id, e));
            }
        );
    }).catch(e => displayChatError(e, msg.chat.id));

}));

Client.ElMarco.onText(/\/options/, authMiddleware(function(msg) {
    const apiCreds = this.getAPICreds();
    Client.GetLNMarketClient(apiCreds.api_client, apiCreds.api_secret, apiCreds.passphrase).optionsGetPositions()
        .then((res) => {
            if (res.length === 0) {
                Client.ElMarco.sendMessage(msg.chat.id, Content.renderNoOptions(), { parse_mode: "HTML" });
                return;
            }
            for(const opt of res) {
                const contentMsg = Content.renderOption({
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
        .catch((e) => displayChatError(e, msg.chat.id));
}));

Client.ElMarco.onText(/\/futures/, authMiddleware(function (msg) {
    const apiCreds = this.getAPICreds();
    Client.GetLNMarketClient(apiCreds.api_client, apiCreds.api_secret, apiCreds.passphrase).futuresGetPositions()
        .then((res) => {
            if (res.length === 0) {
                Client.ElMarco.sendMessage(msg.chat.id, Content.renderNoFutures(), { parse_mode: "HTML" });
                return;
            }
            for(const future of res) {
                Client.ElMarco.sendMessage(msg.chat.id, Content.renderFuture(future), { parse_mode: "HTML" });
            }
        })
        .catch((e) => displayChatError(e, msg.chat.id));
}));

Client.ElMarco.onText(new RegExp(`^(\/createfuture)( )*$|^${Content.Emoji.FutureEmoji}.*`), (msg) => {
    renderDefaultMenu(msg.chat.id, Content.renderCreateFutureParamsError())
});
Client.ElMarco.onText(new RegExp(`^${Content.Emoji.OptionEmoji}.*`), (msg) => {
    renderDefaultMenu(msg.chat.id, Content.renderCmdNotAvailable());
})

Client.ElMarco.onText(/\/createfuture .*/gi, authMiddleware(async function(msg, match) {
    const paramsRgx = new RegExp(/\/createfuture (l|s)( +q=\d+[,|\.]?\d*)? (x=\d+)( +p=\d+[,|\.]?\d*)?( +m=\d+[,|\.]?\d*)?( +sl=\d+[,|\.]?\d*)?( +tp=\d+[,|\.]?\d*)?/gi);

    const matchParams = paramsRgx.exec(match[0]);
     
    if (!matchParams || matchParams.length < 8) {
        Client.ElMarco.sendMessage(
            msg.chat.id,
            Content.renderCreateFutureParamsError(),
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
        id = await KV.store(payload);
    } catch(e) {
        displayChatError(new Error("Server prob yiks"), msg.chat.id)
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
        Content.renderFutureReview(futureParam, displayPrice),
        {
            parse_mode: "HTML",
            reply_markup: {
                remove_keyboard: true,
                inline_keyboard: [[{
                    text: "Créé le Future",
                    callback_data: `${Command.Actions.ActionCreateFuture};${id}`,
                }, {
                    text: "Nope, on annule",
                    callback_data: `${Command.Actions.ActionCreateFuture};${Command.Actions.ActionCancel}`,
                }]],
                one_time_keyboard: true,
            }
        }
    );
}));

Client.ElMarco.onText(/\/closefuture/, authMiddleware(function(msg) {
    const apiCreds = this.getAPICreds();
    Client.GetLNMarketClient(apiCreds.api_client, apiCreds.api_secret, apiCreds.passphrase).futuresGetPositions()
        .then(async (res) => {
            const msgSent = await Client.ElMarco.sendMessage(msg.chat.id, Content.renderClosingFuture(res), {
                parse_mode: "HTML",
                reply_markup: {
                    force_reply: true,
                }
            });

            Client.ElMarco.onReplyToMessage(msg.chat.id, msgSent.message_id, (replyMsg) => {
                let closingFuture = null;
                for(const f of res) {
                    if (f.pid === replyMsg.text) {
                        closingFuture = f;
                        break;
                    }
                }

                if (closingFuture === null) {
                    Client.ElMarco.sendMessage(msg.chat.id, `C'est quoi cet identifiant ${replyMsg.text} ? Concentre toi je ne le trouve`);
                    return;
                }

                Client.ElMarco.sendMessage(
                    msg.chat.id,
                    `Perfecto ! Je te montre à quoi il ressemble et tu me confirmes si on le clôture ou non\n\n${Content.renderFuture(closingFuture)}`,
                    {
                        parse_mode: "HTML",
                        reply_markup: {
                            remove_keyboard: true,
                            inline_keyboard: [[{
                                text: "Go on le clôture",
                                callback_data: `${Command.Actions.ActionCloseFuture};${replyMsg.text}`,
                            }, {
                                text: "Nope, on annule",
                                callback_data: `${Command.Actions.ActionCloseFuture};${Command.Actions.ActionCancel}`,
                            }]],
                            one_time_keyboard: true,
                            force_reply: true,
                        }
                    }  
                )
            });
        })
        .catch((e) => displayChatError(e, msg.chat.id))
}));

Client.ElMarco.onText(/\/closeallfutures/, authMiddleware(function(msg) {
    const apiCreds = this.getAPICreds();
    Client.GetLNMarketClient(apiCreds.api_client, apiCreds.api_secret, apiCreds.passphrase).futuresGetPositions()
        .then(res => {
            if (res.length === 0) {
                renderDefaultMenu(msg.chat.id, Content.renderNoFutures())
                return;
            }

            let agregatedPL = 0;

            for(const future of res) {
                agregatedPL += +future.pl;
                Client.ElMarco.sendMessage(msg.chat.id, Content.renderFuture(future), { parse_mode: "HTML" });
            }
            Client.ElMarco.sendMessage(
                msg.chat.id,
                Content.renderCloseAllFutureConfirm(agregatedPL),
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        remove_keyboard: true,
                        inline_keyboard: [[{
                            text: "On les clôture tous",
                            callback_data: `${Command.Actions.ActionCloseAllFutures}`,
                        }, {
                            text: "Nope, on annule",
                            callback_data: `${Command.Actions.ActionCloseAllFutures};${Command.Actions.ActionCancel}`,
                        }]],
                        one_time_keyboard: true,
                        force_reply: true,
                    }
                }  
            )
        })
        .catch(e => displayChatError(e, msg.chat.id));
}));

// Special case for Balance button in keyboard markup
Client.ElMarco.onText(new RegExp(`${Content.Emoji.BalanceEmoji}.*`), (msg) => {
    renderDefaultMenu(msg.chat.id, Content.renderNeedMe());
})

Client.ElMarco.on("callback_query", async (query) => {
    const data = query.data.split(";");
    if (!data[0]) {
        Client.ElMarco.answerInlineQuery(query.id);
        Client.ElMarco.sendMessage(query.message.chat.id, "J'ai pas bien compris ta réponse 🤨");
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
            Content.renderRequireNewsession(),
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
                    text: "No problemo, on ne le clôture pas !",
                });
                Client.ElMarco.deleteMessage(query.message.chat.id, query.message.message_id);
                renderDefaultMenu(query.message.chat.id, Content.renderNeedMe())
                break;
            }

            lnClient.futuresClosePosition({ pid: data[1] })
                .then((_) => {
                    Client.ElMarco.answerCallbackQuery(query.id);
                    Client.ElMarco.deleteMessage(query.message.chat.id, query.message.message_id);
                    Client.ElMarco.sendMessage(query.message.chat.id, Content.renderCloseFuture(data[1]));
                })
                .catch((e) => {
                    Client.ElMarco.answerCallbackQuery(query.id, {
                        text: Content.renderError(e),
                    });
                })
                .finally(() => 
                    renderDefaultMenu(query.message.chat.id, Content.renderNeedMe())
                );
            break;
        case Command.Actions.ActionCloseAllFutures:
            if (data[1] === Command.Actions.ActionCancel) {
                Client.ElMarco.answerCallbackQuery(query.id, {
                    text: "No problemo, on ne les clôture pas !",
                });
                Client.ElMarco.deleteMessage(query.message.chat.id, query.message.message_id);
                renderDefaultMenu(query.message.chat.id, Content.renderNeedMe())
                break;
            }

            lnClient.futuresCloseAllPositions()
                .then((_) => {
                    Client.ElMarco.answerCallbackQuery(query.id);
                    Client.ElMarco.deleteMessage(query.message.chat.id, query.message.message_id);
                    Client.ElMarco.sendMessage(query.message.chat.id, Content.renderCloseAllFuture());
                })
                .catch((e) => {
                    Client.ElMarco.answerCallbackQuery(query.id, {
                        text: Content.renderError(e),
                    });
                })
                .finally(() => 
                    renderDefaultMenu(query.message.chat.id, Content.renderNeedMe())
                );

            break;
        case Command.Actions.ActionCreateFuture:
            if (data[1] === Command.Actions.ActionCancel) {
                Client.ElMarco.answerCallbackQuery(query.id, {
                    text: "No problemo, on va pas créer le Future",
                });
                Client.ElMarco.deleteMessage(query.message.chat.id, query.message.message_id);
                renderDefaultMenu(query.message.chat.id, Content.renderNeedMe())
                break;
            }

            KV.get(data[1])
                .then(async value => {
                    const params = JSON.parse(value);
                    const res = await lnClient.futuresNewPosition(params);

                    Client.ElMarco.answerCallbackQuery(query.id);
                    Client.ElMarco.deleteMessage(query.message.chat.id, query.message.message_id);
                    Client.ElMarco.sendMessage(
                        query.message.chat.id,
                        Content.renderFutureCreated(res.position),
                        {
                            parse_mode: "HTML",
                        }
                    );
                })
                .catch((e) => displayChatError(`Error futuresNewPosition ${e}`, query.message.chat.id))
                .finally(() =>
                    renderDefaultMenu(query.message.chat.id, Content.renderNeedMe())
                );
            break;
        case Command.Actions.ActionStartStrategy:
            if (data[1] === Command.Actions.ActionCancel) {
                Client.ElMarco.answerCallbackQuery(query.id, {
                    text: "Pas de jobs pour moi, ye compris...",
                });
                Client.ElMarco.deleteMessage(query.message.chat.id, query.message.message_id);
                renderDefaultMenu(query.message.chat.id, Content.renderNeedMe())
                break;
            }

            KV.get(data[1])
                .then(async value => {
                    const params = JSON.parse(value);

                    strategy.createUserStrategy(
                        query.message.chat.id,
                        params.strat,
                        params.options,
                        lnClient,
                    );

                    Client.ElMarco.answerCallbackQuery(query.id);
                    Client.ElMarco.deleteMessage(query.message.chat.id, query.message.message_id);
                    Client.ElMarco.sendMessage(
                        query.message.chat.id,
                        Content.renderStrategyStarted(params.strat),
                        {
                            parse_mode: "HTML",
                        }
                    );
                })
                .catch((e) => displayChatError(`Error create strategy ${e}`, query.message.chat.id))
                .finally(() =>
                    renderDefaultMenu(query.message.chat.id, Content.renderNeedMe())
                );
                break;
        default:
            LogLevel.warn(`unknown_cb_action: [${data[0]}]`);
            Client.ElMarco.answerCallbackQuery(query.id, {
                text: "Ye connais pas ça !",
            });
            renderDefaultMenu(query.message.chat.id, Content.renderNeedMe())
    }
});

const renderDefaultMenu = async (chatID, message) => {
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

    // TODO si strat en cours on va l'afficher la yoooo

    const balanceBtn = typeof balance !== "undefined"
        ? `${Content.Emoji.BalanceEmoji} Ta balance est de ${balance} sat` 
        : `${Content.Emoji.StartEmoji} Créer une session pour commencer`;

    const menu = [
        [balanceBtn],
        [`${Content.Emoji.FutureEmoji} Créer un Future`, `${Content.Emoji.OptionEmoji} Créer une Option`, `${Content.Emoji.HelpEmoji} Aide`]
    ];

    if (typeof lastOffer !== "undefined") {
        menu.push([`${Content.Emoji.PriceEmoji} Dernier prix à ${lastOffer}USD`]);
    }

    Client.ElMarco.sendMessage(chatID, message, {
        parse_mode: "HTML",
        reply_markup: {
            keyboard: menu,
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    });
}