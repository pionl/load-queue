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
 *
 * @param {string} url
 * @param {LoadSuccess} success
 * @param {LoadError} error
 * @param {BaseQueue} queue
 * @constructor
 */
function QueueEntry (url, success, error, queue) {
    /**
     * @type {string}
     */
    this.url = url
    /**
     * Passes all the arguments to LoadSuccess
     * @type {function}
     */
    this.success = (...args) => {
        success(url, ...args)
    }
    /**
     * @type {function}
     * @param {Error} errorObject
     */
    this.error = (errorObject) => {
        error(url, errorObject)
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
