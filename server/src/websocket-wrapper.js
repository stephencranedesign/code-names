const WebSocket = require('ws');
const constants = require('./constants');
const {purgeOldGames} = require('./db');

const {EVERYONE, GAME, SELF} = constants.messageResponseTargets;
const {OK} = constants.messageTypes;

function create(server, messageHandler) {
    const wss = new WebSocket.Server({server});

    wss.on('connection', function connection(ws) {
        console.log('connection');

        ws.isAlive = true;

        function heartbeat() {
            ws.isAlive = true;
        }

        ws.on('message', (data) => {
            const messageFromClient = JSON.parse(data);

            function sendToEveryone(messageToClient) {
                wss.clients.forEach(function each(client) {
                    if (client.readyState != WebSocket.OPEN) return;
                    addGameIdToClient(messageToClient, client, isClientSender);

                    client.send(JSON.stringify(messageToClient));
                });
            }

            function sendToGame(gameId, messageToClient) {
                wss.clients.forEach(function each(client) {
                    if (client.readyState != WebSocket.OPEN) return;

                    const isClientSender = client === ws;
                    addGameIdToClient(messageToClient, client, isClientSender);

                    if (client.gameId == gameId && !isClientSender) {
                        client.send(JSON.stringify(messageToClient));
                    }
                });
            }

            function sendToGameAndSelf(gameId, messageToClient) {
                wss.clients.forEach(function each(client) {
                    if (client.readyState != WebSocket.OPEN) return;

                    const isClientSender = client === ws;
                    addGameIdToClient(messageToClient, client, isClientSender);

                    if (client.gameId == gameId) {
                        client.send(JSON.stringify(messageToClient));
                    }
                });
            }

            function sendToSelf(messageToClient) {
                wss.clients.forEach(function each(client) {
                    if (client.readyState != WebSocket.OPEN) return;

                    const isClientSender = client === ws;
                    addGameIdToClient(messageToClient, client, isClientSender);

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
            console.log('close');

            cleanOldGames(wss.clients);
        });
    });

    function addGameIdToClient(messageToClient, client, isClientSender) {
        if (messageToClient.type === OK && isClientSender) {
            client.gameId = messageToClient.game.gameId;
        }
    }

    function cleanOldGames(clients) {
        const gameIds = [];

        clients.forEach((client) => {
            gameIds.push(client.gameId);
        });

        const activeGameIds = gameIds.filter(x => x);

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