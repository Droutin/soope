"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Path = void 0;
const Path = (path) => {
    return (ctr) => {
        ctr.prototype.path = path;
    };
};
exports.Path = Path;
exports.default = exports.Path;
