// import React from 'react';
// import App from '../../App';
// import {shallow} from 'enzyme';
// import {setState} from '../../state-management';
import {Home} from '../../../components/screens/Home';
import {GameBoard} from '../../../components/screens/Game-Board';
import {renderAppInState, getDefaultState} from '../../utils';

test('test initial render', () => {
    const {wrapper} = renderAppInState();

    // console.log({bill});
    console.log('hi: ', wrapper.is('div'));
    expect(wrapper.is('div')).toBe(true);
    expect(wrapper.childAt(0).is(Home)).toBe(true);
});

test('test setting screen to game board', () => {
    const defaultState = getDefaultState();
    const {wrapper, setState} = renderAppInState();

    setState({
        ...defaultState,
        screen: 'game-board'
    })

    // console.log({bill});
    console.log('hi: ', wrapper.is('div'));
    expect(wrapper.is('div')).toBe(true);
    expect(wrapper.childAt(0).is(GameBoard)).toBe(true);
});

// function givenAppState(state) {

// }