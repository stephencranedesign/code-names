let db = {};

const getGame = (id) => db[id];
const setGame = (id, game) => {
    db[id] = game;
}
const reset = () => {
    db = {};
}

const toCardForNormalPlayer = (card) => {
    if (!card.revealed) {
        return {
            id: card.id,
            word: card.word,
            revealed: card.word,
            url: card.url
        }
    }

    return card;
};

const getGameForNormalPlayer = (id) => {
    const game = getGame(id);

    if (!game) return null;

    const modifiedRoles = {...game.roles};
    delete modifiedRoles.byId;

    return {
        ...game,
        cards: game.cards.map(toCardForNormalPlayer),
        roles: modifiedRoles
    };
};

const getGameForCaptain = (id) => {
    const game = getGame(id);

    if (!game) return null;

    const modifiedRoles = {...game.roles};
    delete modifiedRoles.byId;

    return {
        ...game,
        roles: modifiedRoles
    };
};

const purgeOldGames = (activeGameIds) => {
    Object.keys(db).forEach((key) => {
        if (!activeGameIds.includes(Number(key))) {
            delete db[key];
        }
    });
};

function storeRoleForClientId(gameId, clientId, team, captain) {
    const game = getGame(gameId);

    game.roles.byId[clientId] = {
        team,
        captain
    };
}

function getRoleForClientId(gameId, clientId) {
    const game = getGame(gameId);

    if (!game) return null;

    return game.roles.byId[clientId];
}

module.exports = {getGame, setGame, reset, getGameForNormalPlayer, purgeOldGames, storeRoleForClientId, getRoleForClientId, getGameForCaptain};