import React from 'react';
import {setState as setAppState} from '../../state-management';
import {GAME_BOARD} from '../../constants/screens';
import {GAME} from '../../constants/message-response-targets';
import {JOIN_TEAM, ERROR, OK} from '../../constants/message-types';
import {PLAYING, DECIDING_ROLES} from '../../constants/game-statuses';
import {BLUE, RED} from '../../constants/colors';
import {send} from '../../websocket-wrapper';

export class DecidingRoles extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            roleChoosen: false,
            errorMessage: null
        };
    }

    renderErrorMessage() {
        if (this.state.errorMessage) {
            return <p>{this.state.errorMessage}</p>;
        }
    }

    async chooseRole(team, captain) {
        const payload = {
            gameId: this.props.gameId,
            team,
            captain
        };

        const response = await send(payload, JOIN_TEAM);

        if (response.type === ERROR) {
            this.setState({
                errorMessage: response.reason
            })
        } else {
            const {roles, gameStatus, cards, currentTeam, captainCards} = response.game;
            const screen = gameStatus === PLAYING ? GAME_BOARD : DECIDING_ROLES;
            const cardsToUse = captainCards ? captainCards : cards;

            roles.chosenTeam = team;
            roles.isCaptain = captain;

            this.setState({
                roleChoosen: true
            });

            setAppState({
                screen,
                gameStatus,
                roles,
                cards: cardsToUse,
                currentTeam
            });
        }
    }

    renderSitTight() {
        return (
            <React.Fragment>
                <p>{'Sit Tight and wait for the game to start'}</p>
            </React.Fragment>
        )
    }

    renderPickRole() {
        return (
            <React.Fragment>
                {this.renderErrorMessage()}
                {!this.props.roles.redTeamCaptainClaimed && <button className='button' onClick={() => this.chooseRole(RED, true)}>Join Red Team as Captain</button>}
                {!this.props.roles.blueTeamCaptainClaimed && <button className='button' onClick={() => this.chooseRole(BLUE, true)}>Join Blue Team as Captain</button>}
                <button className='button' onClick={() => this.chooseRole(RED)}>Join Red Team</button>
                <button className='button' onClick={() => this.chooseRole(BLUE)}>Join Blue Team</button>
            </React.Fragment>
        )
    }

    render() {
        const content = this.state.roleChoosen ? this.renderSitTight() : this.renderPickRole();

        return (
            <React.Fragment>
                <div className='container'>
                    <h2>Game Id: {this.props.gameId}</h2>
                    {content}
                </div>
            </React.Fragment>
        )
    }
};