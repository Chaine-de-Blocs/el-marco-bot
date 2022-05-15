/**
 * How will we make the strategies
 * 
 * 1. One strategie per user
 *   1.1 Store active strategy in KV (deleted means inactive)
 *   1.3 Bunch of options for strategies (how many positions it can open, etc.)
 * 2. Store positions openned by the strategy in DB
 *   2.1 Mark the positions when closed with PL (for stats)
 * 
 */

const { Worker } = require("node:worker_threads");
const path = require('node:path');
const DB = require("../db");

const Client = require("../client");

const Strategy = {
    Random: "random",
};

const StrategyAction = {
    CreateFuturePosition: "create_future_pos",
    CloseFuturePosition: "close_future_pos",
};

const StrategyProcess = class {

    workers = new Map();

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
                this.updateAction(userID, message.action, message.data);
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
                        userID,
                        message.data,
                        strategy,
                    );
                    break;
            }
        });

        worker.on("error", (message) => {
            console.log("worker error", message);
        });

        // TODO send message
        // worker.postMessage(data);

        this.workers.set(userID, worker);

        // start the strategy
        // TODO save in KV
    }

    /**
     * 
     * @param {String} userID 
     */
    killUserStrategy(userID) {
        console.log("stop");
        // stop the strategy
        // TODO delete from KV
    }

    /**
     * Update action in DB and log it if needed
     * 
     * @param {String} logType 
     * @param {Object} params 
     */
    updateAction(chatID, logType, params) {
        // TODO content for those messages
        switch(logType) {
            case StrategyAction.CreateFuturePosition:
                Client.ElMarco.sendMessage(
                    chatID,
                    JSON.stringify(params),
                );
                break;
            case StrategyAction.CloseFuturePosition:
                Client.ElMarco.sendMessage(
                    chatID,
                    JSON.stringify(params),
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
    ],
};