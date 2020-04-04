const express = require('express');
const app = express();
const http = require('http').createServer(app);
const {CREATE_GAME, OK, JOIN_GAME, ERROR, JOIN_TEAM, SUBMIT_CLUE} = require('../../client/src/constants/message-types');
const {getGameForNormalPlayer, getGame} = require('./db');
const {onCreateGame, onJoinGame, onJoinTeam, onSubmitClue} = require('./message-handlers');

const {create} = require('./websocket-wrapper');

const PORT = 3001;

create((message, senders) => {
    if (message.type === CREATE_GAME) {
        onCreateGame(message, senders);
    } else if (message.type === JOIN_GAME) {
        onJoinGame(message, senders);
    } else if (message.type === JOIN_TEAM) {
        onJoinTeam(message, senders);
    } else if (message.type === SUBMIT_CLUE) {
        onSubmitClue(message, senders);
    }
});

http.listen(PORT, function(){
    console.log(`listening on *:${PORT}`);
});