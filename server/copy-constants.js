const fs = require('fs');

const colors = require('./constants/colors');
const gameStatuses = require('./constants/game-statuses');
const messageResponseTargets = require('./constants/message-response-targets');
const messageTypes = require('./constants/message-types');
const screens = require('./constants/screens');
const gameTypes = require('./constants/game-types');

const main = async () => {
    const obj = {colors, gameStatuses, messageResponseTargets, messageTypes, screens, gameTypes};

    await fs.writeFileSync('./src/constants.js', `module.exports = ${JSON.stringify(obj)}`);
}

main();