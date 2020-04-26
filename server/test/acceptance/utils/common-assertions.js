const {expect} = require('chai');
const constants = require('../../../src/constants');

const {NEUTRAL, BLUE, BLACK, RED} = constants.colors;

function assertGameGiven(game, shouldShowColor) {
    expect(game.cards).to.have.length(25);
    game.cards.forEach((card) => {
        const hasColorRevealed = [RED, BLUE, BLACK, NEUTRAL].includes(card.color);

        expect(hasColorRevealed).to.equal(shouldShowColor);
    });
    
    expect(game.roles).to.not.have.property('byId');
}

function assertCaptainsGame(game) {
    assertGameGiven(game, true);
}

function assertTeamMembersGame(game) {
    assertGameGiven(game, false);
}

module.exports = {assertCaptainsGame, assertTeamMembersGame};