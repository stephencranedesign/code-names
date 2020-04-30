import {RED} from './constants/colors';
import {HOME, GAME_BOARD} from './constants/screens';
import {WORDS} from './constants/game-types';
import {getClientId} from './get-client-id';

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
    activeTeam: RED,
    actionsTaken: 0,
    screen: HOME,
    // screen: 'game-board',
    roles: {
        blueTeamCaptainClaimed: false,
        redTeamCaptainClaimed: false
    },
    // clues: [{team: 'blue', word: 'testing', number: 2}],
    // cards: Array(25).fill('').map((x,i) => ({word: 'test', id: i, revealed:false})), 
    clues: [],
    cards: [],
    gameId: null,
    gameStatus: null,
    promptRandomGuess: false,
    gameType: WORDS,
    clientId: getClientId(),
    showClueTracker: true
});