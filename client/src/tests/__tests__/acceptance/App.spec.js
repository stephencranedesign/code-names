import {whenSocketSends} from '../../mocks';
import {Home} from '../../../components/screens/Home';
import {GameBoard} from '../../../components/screens/Game-Board';
import {JoinGame} from '../../../components/screens/Join-Game';
import {renderAppInState} from '../../utils';

test('test initial render', async () => {
    const {wrapper} = renderAppInState({
        screen: 'join-game'
    });

    whenSocketSends({type: 'join-game'}).respondWith({type: 'ok', game: {
        roles: {},
        cards: [],
    }});

    await wrapper.find('.container .button').props().onClick();

    wrapper.update();
    expect(wrapper.childAt(0).childAt(0).is(JoinGame)).toBe(false);
});
