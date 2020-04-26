const WebSocket = require('ws');
const constants = require('./constants');
const {purgeOldGames} = require('./db');

const {EVERYONE, GAME, SELF} = constants.messageResponseTargets;
const {OK} = constants.messageTypes;

function create(server, messageHandler) {
    const wss = new WebSocket.Server({server});

    wss.on('connection', function connection(ws) {
        ws.isAlive = true;

        function heartbeat() {
            ws.isAlive = true;
        }

        ws.on('message', (data) => {
            const messageFromClient = JSON.parse(data);

            function sendToEveryone(gameId, messageToClient) {
                wss.clients.forEach(function each(client) {
                    if (client.readyState != WebSocket.OPEN) return;
                    addGameIdToClient(gameId, messageToClient, client, isClientSender);

                    client.send(JSON.stringify(messageToClient));
                });
            }

            function sendToGame(gameId, messageToClient) {
                wss.clients.forEach(function each(client) {
                    if (client.readyState != WebSocket.OPEN) return;

                    const isClientSender = client === ws;
                    addGameIdToClient(gameId, messageToClient, client, isClientSender);

                    if (client.gameId == gameId && !isClientSender) {
                        client.send(JSON.stringify(messageToClient));
                    }
                });
            }

            function sendToGameAndSelf(gameId, messageToClient) {
                wss.clients.forEach(function each(client) {
                    if (client.readyState != WebSocket.OPEN) return;

                    const isClientSender = client === ws;
                    addGameIdToClient(gameId, messageToClient, client, isClientSender);

                    if (client.gameId == gameId) {
                        client.send(JSON.stringify(messageToClient));
                    }
                });
            }

            function sendToSelf(gameId, messageToClient) {
                wss.clients.forEach(function each(client) {
                    if (client.readyState != WebSocket.OPEN) return;

                    const isClientSender = client === ws;
                    addGameIdToClient(gameId, messageToClient, client, isClientSender);

                    if (isClientSender) {
                        client.send(JSON.stringify(messageToClient));
                    }
                });
            }

            if (messageFromClient.type === 'ping') {
                heartbeat();

                return;
            }

            messageHandler(messageFromClient, {sendToEveryone, sendToGame, sendToSelf, sendToGameAndSelf});
        });

        ws.on('close', () => {
            setTimeout(() => {
                cleanOldGames(wss.clients);
            }, 20000);
        });
    });

    function addGameIdToClient(gameId, messageToClient, client, isClientSender) {
        if (messageToClient.status === OK && isClientSender) {
            client.gameId = gameId;
        }
    }

    function cleanOldGames(clients) {
        const gameIds = [];

        clients.forEach((client) => {
            gameIds.push(client.gameId);
        });

        const activeGameIds = gameIds.filter(x => x).map(x => String(x));

        purgeOldGames(activeGameIds);
    }

    function ping() {
        wss.clients.forEach(function each(client) {
            if (client.isAlive === false) return client.terminate();
    
            client.isAlive = false;
            client.send(JSON.stringify({type: 'pong'}));
        });
    }
    
    const interval = setInterval(ping, 10000);

    return wss;
}

module.exports = {create};