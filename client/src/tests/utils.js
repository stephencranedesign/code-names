import React from 'react';
import {mount} from 'enzyme';
import App from '../App';
import * as stateManagement from '../state-management';

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
