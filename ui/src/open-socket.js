import {promiseFactory, storePromise, getPromise} from './promise-factory';

function determineWebsocketUrl() {
    const {protocol, hostname, port} = global.location;
    const actualProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
    const actualHostname = hostname === 'localhost' ? 'localhost' : hostname;
    const actualPort = port == 3000 ? 3001 : port;
    const url = `${actualProtocol}//${actualHostname}:${actualPort}`;

    return url;
}

const NOOP = () => {};
export const openSocket = ({onOpen = NOOP, onMessage = NOOP, onClose = NOOP}) => {
    // Create WebSocket connection.
    const socket = new WebSocket(determineWebsocketUrl());
    const promise = promiseFactory();

    // Connection opened
    socket.addEventListener('open', (event) => {
        onOpen(event);
        heartbeat();
        promise.resolve(socket);
    });

    // Listen for messages
    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        const storedPromise = getPromise(data.id);

        if (storedPromise) {
            storedPromise.resolve(data);
        }

        if (data.type === 'pong') {
            heartbeat();
            return;
        }

        onMessage(data);
    });

    socket.addEventListener('close', (event) => {
        onClose(event);
        clearTimeout(socket.pingTimeout);
    });

    function heartbeat() {
        clearTimeout(socket.pingTimeout);
        socket.send(JSON.stringify({type: 'ping'}));

        socket.pingTimeout = setTimeout(() => {
            socket.close();
        }, 10000 + 1000);
    }

    return promise.promise;
};
