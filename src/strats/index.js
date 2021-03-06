const LogLevel = require("loglevel");
const fs = require('fs');
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

    // TODO should be in worker somehow
    strategies = new Map(); /* Map<String, String> */

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
     * 
     * @returns {Promise<void>}
     */
    async createUserStrategy(userID, strategy, opts, lnmClient) {
        const filePath = path.resolve("./src/strats/workers/random.js");

        if (!fs.existsSync(filePath)) {
            throw new Error("no workers found");
        }

        const stratID = await DB.InsertStrategyBot(userID, strategy, opts); 

        const worker = new Worker(filePath, {
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
                    DB.InsertStrategyPosition(
                        userID,
                        message.data,
                        stratID,
                    );
                    break;
                case StrategyAction.CloseFuturePosition:
                    DB.UpdateCloseStrategyPosition(
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
        this.strategies.set(userID, stratID);
    }

    /**
     * 
     * @param {String} userID
     * 
     * @returns {Promise<void>}
     * 
     * @throws {Error}
     */
    async stopUserStrategy(userID) {
        if (!this.workers.has(userID)) {
            throw new Error("User has no running strategies");
        }

        const stratID = this.strategies.get(userID);

        await DB.UpdateStoppedAtStrategy(userID, stratID);

        const worker = this.workers.get(userID);

        worker.postMessage({
            action: "stop",
        });

        this.workers.delete(userID);
        this.strategies.delete(userID);
    }

    /**
     * Update action in DB and log it if needed
     * 
     * @param {String} logType 
     * @param {Object} params 
     * @param {String} strategy
     */
    updateAction(chatID, logType, data, strategy) {
        const t = Client.GetIntl(""); // TODO fetch locale
        switch(logType) {
            case StrategyAction.CreateFuturePosition:
                Client.ElMarco.sendMessage(
                    chatID,
                    Content.renderCreateFuture(t, data, strategy),
                    {
                        parse_mode: "HTML",
                    },
                );
                break;
            case StrategyAction.CloseFuturePosition:
                Client.ElMarco.sendMessage(
                    chatID,
                    Content.renderCloseFuture(t, data, strategy),
                    {
                        parse_mode: "HTML",
                    },
                );
                break;
            case StrategyAction.CreateFuturePositionFail:
                Client.ElMarco.sendMessage(
                    chatID,
                    Content.renderCreateFutureFail(t, data.params, data.error, strategy),
                    {
                        parse_mode: "HTML",
                    },
                );
                break;
            case StrategyAction.CloseFuturePositionFail:
                Client.ElMarco.sendMessage(
                    chatID,
                    Content.renderCloseFutureFail(t, data, strategy),
                    {
                        parse_mode: "HTML",
                    },
                );
                break;
        }
    }

    /**
     * 
     * @param {String} userID
     * 
     * @returns {Boolean}
     */
    hasRunningStrategy(userID) {
        return this.workers.has(userID);
    }

    /**
     * 
     * @param {String} userID 
     * 
     * @returns {String}
     */
    getRunningStrategyID(userID) {
        return this.strategies.get(userID);
    }

    /**
     * 
     * @param {String} userID 
     * 
     * @return {Promise<Object>}
     * 
     * @throws {Error}
     */
    async computeStats(userID) {
        if (!this.workers.has(userID)) {
            throw new Error("No running strategies");
        }

        const stratID = this.strategies.get(userID);

        const positions = await DB.ListStrategyPositions(userID, stratID);
        const stats = {
            total_pl: 0,
            total_closed: 0,
            total_closed_by_user: 0,
            total_oppened: 0,
            avg_margin: 0,
            avg_price: 0,
            avg_leverage: 0,
            avg_pl: 0,
            avg_exit_price: 0,
        }

        let totalPosition = 0;
        let totalPrice = 0;
        let totalMargin = 0;
        let totalLeverage = 0;
        let totalExitPrice = 0;

        let pos;
        while((pos = await positions.next())) {
            if (typeof pos === "undefined") {
                continue;
            }
            totalPosition++;
            stats.total_pl += pos.pl;
            if (pos.closed) {
                stats.total_closed += 1;
                if (pos.closed_by_user) {
                    stats.total_closed_by_user += 1;
                }
            }
            totalPrice += pos.price;
            totalMargin += pos.margin;
            totalLeverage += pos.leverage;
            totalExitPrice += pos.exit_price;
        }

        stats.total_oppened = totalPosition;

        if (totalPosition > 0) {
            stats.avg_pl = stats.total_pl / totalPosition;
            stats.avg_price = totalPrice / totalPosition;
            stats.avg_margin = totalMargin / totalPosition;
            stats.avg_leverage = totalLeverage / totalPosition;
            stats.avg_exit_price = totalExitPrice / (totalPosition - stats.total_closed);
        }

        return stats;
    }

    /**
     * 
     * @param {String} userID 
     * @param {Object} position 
     * @param {String} [position.pid]
     * @param {Boolean} [position.closed]
     * @param {String} [position.closed_ts]	
     * @param {Number} [position.exit_price]	
     * @param {Number} [position.pl]
     */
    closePositionManually(userID, position) {
        if (this.workers.has(userID)) {
            DB.UpdateCloseStrategyPosition(position, true);
            this.workers.get(userID).postMessage({
                action: "close_position",
                pid: position.pid,
            });
        }
    }
    
    /**
     * 
     * @param {String} userID 
     * @param {String} pid 
     * 
     * @returns {Promise<Boolean>}
     */
    async isStrategyPosition(userID, pid) {
        if (!this.strategies.has(userID)) {
            return false;
        }
        try {
            const stratPosition = await DB.FindStrategyPositionByPID(userID, pid);
            return stratPosition !== null;
        } catch(_) {
            return false;
        }
    }

    /**
     * 
     * @param {String} userID 
     * 
     * @returns {Promise<Object>}
     */
    async getRunningStrategy(userID) {
        const stratID = this.strategies.get(userID);

        if (!stratID) {
            throw new Error("No running strategy");
        }

        const strategy = await DB.GetStrategy(userID, stratID);

        return strategy;
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