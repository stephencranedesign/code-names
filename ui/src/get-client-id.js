const CLIENT_ID = 'client-id';

export const getClientId = () => {
    let key = sessionStorage.getItem(CLIENT_ID);

    if (!key) {
        key = `${Math.round(Math.random() * 100000)}_${Math.round(Math.random() * 100000)}_${Math.round(Math.random() * 100000)}`;
        sessionStorage.setItem(CLIENT_ID, key);
    }

    return key;
};