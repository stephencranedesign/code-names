import {registerMessageHandler} from './websocket-wrapper';
import {CAPTAIN_CLAIMED, GAME_STATUS_CHANGE, NEW_CLUE, CARD_CHOOSEN, GAME_OVER, CHANGE_TURN} from './constants/message-types';
import {PLAYING} from './constants/game-statuses';
import {GAME_BOARD, DECIDING_ROLES} from './constants/screens';
import {setState, getRoles, getClues} from './state-management';
import {onCardChoosen} from './messages/on-card-choosen';

const onMessage = (data) => {
    if (data.type === CAPTAIN_CLAIMED) {
        const {team} = data;
        const teamCaptainPickedKey = `${team.toLowerCase()}TeamCaptainClaimed`;
        const roles = getRoles();
        roles[teamCaptainPickedKey] = true;
        
        setState({roles});
    } else if (data.type === GAME_STATUS_CHANGE) {
        const {gameStatus} = data;
        const screen = gameStatus === PLAYING ? GAME_BOARD : DECIDING_ROLES;

        setState({gameStatus, screen});
    } else if (data.type === NEW_CLUE) {
        const clues = getClues();
        clues.push(data.clue);

        setState({clues});
    } else if (data.type === CARD_CHOOSEN) {
        onCardChoosen(data);
    } else if (data.type === GAME_OVER) {
        setState({
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

export const listen = () => {
    registerMessageHandler(onMessage);
}