const {expect} = require('chai');
const constants = require('../../../src/constants');
const {start, stop} = require('../utils/server');
const {givenGameStarted} = require('../utils/given-game-started');
const {connectToSocket} = require('../utils/connect-to-socket');
const {assertCaptainsGame, assertTeamMembersGame} = require('../utils/common-assertions');
const {listenForAllMessagesToClient, chance, listenForClientMessageOfType, modifyGame} = require('../utils/helpers');

const {SYNC_GAME, ERROR, OK} = constants.messageTypes;
const {RED, BLUE} = constants.colors;

function givenCard() {
    return {
        color: chance.string(),
        revealed: chance.bool(),
        word: chance.string(),
        id: chance.integer({min: 0, max: 100})
    }
}

describe('Acceptance Test: on sync game', () => {
    let given,
        result = {};

    before(() => {
        start();
    })

    describe('when syncing as captain', () => {
        beforeEach(async () => {
            given = await givenGameStarted();

            given.gameStatus = chance.string();
            given.currentTeam = chance.string();
            given.actionsTaken = chance.integer({min: 0, max: 10});
            given.clues = chance.n(chance.string, chance.d6());
            given.cards = chance.n(givenCard, 25);

            modifyGame(given.gameId, {
                gameStatus: given.gameStatus,
                currentTeam: given.currentTeam,
                actionsTaken: given.actionsTaken,
                clues: given.clues,
                cards: given.cards
            });

            result.messagesForRedCaptain = listenForClientMessageOfType(given.redTeamCaptain, SYNC_GAME);

            given.redTeamCaptain.sendMessage(syncGame(given.gameId, given.redTeamCaptain.clientId));
        });

        it('should send synced game to captain', async () => {
            const message = await result.messagesForRedCaptain;
            
            expect(message.game).to.have.property('gameStatus', given.gameStatus);
            expect(message.game).to.have.deep.property('clues', given.clues);
            expect(message.game).to.have.deep.property('cards', given.cards);
            expect(message.game).to.have.property('currentTeam', given.currentTeam);
            expect(message.game).to.have.property('actionsTaken', given.actionsTaken);
        });
    });

    describe('when syncing as team member', () => {
        beforeEach(async () => {
            given = await givenGameStarted();

            given.gameStatus = chance.string();
            given.currentTeam = chance.string();
            given.actionsTaken = chance.integer({min: 0, max: 10});
            given.clues = chance.n(chance.string, chance.d6());
            given.cards = chance.n(givenCard, 25);
            given.requestId = chance.string();

            modifyGame(given.gameId, {
                gameStatus: given.gameStatus,
                currentTeam: given.currentTeam,
                actionsTaken: given.actionsTaken,
                clues: given.clues,
                cards: given.cards
            });

            result.messagesToRedTeamMember = listenForClientMessageOfType(given.redTeamMember, SYNC_GAME);
            given.redTeamMember.sendMessage(syncGame(given.gameId, given.redTeamMember.clientId));
        });

        it('should send synced game to team member', async () => {
            const message = await result.messagesToRedTeamMember;
            
            assertTeamMembersGame(message.game);
            expect(message.game).to.have.property('gameStatus', given.gameStatus);
            expect(message.game).to.have.deep.property('clues', given.clues);
            // expect(message.game).to.have.deep.property('cards', given.cards);
            expect(message.game).to.have.property('currentTeam', given.currentTeam);
            expect(message.game).to.have.property('actionsTaken', given.actionsTaken);
        });
    });

    describe('when attempting to sync as team member not in the game', () => {
        beforeEach(async () => {
            given = await givenGameStarted();

            result.message = listenForClientMessageOfType(given.redTeamMember, SYNC_GAME);
            given.redTeamMember.sendMessage(syncGame(given.gameId, chance.string()));
        });

        it('should send message to client saying there was an error trying to sync', async () => {
            const message = await result.message;
            
            expect(message).to.deep.equal({status: ERROR, message: 'no matching clientId found in game', type: SYNC_GAME});
        });
    });

    describe('when attempting to rejoin a game that does not exist', () => {
        beforeEach(async () => {
            given = await givenGameStarted();

            result.message = listenForClientMessageOfType(given.redTeamMember, SYNC_GAME);
            given.redTeamMember.sendMessage(syncGame(chance.string(), given.redTeamMember.clientId));
        });

        it('should send message to client saying there was an error trying to sync', async () => {
            const message = await result.message;
            
            expect(message).to.deep.equal({status: ERROR, message: 'no matching game found', type: SYNC_GAME});
        });
    });

    after(() => {
        stop();
    });
});

function syncGame(gameId, clientId) {
    return {
        type: SYNC_GAME,
        clientId,
        payload: {
            gameId
        }
    }
}
