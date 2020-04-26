let isPinginServer = false;

function getUrl() {
    if (global.location.hostname === 'localhost') {
        return 'http://localhost:3001/ping';
    }

    return '/ping';
}

export const keepHerokuServerAwake = (url = getUrl()) => {
    if (isPinginServer) return;

    fetch(url);
    isPinginServer = true;

    setTimeout(() => {
        keepHerokuServerAwake(url);
    }, 50000);
};