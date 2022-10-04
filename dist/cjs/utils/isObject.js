"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObject = void 0;
const isObject = (val) => {
    return typeof val === "object" && val !== null && Object.values(val).length > 0;
};
exports.isObject = isObject;
exports.default = exports.isObject;
