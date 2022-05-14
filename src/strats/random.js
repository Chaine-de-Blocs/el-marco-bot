const { BaseStrategy, StrategyAction } = require("./base");

const RandomStrat = class extends BaseStrategy {
    constructor(opts) {
        super(opts);
    }

    start() {
        super.start();
        // everything happens here
        // ... super.updateAction(...)
    }

    stop() {
        super.stop();
    }
}

module.exports = RandomStrat;