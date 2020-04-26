import {whenSocketSends, givenSocketOpened} from '../../mocks/socket';
import {renderAppInState, getDefaultState, givenGameBoardState, chance} from '../../utils';
import {GAME_BOARD} from '../../../constants/screens';
import {CHOOSE_CARD, GAME_OVER, OK} from '../../../constants/message-types';
import {RED, BLUE, NEUTRAL, BLACK} from '../../../constants/colors';
import { TeamTurnTracker } from '../../../components/Team-Turn-Tracker';
import { ClueTracker } from '../../../components/Clue-Tracker';

describe('UI Acceptance Tests: Game Board', () => {
    test('when selecting a neutral card', async () => {
        const state = givenGameBoardState();
        const card = getRandomCard(state);
        const {wrapper} = renderAppInState(state);
    
        await chooseCard(wrapper, state, card, {
            type: CHOOSE_CARD,
            status: OK,
            currentTeam: BLUE,
            revealedCard: {
                ...card,
                color: NEUTRAL,
                revealed: true
            }
        });

        assertScreen(wrapper, GAME_BOARD);
    
        const liProps = wrapper.find('.cards li').at(card.id).props();

        expect(liProps.className.includes('revealed')).toBe(true);
        expect(liProps.className.includes(NEUTRAL)).toBe(true);

        assertTeamTurn(wrapper, BLUE);
    });

    test('when selecting the black card', async () => {
        const state = givenGameBoardState();
        const card = getRandomCard(state);
        const {wrapper} = renderAppInState(state);
    
        await chooseCard(wrapper, state, card, {
            type: GAME_OVER,
            status: OK,
            winner: BLUE
        });

        assertScreen(wrapper, GAME_OVER);
        expect(wrapper.find('.game-over p').text()).toBe(`Team ${BLUE} won!!!`)
    });

    test('when selecting the other teams card', async () => {
        const state = givenGameBoardState();
        const card = getRandomCard(state);
        const {wrapper} = renderAppInState(state);
    
        await chooseCard(wrapper, state, card, {
            type: CHOOSE_CARD,
            status: OK,
            currentTeam: BLUE,
            revealedCard: {
                ...card,
                color: BLUE,
                revealed: true
            }
        });

        assertScreen(wrapper, GAME_BOARD);
    
        const liProps = wrapper.find('.cards li').at(card.id).props();

        expect(liProps.className.includes('revealed')).toBe(true);
        expect(liProps.className.includes(BLUE)).toBe(true);

        assertTeamTurn(wrapper, BLUE);
    });

    test('when selecting your teams card', async () => {
        const state = givenGameBoardState();
        const card = getRandomCard(state);
        const {wrapper} = renderAppInState(state);
    
        await chooseCard(wrapper, state, card, {
            type: CHOOSE_CARD,
            status: OK,
            currentTeam: RED,
            promptRandomGuess: false,
            revealedCard: {
                ...card,
                color: RED,
                revealed: true
            }
        });

        assertScreen(wrapper, GAME_BOARD);
    
        const liProps = wrapper.find('.cards li').at(card.id).props();

        expect(liProps.className.includes('revealed')).toBe(true);
        expect(liProps.className.includes(RED)).toBe(true);

        assertTeamTurn(wrapper, RED);
    });
});

function assertTeamTurn(wrapper, color) {
    const div = wrapper.childAt(0);

    expect(div.is('div.app')).toBe(true);
    expect(div.props().className.includes(`${color}-active`)).toBe(true);
}

function assertScreen(wrapper, screen) {
    if (screen === GAME_BOARD) {
        const gameBoard = wrapper.childAt(0).childAt(0);
        const teamTurnTracker = gameBoard.childAt(0);
        const clueTracker = gameBoard.childAt(1);
        const cardContainer = gameBoard.childAt(2);

        expect(gameBoard.children()).toHaveLength(3);
        
        expect(teamTurnTracker.is(TeamTurnTracker)).toBe(true);
        expect(clueTracker.is(ClueTracker)).toBe(true);
        expect(cardContainer.is('div.card-container')).toBe(true);
    } else if (screen === GAME_OVER) {
        const gameOver = wrapper.childAt(0).childAt(0);

        expect(gameOver.children()).toHaveLength(1);
        expect(gameOver.childAt(0).is('div.game-over')).toBe(true);
    }
}


function getRandomCard(state) {
    return chance.pickone(state.cards);
}

async function chooseCard(wrapper, state, card, response) {
    await givenSocketOpened();
    const actionsTaken = state.actionsTaken;
    const socketRecievedResponse = whenSocketSends({type: CHOOSE_CARD, payload: {actionsTaken}}).respondWith(response);

    const li = wrapper.find('.card-container .cards li');
    li.at(card.id).props().onClick();

    await socketRecievedResponse;
    wrapper.update();
}