const {CARD_CHOOSEN} = require('../../../client/src/constants/message-types');
const {GAME_OVER} = require('../../../client/src/constants/game-statuses');
const {NEUTRAL, RED, BLUE, BLACK} = require('../../../client/src/constants/colors');
const {getGame} = require('../db');
const {getOtherTeam, changeTurn} = require('./game-helpers');

function isOtherTeamsColor(fullGame, revealedCard) {
    return getOtherTeam(fullGame) === revealedCard.color
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

function getLastClueForCorrectGuess({clues}) {
    const lastClue = clues.slice(-1)[0];

    if (!lastClue.correctGuesses) {
        lastClue.correctGuesses = 0;
    }

    ++lastClue.correctGuesses;
    return lastClue;
}

function hasTeamWon(fullGame) {
    const correctGuessesProp = `${fullGame.currentTeam}CorrectGuesses`;
    ++fullGame[correctGuessesProp];

    if (fullGame.currentTeam === RED) {
        return fullGame[correctGuessesProp] === 9;
    } else {
        return fullGame[correctGuessesProp] === 8;
    }
}

function handleCorrectGuess(fullGame, revealedCard, {sendToGameAndSelf}) {
    const {gameId} = fullGame;
    const isGameOver = hasTeamWon(fullGame);
    const lastClue = getLastClueForCorrectGuess(fullGame);
    const shouldChangeTurn = lastClue.correctGuesses > lastClue.number;
    const shouldPromptRandomGuess = lastClue.correctGuesses == lastClue.number;

    if (isGameOver) {
        sendToGameAndSelf(gameId, {type: GAME_OVER, winner: fullGame.currentTeam});
    } else if (shouldChangeTurn) {
        changeTurn(fullGame);
        sendToGameAndSelf(gameId, {type: CARD_CHOOSEN, revealedCard, currentTeam: fullGame.currentTeam, promptRandomGuess: false});
    } else if (shouldPromptRandomGuess) {
        sendToGameAndSelf(gameId, {type: CARD_CHOOSEN, revealedCard, currentTeam: fullGame.currentTeam, promptRandomGuess: true});
    } else {
        sendToGameAndSelf(gameId, {type: CARD_CHOOSEN, revealedCard, currentTeam: fullGame.currentTeam, promptRandomGuess: false});
    }
}

function onChooseCard(message, senders) {
    const {sendToGameAndSelf} = senders;
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
    } else if (!isOtherTeamsColor(fullGame, revealedCard)) {
        handleCorrectGuess(fullGame, revealedCard, senders);
    }
}

module.exports = {onChooseCard};