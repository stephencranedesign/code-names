function getUrl() {
    if (global.location.hostname === 'localhost') {
        return 'http://localhost:3001/ping';
    }

    return '/ping';
}

export const pingServer = (url = getUrl()) => {
    console.log('pinging server');
    fetch(url);

    setTimeout(() => {
        pingServer(url);
    }, 50000);
};