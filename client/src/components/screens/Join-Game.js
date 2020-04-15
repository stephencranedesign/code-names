import React from 'react';
import {JOIN_GAME, OK, ERROR} from '../../constants/message-types';
import {DECIDING_ROLES} from '../../constants/screens';
import {setState as setAppState} from '../../state-management';
import {send} from '../../websocket-wrapper';

export class JoinGame extends React.Component {
    constructor(props) {
        super(props);

        this.updateValue = this.updateValue.bind(this);
        this.joinGame = this.joinGame.bind(this);

        this.state = {
            gameId: '',
            errorMessage: null
        };
    }

    updateValue(e) {
        this.setState({gameId: e.target.value});
    }

    async joinGame() {
        const response = await send({gameId: this.state.gameId}, JOIN_GAME);

        if (response.type === OK) {
            const {cards, currentTeam, roles, gameStatus, clues} = response.game;

            const newState = {
                clues,
                cards,
                currentTeam,
                screen: DECIDING_ROLES,
                roles,
                gameId: this.state.gameId
            };

            setAppState(newState);
        } else if (response.type === ERROR) {
            this.setState({
                errorMessage: response.reason
            })
        }
    }

    renderError() {
        if (this.state.errorMessage) {
            return <p>{this.state.errorMessage}</p>;
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className='container'>
                    <div>
                        {this.renderError()}
                        <input type='text' placeholder='GameId' value={this.state.gameId} onChange={this.updateValue} />
                        <button className='button' onClick={this.joinGame}>Join Game</button>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}