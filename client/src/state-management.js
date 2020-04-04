import {RED} from './constants/colors';
import {HOME} from './constants/screens';

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
export const setState = obj => setStateFunc(obj);

export const getDefaultState = () => ({
    screen: HOME,
    activeTeam: RED,
    roles: {
        blueTeamCaptainClaimed: false,
        redTeamCaptainClaimed: false,
        chosenTeam: null,
        isCaptain: false
    },
    cards: [],
    gameId: null,
    gameStatus: null
});