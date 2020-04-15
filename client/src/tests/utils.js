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

export function givenGameBoardState(overrides = {}) {
    const defaultState = getDefaultState();

    return {
        ...defaultState,
        screen: GAME_BOARD,
        gameId: `gameId-${Math.floor(Math.random() * 1000)}`,
        gameStatus: PLAYING,
        cards: givenCards(),
        roles: {
            ...defaultState.roles,
            chosenRole: defaultState.activeTeam
        },
        ...overrides
    }
}

export const chance = new Chance();
