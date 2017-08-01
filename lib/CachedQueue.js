'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _BaseQueue = require('./BaseQueue');

var _BaseQueue2 = _interopRequireDefault(_BaseQueue);

var _QueueEntry = require('./QueueEntry');

var _QueueEntry2 = _interopRequireDefault(_QueueEntry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function CachedQueue(LoadTaskClass) {
    var concurrentJobs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var startTimeoutTime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

    // Private properties
    var queue = new _BaseQueue2.default(LoadTaskClass, concurrentJobs, startTimeoutTime);

    // A list of url that where success
    var cachedSuccess = {};

    /**
     * Stores entry arguments under url for cached call
     * @param entry
     * @param args
     */
    queue.core.onEntrySuccess = function (entry, args) {
        cachedSuccess[entry.url] = args;
    };

    /**
     * Adds an url to queue
     * @param {string} url
     * @param {LoadSuccess} success
     * @param {LoadError} error
     *
     * @return {QueueEntry}
     */
    this.add = function (url, success, error) {
        // Check if we have cached arguments for success
        // if not add the load into queue
        var cachedArgs = cachedSuccess[url];
        if (typeof cachedArgs === 'undefined') {
            return queue.add(url, success, error);
        }

        // Call the success callback with cached arguments
        var entry = new _QueueEntry2.default(url, success, error, queue);
        entry.success(cachedArgs);
        return entry;
    };

    /**
     * Cancels a load request for given queue entry or an image URL
     * @param {QueueEntry|string} entry
     */
    this.cancel = function (entry) {
        queue.cancel(entry);
    };
}
exports.default = CachedQueue;