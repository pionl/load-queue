import BaseQueue from './BaseQueue'

/**
 * Builds the queue for public use
 * @param {LoadTask} LoadTaskClass
 * @param {Number} concurrentJobs
 * @constructor
 */
function Queue (LoadTaskClass, concurrentJobs = 1) {
    // Private properties
    const queue = new BaseQueue(LoadTaskClass, concurrentJobs)

    /**
     * Adds an url to queue
     * @param {string} url
     * @param {LoadSuccess} success
     * @param {LoadError} error
     *
     * @return {QueueEntry}
     */
    this.add = queue.add

    /**
     * Cancels a load request for given queue entry or an image URL
     * @param {QueueEntry|string} entry
     */
    this.cancel = queue.cancel
}
export default Queue
