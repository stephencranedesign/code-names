const {CARD_CHOOSEN} = require('../../../client/src/constants/message-types');
const {GAME_OVER} = require('../../../client/src/constants/game-statuses');
const {NEUTRAL, RED, BLUE, BLACK} = require('../../../client/src/constants/colors');
const {getGame} = require('../db');

function isOtherTeamsColor(fullGame, revealedCard) {
    return getOtherTeam(fullGame) === revealedCard.color
}

function getOtherTeam(game) {
    return game.currentTeam === BLUE ? RED : BLUE;
}

function changeTurn(game) {
    game.currentTeam = getOtherTeam(game);
}

function isColor(game, card, color) {
    const masterCards = game.cards.find(o => o.word === card.word);

    return masterCards.color === color;
}

function revealCard({cards}, card) {
    const masterCard = cards.find(c => c.word === card.word);

    masterCard.revealed = true;
    return masterCard;
}

function onChooseCard(message, {sendToGame, sendToSelf, sendToGameAndSelf}) {
    const {gameId, card} = message.payload;
    const fullGame = getGame(gameId);
    const revealedCard = revealCard(fullGame, card);

    if (isColor(fullGame, card, NEUTRAL)) {
        changeTurn(fullGame)
        sendToGameAndSelf(gameId, {type: CARD_CHOOSEN, revealedCard, currentTeam: fullGame.currentTeam});
    } else if (isColor(fullGame, card, BLACK)) {
        fullGame.gameStatus = GAME_OVER;
        sendToGameAndSelf(gameId, {type: GAME_OVER, winner: getOtherTeam(fullGame)});
    } else if (isOtherTeamsColor(fullGame, revealedCard)) {
        changeTurn(fullGame);
        sendToGameAndSelf(gameId, {type: CARD_CHOOSEN, revealedCard, currentTeam: fullGame.currentTeam});
    }

    /*
        1) did you guess a card that fits with the current team?
         - yes > 
           - if the current team has more active clues, don't change turns
           - if they guesse
         - no > change turns.
         - all > reveal what card that was to everyone.
         - figure out if a team won..
    */
}

module.exports = {onChooseCard};