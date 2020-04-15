import React from 'react';
import {send} from '../websocket-wrapper';
import {PROMPT_RANDOM_GUESS_ANSWER} from '../constants/message-types';

function takeRandomGuess({gameId}, takeGuess) {
    send({takeGuess, gameId}, PROMPT_RANDOM_GUESS_ANSWER);
}

export const PromptRandomGuess = (props) => {
    if (props.show) {
        return (
            <div className='random-guess'>
                <p>You correctly guessed the number of cards your clue was for. Would you like to take a random guess?</p>
                <button onClick={() => takeRandomGuess(props, true)}>Yes</button>
                <button onClick={() => takeRandomGuess(props, false)}>No</button>
            </div>
        );
    }

    return null;
};