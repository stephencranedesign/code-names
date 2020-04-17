const {execSync} = require('child_process');

console.log();
console.log('logging in...');
execSync('heroku container:login');
console.log('pushing container...');
execSync('heroku container:push web');
console.log('releasing container...');
execSync('heroku container:release web');
console.log('deploy successful!');