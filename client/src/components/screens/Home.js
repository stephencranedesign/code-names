import React from 'react';
import logo from './logo.svg';
import './Home.css';
import {startGame, joinGame} from '../../buttons';

export const Home = () => {
  return (
    <div className="container">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Welcome to Code Names!
      </p>
      <div>
        <button className='button' onClick={startGame}>Start Game</button>
        <button className='button' onClick={joinGame}>Join Game</button>
      </div>
    </div>
  )
}