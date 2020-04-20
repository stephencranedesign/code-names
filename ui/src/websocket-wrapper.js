import {promiseFactory, storePromise, getPromise} from './promise-factory';
import {openSocket} from './open-socket';

let messageQueue = [];
const sendMessages = () => {
    if (messageQueue.length && socket) {
        messageQueue.forEach((message) => {
            socket.send(message);
        });
        messageQueue = [];
    } else {
        setTimeout(sendMessages, 100);
    }
};

let onMessage = () => {};
let socket;

async function ensureSocketStaysOpen(onMessage) {
    socket = await openSocket({
        onMessage,
        onClose: () => {
            socket = undefined;
            ensureSocketStaysOpen(onMessage)
        }
    });
}

export const send = (payload, type) => {
    const id = `${Math.round(Math.random() * 1000000)}-${Math.round(Math.random() * 1000000)}`;
    const promise = promiseFactory();
    const message = JSON.stringify({
        payload,
        type,
        id
    });
    
    storePromise(id, promise);
    messageQueue.push(message);
    sendMessages();

    return promise.promise;
};

export const registerMessageHandler = async (onMessageHandler) => {
    onMessage = onMessageHandler;
    ensureSocketStaysOpen(onMessage);
};