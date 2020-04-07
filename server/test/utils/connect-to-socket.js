const WebSocket = require('ws');
const {promiseGenerator} = require('./promise-generator');

function connectToSocketImpl(url, onMessage, promise) {
    const ws = new WebSocket(url);

    let onMessageHandler = onMessage;

    function sendMessage(data) {
        ws.send(JSON.stringify(data));
    }
    
    ws.on('open', function open() {
        promise.resolve({
            setOnMessage: (handler) => {
                onMessageHandler = handler
            },
            sendMessage
        });
    });
    
    ws.on('message', function incoming(event) {
        const data = JSON.parse(event);

        onMessageHandler(data);
    });
}

function connectToSocket(url, onMessage = () => {}, promise = promiseGenerator()) {
    let attempts = 0;

    try {
        connectToSocketImpl(url, onMessage, promise)
    } catch (e) {
        ++attempts;
        if (attempts < 3) {
            setTimeout(() => {
                connectToSocket(url, onMessage, promise);
            }, 10);
        }
    }

    return promise.promise;
}

module.exports = {connectToSocket};