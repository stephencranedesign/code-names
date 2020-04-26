const {expect} = require('chai');
const {start, stop} = require('../utils/server');
const {givenGameStarted} = require('../utils/given-game-started');
const {assertCaptainsGame, assertTeamMembersGame} = require('../utils/common-assertions');

describe('Acceptance Test: on join team', () => {
    let given,
        result = {};

    before(() => {
        start();
    })

    describe('when picking captain and no one else has picked captain', () => {
        beforeEach(async () => {
            given = await givenGameStarted();
        });

        it('should send fullGame to captains', async () => {
            assertCaptainsGame(given.gameForCaptains);
        });
    });

    describe('when picking team member', () => {
        beforeEach(async () => {
            given = await givenGameStarted();
        });

        it('should send game with out color on cards', async () => {
            assertTeamMembersGame(given.gameForTeamMembers);
        });
    });

    after(() => {
        stop();
    });
});
