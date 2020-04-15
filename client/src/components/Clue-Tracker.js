import React from 'react';
import {SUBMIT_CLUE} from '../constants/message-types';
import {send} from '../websocket-wrapper';

function toClue(clue) {
    return (
        <li key={clue.word}>
            {clue.team.toUpperCase()}: {clue.word} for {clue.number}
        </li>
    )
}

const DEFAULT_STATE = {
    wordForClue: '',
    numberForClue: '',
    error: ''
}

export class ClueTracker extends React.Component {
    constructor(props) {
        super(props);

        this.onChangeWord = this.getOnChange('wordForClue').bind(this);
        this.onChangeNumber = this.getOnChange('numberForClue').bind(this);
        this.submitClue = this.submitClue.bind(this);

        this.state = {...DEFAULT_STATE};
    }

    getOnChange(prop) {
        return function(e) {
            this.setState({
                [prop]: e.target.value
            })
        }
    }

    renderError() {
        if (this.state.error) {
            return <p>{this.state.error}</p>
        }
    }
    
    submitClue() {
        const {wordForClue, numberForClue} = this.state;

        const isWordValid = /^[a-zA-z]+$/.test(wordForClue);
        const isNumberValid = /^[1-8]$/.test(numberForClue);

        if (!isWordValid) {
            this.setState({
                error: 'Clue must be only one word with no special characters in it'
            });
        } else if (!isNumberValid) {
            this.setState({
                error: 'Clue number must be a valid number between 1 & 8'
            });
        } else {
            const clue = {
                word: wordForClue,
                number: numberForClue,
                team: this.props.team
            };
            const payload = {clue, gameId: this.props.gameId};

            send(payload, SUBMIT_CLUE);
            this.setState({...DEFAULT_STATE});
        }
    }

    renderSumbitClue() {
        if (this.props.isCaptain) {
            return (
                <div className='submit-clue'>
                    {this.renderError()}
                    <input type='text' value={this.state.wordForClue} onChange={this.onChangeWord} placeholder='Enter a single word clue' />
                    <input type='text' value={this.state.numberForClue} onChange={this.onChangeNumber} placeholder='How many cards does your clue reference?'/>
                    <button onClick={this.submitClue}>Submit Clue</button>
                </div>
            );
        }
    }

    render() {
        const clues = this.props.clues.map(toClue);

        return (
            <div className='clue-tracker'>
                Clues:
                <ul className='clues'>
                    {clues}
                </ul>
                {this.renderSumbitClue(this.props)}
            </div>
        );
    }
};