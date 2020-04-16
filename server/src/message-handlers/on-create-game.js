const {OK} = require('../constants').messageTypes;
const {createGame} = require('../game-actions/create-game');

function onCreateGame(message, {sendToSelf}) {
    const {gameId} = message.payload;
    const game = createGame(gameId);

    sendToSelf({type: OK, id: message.id, game});
}

module.exports = {onCreateGame};