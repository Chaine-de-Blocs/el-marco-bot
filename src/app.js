require("dotenv").config();
const LogLevel = require("loglevel");

const Client = require("./client");
const Content = require("./content");
const Command = require("./command");
const KV = require("./kv");

Client.ElMarco.onText(/\/start/, async (msg) => {
    renderDefaultMenu(msg.chat.id, Content.renderWelcome());
});
Client.ElMarco.onText(/\/home/, async (msg) => {
    renderDefaultMenu(msg.chat.id, "Back to basico on fait quoi ?");
});
Client.ElMarco.onText(/\/help/, async (msg) => {
    renderDefaultMenu(msg.chat.id, Content.renderHelp());
});

Client.ElMarco.onText(/\/balance/, (msg) => {
    renderDefaultMenu(msg.chat.id, "Je mets ta balance à jour")
});

Client.ElMarco.onText(/\/options/, (msg) => {
    Client.LNMarketAPI.optionsGetPositions()
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

Client.ElMarco.onText(/\/futures/, (msg) => {
    Client.LNMarketAPI.futuresGetPositions()
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
            case Command.Params.ParamSL:
                stoploss = p.value;
                break;
            case Command.Params.ParamTP:
                takeprofit = p.value;
                break;
            case Command.Params.ParamUnknown:
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
    Client.LNMarketAPI.futuresGetPositions()
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

            Client.LNMarketAPI.futuresClosePosition({ pid: data[1] })
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
                    const res = await Client.LNMarketAPI.futuresNewPosition(params);

                    Client.ElMarco.answerCallbackQuery(query.id);
                    Client.ElMarco.deleteMessage(query.message.chat.id, query.message.message_id);
                    Client.ElMarco.sendMessage(query.message.chat.id, Content.renderFutureCreated(res));
                    Client.LNMarketAPI.futuresNewPosition(params)
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
    const lnmUserInfo = await Client.LNMarketAPI.getUser();

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

const displayChatError = (e, chatID) => {
    LogLevel.warn(`error=[e: ${e}]`);
    Client.ElMarco.sendMessage(chatID, Content.renderError(e));
}