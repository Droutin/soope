"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isArray = void 0;
const isArray = (val) => {
    return Array.isArray(val) && val.length > 0;
};
exports.isArray = isArray;
exports.default = exports.isArray;
