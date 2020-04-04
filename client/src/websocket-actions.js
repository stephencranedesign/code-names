import {registerMessageHandler} from './websocket-wrapper';
import {CAPTAIN_CLAIMED, GAME_STATUS_CHANGE} from './constants/message-types';
import {PLAYING} from './constants/game-statuses';
import {GAME_BOARD, DECIDING_ROLES} from './constants/screens';
import {setState, getRoles} from './state-management';

const onMessage = (data) => {
    console.log('onMessage: ', data);

    if (data.type === CAPTAIN_CLAIMED) {
        const {team} = data;
        const teamCaptainPickedKey = `${team.toLowerCase()}TeamCaptainClaimed`;
        const roles = getRoles();
        roles[teamCaptainPickedKey] = true;
        
        console.log({roles});
        setState({roles});
    } else if (data.type === GAME_STATUS_CHANGE) {
        const {gameStatus} = data;
        const screen = gameStatus === PLAYING ? GAME_BOARD : DECIDING_ROLES;

        setState({gameStatus, screen});
    }
};

export const listen = () => {
    registerMessageHandler(onMessage);
}