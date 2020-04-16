const {RED, BLUE} = require('../constants').colors;

function getOtherTeam(game) {
    return game.currentTeam === BLUE ? RED : BLUE;
}

function changeTurn(game) {
    game.currentTeam = getOtherTeam(game);
}

module.exports = {getOtherTeam, changeTurn};