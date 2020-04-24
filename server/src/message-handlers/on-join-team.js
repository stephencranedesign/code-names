const constants = require('../constants');
const {getGameForNormalPlayer, getGameForCaptain, getGame, storeRoleForClientId} = require('../db');

const {OK, ERROR, CAPTAIN_CLAIMED, GAME_STATUS_CHANGE, JOIN_TEAM} = constants.messageTypes;
const {RED, BLUE} = constants.colors;
const {PLAYING} = constants.gameStatuses;

function getCaptainClaimedProp(team) {
    return `${team.toLowerCase()}TeamCaptainClaimed`;
}

function getTeamCountProp(team) {
    return `${team.toLowerCase()}TeamCount`;
}

function claimCaptainAttempt(game, team) {
    const captainClaimedProp = getCaptainClaimedProp(team);
    const unClaimed = game.roles[captainClaimedProp];
    const successful = !unClaimed;

    if (!unClaimed) {
        game.roles[captainClaimedProp] = true;
        ++game.roles[getTeamCountProp(team)];
    };

    return successful;
}

function joinTeamAttempt(game, team) {
    ++game.roles[getTeamCountProp(team)];

    return true;
}

function determineGameStatus(game) {
    const redTeamCaptainClaimed = game.roles[getCaptainClaimedProp(RED)];
    const blueTeamCaptainClaimed = game.roles[getCaptainClaimedProp(BLUE)];
    const redTeamHasEnoughPlayers = game.roles[getTeamCountProp(RED)] > 1;
    const blueTeamHasEnoughPlayers = game.roles[getTeamCountProp(BLUE)] > 1;
    const teamsReady = redTeamCaptainClaimed && blueTeamCaptainClaimed && redTeamHasEnoughPlayers && blueTeamHasEnoughPlayers;

    if (teamsReady) {
        game.gameStatus = PLAYING;
    }

    return teamsReady;
}

function respondToRoleSelection(message, isRequestSuccesful, fullGame, {sendToGame, sendToSelf}) {
    const {id, payload, clientId} = message;
    const {gameId, team, captain} = payload;

    if (!captain) { // successful join team request
        storeRoleForClientId(gameId, clientId, team, false);

        return sendToSelf(gameId, {type: JOIN_TEAM, status:OK, id, game: getGameForNormalPlayer(gameId)});
    }

    if (isRequestSuccesful) { // successful captain request
        storeRoleForClientId(gameId, clientId, team, true);
        sendToGame(gameId, {type: CAPTAIN_CLAIMED, status: OK, team});
        sendToSelf(gameId, {type: JOIN_TEAM, status: OK, id, game: getGameForCaptain(gameId)});
    } else { // failed captain request
        sendToSelf(gameId, {type: JOIN_TEAM, status: ERROR, id, reason: 'Someone else has already claimed captain :('});
    }   
}

function onJoinTeam(message, senders) {
    const {gameId, team, captain} = message.payload;

    const fullGame = getGame(gameId);
    const isRequestSuccesful = captain ? claimCaptainAttempt(fullGame, team) : joinTeamAttempt(fullGame, team);
    const isGameReady = determineGameStatus(fullGame);

    respondToRoleSelection(message, isRequestSuccesful, fullGame, senders);

    if (isGameReady) {
        senders.sendToGame(gameId, {type: GAME_STATUS_CHANGE, status: OK, gameStatus: PLAYING});
    }
}

module.exports = {onJoinTeam};