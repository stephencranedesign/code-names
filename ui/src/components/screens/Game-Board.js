import React from 'react';
import {changeTeamTurn, setState as setAppState} from '../../state-management';
import {TeamTurnTracker} from '../Team-Turn-Tracker';
import {PromptRandomGuess} from '../Prompt-Random-Guess';
import {ClueTracker} from '../Clue-Tracker';
import {send} from '../../websocket-wrapper';
import {CHOOSE_CARD} from '../../constants/message-types';

const selectCard = (props, card) => async (e) => {
    const {activeTeam, roles, gameId, clues = []} = props;
    const latestClue = clues[clues.length - 1];

    if (!latestClue || latestClue.team !== activeTeam) return;
    if (activeTeam != roles.chosenTeam || roles.isCaptain) return;

    await send({gameId, card, actionsTaken: props.actionsTaken}, CHOOSE_CARD);
};

const getCardsClasses = (card) => {
    return `${displayCardColorForCaptain(card)} ${displayRevealed(card)} ${displayGameType(card)}`.trim()
};
const displayCardColorForCaptain = (card) => card.color ? card.color.toLowerCase() : '';
const displayRevealed = (card) => card.revealed ? 'revealed' : '';
const displayGameType = (card) => card.url ? 'picture' : 'word';
const toCard = (props) => (card, i) => {
    if (card.word) {
        return (
            <li className={getCardsClasses(card)} onClick={selectCard(props, card)} key={card.id}>
                <span className='id'>{i+1}</span>
                <span className='word'>{card.word}</span>
            </li>
        );
    }

    return (
        <li className={getCardsClasses(card)} onClick={selectCard(props, card)} key={card.id}>
            <span className='id'>{i+1}</span>
            <img className='img' src={card.url}/>
        </li>
    );
};

function renderLatestClue({clues}) {
    const [latestClue] = clues.slice(-1);

    if (latestClue) {
        return (
            <div className='latest-clue'>
                <span className={`square ${latestClue.team}`}></span>
                <span className='clue'>
                    <span className='word'>{latestClue.word}</span>
                    for
                    <span className='number'>{latestClue.number}</span>
                </span>
            </div>
        );
    }

    return (
        <div className='latest-clue'>
            <span>Sit tight .. no clues given.</span>
        </div>
    )
}

const renderGameInfo = (props) => {
    const [latestClue] = props.clues.slice(-1);

    return (
        <div className='game-info'>
            <div className='game-id'>
                <span>GameId: {props.gameId}</span>
            </div>

            {renderLatestClue(props)}

            <div className='team'>
                <span className='choosen-team'>Your Team:</span>
                <span className={`square ${props.roles.chosenTeam}`}></span>
            </div>
        </div>
    )
};

function toggleClueTracker({showClueTracker}) {
    setAppState({
        showClueTracker: !showClueTracker
    });
}

function renderToggleClueTracker(props) {
    return (
        <span className='clue-tracker-toggle' onClick={() => toggleClueTracker(props)}>
            <img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHMAAABkCAMAAACCTv/3AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRF////5ubmueBsSwAAAAJ0Uk5T/wDltzBKAAAAPklEQVR42uzYQQ0AAAgDseHfNC4IyVoD912WAACUm3uampqampqamq+aAAD+IVtTU1NTU1NT0z8EAFBsBRgAX+kR+Qam138AAAAASUVORK5CYII='/>
        </span>
    )
}

export const GameBoard = (props) => {
    const cards = props.cards.map(toCard(props));

    return (
        <React.Fragment>
            <TeamTurnTracker/>
            <ClueTracker clues={props.clues} gameId={props.gameId} roles={props.roles} activeTeam={props.activeTeam} />
            <div className='card-container'>
                {renderToggleClueTracker(props)}
                {renderGameInfo(props)}
                <PromptRandomGuess show={props.promptRandomGuess} gameId={props.gameId} />
                <ul className='cards'>
                    {cards}
                </ul>
            </div>
        </React.Fragment>
    )
}