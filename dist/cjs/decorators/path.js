"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Path = void 0;
const Path = (path) => {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return (ctr) => {
        ctr.prototype.path = path;
    };
};
exports.Path = Path;
exports.default = exports.Path;
