import { promiseFactory } from "../../promise-factory";
import {deepEqual} from 'assert';

const webSocketInstances = [];
global.WebSocket = jest.fn().mockImplementation(() => {
    const socket = {
        addEventListener: jest.fn(),
        send: jest.fn(),
        active: true
    };

    webSocketInstances.push(socket);

    return socket;
});

function getOnOpenHandler(instanceIndex = 0) {
    const instance = webSocketInstances[instanceIndex];

    return instance.addEventListener.mock.calls.find(call => call[0] === 'open')[1];
}

function getOnMessageHandler(instanceIndex = 0) {
    const instance = webSocketInstances[instanceIndex];

    return instance.addEventListener.mock.calls.find(call => call[0] === 'message')[1];
}

function getOnCloseHandler(instanceIndex = 0) {
    const instance = webSocketInstances[instanceIndex];

    return () => {
        instance.active = false;
        instance.addEventListener.mock.calls.find(call => call[0] === 'close')[1]();
    };
}

function bill(actual, desired) {
    let match = true;

    Object.keys(desired).forEach((key) => {
        if (desired[key] !== actual[key]) {
            match = false;
        }
    })

    return match;
}

function matchArray(actual, desired) {
    let match = true;

    desired.forEach((desiredItem) => {
        if (!actual.includes(desiredItem)) {
            match = false;
        }
    });

    return match;
}

function containsKeys(actual, desired) {
    let match = true;

    Object.keys(desired).forEach((key) => {
        if (!match) return;
        
        if (desired[key] instanceof Array) {
            const actualIsArray = actual[key] && actual[key] instanceof Array;

            match = actualIsArray && matchArray(actual[key], desired[key]);
        } else if (desired[key] instanceof Object) {
            const actualIsObject = actual[key] && actual[key] instanceof Object;
            
            match = actualIsObject && containsKeys(actual[key], desired[key]);
        } else if (desired[key] !== actual[key]) {
            match = false;
        }
    });

    return match;
}

export const givenSocketOpened = async () => {
    const promise = promiseFactory();
    
    getOnOpenHandler()();
    process.nextTick(() => {
        promise.resolve();
    });

    return promise.promise;
}

export function recursivelyCloseAndReopen(socketInstanceIndex = 0) {
    getOnCloseHandler(socketInstanceIndex)();

    const randomDelay = chance.integer({min: 100, max: 300});

    setTimeout(() => {
        getOnOpenHandler(socketInstanceIndex + 1)();
    }, randomDelay);

    setTimeout(() => {
        recursivelyCloseAndReopen(socketInstanceIndex + 1);
    }, randomDelay + 100);
}

export const whenSocketSends = (messageToMatch) => {

    return {
        respondWith: (messageToSend) => {
            const promise = promiseFactory();
            
            recursivelyCheckIfMessageSent(messageToMatch, messageToSend, promise);
            return promise.promise;
        }
    }
};

function getActiveIndex() {
    return webSocketInstances.findIndex(socket => socket.active);
}

function getActiveMessageHandler() {
    const activeIndex = getActiveIndex();

    if (activeIndex === -1) {
        return null;
    }

    return {
        onMessageHandler: getOnMessageHandler(activeIndex),
        activeIndex
    }
}

function recursivelyCheckIfMessageSent(messageToMatch, messageToSend, promise, attempt = 0) {
    const allSendCalls = webSocketInstances.reduce((acc, curr) => acc.concat(curr.send.mock.calls), []);
    const {onMessageHandler, activeIndex} = getActiveMessageHandler();

    const messageFound = onMessageHandler && allSendCalls.some((call) => {
        const parsedMessage = JSON.parse(call[0]);

        if (containsKeys(parsedMessage, messageToMatch)) {
            if (activeIndex === getActiveIndex()) {

                onMessageHandler({
                    data: JSON.stringify({
                        ...messageToSend,
                        id: parsedMessage.id
                    })
                });

                process.nextTick(() => {
                    promise.resolve();
                });

                return true;
            }
        }
    });

    if (!messageFound) {
        if (attempt < 100) {
            setTimeout(() => {
                recursivelyCheckIfMessageSent(messageToMatch, messageToSend, promise, ++attempt);
            }, 10)
        } else {
            throw new Error(`socket send was never called with message: ${JSON.stringify(messageToMatch)}`);
        }
    }
}
