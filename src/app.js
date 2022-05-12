// remove this after tests
// B9toRtCcXTZdDjK2TSxM+3TJwWpEMNR8iPrqVK9YPKU= oKOPtB4XciODbqmGrw61gEq2RYtwE9TtZb+9ePs0Pznt3VMd8eayivEXLu+Gk3D83t4x00zX6E6+7+36iAP08w== i7f6700b1g98f
require("dotenv").config();
const LogLevel = require("loglevel");
const useMdw = require("node-telegram-bot-api-middleware").use;

const Client = require("./client");
const Content = require("./content");
const Command = require("./command");
const KV = require("./kv");
const DB = require("./db");
const auth = require("./auth");

DB.Init();

const lnKey = process.env.LNM_KEY;
const lnSecret = process.env.LNM_SECRET;
const lnPass = process.env.LNM_PASSPHRASE;

const displayChatError = (e, chatId) => {
    LogLevel.warn(`error=[e: ${e}]`);
    Client.ElMarco.sendMessage(chatId, Content.renderError(e));
}

const authMiddleware = useMdw(auth.authMiddleware(displayChatError));

Client.ElMarco.onText(/\/start/, async (msg) => {
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

                    // TODO allow user to define session
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
Client.ElMarco.onText(/\/help|Aide/, async (msg) => {
    renderDefaultMenu(msg.chat.id, Content.renderHelp());
});

Client.ElMarco.onText(/\/balance/, (msg) => {
    renderDefaultMenu(msg.chat.id, "Je mets ta balance à jour")
});

Client.ElMarco.onText(/\/options/, (msg) => {
    Client.GetLNMarketClient(lnKey, lnSecret, lnPass).optionsGetPositions()
        .then((res) => {
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
});

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

Client.ElMarco.onText(/\/createfuture|Créer un Future/, (msg, match) => {
    renderDefaultMenu(msg.chat.id, Content.renderCreateFutureParamsError())
});

Client.ElMarco.onText(/\/createfuture .*/gi, async (msg, match) => {
    const paramsRgx = new RegExp(/\/createfuture (l|s)( q=\d+[,|\.]?\d+)? (x=\d+)( p=\d+[,|\.]?\d+)?( m=\d+[,|\.]?\d+)?( sl=\d+[,|\.]?\d+)?( tp=\d+[,|\.]?\d+)?/gi);

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
        displayChatError("problème de serveur", msg.chat.id)
        return
    }

    Client.ElMarco.sendMessage(
        msg.chat.id,
        Content.renderFutureReview(futureParam),
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
});

Client.ElMarco.onText(/\/closefuture/, async (msg) => {
    Client.GetLNMarketClient(lnKey, lnSecret, lnPass).futuresGetPositions()
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
});

// Special case for Balance button in keyboard markup
Client.ElMarco.onText(/🌟.*/, (msg) => {
    renderDefaultMenu(msg.chat.id, Content.renderNeedMe());
})

Client.ElMarco.on("callback_query", (query) => {
    const data = query.data.split(";");
    if (!data[0]) {
        Client.ElMarco.answerInlineQuery(query.id);
        Client.ElMarco.sendMessage(query.message.chat.id, "J'ai pas bien compris ta réponse 🤨");
        return;
    }

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

            Client.GetLNMarketClient(lnKey, lnSecret, lnPass).futuresClosePosition({ pid: data[1] })
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
                    const res = await Client.GetLNMarketClient(lnKey, lnSecret, lnPass).futuresNewPosition(params);

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
        default:
            LogLevel.warn(`unknown_cb_action: [${data[0]}]`);
            Client.ElMarco.answerCallbackQuery(query.id, {
                text: "Ye connais pas ça !",
            });
            renderDefaultMenu(query.message.chat.id, Content.renderNeedMe())
    }
});

const renderDefaultMenu = async (chatID, message) => {
    const lnmUserInfo = await Client.GetLNMarketClient(lnKey, lnSecret, lnPass).getUser();

    const menu = [
        [`🌟 Ta balance est de ${lnmUserInfo.balance} sat`],
        ["Créer un Future", "Créer une Option", "Aide"]
    ];

    Client.ElMarco.sendMessage(chatID, message, {
        parse_mode: "HTML",
        reply_markup: {
            keyboard: menu,
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    });
}