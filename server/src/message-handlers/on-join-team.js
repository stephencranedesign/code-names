const {OK, ERROR, CAPTAIN_CLAIMED, GAME_STATUS_CHANGE} = require('../../../client/src/constants/message-types');
const {RED, BLUE} = require('../../../client/src/constants/colors');
const {PLAYING} = require('../../../client/src/constants/game-statuses');
const {getGameForNormalPlayer, getGame} = require('../db');

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
    const {id, payload} = message;
    const {gameId, team, captain} = payload;

    

    if (!captain) { // successful join team request
        return sendToSelf({type: OK, id, game: getGameForNormalPlayer(gameId)});
    }

    if (isRequestSuccesful) { // successful captain request
        sendToGame(gameId, {type: CAPTAIN_CLAIMED, team});
        sendToSelf({type: OK, id, game: fullGame});
    } else { // failed captain request
        sendToSelf({type: ERROR, id, reason: 'Someone else has already claimed captain :('});
    }   
}

function onJoinTeam(message, senders) {
    const {gameId, team, captain} = message.payload;

    const fullGame = getGame(gameId);
    const isRequestSuccesful = captain ? claimCaptainAttempt(fullGame, team) : joinTeamAttempt(fullGame, team);
    const isGameReady = determineGameStatus(fullGame);

    respondToRoleSelection(message, isRequestSuccesful, fullGame, senders);

    if (isGameReady) {
        senders.sendToGame(gameId, {type: GAME_STATUS_CHANGE, gameStatus: PLAYING});
    }
}

module.exports = {onJoinTeam};