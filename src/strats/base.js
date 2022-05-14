const StrategyAction = {
    CreateFuturePosition: "create_future_pos",
    CloseFuturePosition: "close_future_pos",
};

const BaseStrategy = class {

    /**
     * 
     * @param {String} userID
     * @param {Object} otps 
     * @param {Number} [otps.max_openned_positions]
     * @param {Number} [otps.max_leverage]
     * @param {Number} [otps.max_margin]
     * @param {Array<String>} [otps.logs_for]
     * @param {Object} lnClient is a LNMarket initiated client
     */
    constructor(userID, otps, lnClient) {
        this.userID = userID;
        this.options = otps;
        this.client = lnClient; /* LNM API Client */
    }

    // might register a thread
    start() {
        console.log("start");
        // start the strategy
        // to override
        // TODO save in KV
    }

    stop() {
        console.log("stop");
        // stop the strategy
        // to override
        // TODO delete from KV
    }

    /**
     * Update action in DB and log it if needed
     * 
     * @param {String} logType 
     * @param {Object} params 
     */
    updateAction(logType, params) {
        switch(logType) {
            case StrategyAction.CreateFuturePosition:
                if (this.options.logs_for.includes(logType)) {
                    console.log("create future");
                }
                break;
            case StrategyAction.CloseFuturePosition:
                if (this.options.logs_for.includes(logType)) {
                    console.log("close future");
                }
                break;
        }
    }
}

module.exports = {
    BaseStrategy,
    StrategyAction,
}