import React from 'react';

export const GameOver = (props) => {
    return (
        <div className='game-over'>
            <p>Team {props.winner} won</p>
        </div>
    )
}