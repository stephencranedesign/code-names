import React from 'react';
import {changeTeamTurn} from '../../state-management';
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

const renderGameInfo = (props) => {
    return (
        <div className='game-info'>
            <span className='game-id'>GameId: {props.gameId}</span>
            <span className='choosen-team'>Your Team:</span>
            <span className={`square ${props.roles.chosenTeam}`}></span>
        </div>
    )
};

export const GameBoard = (props) => {
    const cards = props.cards.map(toCard(props));

    return (
        <React.Fragment>
            <TeamTurnTracker/>
            <ClueTracker clues={props.clues} gameId={props.gameId} roles={props.roles} activeTeam={props.activeTeam} />
            <div className='card-container'>
                {renderGameInfo(props)}
                <PromptRandomGuess show={props.promptRandomGuess} gameId={props.gameId} />
                <ul className='cards'>
                    {cards}
                </ul>
            </div>
        </React.Fragment>
    )
}