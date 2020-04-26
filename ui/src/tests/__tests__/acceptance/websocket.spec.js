import {whenSocketSends, givenSocketOpened, recursivelyCloseAndReopen} from '../../mocks/socket';
import {chance} from '../../utils';
import {SYNC_GAME, OK} from '../../../constants/message-types';
import {setState} from '../../../state-management';

import {registerMessageHandler, send} from '../../../websocket-wrapper';
import { promiseFactory } from '../../../promise-factory';

jest.mock('../../../state-management');

describe('UI Acceptance Tests: Websocket', () => {
    let gameId, clientId;
    beforeEach(() => {
        gameId = chance.string();
        clientId = chance.string();
        sessionStorage.setItem('game-id', gameId);
        sessionStorage.setItem('client-id', clientId);
    });

    afterEach(() => {
        sessionStorage.removeItem('game-id');
        sessionStorage.removeItem('client-id');
    });

    test('when the socket closes it should reopen a new socket, rejoin the game, retrieve the game state from the server, and then send messages', async () => {
        const sentMessageType = chance.string();
        const responseMessageType = chance.string();
        const game = {
            actionsTaken: chance.integer({min: 0, max: 10}),
            currentTeam: chance.string(),
            cards: chance.n(chance.object, chance.d6()),
            clues: chance.n(chance.object, chance.d6()),
            gameStatus: chance.string()
        };

        let successfullyRecievedMessage = false;

        registerMessageHandler((data) => {
            if (data.type === responseMessageType) {
                successfullyRecievedMessage = true;
            }
        });

        await givenSocketOpened();

        const rejoinGameResponse = whenSocketSends({type: SYNC_GAME, payload: {gameId}}).respondWith({type: SYNC_GAME, status: OK, game});
        const desiredMessageResponse = whenSocketSends({type: sentMessageType}).respondWith({type: responseMessageType});

        recursivelyCloseAndReopen();
        send({}, sentMessageType);

        expect(successfullyRecievedMessage).toBe(false);

        await rejoinGameResponse;

        expect(successfullyRecievedMessage).toBe(false);
        expect(setState).toHaveBeenCalledTimes(1);
        expect(setState).toHaveBeenCalledWith({
            cards: game.cards,
            clues: game.clues,
            gameStatus: game.gameStatus,
            currentTeam: game.currentTeam,
            actionsTaken: game.actionsTaken
        });

        await desiredMessageResponse;

        expect(successfullyRecievedMessage).toBe(true);
    });
});