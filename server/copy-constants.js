const fs = require('fs');

const colors = require('./constants/colors');
const gameStatuses = require('./constants/game-statuses');
const messageResponseTargets = require('./constants/message-response-targets');
const messageTypes = require('./constants/message-types');
const screens = require('./constants/screens');

const main = async () => {
    const obj = {colors, gameStatuses, messageResponseTargets, messageTypes, screens, yo: ''};

    await fs.writeFileSync('./src/constants.js', `module.exports = ${JSON.stringify(obj)}`);

    console.log('done!');
}

main();