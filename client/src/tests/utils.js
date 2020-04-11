import React from 'react';
import {shallow} from 'enzyme';
import App from '../App';
import * as stateManagement from '../state-management';

export const renderAppInState = (state) => {
    const wrapper = shallow(<App />);

    stateManagement.setState(state);

    return {
        wrapper,
        setState: stateManagement.setState
    }
};

export const getDefaultState = () => stateManagement.getDefaultState();