import React from 'react';
import { Home } from './components/screens/Home';
import { GameBoard } from './components/screens/Game-Board';
import { set, storeState, getDefaultState } from './state-management';
import { JoinGame } from './components/screens/Join-Game';
import { DecidingRoles } from './components/screens/Deciding-Roles';
import { GameOver } from './components/screens/Game-Over';
import {DecideGameType} from './components/screens/Decide-Game-Type';
import { HOME, DECIDING_ROLES, GAME_BOARD, JOIN_GAME, GAME_OVER, DECIDING_GAME_TYPE } from './constants/screens';
import { RED } from './constants/colors';
import './App.css';
import {listen} from './websocket-actions';
import { keepHerokuServerAwake } from './keep-heroku-server-awake';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = getDefaultState();

    set(this.state, this.setState.bind(this));
    keepHerokuServerAwake();
    listen();
  }

  getComponentForScreen() {
    switch (this.state.screen) {
      case JOIN_GAME:
        return <JoinGame />
      case DECIDING_ROLES:
        return <DecidingRoles roles={this.state.roles} gameId={this.state.gameId} />
      case GAME_BOARD:
        return <GameBoard cards={this.state.cards} activeTeam={this.state.activeTeam} roles={this.state.roles} clues={this.state.clues} actionsTaken={this.state.actionsTaken} gameId={this.state.gameId} promptRandomGuess={this.state.promptRandomGuess} />
      case GAME_OVER:
        return <GameOver winner={this.state.winner} />
      case DECIDING_GAME_TYPE:
        return <DecideGameType />
      default:
        return <Home />;
    }
  }

  renderClasses() {
    const classes = ['app'];
    const {activeTeam, roles, screen} = this.state;
    const {chosenTeam, isCaptain} = roles;

    classes.push(screen);
    if (chosenTeam) classes.push(`choosen-team-${chosenTeam}`);
    if (activeTeam) classes.push(`${activeTeam}-active`);
    if (isCaptain) classes.push('captain');

    return classes.join(' ');
  }

  render() {
    storeState(this.state);

    return (
      <div className={this.renderClasses()}>
        {this.getComponentForScreen()}
      </div>
    );
  }
}

export default App;
