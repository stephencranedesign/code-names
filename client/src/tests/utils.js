import React from 'react';
import {mount} from 'enzyme';
import App from '../App';
import * as stateManagement from '../state-management';
import {PLAYING} from '../constants/game-statuses';
import {RED} from '../constants/colors';
import {GAME_BOARD} from '../constants/screens';
import Chance from 'chance';

export const renderAppInState = (state) => {
    const wrapper = mount(<App />);

    stateManagement.setState(state);
    wrapper.update();

    return {
        wrapper,
        setState: stateManagement.setState
    }
};

export const getDefaultState = () => stateManagement.getDefaultState();
export const setState = (obj) => stateManagement.setState(obj);


function givenCards() {
    return Array(25).fill().map((a, i) => ({
        id: i,
        word: `test-${i}`,
        revealed: false
    }))
}

export function givenGameBoardState(roleOverrides = { chosenTeam: RED }, overrides = {}) {
    const defaultState = getDefaultState();
    const clues = [{
        team: roleOverrides.chosenTeam,
        word: chance.string()
    }]

    return {
        ...defaultState,
        screen: GAME_BOARD,
        gameId: `gameId-${Math.floor(Math.random() * 1000)}`,
        gameStatus: PLAYING,
        cards: givenCards(),
        clues,
        roles: {
            ...defaultState.roles,
            ...roleOverrides
        },
        ...overrides
    }
}

export const chance = new Chance();
