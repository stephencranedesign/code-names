const WebSocket = require('ws');
const {EVERYONE, GAME, SELF} = require('../../client/src/constants/message-response-targets');
const {OK} = require('../../client/src/constants/message-types');
const {purgeOldGames} = require('./db');

function create(messageHandler) {
    const wss = new WebSocket.Server({ port: 8081 });

    wss.on('connection', function connection(ws) {
        ws.isAlive = true;
        ws.on('pong', heartbeat);
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

            messageHandler(messageFromClient, {sendToEveryone, sendToGame, sendToSelf, sendToGameAndSelf});
        });

        ws.on('close', () => {
            clearInterval(interval);

            cleanOldGames(wss.clients);
        });
    });

    function addGameIdToClient(messageToClient, client, isClientSender) {
        if (messageToClient.type === OK && !client.gameId && isClientSender) {
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

    function heartbeat() {
        console.log('heartbeat server');
        this.isAlive = true;
    }
    
    const interval = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) return ws.terminate();
    
            ws.isAlive = false;
            ws.ping(() => {});
        });
    }, 30000);

    return wss;
}

module.exports = {create};