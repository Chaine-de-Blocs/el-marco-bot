const { parentPort, workerData } = require("node:worker_threads");
const { exit } = require("node:process");
const { LNMarketsRest } = require("@ln-markets/api");

const Messages = {
    PosCreated: "create_future_pos",
    PosCreateFail: "create_future_pos_fail",
    PosClosed: "close_future_pos",
    PosCloseFail: "close_future_pos_fail",
    PosClosedByUser: "close_position",
};

const options = workerData.opts;
const lnmClient = new LNMarketsRest(workerData.lnmClient);
// const callFrequencyInMs = 21 * 60 * 1000; // 21 minutes
const callFrequencyInMs = 10000; // 21 minutes

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
        const margin = Math.floor(Math.random() * (options.max_margin - 1000)) + 1000;
        const leverage = Math.floor(Math.random() * (options.max_leverage - 1)) + 1;
        const side = boolRand() ? "b" : "s";

        const params = {
            margin,
            leverage,
            side,
            type: "m", // always market
        }

        try {
            const createPosRes = await lnmClient.futuresNewPosition(params);

            createdPositions.push(createPosRes.position.pid);

            parentPort.postMessage({
                action: Messages.PosCreated,
                data: createPosRes.position,
            });
        } catch(e) {
            parentPort.postMessage({
                action: Messages.PosCreateFail,
                data: {
                    params,
                    error: e.code,
                },
            });
        }
    }

    if(!hasStopped) {
        toRecursiveCall = setTimeout(randomStrat, callFrequencyInMs);
    }
}

// 15 seconds for the first round
toRecursiveCall = setTimeout(randomStrat, 15 * 1000);

parentPort.on("message", (data) => {
    switch(data.action) {
        case "stop":
            clearTimeout(toRecursiveCall);
            hasStopped = true;
            break;
        case Messages.PosClosedByUser:
            // TODO beware of concurrent update
            createdPositions =
                createdPositions.filter(v => v !== data.pid);
            break;
    }
    exit(0);
});