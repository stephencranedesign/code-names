import React from 'react';
import {changeTeamTurn} from '../../state-management';
import {TeamTurnTracker} from '../Team-Turn-Tracker';
import {PromptRandomGuess} from '../Prompt-Random-Guess';
import {ClueTracker} from '../Clue-Tracker';
import {send} from '../../websocket-wrapper';
import {CHOOSE_CARD} from '../../constants/message-types';

const selectCard = (props, card) => async (e) => {
    if (props.activeTeam != props.roles.chosenTeam || props.roles.isCaptain) return;

    await send({gameId: props.gameId, card}, CHOOSE_CARD);
};

const getCardsClasses = (card) => {
    return `${displayCardColorForCaptain(card)} ${displayRevealed(card)}`.trim()
};
const displayCardColorForCaptain = (card) => card.color ? card.color.toLowerCase() : '';
const displayRevealed = (card) => card.revealed ? 'revealed' : '';
const toCard = (props) => (card, i) => (
    <li className={getCardsClasses(card)} onClick={selectCard(props, card)} key={card.word}>
        <span className='id'>{i+1}</span>
        {card.word}
    </li>
);

export const GameBoard = (props) => {
    const cards = props.cards.map(toCard(props));

    return (
        <React.Fragment>
            <TeamTurnTracker activeTeamTurn={props.activeTeam}/>
            <ClueTracker clues={props.clues} isCaptain={props.roles.isCaptain} gameId={props.gameId} team={props.roles.chosenTeam} />
            <PromptRandomGuess show={props.promptRandomGuess} gameId={props.gameId} />
            <div className='card-container'>
                <ul className='cards'>
                    {cards}
                </ul>
            </div>
        </React.Fragment>
    )
}