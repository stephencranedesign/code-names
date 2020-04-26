const {expect} = require('chai');
const constants = require('../../../src/constants');
const {start, stop} = require('../utils/server');
const {givenGameStarted, givenGameStartedWithClue} = require('../utils/given-game-started');
const Chance = require('chance');
const {
    sendMessageAndAwaitResponseForAllClientsInGame,
    listenForClientMessageOfType,
    listenForAllMessagesToClient,
    getCardFromGameWithColor,
    listenForAllMessagesToClients
} = require('../utils/helpers');

const {NEUTRAL, BLUE, BLACK, RED} = constants.colors;
const {CHOOSE_CARD, OK, GAME_OVER, GAME_OUT_OF_SYNC} = constants.messageTypes;
const chance = new Chance();

describe('Acceptance Test: on choose card', () => {
    let given,
        result = {};

    before(() => {
        start();
    })

    describe('when guessing a card with an out of sync game', () => {
        beforeEach(async () => {
            given = await givenGameStarted();
            given.card = getCardFromGameWithColor(given.gameForCaptains, NEUTRAL);
            const message = chooseCardMessage(given.gameId, given.card, given.gameForCaptains.actionsTaken - 1);

            result.messagesForClientNotInGame = listenForAllMessagesToClient(given.clientNotInGame);
            result.messagesForOtherClientsInGame = listenForAllMessagesToClients([given.redTeamCaptain, given.blueTeamCaptain, given.blueTeamMember]);
            result.syncGameMessage = listenForClientMessageOfType(given.redTeamMember, GAME_OUT_OF_SYNC);

            given.redTeamMember.sendMessage(message);
        });

        it('should send message to sending client telling them to resync, should not update current game', async () => {
            const message = await result.syncGameMessage;

            expect(message).to.deep.equal({type: GAME_OUT_OF_SYNC, status: OK});
        });

        it('should not have sent messages to other clients in game', async () => {
            await result.syncGameMessage;

            expect(result.messagesForOtherClientsInGame).to.have.length(3);
            result.messagesForOtherClientsInGame.forEach((messageToClient) => {
                expect(messageToClient).to.have.length(0);
            });
        });

        it('should not have sent any messages to the client not in the game', async () => {
            await result.syncGameMessage;

            expect(result.messagesForClientNotInGame).to.have.length(0);
        });
    });

    describe('when guessing a neutral card', () => {
        beforeEach(async () => {
            given = await givenGameStarted();
            given.card = getCardFromGameWithColor(given.gameForCaptains, NEUTRAL);
            const message = chooseCardMessage(given.gameId, given.card, given.gameForCaptains.actionsTaken);

            result.messagesForClientNotInGame = listenForAllMessagesToClient(given.clientNotInGame);
            result.messages = await sendMessageAndAwaitResponseForAllClientsInGame(given.redTeamMember, message, given, CHOOSE_CARD);
        });

        it('should send message to all clients with revealed card and changing current team', async () => {
            const promises = result.messages.map(promise => {
                return promise.then((message) => {
                    expect(message.revealedCard).to.have.property('word', given.card.word);
                    expect(message.revealedCard).to.have.property('color', NEUTRAL);
                    expect(message.revealedCard).to.have.property('id', given.card.id);
                    expect(message).to.have.property('status', OK);
                    expect(message).to.have.property('currentTeam', BLUE);
                    expect(message).to.have.property('actionsTaken', given.gameForCaptains.actionsTaken + 1);
                });
            });

            expect(result.messages).to.have.length(4);
            await Promise.all(promises);
        });

        it('should not have sent any messages to the client not in the game', () => {
            expect(result.messagesForClientNotInGame).to.have.length(0);
        });
    });

    describe('when guessing the black card', () => {
        beforeEach(async () => {
            given = await givenGameStarted();
            given.card = getCardFromGameWithColor(given.gameForCaptains, BLACK);
            const message = chooseCardMessage(given.gameId, given.card, given.gameForCaptains.actionsTaken);

            result.messagesForClientNotInGame = listenForAllMessagesToClient(given.clientNotInGame);
            result.messages = await sendMessageAndAwaitResponseForAllClientsInGame(given.redTeamMember, message, given, GAME_OVER);
        });

        it('should send message to all clients with other team as winner', async () => {
            const promises = result.messages.map(promise => {
                return promise.then((message) => {
                    expect(message).to.have.property('winner', BLUE);
                    expect(message).to.have.property('status', OK);
                });
            });

            expect(result.messages).to.have.length(4);
            await Promise.all(promises);
        });

        it('should not have sent any messages to the client not in the game', () => {
            expect(result.messagesForClientNotInGame).to.have.length(0);
        });
    });

    describe('when guessing the other teams card', () => {
        beforeEach(async () => {
            given = await givenGameStarted();
            given.card = getCardFromGameWithColor(given.gameForCaptains, BLUE);
            const message = chooseCardMessage(given.gameId, given.card, given.gameForCaptains.actionsTaken);

            result.messagesForClientNotInGame = listenForAllMessagesToClient(given.clientNotInGame);
            result.messages = await sendMessageAndAwaitResponseForAllClientsInGame(given.redTeamMember, message, given, CHOOSE_CARD);
        });

        it('should send message to all clients with revealed card and changing current team', async () => {
            const promises = result.messages.map(promise => {
                return promise.then((message) => {
                    expect(message.revealedCard).to.have.property('word', given.card.word);
                    expect(message.revealedCard).to.have.property('color', BLUE);
                    expect(message.revealedCard).to.have.property('id', given.card.id);
                    expect(message).to.have.property('status', OK);
                    expect(message).to.have.property('currentTeam', BLUE);
                    expect(message).to.have.property('actionsTaken', given.gameForCaptains.actionsTaken + 1);
                });
            });

            expect(result.messages).to.have.length(4);
            await Promise.all(promises);
        });

        it('should not have sent any messages to the client not in the game', () => {
            expect(result.messagesForClientNotInGame).to.have.length(0);
        });
    });

    describe('when guessing your teams card AND less then clue number', () => {
        beforeEach(async () => {

            given = await givenGameStartedWithClue({
                word: chance.string(),
                number: 2,
                RED
            });
            given.card = getCardFromGameWithColor(given.gameForCaptains, RED);
            const message = chooseCardMessage(given.gameId, given.card, given.gameForCaptains.actionsTaken);

            result.messagesForClientNotInGame = listenForAllMessagesToClient(given.clientNotInGame);
            result.messages = await sendMessageAndAwaitResponseForAllClientsInGame(given.redTeamMember, message, given, CHOOSE_CARD);
        });

        it('should send message to all clients with revealed card and keep current team', async () => {
            const promises = result.messages.map(promise => {
                return promise.then((message) => {
                    expect(message.revealedCard).to.have.property('word', given.card.word);
                    expect(message.revealedCard).to.have.property('color', RED);
                    expect(message.revealedCard).to.have.property('id', given.card.id);
                    expect(message).to.have.property('currentTeam', RED);
                    expect(message).to.have.property('status', OK);
                    expect(message).to.have.property('promptRandomGuess', false);
                    expect(message).to.have.property('actionsTaken', given.gameForCaptains.actionsTaken + 1);
                });
            });

            expect(result.messages).to.have.length(4);
            await Promise.all(promises);
        });

        it('should not have sent any messages to the client not in the game', () => {
            expect(result.messagesForClientNotInGame).to.have.length(0);
        });
    });

    describe('when guessing your teams card AND equals clue number', () => {
        beforeEach(async () => {
            given = await givenGameStartedWithClue({
                word: chance.string(),
                number: 1,
                RED
            });
            given.card = getCardFromGameWithColor(given.gameForCaptains, RED);
            const message = chooseCardMessage(given.gameId, given.card, given.gameForCaptains.actionsTaken);

            result.messagesForClientNotInGame = listenForAllMessagesToClient(given.clientNotInGame);
            result.messages = await sendMessageAndAwaitResponseForAllClientsInGame(given.redTeamMember, message, given, CHOOSE_CARD);
        });

        it('should send message to all clients with revealed card, keep current team, and prompt current team if they want to guess again', async () => {
            const promises = result.messages.map(promise => {
                return promise.then((message) => {
                    expect(message.revealedCard).to.have.property('word', given.card.word);
                    expect(message.revealedCard).to.have.property('color', RED);
                    expect(message.revealedCard).to.have.property('id', given.card.id);
                    expect(message).to.have.property('currentTeam', RED);
                    expect(message).to.have.property('status', OK);
                    expect(message).to.have.property('promptRandomGuess', true);
                    expect(message).to.have.property('actionsTaken', given.gameForCaptains.actionsTaken + 1);
                });
            });

            expect(result.messages).to.have.length(4);
            await Promise.all(promises);
        });

        it('should not have sent any messages to the client not in the game', () => {
            expect(result.messagesForClientNotInGame).to.have.length(0);
        });
    });

    describe('when guessing your teams card AND more then clue number', () => {
        beforeEach(async () => {
            given = await givenGameStartedWithClue({
                word: chance.string(),
                number: 1,
                RED
            });
            given.card1 = getCardFromGameWithColor(given.gameForCaptains, RED);
            given.card2 = getCardFromGameWithColor(given.gameForCaptains, RED, [given.card1]);

            const message1 = chooseCardMessage(given.gameId, given.card1, given.gameForCaptains.actionsTaken);
            const message2 = chooseCardMessage(given.gameId, given.card2, given.gameForCaptains.actionsTaken + 1);

            result.messagesForClientNotInGame = listenForAllMessagesToClient(given.clientNotInGame);
            result.messages1 = await sendMessageAndAwaitResponseForAllClientsInGame(given.redTeamMember, message1, given, CHOOSE_CARD);
            result.messages2 = await sendMessageAndAwaitResponseForAllClientsInGame(given.redTeamMember, message2, given, CHOOSE_CARD);
        });

        it('should send message to all clients for first message with revealed card, keep current team, and prompt current team if they want to guess again', async () => {
            const promises = result.messages1.map(promise => {
                return promise.then((message) => {
                    expect(message.revealedCard).to.have.property('word', given.card1.word);
                    expect(message.revealedCard).to.have.property('color', RED);
                    expect(message.revealedCard).to.have.property('id', given.card1.id);
                    expect(message).to.have.property('currentTeam', RED);
                    expect(message).to.have.property('status', OK);
                    expect(message).to.have.property('promptRandomGuess', true);
                    expect(message).to.have.property('actionsTaken', given.gameForCaptains.actionsTaken + 1);
                });
            });

            expect(result.messages1).to.have.length(4);
            await Promise.all(promises);
        });

        it('should send message to all clients for second message with revealed card, change current team, and not prompt current team if they want to guess again', async () => {
            const promises = result.messages2.map(promise => {
                return promise.then((message) => {
                    expect(message.revealedCard).to.have.property('word', given.card2.word);
                    expect(message.revealedCard).to.have.property('color', RED);
                    expect(message.revealedCard).to.have.property('id', given.card2.id);
                    expect(message).to.have.property('currentTeam', BLUE);
                    expect(message).to.have.property('promptRandomGuess', false);
                    expect(message).to.have.property('actionsTaken', given.gameForCaptains.actionsTaken + 2);
                });
            });

            expect(result.messages2).to.have.length(4);
            await Promise.all(promises);
        });

        it('should not have sent any messages to the client not in the game', () => {
            expect(result.messagesForClientNotInGame).to.have.length(0);
        });
    });

    describe('when guessing your teams card AND found all your teams cards', () => {
        beforeEach(async () => {
            given = await givenGameStartedWithClue({
                word: chance.string(),
                number: 9,
                RED
            });

            given.card1 = getCardFromGameWithColor(given.gameForCaptains, RED);
            given.card2 = getCardFromGameWithColor(given.gameForCaptains, RED, [given.card1]);
            given.card3 = getCardFromGameWithColor(given.gameForCaptains, RED, [given.card1, given.card2]);
            given.card4 = getCardFromGameWithColor(given.gameForCaptains, RED, [given.card1, given.card2, given.card3]);
            given.card5 = getCardFromGameWithColor(given.gameForCaptains, RED, [given.card1, given.card2, given.card3, given.card4]);
            given.card6 = getCardFromGameWithColor(given.gameForCaptains, RED, [given.card1, given.card2, given.card3, given.card4, given.card5]);
            given.card7 = getCardFromGameWithColor(given.gameForCaptains, RED, [given.card1, given.card2, given.card3, given.card4, given.card5, given.card6]);
            given.card8 = getCardFromGameWithColor(given.gameForCaptains, RED, [given.card1, given.card2, given.card3, given.card4, given.card5, given.card6, given.card7]);
            given.card9 = getCardFromGameWithColor(given.gameForCaptains, RED, [given.card1, given.card2, given.card3, given.card4, given.card5, given.card6, given.card7, given.card8]);

            const message1 = chooseCardMessage(given.gameId, given.card1, given.gameForCaptains.actionsTaken);
            const message2 = chooseCardMessage(given.gameId, given.card2, given.gameForCaptains.actionsTaken + 1);
            const message3 = chooseCardMessage(given.gameId, given.card3, given.gameForCaptains.actionsTaken + 2);
            const message4 = chooseCardMessage(given.gameId, given.card4, given.gameForCaptains.actionsTaken + 3);
            const message5 = chooseCardMessage(given.gameId, given.card5, given.gameForCaptains.actionsTaken + 4);
            const message6 = chooseCardMessage(given.gameId, given.card6, given.gameForCaptains.actionsTaken + 5);
            const message7 = chooseCardMessage(given.gameId, given.card7, given.gameForCaptains.actionsTaken + 6);
            const message8 = chooseCardMessage(given.gameId, given.card8, given.gameForCaptains.actionsTaken + 7);
            const message9 = chooseCardMessage(given.gameId, given.card9, given.gameForCaptains.actionsTaken + 8);

            await sendMessageAndAwaitResponseForAllClientsInGame(given.redTeamMember, message1, given, CHOOSE_CARD);
            await sendMessageAndAwaitResponseForAllClientsInGame(given.redTeamMember, message2, given, CHOOSE_CARD);
            await sendMessageAndAwaitResponseForAllClientsInGame(given.redTeamMember, message3, given, CHOOSE_CARD);
            await sendMessageAndAwaitResponseForAllClientsInGame(given.redTeamMember, message4, given, CHOOSE_CARD);
            await sendMessageAndAwaitResponseForAllClientsInGame(given.redTeamMember, message5, given, CHOOSE_CARD);
            await sendMessageAndAwaitResponseForAllClientsInGame(given.redTeamMember, message6, given, CHOOSE_CARD);
            await sendMessageAndAwaitResponseForAllClientsInGame(given.redTeamMember, message7, given, CHOOSE_CARD);
            await sendMessageAndAwaitResponseForAllClientsInGame(given.redTeamMember, message8, given, CHOOSE_CARD);

            result.messagesForClientNotInGame = listenForAllMessagesToClient(given.clientNotInGame);
            result.messagesWithAssertions = await sendMessageAndAwaitResponseForAllClientsInGame(given.redTeamMember, message9, given, GAME_OVER);
        });

        it('should send message to all clients saying the current team won', async () => {
            const promises = result.messagesWithAssertions.map(promise => {
                return promise.then((message) => {
                    expect(message).to.have.property('winner', RED);
                    expect(message).to.have.property('status', OK);
                });
            });

            expect(result.messagesWithAssertions).to.have.length(4);
            await Promise.all(promises);
        });

        it('should not have sent any messages to the client not in the game', () => {
            expect(result.messagesForClientNotInGame).to.have.length(0);
        });
    });

    after(() => {
        stop();
    });
});

function chooseCardMessage(gameId, card, actionsTaken) {
    return {
        type: CHOOSE_CARD,
        payload: {
            gameId,
            actionsTaken,
            card: {
                id: card.id,
                word: card.word
            }
        }
    };
}