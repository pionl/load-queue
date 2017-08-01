"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * @callback LoadSuccess
 * @param {string} url
 * @param ...other Other properties based on the load task
 */
/**
 * @callback LoadError
 * @param {string} url
 * @param {Error} errorMessage
 */

/**
 * @param {Array} callbacks
 * @param {function} func Function that will receive callback
 */
function runCallbacks(callbacks, func) {
    for (var i = 0; i < callbacks.length; i++) {
        var callback = callbacks[i];
        func(callback);
    }
}

/**
 * Holds the url entry with success/error
 * @param {string} url
 * @param {LoadSuccess} success
 * @param {LoadError} error
 * @param {BaseQueue} queue
 * @constructor
 */
function QueueEntry(url, success, error, queue) {
    var _this = this;

    // A list of callbacks that will be called. Supports multiple callbacks.
    this.callbacks = {
        success: [success],
        error: [error]
        /**
         * @type {string}
         */
    };this.url = url;
    /**
     * Passes all the arguments to LoadSuccess
     * @type {function}
     */
    this.success = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        runCallbacks(_this.callbacks.success, function (callback) {
            callback.apply(undefined, [url].concat(args));
        });
    };
    /**
     * @type {function}
     * @param {Error} errorObject
     */
    this.error = function (errorObject) {
        runCallbacks(_this.callbacks.success, function (callback) {
            callback(url, errorObject);
        });
    };

    /**
     * Cancels loading - removes the image
     */
    this.cancel = function () {
        queue.cancel(_this);
    };

    /**
     * @type {LoadTask|null}
     */
    this.task = null;
}

exports.default = QueueEntry;