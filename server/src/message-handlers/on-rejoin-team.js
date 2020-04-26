const constants = require('../constants');
const {getGameForNormalPlayer, getGame, getRoleForClientId, getGameForCaptain} = require('../db');

const {REJOIN_TEAM, OK, ERROR} = constants.messageTypes;
const {RED, BLUE} = constants.colors;
const {PLAYING} = constants.gameStatuses;

function respondWithError(gameId, id, message, senders) {
    senders.sendToSelf(gameId, {
        type: REJOIN_TEAM,
        status: ERROR,
        id,
        message
    });
}

function onRejoinTeam(message, senders) {
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
        type: REJOIN_TEAM,
        game,
        captain,
        team,
        id,
        status: OK
    });
}

module.exports = {onRejoinTeam};