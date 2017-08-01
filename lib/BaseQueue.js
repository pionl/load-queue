'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _QueueEntry = require('./QueueEntry');

var _QueueEntry2 = _interopRequireDefault(_QueueEntry);

var _QueueCore = require('./QueueCore');

var _QueueCore2 = _interopRequireDefault(_QueueCore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseQueue =
/**
 * @param LoadTaskClass
 * @param concurrentJobs
 * @param startTimeoutTime Defines if the start will use timeout function to throttle calls and give
 * time for start -> cancel (when user scrolls in list and etc). Set null to turn it off.
 */
function BaseQueue(LoadTaskClass) {
    var _this = this;

    var concurrentJobs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var startTimeoutTime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

    _classCallCheck(this, BaseQueue);

    this.add = function (url, success, error) {
        // Build the entry
        var entry = new _QueueEntry2.default(url, success, error, _this);

        // Add it to queue and start loading if can
        _this.core.add(entry).start();
        return entry;
    };

    this.cancel = function (entry) {
        var url = entry;

        // Support cancel via entry
        if (entry instanceof _QueueEntry2.default) {
            url = entry.url;
        }

        // Cancel given url and check if we can restart the queue
        if (_this.core.cancel(url)) {
            _this.core.start();
        }
    };

    this.core = new _QueueCore2.default(LoadTaskClass, concurrentJobs, startTimeoutTime);
}

/**
 * Adds an url to queue
 * @param {string} url
 * @param {LoadSuccess} success
 * @param {LoadError} error
 *
 * @return {QueueEntry}
 */


/**
 * Cancels a load request for given queue entry or an image URL
 * @param {QueueEntry|string} entry
 */
;

exports.default = BaseQueue;