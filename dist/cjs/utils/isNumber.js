"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNumber = void 0;
const isNumber = (val) => {
    return typeof val === "number" && !isNaN(val);
};
exports.isNumber = isNumber;
exports.default = exports.isNumber;
