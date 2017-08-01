'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CachedQueue = exports.Queue = undefined;

var _Queue = require('./Queue');

var _Queue2 = _interopRequireDefault(_Queue);

var _CachedQueue = require('./CachedQueue');

var _CachedQueue2 = _interopRequireDefault(_CachedQueue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Queue = _Queue2.default;
exports.CachedQueue = _CachedQueue2.default;
exports.default = _Queue2.default;