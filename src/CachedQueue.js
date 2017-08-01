import BaseQueue from './BaseQueue'
import QueueEntry from './QueueEntry'

/**
 * Builds the queue that will cache all success entries - this will ensure
 * that cached loads are instant - skips the queue
 *
 * @param {LoadTask} LoadTaskClass
 * @param {Number} concurrentJobs
 * @param {Number|null|undefined} startTimeoutTime Defines if the start will use timeout function to throttle calls and give
 * time for start -> cancel (when user scrolls in list and etc). Set null to turn it off.
 * @constructor
 */
function CachedQueue (LoadTaskClass, concurrentJobs = 1, startTimeoutTime = undefined) {
    // Private properties
    const queue = new BaseQueue(LoadTaskClass, concurrentJobs, startTimeoutTime)

    // A list of url that where success
    const cachedSuccess = {}

    /**
     * Stores entry arguments under url for cached call
     * @param entry
     * @param args
     */
    queue.core.onEntrySuccess = (entry, args) => {
        cachedSuccess[entry.url] = args
    }

    /**
     * Adds an url to queue
     * @param {string} url
     * @param {LoadSuccess} success
     * @param {LoadError} error
     *
     * @return {QueueEntry}
     */
    this.add = (url, success, error) => {
        // Check if we have cached arguments for success
        // if not add the load into queue
        const cachedArgs = cachedSuccess[url]
        if (typeof cachedArgs === 'undefined') {
            return queue.add(url, success, error)
        }

        // Call the success callback with cached arguments
        const entry = new QueueEntry(url, success, error, queue)
        entry.success(cachedArgs)
        return entry
    }

    /**
     * Cancels a load request for given queue entry or an image URL
     * @param {QueueEntry|string} entry
     */
    this.cancel = (entry) => {
        queue.cancel(entry)
    }
}
export default CachedQueue
