import React from 'react';
import logo from './logo.svg';
import './Home.css';
import {setState} from '../../state-management';
import {send} from '../../websocket-wrapper';
import {CREATE_GAME} from '../../constants/message-types';
import {DECIDING_ROLES, JOIN_GAME} from '../../constants/screens';

const startGame = async () => {
  const gameId = Math.round(Math.random() * 1000);
  await send({gameId}, CREATE_GAME);

  setState({screen: DECIDING_ROLES, gameId});
};

const joinGame = async () => {
  setState({screen: JOIN_GAME});
};

export const Home = () => {
  return (
    <div className="container">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Welcome to code names
      </p>
      <div>
        <button className='button' onClick={startGame}>Start Game</button>
        <button className='button' onClick={joinGame}>Join Game</button>
      </div>
    </div>
  )
}