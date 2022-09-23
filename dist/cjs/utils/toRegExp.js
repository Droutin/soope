"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toRegExp = void 0;
const toRegExp = (re) => {
    if (re.startsWith("/") && re.endsWith("/")) {
        re = re.slice(1, -1);
    }
    return new RegExp(re);
};
exports.toRegExp = toRegExp;
exports.default = exports.toRegExp;
