const {NEW_CLUE} = require('../../../client/src/constants/message-types');

function onSubmitClue(message, {sendToGame, sendToSelf}) {
    const {gameId, clue} = message.payload;
    console.log('onSubmitClue: ', message);

    sendToGame(gameId, {type: NEW_CLUE, clue});
    sendToSelf({type: NEW_CLUE, clue});
}

module.exports = {onSubmitClue};