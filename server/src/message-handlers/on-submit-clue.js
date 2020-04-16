const {NEW_CLUE} = require('../constants').messageTypes;
const {getGame} = require('../db');

function onSubmitClue(message, {sendToGame, sendToSelf}) {
    const {gameId, clue} = message.payload;
    const fullGame = getGame(gameId);

    fullGame.clues.push(clue);
    sendToGame(gameId, {type: NEW_CLUE, clue});
    sendToSelf({type: NEW_CLUE, clue});
}

module.exports = {onSubmitClue};