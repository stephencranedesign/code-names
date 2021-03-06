const {JOIN_GAME} = require('./screens');
const {GAME_OVER} = require('./game-statuses');

module.exports = {
    CREATE_GAME: 'create-game',
    JOIN_GAME,
    JOIN_TEAM: 'join-team',
    OK: 'ok',
    ERROR: 'error',
    CAPTAIN_CLAIMED: 'captain-claimed',
    GAME_STATUS_CHANGE: 'game-status-change',
    SUBMIT_CLUE: 'submit-clue',
    NEW_CLUE: 'new-clue',
    CHOOSE_CARD: 'choose-card',
    CARD_CHOOSEN: 'card-choosen',
    GAME_OVER,
    PROMPT_RANDOM_GUESS_ANSWER: 'prompt-random-guess-answer',
    CHANGE_TURN: 'change-turn',
    SYNC_GAME: 'sync-game',
    GAME_OUT_OF_SYNC: 'game-out-of-sync',
    REJOIN_TEAM: 'rejoin-team'
};