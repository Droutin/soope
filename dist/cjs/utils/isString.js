"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isString = void 0;
const isString = (val) => {
    return typeof val === "string" && val !== "";
};
exports.isString = isString;
exports.default = exports.isString;
