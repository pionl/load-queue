/**
 * @callback LoadSuccess
 * @param {string} url
 * @param ...other Other properties based on the load task
 */
/**
 * @callback LoadError
 * @param {string} url
 * @param {Error} errorMessage
 */

/**
 * @param {Array} callbacks
 * @param {function} func Function that will receive callback
 */
function runCallbacks(callbacks, func) {
    for (let i = 0; i < callbacks.length; i++) {
        const callback = callbacks[i]
        func(callback)
    }
}

/**
 * Holds the url entry with success/error
 * @param {string} url
 * @param {LoadSuccess} success
 * @param {LoadError} error
 * @param {BaseQueue} queue
 * @constructor
 */
function QueueEntry (url, success, error, queue) {
    // A list of callbacks that will be called. Supports multiple callbacks.
    this.callbacks = {
        success: [
            success
        ],
        error: [
            error
        ]
    }
    /**
     * @type {string}
     */
    this.url = url
    /**
     * Passes all the arguments to LoadSuccess
     * @type {function}
     */
    this.success = (...args) => {
        runCallbacks(this.callbacks.success, (callback) => {
            callback(url, ...args)
        })
    }
    /**
     * @type {function}
     * @param {Error} errorObject
     */
    this.error = (errorObject) => {
        runCallbacks(this.callbacks.success, (callback) => {
            callback(url, errorObject)
        })
    }

    /**
     * Cancels loading - removes the image
     */
    this.cancel = () => {
        queue.cancel(this)
    }

    /**
     * @type {LoadTask|null}
     */
    this.task = null
}

export default QueueEntry
