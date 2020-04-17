import {promiseFactory, storePromise, getPromise} from './promise-factory';

let onMessage = () => {};

function determineWebsocketUrl() {
    const {protocol, hostname} = global.location;
    const actualProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
    const actualHostname = hostname === 'localhost' ? 'localhost' : hostname;
    const port = 8081;

    console.log('a: ', `${actualProtocol}//${actualHostname}:${port}`);

    return `${actualProtocol}//${actualHostname}:${port}`;
}

// Create WebSocket connection.
const socket = new WebSocket(determineWebsocketUrl());

// Connection opened
socket.addEventListener('open', (event) => {
    console.log('client opened', event);
    // heartbeat();
});

// Listen for messages
socket.addEventListener('message', (event) => {
    // heartbeat();

    const data = JSON.parse(event.data);
    const storedPromise = getPromise(data.id);

    if (storedPromise) {
        storedPromise.resolve(data);
    }

    onMessage(data);
});

socket.addEventListener('close', () => {
    clearTimeout(this.pingTimeout);
});

function heartbeat() {
    clearTimeout(this.pingTimeout);

    this.pingTimeout = setTimeout(() => {
        this.close();
    }, 30000 + 1000);
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
    socket.send(message);

    return promise.promise;
};

export const registerMessageHandler = (onMessageHandler) => {
    onMessage = onMessageHandler;
};