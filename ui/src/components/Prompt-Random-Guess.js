import React from 'react';
import {send} from '../websocket-wrapper';
import {PROMPT_RANDOM_GUESS_ANSWER} from '../constants/message-types';
import {setState} from '../state-management';

function takeRandomGuess({gameId}, takeGuess) {
    send({takeGuess, gameId}, PROMPT_RANDOM_GUESS_ANSWER);
    
    if (takeGuess) {
        setState({promptRandomGuess: false});
    }
}

export const PromptRandomGuess = (props) => {
    if (props.show) {
        return (
            <div className='random-guess'>
                <p>You correctly guessed the number of cards for the clue. Would you like to take a random guess?</p>
                <button className='button' onClick={() => takeRandomGuess(props, true)}>Yes</button>
                <button className='button' onClick={() => takeRandomGuess(props, false)}>No</button>
            </div>
        );
    }

    return null;
};