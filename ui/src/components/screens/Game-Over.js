import React from 'react';
import logo from './logo.svg';
import './Home.css';
import {decideGameType, joinGame} from '../../buttons';

export const GameOver = (props) => {
    return (
        <div className="container game-over">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
                Team {props.winner} won!!!
            </p>
            <div>
                <button className='button' onClick={decideGameType}>Start New Game</button>
                <button className='button' onClick={joinGame}>Join Game</button>
            </div>
        </div>
    )
}