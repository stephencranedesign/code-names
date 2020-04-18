import {setState} from './state-management';
import {send} from './websocket-wrapper';
import {CREATE_GAME} from './constants/message-types';
import {DECIDING_ROLES, JOIN_GAME, DECIDING_GAME_TYPE} from './constants/screens';

export const decideGameType = () => {
    setState({screen: DECIDING_GAME_TYPE});
};

export const startGame = async (gameType) => {
    const gameId = Math.round(Math.random() * 100000);
    await send({gameId, gameType}, CREATE_GAME);

    setState({screen: DECIDING_ROLES, gameId, gameType});
};

export const joinGame = async () => {
    setState({screen: JOIN_GAME});
};
