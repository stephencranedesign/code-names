const {OK, ERROR, JOIN_GAME} = require('../constants').messageTypes;
const {getGameForNormalPlayer} = require('../db');

function onJoinGame(message, {sendToSelf}) {
    const {gameId} = message.payload;
    const game = getGameForNormalPlayer(gameId);

    game ?
        sendToSelf(gameId, {type: JOIN_GAME, status: OK, id: message.id, game}) :
        sendToSelf(gameId, {type: JOIN_GAME, status: ERROR, id: message.id, reason: 'No current games with that Id :('});
}

module.exports = {onJoinGame};