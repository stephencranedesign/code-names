const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const cors = require('cors');

const {CREATE_GAME, OK, JOIN_GAME, ERROR, JOIN_TEAM, SUBMIT_CLUE, CHOOSE_CARD, PROMPT_RANDOM_GUESS_ANSWER, REJOIN_TEAM, SYNC_GAME} = require('./constants').messageTypes;
const {getGameForNormalPlayer, getGame} = require('./db');
const {onCreateGame, onJoinGame, onJoinTeam, onSubmitClue, onChooseCard, onPromptRandomGuess, onRejoinTeam, onSyncGame} = require('./message-handlers');

const {create} = require('./websocket-wrapper');
const PORT = process.env.PORT || 3001;

let websocket;

function start() {
    server.listen(PORT, function(){
        console.log(`listening on *:${PORT}`);
    });
    
    websocket = create(server, (message, senders) => {
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
        } else if(message.type === REJOIN_TEAM) {
            onRejoinTeam(message, senders);
        } else if(message.type === SYNC_GAME) {
            onSyncGame(message, senders);
        } else {
            console.log('no type for message: ', message);
        }
    });

    const buildPath = path.join(__dirname, '..', 'build');
    const staticPath = path.join(__dirname, '..', 'build', 'static');

    app.use(express.static(buildPath));
    app.use('/static', express.static(staticPath));

    app.get('/ping', cors(), (req, res) => {
        res.send('pong');
    });
}

function stop() {
    server.close();
    websocket.close();
}

module.exports = {start, stop};