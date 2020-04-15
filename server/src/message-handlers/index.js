const {onCreateGame} = require('./on-create-game');
const {onJoinGame} = require('./on-join-game');
const {onJoinTeam} = require('./on-join-team');
const {onSubmitClue} = require('./on-submit-clue');
const {onChooseCard} = require('./on-choose-card');
const {onPromptRandomGuess} = require('./on-prompt-random-guess');

module.exports = {onCreateGame, onJoinGame, onJoinTeam, onSubmitClue, onChooseCard, onPromptRandomGuess};