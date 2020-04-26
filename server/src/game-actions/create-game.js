const Chance = require('chance');
const {WORDS, CUSTOM} = require('../words');
const {setGame, getGameForNormalPlayer} = require('../db');
const constants = require('../constants');
const fetch = require('node-fetch');

const {RED, BLACK, BLUE, NEUTRAL} = constants.colors;
const {DECIDING_ROLES} = constants.gameStatuses;

const chance = new Chance();

function unique(array) {
    const set = new Set();
    const newArray = [];

    array.forEach(item => set.add(item));
    set.forEach(item => newArray.push(item));

    return newArray;
}

function assignColorsAndShuffle(cards) {
    const unshuffled = cards.map((card, i) => {
        if (i < 9) { // 9 red
            return {
                ...card,
                color: RED
            }
        } else if (i < 16) { // 8 blue
            return {
                ...card,
                color: BLUE
            }
        } else if (i < 17) { // 1 black
            return {
                ...card,
                color: BLACK
            }
        }

        return {
            ...card,
            color: NEUTRAL
        };
    });

    return chance.shuffle(unshuffled).map((card, i) => ({
        ...card,
        id: i,
        revealed: false
    }));
}

function createWordCards(array) {
    const pool = WORDS.concat(CUSTOM);
    const poolWithPossibleDuplicates = chance.pickset(pool, 50);
    const uniquePool = unique(poolWithPossibleDuplicates);
    const unshuffledCaptainCards = chance.pickset(uniquePool, 25).map(word => ({word}));
    const cards = assignColorsAndShuffle(unshuffledCaptainCards);

    return Promise.resolve(cards);
}

async function createPictureCards() {
    const page = chance.integer({min: 1, max: 39});
    const pics = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=25`).then(res => res.json());
    const urls = pics.map(({id}) => ({url: `https://picsum.photos/id/${id}/300/300`}));
    
    return assignColorsAndShuffle(urls);
}

const createGame = async (gameId, gameType) => {
    const cardsPromise = gameType === constants.gameTypes.PICTURES ? createPictureCards() : createWordCards();
    const cards = await cardsPromise;
    
    setGame(gameId, {
        cards,
        currentTeam: RED,
        clues: [],
        roles: {
            blueTeamCaptainClaimed: false,
            redTeamCaptainClaimed: false,
            blueTeamCount: 0,
            redTeamCount: 0,
            chosenTeam: null,
            byId: {}
        },
        gameId,
        blueCorrectGuesses: 0,
        redCorrectGuesses: 0,
        gameStatus: DECIDING_ROLES,
        actionsTaken: 0
    });

    return getGameForNormalPlayer(gameId);
};

module.exports = {createGame};