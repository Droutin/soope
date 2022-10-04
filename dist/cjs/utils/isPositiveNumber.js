"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPositiveNumber = void 0;
const _1 = require(".");
const isPositiveNumber = (val) => {
    return (0, _1.isNumber)(val) && val >= 0;
};
exports.isPositiveNumber = isPositiveNumber;
exports.default = exports.isPositiveNumber;
