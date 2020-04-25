import {registerMessageHandler} from './websocket-wrapper';
import {CAPTAIN_CLAIMED, GAME_STATUS_CHANGE, NEW_CLUE, CHOOSE_CARD, GAME_OVER, CHANGE_TURN} from './constants/message-types';
import {setState, getRoles, getClues, getDefaultState} from './state-management';
import {onCardChoosen} from './messages/on-card-choosen';
import {onGameStatusChange} from './messages/on-game-status-change';

const onMessage = (data) => {
    if (data.type === CAPTAIN_CLAIMED) {
        const {team} = data;
        const teamCaptainPickedKey = `${team.toLowerCase()}TeamCaptainClaimed`;
        const roles = getRoles();
        roles[teamCaptainPickedKey] = true;
        
        setState({roles});
    } else if (data.type === GAME_STATUS_CHANGE) {
        onGameStatusChange(data);
    } else if (data.type === NEW_CLUE) {
        const clues = getClues();
        clues.push(data.clue);

        setState({clues});
    } else if (data.type === CHOOSE_CARD) {
        onCardChoosen(data);
    } else if (data.type === GAME_OVER) {
        setState({
            ...getDefaultState(),
            screen: GAME_OVER,
            gameStatus: GAME_OVER,
            winner: data.winner
        })
    } else if (data.type === CHANGE_TURN) {
        setState({
            activeTeam: data.currentTeam,
            promptRandomGuess: false
        })
    }
};

let isListenerSet = false;

export const listen = () => {
    if (isListenerSet) return;

    isListenerSet = true;
    registerMessageHandler(onMessage);
}