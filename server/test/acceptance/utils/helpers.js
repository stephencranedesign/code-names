const {getGame} = require('../../../src/db');
const Chance = require('chance');

const chance = new Chance();

function promiseGenerator() {
    let resolve, reject;

    const promise = new Promise((resolver, rejector) => {resolve = resolver, reject = rejector});

    return {
        promise,
        resolve,
        reject
    }
}


function getCardFromGameWithColor(game, color, otherCardsToExclude = []) {
    return game.cards.find(card => card.color === color && !otherCardsToExclude.includes(card.word));
}

function listenForAllMessagesToClient(client) {
    const messages = [];

    client.setOnMessage((data) => {
        messages.push(data);
    });

    return messages;
}

function listenForClientMessageOfType(client, type) {
    const promise = promiseGenerator();

    client.setOnMessage((data) => {
        if (data.type === type) {
            promise.resolve(data);
        }
    });

    return promise.promise;
}

async function sendMessageAndAwaitResponseForAllClientsInGame(client, message, given, type) {
    const responses = [
        listenForClientMessageOfType(given.blueTeamCaptain, type),
        listenForClientMessageOfType(given.redTeamCaptain, type),
        listenForClientMessageOfType(given.blueTeamMember, type),
        listenForClientMessageOfType(given.redTeamMember, type)
    ];

    client.sendMessage(message);
    await Promise.all(responses);

    return responses;
}

function setGameStatus(gameId, status) {
    const game = getGame(gameId);

    game.gameStatus = status;
}

module.exports = {
    promiseGenerator,
    sendMessageAndAwaitResponseForAllClientsInGame,
    listenForClientMessageOfType,
    listenForAllMessagesToClient,
    getCardFromGameWithColor,
    chance,
    setGameStatus
};