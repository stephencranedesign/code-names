const {onCreateGame} = require('./on-create-game');
const {onJoinGame} = require('./on-join-game');
const {onJoinTeam} = require('./on-join-team');
const {onSubmitClue} = require('./on-submit-clue');
const {onChooseCard} = require('./on-choose-card');

module.exports = {onCreateGame, onJoinGame, onJoinTeam, onSubmitClue, onChooseCard};