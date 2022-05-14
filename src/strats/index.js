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

const { StrategyAction } = require("./base");
const RandomStrat = require("./random");

const Strategy = {
    Random: "random",
};

module.exports = {
    Strategy,
    StrategyAction,
    RandomStrat,
    Strategies: [
        Strategy.Random,
    ],
    StrategyActions: [
        StrategyAction.CloseFuturePosition,
        StrategyAction.CreateFuturePosition,
    ],
};