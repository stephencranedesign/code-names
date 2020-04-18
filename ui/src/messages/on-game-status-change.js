import {PLAYING} from '../constants/game-statuses';
import {GAME_BOARD, DECIDING_ROLES} from '../constants/screens';
import {setState, getRoles} from '../state-management';

export const onGameStatusChange = ({gameStatus}) => {
    const isPlaying = gameStatus === PLAYING;
    const hasJoinedTeam = Boolean(getRoles().chosenTeam);
    const shouldShowGameBoard = isPlaying && hasJoinedTeam;
    const screen = shouldShowGameBoard? GAME_BOARD : DECIDING_ROLES;
    
    setState({gameStatus, screen});
};