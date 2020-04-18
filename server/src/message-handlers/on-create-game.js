const {OK} = require('../constants').messageTypes;
const {createGame} = require('../game-actions/create-game');

async function onCreateGame(message, {sendToSelf}) {
    const {gameId, gameType} = message.payload;
    const game = await createGame(gameId, gameType);

    sendToSelf({type: OK, id: message.id, game});
}

module.exports = {onCreateGame};