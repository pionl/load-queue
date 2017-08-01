import BaseQueue from './BaseQueue'

/**
 * Builds the queue for public use
 * @param {LoadTask} LoadTaskClass
 * @param {Number} concurrentJobs
 * @param {Number|null|undefined} startTimeoutTime Defines if the start will use timeout function to throttle calls and give
 * time for start -> cancel (when user scrolls in list and etc). Set null to turn it off.
 *
 * @constructor
 */
function Queue (LoadTaskClass, concurrentJobs = 1, startTimeoutTime = undefined) {
    // Private properties
    const queue = new BaseQueue(LoadTaskClass, concurrentJobs, startTimeoutTime)

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
