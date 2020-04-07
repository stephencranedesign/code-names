function promiseGenerator() {
    let resolve, reject;

    const promise = new Promise((resolver, rejector) => {resolve = resolver, reject = rejector});

    return {
        promise,
        resolve,
        reject
    }
}

module.exports = {promiseGenerator};