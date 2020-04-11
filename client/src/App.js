import React from 'react';
import { Home } from './components/screens/Home';
import { GameBoard } from './components/screens/Game-Board';
import { set, storeState, getDefaultState } from './state-management';
import { JoinGame } from './components/screens/Join-Game';
import { DecidingRoles } from './components/screens/Deciding-Roles';
import { HOME, DECIDING_ROLES, GAME_BOARD, JOIN_GAME } from './constants/screens';
import { RED } from './constants/colors';
import {listen} from './websocket-actions';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = getDefaultState();

    set(this.state, this.setState.bind(this));
    listen();
  }

  getComponentForScreen() {
    switch (this.state.screen) {
      case JOIN_GAME:
        return <JoinGame />
      case DECIDING_ROLES:
        return <DecidingRoles roles={this.state.roles} gameId={this.state.gameId} />
      case GAME_BOARD:
        return <GameBoard cards={this.state.cards} activeTeam={this.state.activeTeam} roles={this.state.roles} clues={this.state.clues} gameId={this.state.gameId} />
      default:
        return <Home />;
    }
  }

  render() {
    const {chosenTeam, isCaptain} = this.state.roles;
    const captain = isCaptain ? 'captain' : '';

    storeState(this.state);

    return (
      <div className={`app choosen-team-${chosenTeam} ${this.state.activeTeam}-active ${captain}`}>
        {this.getComponentForScreen()}
      </div>
    );
  }
}

export default App;
