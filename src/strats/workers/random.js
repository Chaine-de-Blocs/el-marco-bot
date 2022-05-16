const { parentPort, workerData } = require("node:worker_threads");
const { LNMarketsRest } = require("@ln-markets/api");

const Messages = {
    PosCreated: "create_future_pos",
    PosClosed: "close_future_pos",
    PosCloseFail: "close_future_pos_fail",
};

const options = workerData.opts;
const lnmClient = new LNMarketsRest(workerData.lnmClient);

let createdPositions = [];
let toRecursiveCall;
let hasStopped = false;

/**
 * @returns {Boolean}
 */
function boolRand() {
    const v = Math.random();
    return v > 0.5 ? true : false;
}

// TODO create a random generator

const randomStrat = async () => {
    const doClosePosition = createdPositions.length > 0
        && boolRand();

    const doCreatePosition = createdPositions.length < options.max_openned_positions
        && boolRand();

    if (doClosePosition) {
        const indexToClose = Math.floor(Math.random() * createdPositions.length);
        const positionID = createdPositions[indexToClose];

        try {
            const closedPosition = await lnmClient.futuresClosePosition({ pid: positionID });

            createdPositions =
                createdPositions.filter(v => v !== positionID);

            parentPort.postMessage({
                action: Messages.PosClosed,
                data: closedPosition,
            });
        } catch(e) {
            createdPositions =
                createdPositions.filter(v => v !== positionID);

            parentPort.postMessage({
                action: Messages.PosCloseFail,
                data: positionID,
            });
        }
    }

    if (doCreatePosition) {
        const margin = Math.floor(Math.random() * options.max_margin);
        const leverage = Math.floor(Math.random() * (options.max_leverage - 1)) + 1;
        const side = boolRand() ? "b" : "s";

        // TODO make an SL at least for not losing
        // everything and sell the house, the dog
        // and the children

        const params = {
            margin,
            leverage,
            side,
            type: "m",
        }

        try {
            const createPosRes = await lnmClient.futuresNewPosition(params);
            createdPositions.push(createPosRes.position.pid);

            parentPort.postMessage({
                action: Messages.PosCreated,
                data: createPosRes.position,
            });
        } catch(e) {
            // TODO send error to parent (how?)
            console.log(e);
        }
    }

    if(!hasStopped) {
        // toCall = setTimeout(randomStrat, 5 * 60 * 1000);
        // 1 sec for testing
        toRecursiveCall = setTimeout(randomStrat, 5000);
    }
}

randomStrat();

parentPort.on("message", (data) => {
    switch(data.action) {
        case "stop":
            console.log("stopped");
            clearTimeout(toRecursiveCall);
            hasStopped = true;
            break;
    }
});