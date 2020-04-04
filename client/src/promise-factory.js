const storedPromises = {};

export const storePromise = (id, promise) => storedPromises[id] = promise;
export const getPromise = id => storedPromises[id];

export const promiseFactory = () => {
    let resolve, reject;

    const promise = new Promise((resolver, rejector) => {
        resolve = resolver;
        reject = rejector;
    });

    return {
        promise,
        resolve,
        reject
    }
};