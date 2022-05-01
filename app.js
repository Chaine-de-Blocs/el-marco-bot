require('dotenv').config();

const Content = require('./content');
const Client = require('./client');

// Actions
const ActionCloseFuture = "closefuture";
const ActionCancel = "cancel"

Client.ElMarco.setMyCommands([{
    command: "start",
    description: "Démarrer El Marco Bot pour faire fortune (en sat bien évidemment)",
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
    command: ActionCloseFuture,
    description: "Fermer un Future en cours",
}]);

Client.ElMarco.onText(/\/start/, async (msg) => {
    renderDefaultMenu(msg.chat.id, Content.renderWelcome());
});
Client.ElMarco.onText(/\/home/, async (msg) => {
    renderDefaultMenu(msg.chat.id, "Back to basico on fait quoi ?");
})

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
                                callback_data: `${ActionCloseFuture};${replyMsg.text}`,
                            }, {
                                text: "Nope, on annule",
                                callback_data: `${ActionCloseFuture};${ActionCancel}`,
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
        case ActionCloseFuture:
            if (data[1] === ActionCancel) {
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
        default:
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
        reply_markup: {
            keyboard: menu,
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    });
}

const displayChatError = (e, chatID) => {
    Client.ElMarco.sendMessage(chatID, Content.renderError(e));
}