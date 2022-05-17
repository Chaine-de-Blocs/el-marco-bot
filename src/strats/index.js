const LogLevel = require("loglevel");
const { Worker } = require("node:worker_threads");

const path = require('node:path');
const DB = require("../db");

const Client = require("../client");

const Content = require("./content");

const Strategy = {
    Random: "random",
};

const StrategyAction = {
    CreateFuturePosition: "create_future_pos",
    CloseFuturePosition: "close_future_pos",
    CreateFuturePositionFail: "create_future_pos_fail",
    CloseFuturePositionFail: "close_future_pos_fail",
};

const StrategyProcess = class {

    workers = new Map(); /* Map<String, String> */

    /**
     * Main thread handling all data
     * 
     * @param {String} userID
     * @param {String} strategy
     * @param {Object} opts 
     * @param {Number} [opts.max_openned_positions]
     * @param {Number} [opts.max_leverage]
     * @param {Number} [opts.max_margin]
     * @param {Array<String>} [opts.logs_for]
     * @param {Object} lnClient
     */
    createUserStrategy(userID, strategy, opts, lnmClient) {
        const worker = new Worker(path.resolve("./strats/workers/random.js"), {
            workerData: {
                opts,
                lnmClient,
            },
        });

        worker.on("message", (message) => {
            if (opts.logs_for.includes(message.action)) {
                this.updateAction(userID, message.action, message.data, strategy);
            }

            switch(message.action) {
                case StrategyAction.CreateFuturePosition:
                    DB.InsertStrategyBotPosition(
                        userID,
                        message.data,
                        strategy,
                    );
                    break;
                case StrategyAction.CloseFuturePosition:
                    DB.UpdateCloseStrategyBotPosition(
                        message.data,
                    );
                    break;
                case StrategyAction.CreateFuturePositionFail:
                case StrategyAction.CloseFuturePositionFail:
                    // nothing to do here I guess
                    break;
            }
        });

        worker.on("error", (message) => {
            LogLevel.trace(`strat_worker=[${strategy}, error=${message}]`)
        });

        this.workers.set(userID, worker);
    }

    /**
     * 
     * @param {String} userID 
     * 
     * @throws {Error}
     */
    stopUserStrategy(userID) {
        if (!this.workers.has(userID)) {
            throw new Error("User has no running strategies");
        }

        const worker = this.workers.get(userID);

        worker.postMessage({
            action: "stop",
        });

        this.workers.delete(userID);
    }

    /**
     * Update action in DB and log it if needed
     * 
     * @param {String} logType 
     * @param {Object} params 
     * @param {String} strategy
     */
    updateAction(chatID, logType, data, strategy) {
        switch(logType) {
            case StrategyAction.CreateFuturePosition:
                Client.ElMarco.sendMessage(
                    chatID,
                    Content.renderCreateFuture(data, strategy),
                    {
                        parse_mode: "HTML",
                    },
                );
                break;
            case StrategyAction.CloseFuturePosition:
                Client.ElMarco.sendMessage(
                    chatID,
                    Content.renderCloseFuture(data, strategy),
                    {
                        parse_mode: "HTML",
                    },
                );
                break;
            case StrategyAction.CreateFuturePositionFail:
                Client.ElMarco.sendMessage(
                    chatID,
                    Content.renderCreateFutureFail(data.params, data.error, strategy),
                    {
                        parse_mode: "HTML",
                    },
                );
                break;
            case StrategyAction.CloseFuturePositionFail:
                Client.ElMarco.sendMessage(
                    chatID,
                    Content.renderCloseFutureFail(data, strategy),
                    {
                        parse_mode: "HTML",
                    },
                );
                break;
        }
    }
}

module.exports = {
    StrategyProcess,
    Strategy,
    StrategyAction,
    Strategies: [
        Strategy.Random,
    ],
    StrategyActions: [
        StrategyAction.CloseFuturePosition,
        StrategyAction.CreateFuturePosition,
        StrategyAction.CreateFuturePositionFail,
        StrategyAction.CloseFuturePositionFail,
    ],
};