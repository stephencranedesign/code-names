import {promiseFactory, storePromise, getPromise} from './promise-factory';
import {openSocket} from './open-socket';
import {getClientId} from './get-client-id';
import {SYNC_GAME} from './constants/message-types';
import {setState} from './state-management';

let messageQueue = [];
const sendMessages = () => {
    if (messageQueue.length && shouldSendMessages) {
        messageQueue.forEach((message) => {
            socket.send(JSON.stringify(message));
        });
        messageQueue = [];
    } else {
        setTimeout(sendMessages, 100);
    }
};

let socket;
let shouldSendMessages = true;
let isFirstSocket = true;

async function ensureSocketStaysOpen(onMessage) {
    socket = await openSocket({
        onMessage,
        onClose: () => {
            shouldSendMessages = false;
            isFirstSocket = false;
            ensureSocketStaysOpen(onMessage)
        }
    });

    if (!isFirstSocket) {
        const gameId = sessionStorage.getItem('game-id');
        const {game} = await sendAndByPassMessageQueue({gameId}, SYNC_GAME);

        setState({
            cards: game.cards,
            clues: game.clues,
            gameStatus: game.gameStatus,
            currentTeam: game.currentTeam,
            actionsTaken: game.actionsTaken
        });

        shouldSendMessages = true;
    }
}

const clientId = getClientId();
function buildMessage(payload, type) {
    const id = `${Math.round(Math.random() * 1000000)}-${Math.round(Math.random() * 1000000)}`;
    const promise = promiseFactory();
    const message = {
        payload,
        type,
        id,
        clientId
    };

    storePromise(id, promise);

    return {message, promise};
}

const sendAndByPassMessageQueue = (payload, type) => {
    const {message, promise} = buildMessage(payload, type);

    socket.send(JSON.stringify(message));
    return promise.promise;
};

export const send = (payload, type) => {
    const {message, promise} = buildMessage(payload, type);
    
    messageQueue.push(message);
    sendMessages();

    return promise.promise;
};

export const registerMessageHandler = (onMessage) => {
    ensureSocketStaysOpen(onMessage);
};