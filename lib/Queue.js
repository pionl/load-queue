'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _BaseQueue = require('./BaseQueue');

var _BaseQueue2 = _interopRequireDefault(_BaseQueue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Builds the queue for public use
 * @param {LoadTask} LoadTaskClass
 * @param {Number} concurrentJobs
 * @param {Number|null|undefined} startTimeoutTime Defines if the start will use timeout function to throttle calls and give
 * time for start -> cancel (when user scrolls in list and etc). Set null to turn it off.
 *
 * @constructor
 */
function Queue(LoadTaskClass) {
  var concurrentJobs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var startTimeoutTime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

  // Private properties
  var queue = new _BaseQueue2.default(LoadTaskClass, concurrentJobs, startTimeoutTime);

  /**
   * Adds an url to queue
   * @param {string} url
   * @param {LoadSuccess} success
   * @param {LoadError} error
   *
   * @return {QueueEntry}
   */
  this.add = queue.add;

  /**
   * Cancels a load request for given queue entry or an image URL
   * @param {QueueEntry|string} entry
   */
  this.cancel = queue.cancel;
}
exports.default = Queue;