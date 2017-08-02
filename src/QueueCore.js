import EntryList from './EntryList'

/**
 * Checks if given url has been cancelled
 * @param {EntryList} loadingList
 * @param {string} url
 * @return {boolean}
 */
function isCanceled (loadingList, url) {
    return loadingList.has(url) === false
}

/**
 * Tries to merge success/error callbacks for existing entry
 * in given list. Returns true if merged. Used for multiple callback calls
 * for same entry
 *
 * @param {EntryList} list
 * @param {QueueEntry} entry
 * @return {boolean}
 */
function tryToMergeEntryInList(list, entry) {
    if (list.has(entry.url) === false) {
        return false
    }
    // Get the entry
    const loadingEntry = list.get(entry.url)

    // Pass new callbacks to the entry - will be triggered all requests
    loadingEntry.callbacks.error.push(entry.callbacks.error[0])
    loadingEntry.callbacks.success.push(entry.callbacks.success[0])

    // Copy the executing task
    entry.task = loadingEntry.task
    return true
}

/**
 * @callback TaskLoadSuccess
 * @param ...arguments List of arguments that is required to send
 */
/**
 * @callback TaskLoadError
 * @param {Error} errorMessage
 */
/**
 * Starts loading given entry with cancel support.
 *
 * @class LoadTask
 * @param {QueueEntry} entry
 * @param {TaskLoadSuccess} finish
 * @method cancel Optional cancel
 */
export default class QueueCore {
    /**
     * @param {LoadTask} LoadTaskClass
     * @param {Number} concurrentJobs
     * @param {Number|null|undefined} startTimeoutTime Defines if the start will use timeout function to throttle calls and give
     * time for start -> cancel (when user scrolls in list and etc). Set null to turn it off.
     */
    constructor (LoadTaskClass, concurrentJobs = 1, startTimeoutTime = undefined) {
        // Public
        this.concurrentJobs = concurrentJobs
        this.queue = new EntryList()
        this.loading = new EntryList()
        this.LoadTaskClass = LoadTaskClass
        /**
         * Custom callback when entry was loaded. Passes entry, and args (that are sent to success)
         * @type {function}
         */
        this.onEntrySuccess = null
        /**
         * Custom callback when entry was loaded wit failure. Passes an entry object and error
         * @type {function}
         */
        this.onEntryError = null
        /**
         * The start timeout time
         * @type {Number|null}
         */
        this.startTimeoutTime = typeof startTimeoutTime === 'undefined' ? 50 : startTimeoutTime
        /**
         * Add more time between starting queue - when canceling more items, the start can request multiple
         * items at once - when scrolling, item is added to list and then canceled.
         * @type {number|null}
         */
        this.startTimeout = null
    }

    /**
     * Adds given entry to queue
     * @param {QueueEntry} entry
     * @return {QueueCore}
     */
    add (entry) {
        // Check if the item is already loaded and append callbacks
        // in load list, if not loading, try to merge already existing
        // queue entry or add it to a queue
        if (tryToMergeEntryInList(this.loading, entry)) {
            return this
        } else if (tryToMergeEntryInList(this.queue, entry) === false) {
            this.queue.push(entry)
        }

        return this
    }

    /**
     * Starts the queue, returns true if the queue could start (when timeout is used) or if it started (timeout not used).
     * Uses setTimeout to prevent multiple calls.
     *
     * @return {boolean}
     */
    start () {
        // Check if the concurrent jobs limit has exceeded
        if (this.loading.length() >= this.concurrentJobs) {
            return false
        }

        // Clear last request for start
        if (this.startTimeout !== null) {
            clearTimeout(this.startTimeout)
        }

        // Timeout is turned off
        if (this.startTimeoutTime === null) {
            return this.forceStart()
        }

        // Start the request
        this.startTimeout = setTimeout(() => {
            let queueEmpty = false
            // Start enough items for concurrent jobs
            while (queueEmpty === false && this.loading.length() < this.concurrentJobs) {
                // If force start returns false, the queue is empty - stop
                queueEmpty = this.forceStart() === false
            }
        }, this.startTimeoutTime) // 50ms is enough to handle scroll start -> cancel transitions
    }

    /**
     * Forces start, returns true if entry has started
     *
     * @return {boolean}
     */
    forceStart () {
        // Pull the first entry from the list
        const entry = this.queue.shift()

        // If no item is returned, queue is empty
        if (entry === null) {
            return false
        }

        // Add the entry to load list
        this.loading.push(entry)

        // Get the url
        const url = entry.url

        // Start loading
        const LoadTaskClass = this.LoadTaskClass

        // Success callback accepts custom arguments that will be passed
        // to success callback
        entry.task = new LoadTaskClass(entry, (...args) => {
            // Check if the loading was not cancelled
            if (isCanceled(this.loading, url)) {
                return
            }

            // Pass success and pass it to caller
            entry.success(...args)

            // Remove it from loading list
            this.loading.remove(url)

            // Start next item
            this.start()

            // Custom callback on entry success
            if (this.onEntrySuccess !== null) {
                this.onEntrySuccess(entry, args)
            }
        }, (error) => {
            // Check if the loading was not cancelled
            if (isCanceled(this.loading, url)) {
                return
            }

            // Handle the error and pass it to caller
            entry.error(error)

            // Remove it from loading list
            this.loading.remove(url)

            // Start next item
            this.start()

            // Custom callback on entry error
            if (this.onEntryError !== null) {
                this.onEntryError(entry, error)
            }
        })
        return true
    }

    /**
     * Cancels given url and returns boolean if we can start the load
     * queue again
     *
     * @param url
     * @return {boolean}
     */
    cancel (url) {
        this.queue.remove(url)

        // If we are currently loading given image, discard
        // the load progress and start loading next image
        if (this.loading.has(url)) {
            // Get the entry and pull it from the loading list
            const entry = this.loading.pull(url)

            // Cancel the task if task is set and supports it
            if (entry.task !== null && typeof entry.task.cancel === 'function') {
                entry.task.cancel()
            }
            // We should restart queue
            return true
        }

        return false
    }
}
