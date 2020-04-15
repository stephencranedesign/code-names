import {setState} from './state-management';
import {send} from './websocket-wrapper';
import {CREATE_GAME} from './constants/message-types';
import {DECIDING_ROLES, JOIN_GAME} from './constants/screens';

export const startGame = async () => {
    const gameId = Math.round(Math.random() * 1000);
    await send({gameId}, CREATE_GAME);

    setState({screen: DECIDING_ROLES, gameId});
};

export const joinGame = async () => {
    setState({screen: JOIN_GAME});
};
