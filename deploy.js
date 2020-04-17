const {execSync} = require('child_process');

execSync('heroku container:login');
execSync('heroku container:push web');
execSync('heroku container:release web');