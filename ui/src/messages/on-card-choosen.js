import {setState, getCards, getRoles} from '../state-management';

const revealCard = (revealedCard) => (card) => {
    if (card.id === revealedCard.id) {
        return {
            ...card,
            color: revealedCard.color,
            revealed: true
        }
    }

    return card;
};

export const onCardChoosen = ({revealedCard, currentTeam, promptRandomGuess, actionsTaken}) => {
    const cards = getCards().map(revealCard(revealedCard));
    const roles = getRoles();
    
    setState({
        cards,
        activeTeam: currentTeam,
        actionsTaken,
        promptRandomGuess: promptRandomGuess && currentTeam === roles.chosenTeam && !roles.isCaptain
    });
};