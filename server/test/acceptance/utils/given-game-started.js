
const {promiseGenerator, chance} = require('./helpers');
const {connectToSocket} = require('./connect-to-socket');
const constants = require('../../../src/constants');

const {CREATE_GAME, JOIN_TEAM, CAPTAIN_CLAIMED, OK, SUBMIT_CLUE, NEW_CLUE} = constants.messageTypes;
const {RED, BLUE} = constants.colors;

async function givenGameStarted() {
    const gameId = chance.integer({min: 1, max: 100});
    const {blueTeamCaptain, redTeamCaptain, game: gameForCaptains} = await givenConnectedTeamCaptains(gameId);
    const {redTeamMember, blueTeamMember, game: gameForTeamMembers} = await givenConnectedTeamMembers(gameId);
    const clientNotInGame = await connectToSocket('ws://localhost:8081/');

    return {
        blueTeamCaptain,
        redTeamCaptain,
        blueTeamMember,
        redTeamMember,
        clientNotInGame,
        gameId,
        gameForCaptains,
        gameForTeamMembers
    }
} 

async function givenGameStartedWithClue(clue) {
    const gameId = chance.integer({min: 1, max: 100});
    const {blueTeamCaptain, redTeamCaptain, game: gameForCaptains} = await givenConnectedTeamCaptains(gameId);
    const {redTeamMember, blueTeamMember, game: gameForTeamMembers} = await givenConnectedTeamMembers(gameId);
    const clientNotInGame = await connectToSocket('ws://localhost:8081/');
    
    await submitClue(redTeamCaptain, clue, gameId);

    return {
        blueTeamCaptain,
        redTeamCaptain,
        blueTeamMember,
        redTeamMember,
        clientNotInGame,
        gameId,
        gameForCaptains,
        gameForTeamMembers
    }
} 

async function givenConnectedTeamMembers(gameId) {
    const redTeamMember = await connectToSocket('ws://localhost:8081/');
    const blueTeamMember = await connectToSocket('ws://localhost:8081/');

    const {game} = await joinGameAsRole(redTeamMember, gameId, RED, false, redTeamMember.clientId);
    await joinGameAsRole(blueTeamMember, gameId, BLUE, false, blueTeamMember.clientId);

    return {
        redTeamMember,
        blueTeamMember,
        game
    }
}

async function givenConnectedTeamCaptains(gameId) {
    const redTeamClient = await connectToSocket('ws://localhost:8081/');
    const blueTeamClient = await connectToSocket('ws://localhost:8081/');
    await givenGame(redTeamClient, gameId);

    const {game} = await joinGameAsRole(redTeamClient, gameId, RED, true, redTeamClient.clientId);
    await joinGameAsRole(blueTeamClient, gameId, BLUE, true, blueTeamClient.clientId);

    return {
        blueTeamCaptain: blueTeamClient,
        redTeamCaptain: redTeamClient,
        gameId,
        game
    }
}

async function givenGame(client, gameId) {
    const id = chance.string();
    const promise = promiseGenerator();
    client.setOnMessage((data) => {
        if (data.type === CREATE_GAME, data.status === OK) {
            promise.resolve();
        }
    });
    client.sendMessage({type: CREATE_GAME, id, payload: {gameId}});

    return promise.promise;
}

async function joinGameAsRole(client, gameId, team, captain, clientId) {
    const id = chance.string();
    const promise = promiseGenerator();

    client.setOnMessage((data) => {
        if (data.type === JOIN_TEAM && data.status === OK) {
            promise.resolve(data);
        }
    });
    client.sendMessage({type: JOIN_TEAM, id, clientId, payload: {gameId, team, captain}});

    return promise.promise;
}

async function submitClue(client, clue, gameId) {
    const promise = promiseGenerator();

    client.setOnMessage((data) => {
        if (data.type === NEW_CLUE) {
            promise.resolve(data);
        }
    });
    client.sendMessage({type: SUBMIT_CLUE, payload: {clue, gameId}});

    return promise.promise;
}

module.exports = {givenGameStarted, givenGameStartedWithClue};