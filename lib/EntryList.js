'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EntryList = function () {
    function EntryList() {
        _classCallCheck(this, EntryList);

        /**
         * An list of QueueEntry entries
         */
        this.list = {};
    }

    /**
     * Returns an entry for given key
     * @param {string} url
     * @return {QueueEntry|null}
     */


    _createClass(EntryList, [{
        key: 'get',
        value: function get(url) {
            return this.list[url];
        }

        /**
         * Checks if url is in the list
         * @param {string} url
         * @return {boolean}
         */

    }, {
        key: 'has',
        value: function has(url) {
            var entry = this.get(url);
            return (typeof entry === 'undefined' ? 'undefined' : _typeof(entry)) === 'object';
        }

        /**
         * Returns current length of the list
         * @return {Number}
         */

    }, {
        key: 'length',
        value: function length() {
            return this.keys().length;
        }

        /**
         * Returns the current list keys
         * @return {Array}
         */

    }, {
        key: 'keys',
        value: function keys() {
            return Object.keys(this.list);
        }

        /**
         * Pulls the first entry from the list
         * @return {QueueEntry|null}
         */

    }, {
        key: 'shift',
        value: function shift() {
            var keys = this.keys();

            if (keys.length === 0) {
                return null;
            }

            return this.pull(keys[0]);
        }

        /**
         * Pulls the entry and deletes it from the list
         *
         * @return {QueueEntry|null}
         */

    }, {
        key: 'pull',
        value: function pull(url) {
            var entry = this.get(url);

            // Delete the entry if valid and return value
            if ((typeof entry === 'undefined' ? 'undefined' : _typeof(entry)) === 'object') {
                this.remove(url);
                return entry;
            }

            // Return null if not found
            return null;
        }

        /**
         * Adds an entry to the list
         * @param {QueueEntry} entry
         * @return {EntryList}
         */

    }, {
        key: 'push',
        value: function push(entry) {
            this.list[entry.url] = entry;
            return this;
        }

        /**
         * Deletes given entry by its url
         * @param {string} url
         * @return {EntryList}
         */

    }, {
        key: 'remove',
        value: function remove(url) {
            delete this.list[url];
            return this;
        }
    }]);

    return EntryList;
}();

exports.default = EntryList;