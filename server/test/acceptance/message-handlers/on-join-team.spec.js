const {expect} = require('chai');
const {onChooseCard} = require('../../../src/message-handlers/on-choose-card');
const {NEUTRAL, BLUE, BLACK, RED} = require('../../../../client/src/constants/colors');
const {start, stop} = require('../utils/server');
const {givenGameStarted, givenGameStartedWithClue} = require('../utils/given-game-started');
const {JOIN_TEAM} = require('../../../../client/src/constants/message-types');
const {promiseGenerator} = require('../utils/promise-generator');
const Chance = require('chance');

const chance = new Chance();

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
            expect(given.gameForCaptains.cards).to.have.length(25);

            given.gameForCaptains.cards.forEach((card) => {
                const hasColorRevealed = [RED, BLUE, BLACK, NEUTRAL].includes(card.color);

                expect(hasColorRevealed).to.equal(true);
            });
        });
    });

    describe('when picking team member', () => {
        beforeEach(async () => {
            given = await givenGameStarted();
        });

        it('should send game with out color on cards', async () => {
            expect(given.gameForTeamMembers.cards).to.have.length(25);

            given.gameForTeamMembers.cards.forEach((card) => {
                expect(card).to.not.have.property('color');
            });
        });
    });

    after(() => {
        stop();
    });
});

function getCardFromGameWithColor(game, color, otherCardsToExclude = []) {
    return game.cards.find(card => card.color === color && !otherCardsToExclude.includes(card.word));
}

function listenForAllMessagesToClient(client) {
    const messages = [];

    client.setOnMessage((data) => {
        messages.push(data);
    });

    return messages;
}

function listenForClientMessageOfType(client, type) {
    const promise = promiseGenerator();

    client.setOnMessage((data) => {
        if (data.type === type) {
            promise.resolve(data);
        }
    });

    return promise.promise;
}

async function sendMessageAndAwaitResponseForAllClientsInGame(client, message, given, type) {
    const responses = [
        listenForClientMessageOfType(given.blueTeamCaptain, type),
        listenForClientMessageOfType(given.redTeamCaptain, type),
        listenForClientMessageOfType(given.blueTeamMember, type),
        listenForClientMessageOfType(given.redTeamMember, type)
    ];

    client.sendMessage(message);
    await Promise.all(responses);

    return responses;
}

function joinTeamMessage(gameId, team, captain) {
    return {
        type: JOIN_TEAM,
        payload: {
            gameId,
            team,
            captain
        }
    };
}