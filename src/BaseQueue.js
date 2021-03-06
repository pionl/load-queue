import QueueEntry from './QueueEntry'
import QueueCore from './QueueCore'

export default class BaseQueue {
    /**
     * @param LoadTaskClass
     * @param concurrentJobs
     * @param startTimeoutTime Defines if the start will use timeout function to throttle calls and give
     * time for start -> cancel (when user scrolls in list and etc). Set null to turn it off.
     */
    constructor (LoadTaskClass, concurrentJobs = 1, startTimeoutTime = undefined) {
        this.core = new QueueCore(LoadTaskClass, concurrentJobs, startTimeoutTime)
    }

    /**
     * Adds an url to queue
     * @param {string} url
     * @param {LoadSuccess} success
     * @param {LoadError} error
     *
     * @return {QueueEntry}
     */
    add = (url, success, error) => {
        // Build the entry
        const entry = new QueueEntry(url, success, error, this)

        // Add it to queue and start loading if can
        this.core.add(entry).start()
        return entry
    }

    /**
     * Cancels a load request for given queue entry or an image URL
     * @param {QueueEntry|string} entry
     */
    cancel = (entry) => {
        let url = entry

        // Support cancel via entry
        if (entry instanceof QueueEntry) {
            url = entry.url
        }

        // Cancel given url and check if we can restart the queue
        if (this.core.cancel(url)) {
            this.core.start()
        }
    }
}