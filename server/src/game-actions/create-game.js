const Chance = require('chance');
const {WORDS, CUSTOM} = require('../words');
const {setGame, getGameForNormalPlayer} = require('../db');
const constants = require('../constants');

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

const createGame = (gameId) => {
    const pool = WORDS.concat(CUSTOM);
    const poolWithPossibleDuplicates = chance.pickset(pool, 50);
    const uniquePool = unique(poolWithPossibleDuplicates);
    const unshuffledCaptainCards = chance.pickset(uniquePool, 25).map((word, i) => {
        if (i < 9) { // 9 red
            return {
                word,
                color: RED
            }
        } else if (i < 16) { // 8 blue
            return {
                word,
                color: BLUE
            }
        } else if (i < 17) { // 1 black
            return {
                word,
                color: BLACK
            }
        }

        return {
            word,
            color: NEUTRAL
        };
    });

    const cards = chance.shuffle(unshuffledCaptainCards).map(({word, color}, i) => ({
        id: i,
        word,
        color,
        revealed: false
    }));
    
    setGame(gameId, {
        cards: cards,
        currentTeam: RED,
        clues: [],
        roles: {
            blueTeamCaptainClaimed: false,
            redTeamCaptainClaimed: false,
            blueTeamCount: 0,
            redTeamCount: 0,
            chosenTeam: null
        },
        gameId,
        blueCorrectGuesses: 0,
        redCorrectGuesses: 0,
        gameStatus: DECIDING_ROLES
    });

    return getGameForNormalPlayer(gameId);
};

module.exports = {createGame};