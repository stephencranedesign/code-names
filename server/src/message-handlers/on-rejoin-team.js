const constants = require('../constants');
const {getGameForNormalPlayer, getGame, getRoleForClientId, getGameForCaptain} = require('../db');

const {REJOIN_TEAM, OK, ERROR} = constants.messageTypes;
const {RED, BLUE} = constants.colors;
const {PLAYING} = constants.gameStatuses;

function respondWithError(gameId, message, senders) {
    senders.sendToSelf(gameId, {
        type: REJOIN_TEAM,
        status: ERROR,
        message
    });
}

function onRejoinTeam(message, senders) {
    const {gameId, clientId} = message.payload;
    const fullGame = getGame(gameId);
    const roleForClient = getRoleForClientId(gameId, clientId);

    if (!fullGame) return respondWithError(gameId, 'no matching game found', senders);
    if (!roleForClient) return respondWithError(gameId, 'no matching clientId found in game', senders);

    const {captain, team} = roleForClient;
    const game = captain ? getGameForCaptain(gameId) : getGameForNormalPlayer(gameId);
    const {cards, gameStatus} = game;

    senders.sendToSelf(gameId, {
        type: REJOIN_TEAM,
        game,
        captain,
        team,
        status: OK
    });
}

module.exports = {onRejoinTeam};