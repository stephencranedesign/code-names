const {OK, ERROR, CHANGE_TURN} = require('../../../client/src/constants/message-types');
const {getGame} = require('../db');
const {changeTurn} = require('./game-helpers');

function onPromptRandomGuess(message, {sendToGameAndSelf}) {
    const {gameId, takeGuess} = message.payload;
    const fullGame = getGame(gameId);

    if (!takeGuess) {
        changeTurn(fullGame);

        sendToGameAndSelf(gameId, {type: CHANGE_TURN, currentTeam: fullGame.currentTeam});
    }
}

module.exports = {onPromptRandomGuess};