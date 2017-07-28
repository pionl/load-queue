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
     */
    constructor (LoadTaskClass, concurrentJobs = 1) {
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
    }

    /**
     * Adds given entry to queue
     * @param {QueueEntry} entry
     * @return {QueueCore}
     */
    add (entry) {
        // Check if the item is already loaded and just replace the value
        // in load list (to use new callbacks), or use queue
        if (this.loading.has(entry.url)) {
            this.loading.push(entry)
        } else {
            this.queue.push(entry)
        }

        return this
    }

    /**
     * Starts the queue, returns true if entry has started
     * @return {boolean}
     */
    start () {
        // Check if the concurrent jobs limit has exceeded
        if (this.loading.length() >= this.concurrentJobs) {
            return false
        }

        this.forceStart()
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
