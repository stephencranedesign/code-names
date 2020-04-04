const {OK, ERROR} = require('../../../client/src/constants/message-types');
const {getGameForNormalPlayer} = require('../db');

function onJoinGame(message, {sendToSelf}) {
    const {gameId} = message.payload;
    const game = getGameForNormalPlayer(gameId);

    game ?
        sendToSelf({type: OK, id: message.id, game}) :
        sendToSelf({type: ERROR, id: message.id, reason: 'No current games with that Id :('});
}

module.exports = {onJoinGame};