import React from 'react';
import {changeTeamTurn} from '../../state-management';
import {TeamTurnTracker} from '../Team-Turn-Tracker';

const selectCard = (props) => () => {
    if (!props.activeTeam === props.roles.chosenTeam) return;

    // do socket stuff.
    changeTeamTurn()
};

const displayCardColorForCaptain = (card) => card.color ? card.color.toLowerCase() : '';
const toCard = (props) => (card, i) => (
    <li className={displayCardColorForCaptain(card)} onClick={selectCard(props)} key={card.word}>
        <span className='id'>{i+1}</span>
        {card.word}
    </li>
);

export const GameBoard = (props) => {
    const cards = props.cards.map(toCard(props));

    return (
        <React.Fragment>
            <TeamTurnTracker activeTeamTurn={props.activeTeam}/>
            <div className='container'>
                <ul className='cards'>
                    {cards}
                </ul>
            </div>
        </React.Fragment>
    )
}