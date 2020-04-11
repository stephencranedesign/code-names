let db = {};

const getGame = (id) => db[id];
const setGame = (id, game) => {
    db[id] = game;
}
const reset = () => {
    db = {};
}

const getGameForNormalPlayer = (id) => {
    const game = getGame(id);

    if (!game) return null;

    return {
        ...game,
        cards: game.cards.map(({id, word, revealed}) => ({
            id,
            word,
            revealed
        }))
    };
};

const purgeOldGames = (activeGameIds) => {
    Object.keys(db).forEach((key) => {
        if (!activeGameIds.includes(Number(key))) {
            delete db[key];
        }
    });
};

module.exports = {getGame, setGame, reset, getGameForNormalPlayer, purgeOldGames};