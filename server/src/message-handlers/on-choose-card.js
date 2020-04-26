const constants = require('../constants');
const {getGame} = require('../db');
const {getOtherTeam, changeTurn} = require('./game-helpers');

const {CHOOSE_CARD, OK, GAME_OUT_OF_SYNC} = constants.messageTypes;
const {GAME_OVER} = constants.gameStatuses;
const {NEUTRAL, RED, BLUE, BLACK} = constants.colors;

function isOtherTeamsColor(fullGame, revealedCard) {
    return getOtherTeam(fullGame) === revealedCard.color
}

function isColor(game, card, color) {
    const masterCards = game.cards.find(o => o.id === card.id);

    return masterCards.color === color;
}

function revealCard({cards}, card) {
    const masterCard = cards.find(c => c.id === card.id);

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
    const {actionsTaken} = fullGame;

    if (isGameOver) {
        sendToGameAndSelf(gameId, {type: GAME_OVER, status: OK, winner: fullGame.currentTeam});
    } else if (shouldChangeTurn) {
        changeTurn(fullGame);
        sendToGameAndSelf(gameId, {type: CHOOSE_CARD, status: OK, revealedCard, currentTeam: fullGame.currentTeam, promptRandomGuess: false, actionsTaken});
    } else if (shouldPromptRandomGuess) {
        sendToGameAndSelf(gameId, {type: CHOOSE_CARD, status: OK, revealedCard, currentTeam: fullGame.currentTeam, promptRandomGuess: true, actionsTaken});
    } else {
        sendToGameAndSelf(gameId, {type: CHOOSE_CARD, status: OK, revealedCard, currentTeam: fullGame.currentTeam, promptRandomGuess: false, actionsTaken});
    }
}

function processCardChosen(message, senders, fullGame) {
    const {sendToGameAndSelf} = senders;
    const {gameId, card} = message.payload;
    const revealedCard = revealCard(fullGame, card);

    ++fullGame.actionsTaken;
    const {actionsTaken} = fullGame;

    if (isColor(fullGame, card, NEUTRAL)) {
        changeTurn(fullGame)
        sendToGameAndSelf(gameId, {type: CHOOSE_CARD, status: OK, revealedCard, currentTeam: fullGame.currentTeam, actionsTaken});
    } else if (isColor(fullGame, card, BLACK)) {
        fullGame.gameStatus = GAME_OVER;
        sendToGameAndSelf(gameId, {type: GAME_OVER, status: OK, winner: getOtherTeam(fullGame)});
    } else if (isOtherTeamsColor(fullGame, revealedCard)) {
        changeTurn(fullGame);
        sendToGameAndSelf(gameId, {type: CHOOSE_CARD, status: OK, actionsTaken, revealedCard, currentTeam: fullGame.currentTeam});
    } else if (!isOtherTeamsColor(fullGame, revealedCard)) {
        handleCorrectGuess(fullGame, revealedCard, senders);
    }
}

function onChooseCard(message, senders) {
    const {gameId, card, actionsTaken} = message.payload;
    const fullGame = getGame(gameId);
    const clientInSyncWithRestOfGame = actionsTaken === fullGame.actionsTaken;

    if (clientInSyncWithRestOfGame) {
        processCardChosen(message, senders, fullGame);
    } else {
        senders.sendToSelf(gameId, {type: GAME_OUT_OF_SYNC, status: OK});
    }
}

module.exports = {onChooseCard};