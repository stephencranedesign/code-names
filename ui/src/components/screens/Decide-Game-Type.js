import React from 'react';
import {WORDS, PICTURES} from '../../constants/game-types';
import {startGame} from '../../buttons';

export const DecideGameType = () => {
  return (
    <div className="container">
      <p>Choose Game Type:</p>
      <div>
        <button className='button' onClick={() => startGame(WORDS)}>Words</button>
        <button className='button' onClick={() => startGame(PICTURES)}>Pictures</button>
      </div>
    </div>
  )
}