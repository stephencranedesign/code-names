const {expect} = require('chai');
const constants = require('../../../src/constants');
const {start, stop} = require('../utils/server');
const {givenGameStarted} = require('../utils/given-game-started');
const {connectToSocket} = require('../utils/connect-to-socket');
const {assertCaptainsGame, assertTeamMembersGame} = require('../utils/common-assertions');
const {listenForAllMessagesToClient, chance, listenForClientMessageOfType, setGameStatus} = require('../utils/helpers');

const {REJOIN_TEAM, ERROR, OK} = constants.messageTypes;
const {RED, BLUE} = constants.colors;

describe('Acceptance Test: on rejoin team', () => {
    let given,
        result = {};

    before(() => {
        start();
    })

    describe('when rejoining as captain', () => {
        beforeEach(async () => {
            given = await givenGameStarted();
            given.redTeamCaptain.close();
            given.blueTeamCaptain.close();
            given.newRedTeamCaptain = await connectToSocket('ws://localhost:8081/');
            given.newBlueTeamCaptain = await connectToSocket('ws://localhost:8081/');
            given.gameStatus = chance.string();
            setGameStatus(given.gameId, given.gameStatus);

            result.messagesForRedCaptain = listenForClientMessageOfType(given.newRedTeamCaptain, REJOIN_TEAM);
            result.messagesForBlueCaptain = listenForClientMessageOfType(given.newBlueTeamCaptain, REJOIN_TEAM);

            given.newRedTeamCaptain.sendMessage(rejoinTeam(given.gameId, given.redTeamCaptain.clientId));
            given.newBlueTeamCaptain.sendMessage(rejoinTeam(given.gameId, given.blueTeamCaptain.clientId));
        });

        it('should send game with colors and no ById in roles to red captain', async () => {
            const message = await result.messagesForRedCaptain;
            
            assertCaptainsGame(message.game);
            expect(message.game).to.have.property('gameStatus', given.gameStatus);
            expect(message).to.have.property('captain', true);
            expect(message).to.have.property('team', RED);
            expect(message).to.have.property('type', REJOIN_TEAM);
            expect(message).to.have.property('status', OK);
        });

        it('should send game with colors and no ById in roles to blue captain', async () => {
            const message = await result.messagesForBlueCaptain;
            
            assertCaptainsGame(message.game);
            expect(message.game).to.have.property('gameStatus', given.gameStatus);
            expect(message).to.have.property('captain', true);
            expect(message).to.have.property('team', BLUE);
            expect(message).to.have.property('type', REJOIN_TEAM);
            expect(message).to.have.property('status', OK);
        });
    });

    describe('when rejoining as team member', () => {
        beforeEach(async () => {
            given = await givenGameStarted();
            given.redTeamMember.close();
            given.blueTeamMember.close();
            given.newRedTeamMember = await connectToSocket('ws://localhost:8081/');
            given.newBlueTeamMember = await connectToSocket('ws://localhost:8081/');
            given.gameStatus = chance.string();
            setGameStatus(given.gameId, given.gameStatus)

            result.messagesToRedTeamMember = listenForClientMessageOfType(given.newRedTeamMember, REJOIN_TEAM);
            result.messagesToBlueTeamMember = listenForClientMessageOfType(given.newBlueTeamMember, REJOIN_TEAM);

            given.newRedTeamMember.sendMessage(rejoinTeam(given.gameId, given.redTeamMember.clientId));
            given.newBlueTeamMember.sendMessage(rejoinTeam(given.gameId, given.blueTeamMember.clientId));
        });

        it('should send game with out colors and no ById in roles to red team member', async () => {
            const message = await result.messagesToRedTeamMember;
            
            assertTeamMembersGame(message.game);
            expect(message.game).to.have.property('gameStatus', given.gameStatus);
            expect(message).to.have.property('captain', false);
            expect(message).to.have.property('team', RED);
            expect(message).to.have.property('type', REJOIN_TEAM);
            expect(message).to.have.property('status', OK);
        });

        it('should send game with out colors and no ById in roles to blue team member', async () => {
            const message = await result.messagesToBlueTeamMember;

            assertTeamMembersGame(message.game);
            expect(message.game).to.have.property('gameStatus', given.gameStatus);
            expect(message).to.have.property('captain', false);
            expect(message).to.have.property('team', BLUE);
            expect(message).to.have.property('type', REJOIN_TEAM);
            expect(message).to.have.property('status', OK);
        });
    });

    describe('when attempting to rejoin as team member not in the game', () => {
        beforeEach(async () => {
            given = await givenGameStarted();
            given.redTeamMember.close();
            given.newRedTeamMember = await connectToSocket('ws://localhost:8081/');

            result.message = listenForClientMessageOfType(given.newRedTeamMember, REJOIN_TEAM);
            given.newRedTeamMember.sendMessage(rejoinTeam(given.gameId, chance.string()));
        });

        it('should send game with out colors and no ById in roles', async () => {
            const message = await result.message;
            
            expect(message).to.deep.equal({status: ERROR, message: 'no matching clientId found in game', type: REJOIN_TEAM});
        });
    });

    describe('when attempting to rejoin a game that does not exist', () => {
        beforeEach(async () => {
            given = await givenGameStarted();
            given.redTeamMember.close();
            given.newRedTeamMember = await connectToSocket('ws://localhost:8081/');

            result.message = listenForClientMessageOfType(given.newRedTeamMember, REJOIN_TEAM);
            given.newRedTeamMember.sendMessage(rejoinTeam(chance.string(), given.redTeamMember.clientId));
        });

        it('should send game with out colors and no ById in roles', async () => {
            const message = await result.message;
            
            expect(message).to.deep.equal({status: ERROR, message: 'no matching game found', type: REJOIN_TEAM});
        });
    });

    after(() => {
        stop();
    });
});

function rejoinTeam(gameId, clientId) {
    return {
        type: REJOIN_TEAM,
        payload: {
            clientId,
            gameId
        }
    }
}
