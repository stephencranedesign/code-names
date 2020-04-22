import { promiseFactory } from "../../promise-factory";

const webSocketInstances = [];
global.WebSocket = jest.fn().mockImplementation(() => {
    const socket = {
        addEventListener: jest.fn(),
        send: jest.fn()
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

    return instance.addEventListener.mock.calls.find(call => call[0] === 'close')[1];
}

function containsKeys(actual, desired) {
    let match = true;

    Object.keys(desired).forEach((key) => {
        if (desired[key] !== actual[key]) {
            match = false;
        }
    })

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

function recursivelyCloseAndReopen(socketInstanceIndex = 0) {
    getOnCloseHandler(socketInstanceIndex)();

    const randomDelay = chance.integer({min: 100, max: 300});

    setTimeout(() => {
        getOnOpenHandler(socketInstanceIndex + 1)();
    }, randomDelay);

    setTimeout(() => {
        recursivelyCloseAndReopen(socketInstanceIndex + 1);
    }, randomDelay + 10);
}

export const givenUnReliableSocketOpened = async () => {
    await givenSocketOpened();

    recursivelyCloseAndReopen();
}

export const whenSocketSends = (messageToMatch) => {    
    const onMessageHandler = getOnMessageHandler();

    return {
        respondWith: (messageToSend) => {
            const promise = promiseFactory();
            
            recursivelyCheckIfMessageSent(messageToMatch, onMessageHandler, messageToSend, promise);
            return promise.promise;
        }
    }
};

function recursivelyCheckIfMessageSent(messageToMatch, onMessageHandler, messageToSend, promise, attempt = 0) {
    const allSendCalls = webSocketInstances.reduce((acc, curr) => acc.concat(curr.send.mock.calls), []);

    const messageFound = allSendCalls.some((call) => {
        const parsedMessage = JSON.parse(call[0]);

        if (containsKeys(parsedMessage, messageToMatch)) {
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
    });

    if (!messageFound) {
        if (attempt < 100) {
            setTimeout(() => {
                recursivelyCheckIfMessageSent(messageToMatch, onMessageHandler, messageToSend, promise, ++attempt);
            }, 10)
        } else {
            throw new Error(`socket send was never called with message: ${JSON.stringify(messageToMatch)}`);
        }
    }
}

// export {addEventListener};
