const express = require('express');
const app = express();
const http = require('http').createServer(app);
const {CREATE_GAME, OK, JOIN_GAME, ERROR, JOIN_TEAM, SUBMIT_CLUE, CHOOSE_CARD, PROMPT_RANDOM_GUESS_ANSWER} = require('../../client/src/constants/message-types');
const {getGameForNormalPlayer, getGame} = require('./db');
const {onCreateGame, onJoinGame, onJoinTeam, onSubmitClue, onChooseCard, onPromptRandomGuess} = require('./message-handlers');

const {create} = require('./websocket-wrapper');
const PORT = 3001;

let websocket;

function start() {
    websocket = create((message, senders) => {
        if (message.type === CREATE_GAME) {
            onCreateGame(message, senders);
        } else if (message.type === JOIN_GAME) {
            onJoinGame(message, senders);
        } else if (message.type === JOIN_TEAM) {
            onJoinTeam(message, senders);
        } else if (message.type === SUBMIT_CLUE) {
            onSubmitClue(message, senders);
        } else if (message.type === CHOOSE_CARD) {
            onChooseCard(message, senders);
        } else if(message.type === PROMPT_RANDOM_GUESS_ANSWER) {
            onPromptRandomGuess(message, senders);
        } else {
            console.log('no type for message: ', message);
        }
    });
    
    http.listen(PORT, function(){
        console.log(`listening on *:${PORT}`);
    });
}

function stop() {
    http.close();
    websocket.close();
}

module.exports = {start, stop};