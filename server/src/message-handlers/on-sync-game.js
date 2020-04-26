const constants = require('../constants');
const {getGameForNormalPlayer, getGame, getRoleForClientId, getGameForCaptain} = require('../db');

const {SYNC_GAME, OK, ERROR} = constants.messageTypes;
const {RED, BLUE} = constants.colors;
const {PLAYING} = constants.gameStatuses;

function respondWithError(gameId, id, message, senders) {
    senders.sendToSelf(gameId, {
        type: SYNC_GAME,
        status: ERROR,
        id,
        message
    });
}

function onSyncGame(message, senders) {
    const {payload, clientId, id} = message;
    const {gameId} = payload;
    const fullGame = getGame(gameId);
    const roleForClient = getRoleForClientId(gameId, clientId);

    if (!fullGame) return respondWithError(gameId, id, 'no matching game found', senders);
    if (!roleForClient) return respondWithError(gameId, id, 'no matching clientId found in game', senders);

    const {captain, team} = roleForClient;
    const game = captain ? getGameForCaptain(gameId) : getGameForNormalPlayer(gameId);
    const {cards, gameStatus} = game;

    senders.sendToSelf(gameId, {
        type: SYNC_GAME,
        game,
        id,
        status: OK
    });
}

module.exports = {onSyncGame};