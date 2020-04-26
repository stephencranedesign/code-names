import React from 'react';
import {SUBMIT_CLUE} from '../constants/message-types';
import {send} from '../websocket-wrapper';

function toClue(clue, i) {
    return (
        <li key={clue.word + i}>
            <span className={`square ${clue.team}`}></span>
            <span className='clue'>{clue.word} for {clue.number}</span>
        </li>
    )
}

const DEFAULT_STATE = {
    wordForClue: '',
    numberForClue: '',
    clueSubmitted: false,
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
                [prop]: e.target.value.trim()
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
                team: this.props.roles.chosenTeam
            };
            const payload = {clue, gameId: this.props.gameId};

            send(payload, SUBMIT_CLUE);
            this.setState({
                ...DEFAULT_STATE,
                team: this.props.roles.chosenTeam,
                clueSubmitted: true
            });
        }
    }

    getLastClue() {
        const [clue] = this.props.clues.slice(-1);

        return clue;
    }

    renderSumbitClue() {
        const clue = this.getLastClue();
        const hasSubmittedClue = clue && clue.team == this.props.activeTeam;
        const teamCaptain = this.props.roles.isCaptain && this.props.roles.chosenTeam === this.props.activeTeam;

        if (teamCaptain && !hasSubmittedClue) {
            return (
                <div className='submit-clue'>
                    {this.renderError()}
                    <input type='text' value={this.state.wordForClue} onChange={this.onChangeWord} placeholder='Enter a single word clue' />
                    <input type='text' value={this.state.numberForClue} onChange={this.onChangeNumber} placeholder='How many cards does your clue reference?'/>
                    <button className='button' onClick={this.submitClue}>Submit Clue</button>
                </div>
            );
        }
    }

    renderClues() {
        if (this.props.clues.length === 0) {
            return <li>{'no clues given.. wait for a clue.'}</li>
        }

        return this.props.clues.map(toClue);
    }

    render() {
        return (
            <div className='clue-tracker'>
                Clues:
                <div className='clues'>
                    <ul>
                        {this.renderClues()}
                    </ul>
                </div>
                {this.renderSumbitClue(this.props)}
            </div>
        );
    }
};