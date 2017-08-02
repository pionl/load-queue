'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _EntryList = require('./EntryList');

var _EntryList2 = _interopRequireDefault(_EntryList);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Checks if given url has been cancelled
 * @param {EntryList} loadingList
 * @param {string} url
 * @return {boolean}
 */
function isCanceled(loadingList, url) {
    return loadingList.has(url) === false;
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
        return false;
    }
    // Get the entry
    var loadingEntry = list.get(entry.url);

    // Pass new callbacks to the entry - will be triggered all requests
    loadingEntry.callbacks.error.push(entry.callbacks.error[0]);
    loadingEntry.callbacks.success.push(entry.callbacks.success[0]);

    // Copy the executing task
    entry.task = loadingEntry.task;
    return true;
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

var QueueCore = function () {
    /**
     * @param {LoadTask} LoadTaskClass
     * @param {Number} concurrentJobs
     * @param {Number|null|undefined} startTimeoutTime Defines if the start will use timeout function to throttle calls and give
     * time for start -> cancel (when user scrolls in list and etc). Set null to turn it off.
     */
    function QueueCore(LoadTaskClass) {
        var concurrentJobs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        var startTimeoutTime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

        _classCallCheck(this, QueueCore);

        // Public
        this.concurrentJobs = concurrentJobs;
        this.queue = new _EntryList2.default();
        this.loading = new _EntryList2.default();
        this.LoadTaskClass = LoadTaskClass;
        /**
         * Custom callback when entry was loaded. Passes entry, and args (that are sent to success)
         * @type {function}
         */
        this.onEntrySuccess = null;
        /**
         * Custom callback when entry was loaded wit failure. Passes an entry object and error
         * @type {function}
         */
        this.onEntryError = null;
        /**
         * The start timeout time
         * @type {Number|null}
         */
        this.startTimeoutTime = typeof startTimeoutTime === 'undefined' ? 50 : startTimeoutTime;
        /**
         * Add more time between starting queue - when canceling more items, the start can request multiple
         * items at once - when scrolling, item is added to list and then canceled.
         * @type {number|null}
         */
        this.startTimeout = null;
    }

    /**
     * Adds given entry to queue
     * @param {QueueEntry} entry
     * @return {QueueCore}
     */


    _createClass(QueueCore, [{
        key: 'add',
        value: function add(entry) {
            // Check if the item is already loaded and append callbacks
            // in load list, if not loading, try to merge already existing
            // queue entry or add it to a queue
            if (tryToMergeEntryInList(this.loading, entry)) {
                return this;
            } else if (tryToMergeEntryInList(this.queue, entry) === false) {
                this.queue.push(entry);
            }

            return this;
        }

        /**
         * Starts the queue, returns true if the queue could start (when timeout is used) or if it started (timeout not used).
         * Uses setTimeout to prevent multiple calls.
         *
         * @return {boolean}
         */

    }, {
        key: 'start',
        value: function start() {
            var _this = this;

            // Check if the concurrent jobs limit has exceeded
            if (this.loading.length() >= this.concurrentJobs) {
                return false;
            }

            // Clear last request for start
            if (this.startTimeout !== null) {
                clearTimeout(this.startTimeout);
            }

            // Timeout is turned off
            if (this.startTimeoutTime === null) {
                return this.forceStart();
            }

            // Start the request
            this.startTimeout = setTimeout(function () {
                var queueEmpty = false;
                // Start enough items for concurrent jobs
                while (queueEmpty === false && _this.loading.length() < _this.concurrentJobs) {
                    console.log('looping');
                    queueEmpty = _this.forceStart() === false;
                }
            }, this.startTimeoutTime); // 50ms is enough to handle scroll start -> cancel transitions
        }

        /**
         * Forces start, returns true if entry has started
         *
         * @return {boolean}
         */

    }, {
        key: 'forceStart',
        value: function forceStart() {
            var _this2 = this;

            // Pull the first entry from the list
            var entry = this.queue.shift();

            // If no item is returned, queue is empty
            if (entry === null) {
                return false;
            }

            // Add the entry to load list
            this.loading.push(entry);

            // Get the url
            var url = entry.url;

            // Start loading
            var LoadTaskClass = this.LoadTaskClass;

            // Success callback accepts custom arguments that will be passed
            // to success callback
            entry.task = new LoadTaskClass(entry, function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                // Check if the loading was not cancelled
                if (isCanceled(_this2.loading, url)) {
                    return;
                }

                // Pass success and pass it to caller
                entry.success.apply(entry, args);

                // Remove it from loading list
                _this2.loading.remove(url);

                // Start next item
                _this2.start();

                // Custom callback on entry success
                if (_this2.onEntrySuccess !== null) {
                    _this2.onEntrySuccess(entry, args);
                }
            }, function (error) {
                // Check if the loading was not cancelled
                if (isCanceled(_this2.loading, url)) {
                    return;
                }

                // Handle the error and pass it to caller
                entry.error(error);

                // Remove it from loading list
                _this2.loading.remove(url);

                // Start next item
                _this2.start();

                // Custom callback on entry error
                if (_this2.onEntryError !== null) {
                    _this2.onEntryError(entry, error);
                }
            });
            return true;
        }

        /**
         * Cancels given url and returns boolean if we can start the load
         * queue again
         *
         * @param url
         * @return {boolean}
         */

    }, {
        key: 'cancel',
        value: function cancel(url) {
            this.queue.remove(url);

            // If we are currently loading given image, discard
            // the load progress and start loading next image
            if (this.loading.has(url)) {
                // Get the entry and pull it from the loading list
                var entry = this.loading.pull(url);

                // Cancel the task if task is set and supports it
                if (entry.task !== null && typeof entry.task.cancel === 'function') {
                    entry.task.cancel();
                }
                // We should restart queue
                return true;
            }

            return false;
        }
    }]);

    return QueueCore;
}();

exports.default = QueueCore;