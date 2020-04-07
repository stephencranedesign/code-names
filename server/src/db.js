let db = {};

const getGame = (id) => db[id];
const setGame = (id, game) => {
    db[id] = game;

    console.log({db});
}
const reset = () => {
    db = {};
}

const getGameForNormalPlayer = (id) => {
    const game = getGame(id);

    if (!game) return null;

    return {
        ...game,
        captainCards: null
    };
};

const purgeOldGames = (activeGameIds) => {
    console.log('purgeOldGames');

    Object.keys(db).forEach((key) => {
        console.log({key});

        if (!activeGameIds.includes(Number(key))) {
            delete db[key];
        }
    });

    console.log({db});
};

module.exports = {getGame, setGame, reset, getGameForNormalPlayer, purgeOldGames};