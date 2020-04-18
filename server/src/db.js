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

    return {
        ...game,
        cards: game.cards.map(toCardForNormalPlayer)
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