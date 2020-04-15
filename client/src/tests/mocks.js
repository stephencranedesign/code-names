import { promiseFactory } from "../promise-factory";

const addEventListener = jest.fn();
const send = jest.fn();

global.WebSocket = jest.fn(() => {
    return {
        addEventListener,
        send
    }
});

function getOnMessageHandler() {
    return addEventListener.mock.calls.find(call => call[0] === 'message')[1]
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
    const messageFound = send.mock.calls.some((call) => {
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

export {addEventListener};
