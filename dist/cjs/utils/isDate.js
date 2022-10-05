"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDate = void 0;
const isDate = (val) => {
    return new Date(val).toString() !== "Invalid Date" && !isNaN(Date.parse(val));
};
exports.isDate = isDate;
exports.default = exports.isDate;
