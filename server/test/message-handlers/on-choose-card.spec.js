const {expect} = require('chai');
const {onChooseCard} = require('../../src/message-handlers/on-choose-card');
const {NEUTRAL, BLUE, BLACK} = require('../../../client/src/constants/colors');
const {start, stop} = require('../utils/server');
const {givenGameStarted} = require('../utils/given-game-started');
const {CHOOSE_CARD, CARD_CHOOSEN, GAME_OVER} = require('../../../client/src/constants/message-types');
const {promiseGenerator} = require('../utils/promise-generator');

describe('on choose card', () => {
    let given,
        result = {};

    before(() => {
        start();
    })

    describe('when guessing a neutral card', () => {
        beforeEach(async () => {
            given = await givenGameStarted();
            given.card = getCardFromGameWithColor(given.game, NEUTRAL);

            const message = {
                type: CHOOSE_CARD,
                payload: {
                    gameId: given.gameId,
                    card: {
                        id: given.card.id,
                        word: given.card.word
                    }
                }
            };

            result.messages = [
                listenForMessage(given.blueTeamCaptain, CARD_CHOOSEN),
                listenForMessage(given.redTeamCaptain, CARD_CHOOSEN),
                listenForMessage(given.blueTeamMember, CARD_CHOOSEN),
                listenForMessage(given.redTeamMember, CARD_CHOOSEN)
            ];

            given.redTeamMember.sendMessage(message);
            await Promise.all(result.messages);
        });

        it('should send message to all clients', async () => {
            const promises = result.messages.map(promise => {
                return promise.then((message) => {
                    expect(message.revealedCard).to.have.property('word', given.card.word);
                    expect(message.revealedCard).to.have.property('color', NEUTRAL);
                    expect(message.revealedCard).to.have.property('id', given.card.id);
                    expect(message).to.have.property('currentTeam', BLUE);
                });
            });

            await Promise.all(promises);
        });
    });

    describe('when guessing the black card', () => {
        beforeEach(async () => {
            given = await givenGameStarted();
            given.card = getCardFromGameWithColor(given.game, BLACK);

            const message = {
                type: CHOOSE_CARD,
                payload: {
                    gameId: given.gameId,
                    card: {
                        id: given.card.id,
                        word: given.card.word
                    }
                }
            };

            result.messages = [
                listenForMessage(given.blueTeamCaptain, GAME_OVER),
                listenForMessage(given.redTeamCaptain, GAME_OVER),
                listenForMessage(given.blueTeamMember, GAME_OVER),
                listenForMessage(given.redTeamMember, GAME_OVER)
            ];

            given.redTeamMember.sendMessage(message);
            await Promise.all(result.messages);
        });

        it('should send message to all clients', async () => {
            const promises = result.messages.map(promise => {
                return promise.then((message) => {
                    console.log({message});
                    expect(message).to.have.property('winner', BLUE);
                });
            });

            await Promise.all(promises);
        });
    });

    describe('when guessing the other teams card', () => {
        beforeEach(async () => {
            given = await givenGameStarted();
            given.card = getCardFromGameWithColor(given.game, BLUE);

            const message = {
                type: CHOOSE_CARD,
                payload: {
                    gameId: given.gameId,
                    card: {
                        id: given.card.id,
                        word: given.card.word
                    }
                }
            };

            result.messages = [
                listenForMessage(given.blueTeamCaptain, CARD_CHOOSEN),
                listenForMessage(given.redTeamCaptain, CARD_CHOOSEN),
                listenForMessage(given.blueTeamMember, CARD_CHOOSEN),
                listenForMessage(given.redTeamMember, CARD_CHOOSEN)
            ];

            given.redTeamMember.sendMessage(message);
            await Promise.all(result.messages);
        });

        it('should send message to all clients', async () => {
            const promises = result.messages.map(promise => {
                return promise.then((message) => {
                    expect(message.revealedCard).to.have.property('word', given.card.word);
                    expect(message.revealedCard).to.have.property('color', BLUE);
                    expect(message.revealedCard).to.have.property('id', given.card.id);
                    expect(message).to.have.property('currentTeam', BLUE);
                });
            });

            await Promise.all(promises);
        });
    });

    after(() => {
        console.log('stop');
        stop();
    });
});

function getCardFromGameWithColor(game, color) {
    return game.cards.find(card => card.color === color);
}

function listenForMessage(client, type) {
    const promise = promiseGenerator();

    client.setOnMessage((data) => {
        if (data.type === type) {
            promise.resolve(data);
        }
    });

    return promise.promise;
}