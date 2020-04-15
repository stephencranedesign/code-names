import {RED} from './constants/colors';
import {HOME, GAME_BOARD} from './constants/screens';

let state;
let setStateFunc;

export const set = (stateObj, func) => {
    state = stateObj;
    setStateFunc = func;
};

export const storeState = (stateObj) => state = stateObj;

export const setScreen = screen => setStateFunc({screen});
export const changeTeamTurn = () => {
    const activeTeam = state.activeTeam === 'blue' ? 'red' : 'blue';
    
    setStateFunc({activeTeam});
};

export const getRoles = () => state.roles;
export const getClues = () => state.clues;
export const getCards = () => state.cards;
export const setState = obj => setStateFunc(obj);

export const getDefaultState = () => ({
    // screen: GAME_BOARD,
    screen: HOME,
    activeTeam: RED,
    roles: {
        blueTeamCaptainClaimed: false,
        redTeamCaptainClaimed: false,
        chosenTeam: RED,
        isCaptain: false
    },
    // clues: [{word: 'bill', number: 2, team: 'red'}, {word: 'bob', number: 2, team: 'blue'}],
    // cards: Array(25).fill().map((a, i) => ({word: `test-${i}`})),
    clues: [],
    cards: [], 
    gameId: null,
    gameStatus: null
});