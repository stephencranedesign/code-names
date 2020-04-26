import React from 'react';
import {JOIN_GAME, REJOIN_TEAM, OK, ERROR} from '../../constants/message-types';
import {DECIDING_ROLES, GAME_BOARD} from '../../constants/screens';
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

    async joinGameForFirstTime() {
        const response = await send({gameId: this.state.gameId}, JOIN_GAME);

        if (response.status === OK) {
            const {cards, currentTeam, roles, gameStatus, clues} = response.game;

            const newState = {
                clues,
                cards,
                currentTeam,
                screen: DECIDING_ROLES,
                roles,
                gameId: this.state.gameId
            };

            sessionStorage.setItem('game-id', this.state.gameId);
            setAppState(newState);
        } else if (response.status === ERROR) {
            this.setState({
                errorMessage: response.reason
            })
        }
    }

    async rejoinGame() {
        const {status, team, captain, game} = await send({gameId: this.state.gameId}, REJOIN_TEAM);

        if (status === OK) {
            const {cards, currentTeam, roles, gameStatus, clues, gameId} = game;
            const screen = gameStatus === DECIDING_ROLES ? DECIDING_ROLES : GAME_BOARD;

            roles.chosenTeam = team;
            roles.isCaptain = captain;

            const newState = {
                clues,
                cards,
                currentTeam,
                screen,
                roles,
                gameId
            };

            setAppState(newState);

            return;
        }

        this.joinGameForFirstTime();
    }

    async joinGame() {
        const clientId = sessionStorage.getItem('client-id');

        clientId? this.rejoinGame() : this.joinGameForFirstTime();
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