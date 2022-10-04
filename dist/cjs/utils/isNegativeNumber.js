"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNegativeNumber = void 0;
const _1 = require(".");
const isNegativeNumber = (val) => {
    return (0, _1.isNumber)(val) && val <= 0;
};
exports.isNegativeNumber = isNegativeNumber;
exports.default = exports.isNegativeNumber;
